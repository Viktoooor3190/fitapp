import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormData, ValidationErrors, UserRole } from '../types';

export const useSignup = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    name: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual signup logic with Supabase
      console.log('Signing up with:', formData);
      
      // Redirect based on role
      if (formData.role === 'coach') {
        navigate('/coach/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'An error occurred during signup' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof SignupFormData, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
  };
}; 