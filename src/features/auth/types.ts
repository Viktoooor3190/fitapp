export type UserRole = 'coach' | 'user';

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  name: string;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
} 