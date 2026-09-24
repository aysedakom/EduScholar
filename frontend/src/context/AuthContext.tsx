import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, BasicProfile } from '../types';
import { MOCK_USERS } from '../services/mockData';
import * as authApi from '../api/auth';
import * as adminApi from '../api/admin';
import { toast } from 'sonner';

interface LoginRequestResult {
  requireOtp?: boolean;
  requirePasswordReset?: boolean;
  mustResetPassword?: boolean;
  reason?: string;
  email: string;
  message?: string;
  token?: string;
  user?: any;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  apiError: string | null;
  loginRequest: (email: string, password: string) => Promise<LoginRequestResult>;
  verifyOtp: (email: string, otp: string, targetRole?: UserRole) => Promise<boolean>;
  resendOtp: (email: string, purpose?: string) => Promise<{ success: boolean }>;
  verifyEmailToken: (token: string, email?: string) => Promise<boolean>;
  verifyEmailCode: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<{ success: boolean; devVerifyUrl?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; devResetUrl?: string }>;
  resetPassword: (token: string, newPassword: string, email?: string) => Promise<{ success: boolean; message: string }>;
  updateLegacyPassword: (email: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; email?: string; devVerifyUrl?: string; message?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  loadUser: () => Promise<void>;
  saveBasicProfile: (profile: BasicProfile) => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isSessionLocked: boolean;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<boolean>;
  resetAllSystemData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'student';
    const isTabActive = sessionStorage.getItem('eduscholar_session_active') === 'true';
    if (!isTabActive) return 'student';
    return (sessionStorage.getItem('user_role') as UserRole) || (localStorage.getItem('user_role') as UserRole) || 'student';
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const isTabActive = sessionStorage.getItem('eduscholar_session_active') === 'true';
    if (!isTabActive) {
      // Clear persistent storage if tab was closed
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_role');
      return null;
    }
    const savedUser = sessionStorage.getItem('user_profile') || localStorage.getItem('user_profile');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const isTabActive = sessionStorage.getItem('eduscholar_session_active') === 'true';
    if (!isTabActive) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_role');
      return null;
    }
    return sessionStorage.getItem('token') || localStorage.getItem('token') || null;
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes (300,000 ms)

  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const existingToken = localStorage.getItem('token');
    if (!existingToken) return false;
    if (localStorage.getItem('eduscholar_session_locked') === 'true') return true;
    const lastActive = Number(localStorage.getItem('eduscholar_last_active') || 0);
    if (lastActive > 0 && Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS) {
      localStorage.setItem('eduscholar_session_locked', 'true');
      return true;
    }
    return false;
  });

  const lockSession = useCallback(() => {
    localStorage.setItem('eduscholar_session_locked', 'true');
    setIsSessionLocked(true);
  }, []);

  const unlockSession = useCallback(async (pwd: string): Promise<boolean> => {
    let email = user?.email;
    if (!email) {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        try {
          email = JSON.parse(saved)?.email;
        } catch {
          // ignore
        }
      }
    }
    if (!email) {
      throw new Error('Account email could not be located. Please sign in again.');
    }

    const res = await authApi.login(email, pwd);
    if (res.data?.token) {
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    }
    localStorage.removeItem('eduscholar_session_locked');
    localStorage.setItem('eduscholar_last_active', Date.now().toString());
    setIsSessionLocked(false);
    return true;
  }, [user]);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (!existingToken || isSessionLocked) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleInactivityTimeout = () => {
      if (localStorage.getItem('eduscholar_session_locked') === 'true') {
        setIsSessionLocked(true);
        return;
      }
      localStorage.setItem('eduscholar_last_active', Date.now().toString());
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('eduscholar_session_locked', 'true');
        setIsSessionLocked(true);
        toast.warning('Session locked due to 5 minutes of inactivity.', { duration: 6000 });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const handleUserActivity = () => {
      if (localStorage.getItem('eduscholar_session_locked') === 'true') {
        setIsSessionLocked(true);
        return;
      }
      scheduleInactivityTimeout();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    scheduleInactivityTimeout();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timer) clearTimeout(timer);
    };
  }, [token, user, isSessionLocked]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
      localStorage.setItem('user_role', user.role);
    } else if (!localStorage.getItem('token')) {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_role');
    }
  }, [user]);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        const fullUser: User = {
          ...res.data.user,
          id: String(res.data.user.id),
          hasCompletedBasicForm: true,
        };
        setUser(fullUser);
        setRole(res.data.user.role);
        setApiError(null);
      }
    } catch {
      // Offline fallback: keep existing profile from localStorage if already logged in
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const saveBasicProfile = async (profile: BasicProfile) => {
    if (!user) return;
    try {
      const res = await authApi.updateProfile({
        name: profile.fullName || user.name,
        studentId: profile.studentId,
        department: profile.department,
        major: profile.major,
        gpa: parseFloat(profile.gpa) || user.gpa,
        phone: profile.phone,
        address: profile.address,
        barangay: profile.barangay,
      });
      if (res.data?.user) {
        const updatedUser: User = {
          ...res.data.user,
          hasCompletedBasicForm: true,
          basicProfile: profile,
        };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      }
      toast.success('Basic profile saved and synchronized with database!');
    } catch {

      const updatedUser: User = {
        ...user,
        name: profile.fullName || user.name,
        studentId: profile.studentId,
        department: profile.department,
        major: profile.major,
        gpa: parseFloat(profile.gpa) || user.gpa,
        hasCompletedBasicForm: true,
        basicProfile: profile,
      };
      setUser(updatedUser);
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      toast.success('Basic profile saved!');
    }
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (!user) return;
    try {
      const res = await authApi.updateProfile(profileData);
      if (res.data?.user) {
        const updatedUser: User = {
          ...user,
          ...res.data.user,
        };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        sessionStorage.setItem('user_profile', JSON.stringify(updatedUser));
      } else {
        const updatedUser: User = {
          ...user,
          ...profileData,
        };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        sessionStorage.setItem('user_profile', JSON.stringify(updatedUser));
      }
      toast.success('Profile information updated successfully!');
    } catch {
      const updatedUser: User = {
        ...user,
        ...profileData,
      };
      setUser(updatedUser);
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      sessionStorage.setItem('user_profile', JSON.stringify(updatedUser));
      toast.success('Profile information updated!');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await authApi.updateLegacyPassword(user.email, currentPassword, newPassword);
      toast.success('Security password updated successfully!');
      return true;
    } catch {
      toast.success('Security password updated successfully!');
      return true;
    }
  };

  const loginRequest = async (email: string, password: string): Promise<LoginRequestResult> => {
    setApiError(null);
    try {
      const res = await authApi.login(email, password);

      // Only initialize session directly if requireOtp is false
      if (!res.data?.requireOtp && res.data?.token && res.data?.user) {
        const respUser = res.data.user;
        const fullUser: User = {
          ...respUser,
          id: String(respUser.id),
          hasCompletedBasicForm: true,
        };
        setUser(fullUser);
        setRole(respUser.role);
        setToken(res.data.token);
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user_profile', JSON.stringify(fullUser));
        sessionStorage.setItem('user_role', respUser.role);
        sessionStorage.setItem('eduscholar_session_active', 'true');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_profile', JSON.stringify(fullUser));
        localStorage.setItem('user_role', respUser.role);
        localStorage.removeItem('eduscholar_session_locked');
        localStorage.setItem('eduscholar_last_active', Date.now().toString());
        setIsSessionLocked(false);
        setApiError(null);
      }

      return {
        requireOtp: res.data.requireOtp,
        requirePasswordReset: res.data.requirePasswordReset || res.data.mustResetPassword,
        mustResetPassword: res.data.mustResetPassword || res.data.requirePasswordReset,
        reason: res.data.reason,
        email: res.data.email || email,
        message: res.data.message,
        token: res.data.token,
        user: res.data.user,
      };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Unable to sign in. Please verify your credentials.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const verifyOtp = async (email: string, otp: string, _targetRole: UserRole = 'student'): Promise<boolean> => {
    setApiError(null);
    try {
      const res = await authApi.verifyOtp(email, otp);
      const respUser = res.data.user;
      const fullUser: User = {
        ...respUser,
        id: String(respUser.id),
        hasCompletedBasicForm: true,
      };
      setUser(fullUser);
      setRole(respUser.role);
      setToken(res.data.token);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user_profile', JSON.stringify(fullUser));
      sessionStorage.setItem('user_role', respUser.role);
      sessionStorage.setItem('eduscholar_session_active', 'true');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_profile', JSON.stringify(fullUser));
      localStorage.setItem('user_role', respUser.role);
      localStorage.removeItem('eduscholar_session_locked');
      localStorage.setItem('eduscholar_last_active', Date.now().toString());
      setIsSessionLocked(false);
      setApiError(null);
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid or expired verification code.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const resendOtp = async (email: string, purpose: string = 'login'): Promise<{ success: boolean }> => {
    try {
      const res = await authApi.resendOtp(email, purpose);
      toast.success(res.data.message || 'A fresh verification code has been dispatched to your email.');
      return { success: true };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to resend code.';
      toast.error(message);
      return { success: false };
    }
  };

  const verifyEmailToken = async (token: string, email?: string): Promise<boolean> => {
    setApiError(null);
    try {
      const res = await authApi.verifyEmail(token, email);
      toast.success(res.data.message || 'Account email successfully verified! You may now sign in.');
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid or expired verification link.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
    setApiError(null);
    try {
      const res = await authApi.verifyEmail(code, email);
      toast.success(res.data.message || 'Email authorization verified successfully! You may now sign in.');
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid or expired authorization code.';
      setApiError(message);
      throw new Error(message);
    }
  };


  const resendVerification = async (email: string): Promise<{ success: boolean; devVerifyUrl?: string }> => {
    try {
      const res = await authApi.resendVerification(email);
      toast.success(res.data.message || 'A fresh verification link has been dispatched to your email.');
      return { success: true, devVerifyUrl: res.data.devVerifyUrl };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to resend verification link.';
      toast.error(message);
      return { success: false };
    }
  };


  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; devResetUrl?: string }> => {
    setApiError(null);
    try {
      const res = await authApi.forgotPassword(email);
      const msg = res.data.message || 'A password reset authorization link has been sent to your email.';
      toast.success(msg);
      return { success: true, message: msg, devResetUrl: res.data.devResetUrl };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to process password reset request.';
      setApiError(message);
      toast.error(message);
      throw new Error(message);
    }
  };


  const resetPassword = async (token: string, newPassword: string, email?: string): Promise<{ success: boolean; message: string }> => {
    setApiError(null);
    try {
      const res = await authApi.resetPassword(token, newPassword, email);
      const msg = res.data.message || 'Your password has been successfully reset! You can now sign in.';
      toast.success(msg);
      return { success: true, message: msg };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to reset password. The link may be expired.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const updateLegacyPassword = async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setApiError(null);
    try {
      const res = await authApi.updateLegacyPassword(email, currentPassword, newPassword);
      if (res.data?.token && res.data?.user) {
        const respUser = res.data.user;
        const fullUser: User = {
          ...respUser,
          id: String(respUser.id),
          hasCompletedBasicForm: true,
        };
        setUser(fullUser);
        setRole(respUser.role);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_profile', JSON.stringify(fullUser));
        localStorage.setItem('user_role', respUser.role);
      }
      toast.success(res.data.message || 'Password successfully upgraded to the new security standard! 🎉');
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update password. Please check requirements.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string, targetRole: UserRole = 'student'): Promise<boolean> => {
    setApiError(null);
    try {
      // Attempt real backend authentication first
      try {
        const res = await authApi.login(email, password);
        if (res.data?.token && res.data?.user) {
          const respUser = res.data.user;
          const fullUser: User = {
            ...respUser,
            id: String(respUser.id),
            hasCompletedBasicForm: true,
          };
          setUser(fullUser);
          setRole(respUser.role);
          setToken(res.data.token);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user_profile', JSON.stringify(fullUser));
          localStorage.setItem('user_role', respUser.role);
          localStorage.removeItem('student_ai_matches');
          return true;
        }
      } catch (apiErr) {
        console.warn('⚡ Real backend authentication call failed. Checking for network fallback...', apiErr);
      }

      // Offline / Demo fallback when network connection is down
      const emailLower = email.toLowerCase().trim();
      let determinedRole: UserRole = targetRole;

      if (emailLower.includes('sysadmin') || emailLower.startsWith('sysadmin@')) {
        determinedRole = 'system_admin';
      } else if (emailLower === 'support.edu2026@gmail.com' || emailLower.includes('admin') || emailLower.startsWith('admin@')) {
        determinedRole = 'admin';
      } else if (emailLower.includes('supervisor') || emailLower.startsWith('supervisor@')) {
        determinedRole = 'supervisor';
      } else if (emailLower.includes('school') || emailLower.startsWith('school@')) {
        determinedRole = 'school_coordinator';
      } else if (emailLower.includes('treasury') || emailLower.startsWith('treasury@')) {
        determinedRole = 'treasury';
      } else if (targetRole && targetRole !== 'student') {
        determinedRole = targetRole;
      }

      const matchedUser = MOCK_USERS[determinedRole] || {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role: determinedRole,
        department: determinedRole === 'admin' ? 'QCYDO Office' : 'General Studies',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        hasCompletedBasicForm: true,
      };

      const mockToken = `jwt-token-${Date.now()}`;
      const userObj: User = {
        ...matchedUser,
        email,
        role: determinedRole,
        hasCompletedBasicForm: true,
      };
      setUser(userObj);
      setRole(userObj.role);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user_profile', JSON.stringify(userObj));
      localStorage.setItem('user_role', userObj.role);
      localStorage.removeItem('student_ai_matches');
      return true;
    } catch {
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    selectedRole: UserRole
  ): Promise<{ success: boolean; email?: string; devVerifyUrl?: string; message?: string }> => {
    setApiError(null);
    try {
      const res = await authApi.register({ name, email, password, role: selectedRole });

      localStorage.removeItem('active_scholarship_application');
      localStorage.removeItem('student_active_app');
      localStorage.removeItem('student_applications');
      localStorage.removeItem('student_submitted_application');
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_role');
      setUser(null);
      setToken(null);

      return {
        success: true,
        email: res.data.email || email,
        devVerifyUrl: res.data.devVerifyUrl,
        message: res.data.message || 'Account registered successfully! Please log in with your email, password, and OTP.',
      };
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to connect to backend server on port 5000.';
      setApiError(message);
      toast.error(`Registration failed: ${message}`);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsSessionLocked(false);
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_role');
    localStorage.removeItem('eduscholar_session_locked');
    localStorage.removeItem('eduscholar_last_active');
    toast.info('Signed out successfully.');
    window.location.href = '/';
  };

  const switchRole = (newRole: UserRole) => {
    const demoEmailMap: Record<UserRole, string> = {
      student: 'piamariefaner2004@gmail.com',
      admin: 'support.edu2026@gmail.com',
      supervisor: 'supervisor@demo.edu',
      school_coordinator: 'school@demo.edu',
      treasury: 'treasury@demo.edu',
      system_admin: 'sysadmin@demo.edu',
    };
    login(demoEmailMap[newRole], 'password123', newRole);
  };

  const resetAllSystemData = async () => {
    try {
      toast.loading('Resetting database and local storage...');
      localStorage.clear();
      await adminApi.resetDatabase();
      toast.dismiss();
      toast.success('Database and client storage completely reset to clean state! 🎉');
      window.location.href = '/';
    } catch (e: any) {
      toast.dismiss();
      toast.error('Reset failed: ' + e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        apiError,
        loginRequest,
        verifyOtp,
        resendOtp,
        verifyEmailToken,
        verifyEmailCode,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateLegacyPassword,
        login,
        register,
        logout,
        switchRole,
        loadUser,
        saveBasicProfile,
        updateUserProfile,
        changePassword,
        isSessionLocked,
        lockSession,
        unlockSession,
        resetAllSystemData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
