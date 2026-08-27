// frontend/src/api/auth.ts
import api from './axios';
import type { UserRole, User } from '../types';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequestResponse {
  requireOtp?: boolean;
  email?: string;
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export const register = (payload: RegisterPayload) => {
  return api.post<RegisterResponse>('/auth/register', payload);
};

export const login = (email: string, password: string) => {
  return api.post<LoginRequestResponse>('/auth/login', { email, password });
};

export const verifyOtp = (email: string, otp: string) => {
  return api.post<AuthResponse>('/auth/verify-otp', { email, otp });
};

export const resendOtp = (email: string, purpose: string = 'login') => {
  return api.post<{ success: boolean; message: string }>('/auth/resend-otp', { email, purpose });
};

export const verifyEmail = (token: string, email?: string) => {
  return api.post<{ success: boolean; message: string; email: string }>('/auth/verify-email', { token, email });
};

export const resendVerification = (email: string) => {
  return api.post<{ success: boolean; message: string }>('/auth/resend-verification', { email });
};

export const forgotPassword = (email: string) => {
  return api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
};

export const resetPassword = (token: string, newPassword: string, email?: string) => {
  return api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, newPassword, email });
};

export const getMe = () => {
  return api.get<{ user: User }>('/auth/me');
};

export const updateProfile = (profileData: Partial<User>) => {
  return api.put<{ message: string; user: User }>('/auth/profile', profileData);
};
