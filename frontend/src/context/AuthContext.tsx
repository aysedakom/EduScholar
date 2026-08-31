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
  devOtp?: string;
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
  resendOtp: (email: string, purpose?: string) => Promise<{ success: boolean; devOtp?: string }>;
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
  resetAllSystemData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('user_role') as UserRole) || 'student';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user_profile');
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
    return localStorage.getItem('token') || null;
  });

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
      localStorage.setItem('user_role', user.role);
    } else {
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

  const loginRequest = async (email: string, password: string): Promise<LoginRequestResult> => {
    setApiError(null);
    try {
      const res = await authApi.login(email, password);

      // If direct authenticated token and user returned, initialize session immediately
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
        setApiError(null);
      }

      return {
        requireOtp: res.data.requireOtp,
        requirePasswordReset: res.data.requirePasswordReset || res.data.mustResetPassword,
        mustResetPassword: res.data.mustResetPassword || res.data.requirePasswordReset,
        reason: res.data.reason,
        email: res.data.email || email,
        devOtp: res.data.devOtp,
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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_profile', JSON.stringify(fullUser));
      localStorage.setItem('user_role', respUser.role);
      setApiError(null);
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid or expired verification code.';
      setApiError(message);
      throw new Error(message);
    }
  };

  const resendOtp = async (email: string, purpose: string = 'login'): Promise<{ success: boolean; devOtp?: string }> => {
    try {
      const res = await authApi.resendOtp(email, purpose);
      toast.success(res.data.message || 'A fresh verification code has been dispatched to your email.');
      return { success: true, devOtp: res.data.devOtp };
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

  const login = async (email: string, _password: string, targetRole: UserRole = 'student'): Promise<boolean> => {
    setApiError(null);
    try {
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
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_role');
    toast.info('Signed out successfully.');
    window.location.href = '/login';
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
      window.location.href = '/login';
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
