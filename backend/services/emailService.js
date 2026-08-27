// backend/services/emailService.js
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

function getBrevoApiKey() {
  if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim().startsWith('xkeysib-')) {
    return process.env.BREVO_API_KEY.trim();
  }
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/BREVO_API_KEY\s*=\s*([^\r\n]+)/);
      if (match && match[1]) {
        const key = match[1].trim();
        process.env.BREVO_API_KEY = key;
        return key;
      }
    }
  } catch (e) {
    console.warn('[EmailService] Could not read .env file:', e.message);
  }
  return (process.env.BREVO_API_KEY || '').trim();
}

/**
 * Logs every dispatched email into PostgreSQL table `email_logs`
 */
async function logEmailToDatabase({ recipientEmail, recipientName, emailType, subject, codeOrUrl, dispatchMethod = 'simulation', status = 'sent' }) {
  try {
    await pool.query(
      `INSERT INTO email_logs (recipient_email, recipient_name, email_type, subject, code_or_url, dispatch_method, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [recipientEmail.toLowerCase().trim(), recipientName || null, emailType, subject, String(codeOrUrl || ''), dispatchMethod, status]
    );
  } catch (err) {
    console.warn('[EmailService] Warning logging email to PostgreSQL:', err.message);
  }
}

/**
 * Brevo Transactional Email Service
 * Supports:
 * 1. Brevo REST API (via process.env.BREVO_API_KEY)
 * 2. Brevo / Custom SMTP Relay (via process.env.BREVO_SMTP_KEY or process.env.SMTP_PASS)
 * 3. Local Development Simulation Fallback (prints clear OTP box in server console)
 */

const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'support.edu2026@gmail.com';
const SENDER_NAME = process.env.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME_ || 'Campus Aid Hub';

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  const user = (process.env.BREVO_SMTP_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS || '').trim();

  if (user && pass) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 2500,
      greetingTimeout: 2500,
      socketTimeout: 2500,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return smtpTransporter;
}

/**
 * Sends an email using Brevo REST API (v3)
 */
async function sendViaBrevoApi({ to, toName, subject, htmlContent, textContent }) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) return null;

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to, name: toName || to.split('@')[0] }],
    subject,
    htmlContent,
    textContent: textContent || subject,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Brevo API returned HTTP ${response.status}: ${errBody}`);
    }

    const result = await response.json().catch(() => ({}));
    return { messageId: result.messageId || 'brevo-api-sent', method: 'brevo_api' };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generates an accessible, responsive HTML email template for Account Verification Link
 */
function generateVerificationLinkEmailHtml({ name, verifyUrl, expiresInMinutes = 60 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your EduScholar Account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0A1628 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; }
    .content { padding: 36px 30px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 28px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .verify-btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 34px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); letter-spacing: 0.3px; }
    .link-note { font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .link-note a { color: #2563eb; word-break: break-all; }
    .alert { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #1e40af; line-height: 1.5; margin-top: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QUEZON CITY SCHOLARSHIP HUB</h1>
      <p>EduScholar Student & Coordinator Portal</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name || 'Applicant'},</div>
      <div class="desc">
        Thank you for registering your student account with the Quezon City Campus Aid Hub (EduScholar). To authorize and activate your account, please click the button below to verify your email address.
      </div>
      
      <div class="btn-container">
        <a href="${verifyUrl}" target="_blank" class="verify-btn">
          Verify My Account →
        </a>
      </div>

      <div class="link-note">
        If the button above does not open, copy and paste this verification URL into your browser:<br>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </div>

      <div class="alert">
        <strong>Security Notice:</strong> This email verification link is strictly valid for the next ${expiresInMinutes} minutes. Once verified, you will be able to sign in and authenticate using OTP security codes.
      </div>
    </div>
    <div class="footer">
      This is an automated security verification message from Quezon City Campus Aid Hub.<br>
      © 2026 Quezon City Government. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * High-level function to send Email Verification Link (Strictly for New Account Registration)
 */
async function sendVerificationLinkEmail({ to, name, verifyUrl, expiresInMinutes = 60 }) {
  const subject = `[${SENDER_NAME}] Verify your Quezon City EduScholar account`;
  const htmlContent = generateVerificationLinkEmailHtml({ name, verifyUrl, expiresInMinutes });
  const textContent = `Hello ${name || 'Applicant'}, please verify your EduScholar account by visiting: ${verifyUrl}. This link expires in ${expiresInMinutes} minutes.`;

  // 1. Try Brevo REST API if configured
  if (process.env.BREVO_API_KEY) {
    try {
      const apiResult = await sendViaBrevoApi({ to, toName: name, subject, htmlContent, textContent });
      console.log(`[EmailService] ✅ Verification link sent via Brevo API to ${to} (MessageId: ${apiResult.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'verification_link', subject, codeOrUrl: verifyUrl, dispatchMethod: 'brevo_api' });
      return { success: true, method: 'brevo_api', messageId: apiResult.messageId };
    } catch (apiErr) {
      console.warn(`[EmailService] ⚠️ Brevo API failed (${apiErr.message}), trying SMTP fallback...`);
    }
  }

  // 2. Try SMTP Transporter
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EmailService] ✅ Verification link sent via SMTP to ${to} (MessageId: ${info.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'verification_link', subject, codeOrUrl: verifyUrl, dispatchMethod: 'smtp' });
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[EmailService] ⚠️ SMTP transport failed: ${smtpErr.message}`);
    }
  }

  // 3. Local Development Simulation Fallback
  console.log('====================================================');
  console.log('  📧 [EMAIL SERVICE - VERIFY ACCOUNT LINK]');
  console.log(`  To:           ${to} (${name || 'Student/Applicant'})`);
  console.log(`  Subject:      ${subject}`);
  console.log(`  🔗 VERIFY URL: ${verifyUrl}`);
  console.log(`  ⏱ Expiry:     ${expiresInMinutes} minutes`);
  console.log('====================================================');

  logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'verification_link', subject, codeOrUrl: verifyUrl, dispatchMethod: 'simulation' });

  return {
    success: true,
    method: 'simulation',
    verifyUrl,
  };
}

/**
 * Generates an accessible, responsive HTML email template for Login OTP verification
 */
function generateOtpEmailHtml({ name, otpCode, purpose = 'login', expiresInMinutes = 10 }) {
  const purposeTitle = 'Account Login Verification Code';
  const purposeDesc = 'A sign-in attempt was initiated for your EduScholar account. Please enter the unique one-time verification code below to complete your authentication.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0A1628 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px; margin-bottom: 8px; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: 'Courier New', Courier, monospace; margin: 0; }
    .otp-expiry { font-size: 12px; color: #94a3b8; margin-top: 8px; }
    .alert { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #1e40af; line-height: 1.5; margin-top: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QUEZON CITY SCHOLARSHIP HUB</h1>
      <p>EduScholar Student & Coordinator Portal</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name || 'User'},</div>
      <div class="desc">${purposeDesc}</div>
      
      <div class="otp-box">
        <div class="otp-label">Your One-Time Login Verification Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">⏱ Valid for the next ${expiresInMinutes} minutes</div>
      </div>

      <div class="alert">
        <strong>Security Notice:</strong> Never share this OTP code with anyone. EduScholar or QC Government staff will never ask for your verification code.
      </div>
    </div>
    <div class="footer">
      This is an automated security notification from Quezon City Campus Aid Hub.<br>
      © 2026 Quezon City Government. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * High-level function to send OTP email (Exclusively for Login 2FA)
 */
async function sendOtpEmail({ to, name, otpCode, purpose = 'login', expiresInMinutes = 10 }) {
  const subject = `[${SENDER_NAME}] ${otpCode} is your login OTP verification code`;
  const htmlContent = generateOtpEmailHtml({ name, otpCode, purpose, expiresInMinutes });
  const textContent = `Your ${SENDER_NAME} login OTP verification code is: ${otpCode}. It expires in ${expiresInMinutes} minutes. Do not share this code.`;

  // 1. Try Brevo REST API if configured
  if (process.env.BREVO_API_KEY) {
    try {
      const apiResult = await sendViaBrevoApi({ to, toName: name, subject, htmlContent, textContent });
      console.log(`[EmailService] ✅ OTP sent via Brevo API to ${to} (MessageId: ${apiResult.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'login_otp', subject, codeOrUrl: otpCode, dispatchMethod: 'brevo_api' });
      return { success: true, method: 'brevo_api', messageId: apiResult.messageId };
    } catch (apiErr) {
      console.warn(`[EmailService] ⚠️ Brevo API failed (${apiErr.message}), trying SMTP fallback...`);
    }
  }

  // 2. Try SMTP Transporter
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EmailService] ✅ OTP sent via SMTP to ${to} (MessageId: ${info.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'login_otp', subject, codeOrUrl: otpCode, dispatchMethod: 'smtp' });
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[EmailService] ⚠️ SMTP transport failed: ${smtpErr.message}`);
    }
  }

  // 3. Local Development Simulation Fallback
  console.log('====================================================');
  console.log('  📧 [EMAIL SERVICE - LOGIN OTP CODE]');
  console.log(`  To:      ${to} (${name || 'Student/User'})`);
  console.log(`  Subject: ${subject}`);
  console.log(`  🔐 OTP CODE: [ ${otpCode} ] (Expires in ${expiresInMinutes} mins)`);
  console.log('====================================================');

  logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'login_otp', subject, codeOrUrl: otpCode, dispatchMethod: 'simulation' });

  return {
    success: true,
    method: 'simulation',
    otpCode,
  };
}

/**
 * Generates an accessible, responsive HTML email template for Password Reset Authorization & Link
 */
function generatePasswordResetEmailHtml({ name, resetUrl, expiresInMinutes = 30 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0A1628 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 28px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn-verify { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); text-align: center; letter-spacing: 0.3px; }
    .btn-verify:hover { background: #1d4ed8; }
    .security-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 8px; font-size: 12px; color: #991b1b; line-height: 1.6; margin-top: 28px; }
    .fallback-link { word-break: break-all; color: #2563eb; font-size: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 16px; }
    .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QUEZON CITY SCHOLARSHIP HUB</h1>
      <p>Campus Aid Hub • Account Security Notice</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name || 'User'},</div>
      <div class="desc">
        We received a request to reset the password associated with your Quezon City EduScholar account.
        <br><br>
        <strong>Before you can set a new password</strong>, please verify that you initiated this request by clicking the authorization button below:
      </div>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="btn-verify" target="_blank" rel="noopener noreferrer">
          Verify & Reset My Password →
        </a>
      </div>

      <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: -12px; margin-bottom: 24px;">
        ⏱ This secure reset link is valid for <strong>${expiresInMinutes} minutes</strong>.
      </div>

      <div style="font-size: 12px; color: #64748b; margin-top: 20px;">
        Or copy and paste this verification URL directly into your browser:
        <div class="fallback-link">${resetUrl}</div>
      </div>

      <div class="security-box">
        <strong>⚠️ Security Alert:</strong> If you did NOT request a password reset, please ignore this email or contact support immediately. Your password will remain unchanged and your account is secure.
      </div>
    </div>
    <div class="footer">
      This is an automated security authorization notice from Quezon City Campus Aid Hub.<br>
      © 2026 Quezon City Local Government Unit. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * High-level function to send Password Reset Authorization & Link Email
 */
async function sendPasswordResetEmail({ to, name, resetUrl, expiresInMinutes = 30 }) {
  const subject = `[${SENDER_NAME}] Password Reset Authorization & Verification Request`;
  const htmlContent = generatePasswordResetEmailHtml({ name, resetUrl, expiresInMinutes });
  const textContent = `Hello ${name || 'User'}, we received a request to reset your password for EduScholar. To verify it is you and set a new password, visit: ${resetUrl}. This link expires in ${expiresInMinutes} minutes. If you did not request this, please ignore this message.`;

  // 1. Try Brevo REST API if configured
  if (process.env.BREVO_API_KEY) {
    try {
      const apiResult = await sendViaBrevoApi({ to, toName: name, subject, htmlContent, textContent });
      console.log(`[EmailService] ✅ Password reset link sent via Brevo API to ${to} (MessageId: ${apiResult.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'password_reset', subject, codeOrUrl: resetUrl, dispatchMethod: 'brevo_api' });
      return { success: true, method: 'brevo_api', messageId: apiResult.messageId };
    } catch (apiErr) {
      console.warn(`[EmailService] ⚠️ Brevo API failed (${apiErr.message}), trying SMTP fallback...`);
    }
  }

  // 2. Try SMTP Transporter
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EmailService] ✅ Password reset link sent via SMTP to ${to} (MessageId: ${info.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'password_reset', subject, codeOrUrl: resetUrl, dispatchMethod: 'smtp' });
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[EmailService] ⚠️ SMTP transport failed: ${smtpErr.message}`);
    }
  }

  // 3. Local Development Simulation Fallback
  console.log('====================================================');
  console.log('  📧 [EMAIL SERVICE - PASSWORD RESET LINK]');
  console.log(`  To:           ${to} (${name || 'User'})`);
  console.log(`  Subject:      ${subject}`);
  console.log(`  🔗 RESET URL: ${resetUrl}`);
  console.log(`  ⏱ Expiry:     ${expiresInMinutes} minutes`);
  console.log('====================================================');

  logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'password_reset', subject, codeOrUrl: resetUrl, dispatchMethod: 'simulation' });

  return {
    success: true,
    method: 'simulation',
    resetUrl,
  };
}

/**
 * Generates an official, beautifully formatted Certificate of Scholarship Award & Qualification HTML
 */
function generateScholarshipAwardCertificateHtml({
  name,
  studentId,
  programTitle,
  awardAmount = 20000,
  certificateNumber,
  school,
  course,
  issueDate,
}) {
  const getGrantBreakdown = (title, amt) => {
    const t = (title || '').toLowerCase();
    if (t.includes('economic')) {
      return '₱10,000.00 / Sem (₱5,000 Tuition Grant + ₱5,000 Stipend)';
    }
    if (t.includes('excel')) {
      return '₱80,000.00 / Sem (₱55,000 Tuition + ₱25,000 Stipend)';
    }
    if (t.includes('academic') && !t.includes('shs') && !t.includes('senior high')) {
      return '₱52,500.00 / Sem (₱40,000 Tuition + ₱12,500 Stipend)';
    }
    if (t.includes('athletic') || t.includes('youth leader')) {
      return '₱40,000.00 / Sem (₱27,500 Tuition + ₱12,500 Stipend)';
    }
    if (t.includes('shs') || t.includes('senior high')) {
      return '₱15,000.00 / Sem (₱10,000 Tuition + ₱5,000 Stipend)';
    }
    return `${Number(amt).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} / Sem`;
  };

  const grantBreakdownText = getGrantBreakdown(programTitle, awardAmount);
  const formattedAmount = Number(awardAmount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
  const certNo = certificateNumber || `QCSP-AWARD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const dateStr = issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const inst = school || 'Quezon City University / Partner Institution';
  const deg = course || 'Tertiary Degree Program';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Certificate of Scholarship Award - Quezon City Government</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .email-container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header-banner { background: linear-gradient(135deg, #0A1628 0%, #1e3a8a 60%, #1d4ed8 100%); padding: 36px 28px; text-align: center; color: #ffffff; position: relative; }
    .header-banner h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
    .header-banner p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; font-weight: 700; }
    
    .content-body { padding: 36px 32px; }
    .congrats-title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px; }
    .congrats-sub { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    
    /* Printable Certificate Canvas Frame */
    .certificate-canvas { background: #fffdfa; border: 4px double #b45309; border-radius: 16px; padding: 28px 24px; margin: 24px 0; text-align: center; position: relative; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.08); }
    .cert-heading-top { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #78350f; }
    .cert-heading-sub { font-size: 11px; font-weight: 700; color: #92400e; margin-top: 2px; }
    .cert-title { font-size: 17px; font-weight: 900; color: #451a03; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 10px 0; border-top: 1px solid #d97706; border-bottom: 1px solid #d97706; padding: 8px 0; }
    .cert-control { font-family: monospace; font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 14px; }
    
    .cert-recipient { font-size: 20px; font-weight: 900; color: #1e3a8a; text-decoration: underline; margin: 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .cert-body-text { font-size: 13px; color: #334155; line-height: 1.6; max-width: 540px; margin: 0 auto 18px auto; text-align: justify; }
    
    .cert-meta-grid { display: table; width: 100%; margin: 16px 0; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; }
    .cert-meta-row { display: table-row; }
    .cert-meta-cell { display: table-cell; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .cert-meta-label { color: #64748b; font-weight: 700; font-size: 10px; text-transform: uppercase; }
    .cert-meta-val { color: #0f172a; font-weight: 800; }
    
    .cert-signatures { display: table; width: 100%; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .cert-sig-cell { display: table-cell; width: 50%; text-align: center; vertical-align: bottom; }
    .sig-line { font-size: 11px; font-weight: 800; color: #0f172a; border-top: 1px solid #94a3b8; width: 75%; margin: 0 auto; padding-top: 4px; text-transform: uppercase; }
    .sig-title { font-size: 10px; color: #64748b; }

    .instructions-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 10px; font-size: 13px; color: #14532d; line-height: 1.6; margin: 24px 0; }
    .footer-bar { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <h1>QUEZON CITY GOVERNMENT</h1>
      <p>Quezon City Youth Development Office • Scholarship Division</p>
    </div>

    <div class="content-body">
      <div class="congrats-title">🎉 Congratulations, ${name}!</div>
      <div class="congrats-sub">
        We are thrilled to inform you that your application for the <strong>${programTitle}</strong> has been <strong>OFFICIALLY APPROVED</strong> by the Quezon City Scholarship Screening Committee.
        <br><br>
        You are now formally recognized as an <strong>Official Government Scholar</strong> of the City Government of Quezon City for Academic Year 2026–2027.
      </div>

      <!-- Formal Award Certificate -->
      <div class="certificate-canvas">
        <div class="cert-heading-top">Republic of the Philippines • City Government of Quezon City</div>
        <div class="cert-heading-sub">Quezon City Youth Development Office (QCYDO)</div>
        
        <div class="cert-title">
          Certificate of Scholarship Award & Qualification
        </div>
        
        <div class="cert-control">
          Official Award Certificate No: <strong>${certNo}</strong>
        </div>

        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 12px;">This is formally conferred upon</div>
        <div class="cert-recipient">${name}</div>
        <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 12px;">Student ID: ${studentId}</div>

        <div class="cert-body-text">
          having satisfactorily fulfilled all rigorous documentary credentials, biometric verification, and academic standards established under the Quezon City Scholarship Code. The bearer is hereby designated an <strong>Official Quezon City Scholar</strong> in Active Good Standing with full grant entitlement.
        </div>

        <div class="cert-meta-grid">
          <div class="cert-meta-row">
            <div class="cert-meta-cell">
              <div class="cert-meta-label">Scholarship Program</div>
              <div class="cert-meta-val">${programTitle}</div>
            </div>
            <div class="cert-meta-cell">
              <div class="cert-meta-label">Approved Educational Grant & Aid</div>
              <div class="cert-meta-val" style="color: #16a34a;">${grantBreakdownText}</div>
            </div>
          </div>
          <div class="cert-meta-row">
            <div class="cert-meta-cell">
              <div class="cert-meta-label">School / Institution</div>
              <div class="cert-meta-val">${inst}</div>
            </div>
            <div class="cert-meta-cell">
              <div class="cert-meta-label">Degree / Course</div>
              <div class="cert-meta-val">${deg}</div>
            </div>
          </div>
          <div class="cert-meta-row">
            <div class="cert-meta-cell">
              <div class="cert-meta-label">Date Conferred</div>
              <div class="cert-meta-val">${dateStr}</div>
            </div>
            <div class="cert-meta-cell">
              <div class="cert-meta-label">Status Clearance</div>
              <div class="cert-meta-val" style="color: #2563eb;">✓ Verified & Authenticated</div>
            </div>
          </div>
        </div>

        <div class="cert-signatures">
          <div class="cert-sig-cell">
            <div class="sig-line">HON. ROBERTO V. CRUZ</div>
            <div class="sig-title">Executive Director, QCYDO</div>
          </div>
          <div class="cert-sig-cell">
            <div class="sig-line">HON. MA. JOSEFINA "JOY" BELMONTE</div>
            <div class="sig-title">City Mayor, Quezon City</div>
          </div>
        </div>
      </div>

      <div class="instructions-box">
        <strong>📋 Next Steps & Grant Release:</strong><br>
        1. Keep a copy of this official certificate for your academic records.<br>
        2. You may also download and print your official certificate directly from your <strong>EduScholar Document Vault</strong> anytime.<br>
        3. Your stipend disbursement is currently queued for disbursement via your registered QCitizen Pay / bank channel.<br>
        4. Maintain your academic standing (GWA >= 1.75) and participate in scheduled Quezon City youth development activities.
      </div>
    </div>

    <div class="footer-bar">
      This is an official transaction document issued by the Quezon City Government & QCYDO.<br>
      © 2026 City Government of Quezon City. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatches the official Certificate of Scholarship Award & Qualification Email
 */
async function sendScholarshipAwardCertificateEmail({
  to,
  name,
  studentId,
  programTitle,
  awardAmount = 20000,
  certificateNumber,
  school,
  course,
  issueDate,
}) {
  const certNo = certificateNumber || `QCSP-AWARD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const subject = `🎓 [OFFICIAL AWARD] Certificate of Scholarship Qualification - ${name} (${certNo})`;
  const htmlContent = generateScholarshipAwardCertificateHtml({
    name,
    studentId,
    programTitle,
    awardAmount,
    certificateNumber: certNo,
    school,
    course,
    issueDate,
  });
  const textContent = `Congratulations ${name}! You have been officially approved as a Quezon City Government Scholar for ${programTitle}. Official Certificate Number: ${certNo}. Approved Educational Grant: PHP ${awardAmount}. Visit your EduScholar Document Vault to view and download your full certificate.`;

  // 1. Try Brevo REST API
  if (process.env.BREVO_API_KEY) {
    try {
      const apiResult = await sendViaBrevoApi({ to, toName: name, subject, htmlContent, textContent });
      console.log(`[EmailService] ✅ Official Award Certificate emailed via Brevo API to ${to} (MessageId: ${apiResult.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'scholarship_award_certificate', subject, codeOrUrl: certNo, dispatchMethod: 'brevo_api' });
      return { success: true, method: 'brevo_api', messageId: apiResult.messageId, certificateNumber: certNo };
    } catch (apiErr) {
      console.warn(`[EmailService] ⚠️ Brevo API failed (${apiErr.message}), trying SMTP fallback...`);
    }
  }

  // 2. Try SMTP Transporter with attached certificate
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            filename: `Official_Scholar_Certificate_${certNo}.html`,
            content: htmlContent,
            contentType: 'text/html',
          },
        ],
      });
      console.log(`[EmailService] ✅ Official Award Certificate emailed via SMTP to ${to} (MessageId: ${info.messageId})`);
      logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'scholarship_award_certificate', subject, codeOrUrl: certNo, dispatchMethod: 'smtp' });
      return { success: true, method: 'smtp', messageId: info.messageId, certificateNumber: certNo };
    } catch (smtpErr) {
      console.warn(`[EmailService] ⚠️ SMTP transport failed: ${smtpErr.message}`);
    }
  }

  // 3. Local Development Simulation Fallback
  console.log('====================================================');
  console.log('  🎓 📧 [EMAIL SERVICE - SCHOLARSHIP AWARD CERTIFICATE DISPATCH]');
  console.log(`  To:                 ${to} (${name || 'Student'})`);
  console.log(`  Subject:            ${subject}`);
  console.log(`  📜 CERTIFICATE NO:  [ ${certNo} ]`);
  console.log(`  💰 GRANT AMOUNT:    PHP ${awardAmount}`);
  console.log(`  🏫 INSTITUTION:     ${school || 'Partner Institution'}`);
  console.log(`  📚 PROGRAM:         ${programTitle}`);
  console.log('====================================================');

  logEmailToDatabase({ recipientEmail: to, recipientName: name, emailType: 'scholarship_award_certificate', subject, codeOrUrl: certNo, dispatchMethod: 'simulation' });

  return {
    success: true,
    method: 'simulation',
    certificateNumber: certNo,
  };
}

module.exports = {
  sendVerificationLinkEmail,
  generateVerificationLinkEmailHtml,
  sendOtpEmail,
  generateOtpEmailHtml,
  sendPasswordResetEmail,
  generatePasswordResetEmailHtml,
  sendScholarshipAwardCertificateEmail,
  generateScholarshipAwardCertificateHtml,
};

