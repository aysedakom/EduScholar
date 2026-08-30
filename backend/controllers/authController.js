
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const otpModel = require('../models/otpModel');
const emailService = require('../services/emailService');
const { validateStandardPassword } = require('../utils/passwordValidator');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_super_secret_key_change_this',
    { expiresIn: '7d' }
  );
};

const formatUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  student_id: user.student_id,
  studentId: user.student_id,
  department: user.department,
  major: user.major,
  gpa: user.gpa ? Number(user.gpa) : null,
  financialAidYear: user.financial_aid_year,
  avatar: user.avatar,
  phone: user.phone,
  address: user.address,
  barangay: user.barangay,
  city: user.city,
  province: user.province,
  zipCode: user.zip_code,
  isPwd: user.is_pwd,
  isSoloParent: user.is_solo_parent,
  isIndigenous: user.is_indigenous,
  is4ps: user.is_4ps,
  isKasambahayOrToda: user.is_kasambahay_or_toda,
  status: user.status,
  hasCompletedBasicForm: true,
});

const isSafeClientUrl = (urlStr) => {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    // Block AWS/GCP metadata & private RFC1918 subnets (SSRF protection)
    if (
      host === '169.254.169.254' ||
      host === 'metadata.google.internal' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host === '0.0.0.0'
    ) {
      return false;
    }
    return true;
  } catch (_) {
    return false;
  }
};

const resolveClientUrl = (req) => {
  // 1. Explicitly supplied by client body (with SSRF verification)
  if (req?.body?.clientUrl && typeof req.body.clientUrl === 'string' && isSafeClientUrl(req.body.clientUrl)) {
    const rawUrl = req.body.clientUrl.replace(/\/$/, '');
    if (!rawUrl.includes('localhost') || process.env.NODE_ENV !== 'production') {
      return rawUrl;
    }
  }
  // 2. Proxied Host from reverse proxy (Railway, Vercel, Nginx, iOS devices)
  if (req?.headers && req.headers['x-forwarded-host']) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${req.headers['x-forwarded-host']}`.replace(/\/$/, '');
  }
  // 3. Origin header from browser request (e.g. https://eduscholar-production.up.railway.app)
  if (req?.headers?.origin && req.headers.origin !== 'null' && req.headers.origin.startsWith('http')) {
    return req.headers.origin.replace(/\/$/, '');
  }
  // 4. Referer header from browser request
  if (req?.headers?.referer) {
    try {
      const u = new URL(req.headers.referer);
      return u.origin.replace(/\/$/, '');
    } catch (_) {}
  }
  // 5. Direct Host header (e.g. from mobile / safari requests)
  if (req?.headers?.host && !req.headers.host.includes('localhost:5000')) {
    const proto = req.secure || (req.headers && req.headers['x-forwarded-proto'] === 'https') ? 'https' : 'https';
    return `${proto}://${req.headers.host}`.replace(/\/$/, '');
  }
  // 6. Environment variables
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.replace(/\/$/, '');
  }
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, '');
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (process.env.RAILWAY_STATIC_URL) {
    return `https://${process.env.RAILWAY_STATIC_URL}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://eduscholar-production.up.railway.app';
  }
  return 'http://localhost:5173';
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const pwdValidation = validateStandardPassword(password, { name, email });
    if (!pwdValidation.isValid) {
      return res.status(400).json({ message: pwdValidation.message });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.is_email_verified || existing.status === 'active') {
        return res.status(409).json({
          message: 'This email address is already registered. Each email address can only be used once in the system. Please sign in to your account.',
        });
      } else {
        return res.status(409).json({
          message: 'This email address is already registered and currently awaiting email authorization. Please verify your email or sign in.',
          requireEmailVerification: true,
          email: existing.email,
        });
      }
    }


    const assignedRole = 'student';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, hashedPassword, role: assignedRole });


    const tokenRecord = await otpModel.createVerificationToken({
      email: user.email,
      expiresInMinutes: 60,
    });

    const clientUrl = resolveClientUrl(req);
    const verifyUrl = `${clientUrl}/verify-email?token=${tokenRecord.otp_code}&email=${encodeURIComponent(user.email)}`;


    emailService.sendVerificationLinkEmail({
      to: user.email,
      name: user.name,
      verifyUrl,
      expiresInMinutes: 60,
    }).catch((err) => console.warn('[authController] Email verification dispatch warning:', err.message));

    res.status(201).json({
      success: true,
      requireEmailVerification: true,
      email: user.email,
      message: 'Account created! Please check your email and click the verification button to verify your account.',
    });
  } catch (error) {
    console.error('[authController] register error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};


const verifyEmail = async (req, res) => {
  try {
    const { email, token, code } = req.body;
    const verificationToken = token || code;

    if (!verificationToken) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }


    const verification = await otpModel.verifyToken({
      email,
      token: verificationToken,
    });

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const verifiedEmail = verification.email;
    const user = await userModel.findByEmail(verifiedEmail);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }


    await userModel.verifyEmail(user.email);

    res.json({
      success: true,
      message: 'Your email address has been successfully verified! You may now sign in.',
      email: user.email,
    });
  } catch (error) {
    console.error('[authController] verifyEmail error:', error);
    res.status(500).json({ message: 'Server error verifying email: ' + error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'No account associated with this email.' });
    }

    if (user.is_email_verified) {
      return res.json({ success: true, message: 'Your email address is already verified. You can sign in.' });
    }

    const tokenRecord = await otpModel.createVerificationToken({
      email: user.email,
      expiresInMinutes: 60,
    });

    const clientUrl = resolveClientUrl(req);
    const verifyUrl = `${clientUrl}/verify-email?token=${tokenRecord.otp_code}&email=${encodeURIComponent(user.email)}`;

    emailService.sendVerificationLinkEmail({
      to: user.email,
      name: user.name,
      verifyUrl,
      expiresInMinutes: 60,
    }).catch((err) => console.warn('[authController] Email verification dispatch warning:', err.message));

    res.json({
      success: true,
      message: 'A fresh verification link has been dispatched to your email.',
    });
  } catch (error) {
    console.error('[authController] resendVerification error:', error);
    res.status(500).json({ message: 'Server error resending verification: ' + error.message });
  }
};

// @desc   Initiate Login (Validates credentials, checks email verification, dispatches login OTP)
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email has been verified/authorized
    if (!user.is_email_verified && user.status === 'pending') {
      return res.status(403).json({
        requireEmailVerification: true,
        email: user.email,
        message: 'Your email address is not yet authorized. Please authorize your email address before signing in.',
      });
    }

    // Verify if existing password satisfies the enhanced security policy
    const passwordCheck = validateStandardPassword(password, { name: user.name, email: user.email });
    const isLegacyFormat = !passwordCheck.isValid || user.must_reset_password === true;

    if (isLegacyFormat) {
      return res.json({
        requirePasswordReset: true,
        mustResetPassword: true,
        email: user.email,
        name: user.name,
        message: 'Security Policy Update: Your account password was created before our enhanced security standard was implemented. Please set a new secure password to continue.',
        reason: passwordCheck.message || 'Password must be at least 12 characters and include uppercase, lowercase, numeric, and symbol characters.',
      });
    }

    // Credentials valid & email verified -> Generate unique 6-digit login OTP
    const otp = await otpModel.createOtp({
      email: user.email,
      purpose: 'login',
      expiresInMinutes: 10,
    });

    // Dispatch OTP email asynchronously in background
    emailService.sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode: otp.otp_code,
      purpose: 'login',
      expiresInMinutes: 10,
    }).catch((err) => console.warn('[authController] Email dispatch warning:', err.message));

    // Return requireOtp signal
    res.json({
      requireOtp: true,
      email: user.email,
      message: 'A unique 6-digit verification code has been dispatched to your email.',
    });
  } catch (error) {
    console.error('[authController] login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

// @desc   Verify OTP and complete authentication
// @route  POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Verify OTP against database
    const verification = await otpModel.verifyOtp({
      email: user.email,
      otpCode: otp,
      purpose: 'login',
    });

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    // Issue JWT token and return user profile
    const token = generateToken(user);
    res.json({
      message: 'Authentication successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[authController] verifyOtp error:', error);
    res.status(500).json({ message: 'Server error verifying OTP: ' + error.message });
  }
};

// @desc   Resend a fresh OTP code to user's email
// @route  POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to resend verification code' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'No account associated with this email address' });
    }

    // Generate fresh OTP code
    const otp = await otpModel.createOtp({
      email: user.email,
      purpose,
      expiresInMinutes: 10,
    });

    // Send email asynchronously
    emailService.sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode: otp.otp_code,
      purpose,
      expiresInMinutes: 10,
    }).catch((err) => console.warn('[authController] Email dispatch warning:', err.message));

    res.json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.',
    });
  } catch (error) {
    console.error('[authController] resendOtp error:', error);
    res.status(500).json({ message: 'Server error resending OTP: ' + error.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('[authController] me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const updated = await userModel.updateProfile(req.user.id, req.body);
    res.json({
      message: 'Profile updated successfully',
      user: formatUserResponse(updated),
    });
  } catch (error) {
    console.error('[authController] updateProfile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc   Request password reset link & notify email for identity verification
// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      // Return uniform success message to protect privacy
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset verification link has been sent.',
      });
    }

    // Generate secure password reset token (30 minutes expiry)
    const tokenRecord = await otpModel.createPasswordResetToken({
      email: user.email,
      expiresInMinutes: 30,
    });

    const clientUrl = resolveClientUrl(req);
    const resetUrl = `${clientUrl}/login?view=reset-password&token=${tokenRecord.otp_code}&email=${encodeURIComponent(user.email)}`;

    // Dispatch verification link email
    emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresInMinutes: 30,
    }).catch((err) => console.warn('[authController] Password reset email dispatch error:', err.message));

    res.json({
      success: true,
      message: 'If an account exists with this email address, a password reset verification link has been sent.',
    });
  } catch (error) {
    console.error('[authController] forgotPassword error:', error);
    res.status(500).json({ message: 'Server error processing password reset request: ' + error.message });
  }
};

// @desc   Verify reset token and update password
// @route  POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Verification token and new password are required' });
    }

    const pwdValidation = validateStandardPassword(newPassword, { email });
    if (!pwdValidation.isValid) {
      return res.status(400).json({ message: pwdValidation.message });
    }

    // Validate token against database
    const verification = await otpModel.verifyPasswordResetToken({
      email,
      token,
    });

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const targetEmail = verification.email;
    const user = await userModel.findByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Hash new password and update in PostgreSQL
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(targetEmail, hashedPassword);

    // Issue JWT token and return user profile
    const authToken = generateToken(user);

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.',
      token: authToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[authController] resetPassword error:', error);
    res.status(500).json({ message: 'Server error resetting password: ' + error.message });
  }
};

// @desc   Update legacy password and establish authenticated session
// @route  POST /api/auth/update-legacy-password
const updateLegacyPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Email, current password, and new password are required.' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password).catch(() => false);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password verification failed.' });
    }

    // Validate new password against standard security policy
    const pwdValidation = validateStandardPassword(newPassword, { name: user.name, email: user.email });
    if (!pwdValidation.isValid) {
      return res.status(400).json({ message: pwdValidation.message });
    }

    // Hash and store new password in PostgreSQL
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.email, hashedPassword);

    // Issue JWT token and complete session establishment
    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Your password has been successfully updated to the new standard security format! Welcome back.',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[authController] updateLegacyPassword error:', error);
    res.status(500).json({ message: 'Server error updating password: ' + error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateLegacyPassword,
  me,
  updateProfile,
};
