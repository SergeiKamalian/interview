import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/model/authSlice';
import { useAppDispatch } from '@app/store/hooks';
import { tokenStorage } from '@shared/lib/token-storage';
import { SignupForm } from '@shared/ui/signup-form';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    companyName?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    const nextErrors: typeof fieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    if (!companyName.trim()) {
      nextErrors.companyName = 'Company name is required';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    try {
      const result = await register({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        companyName: companyName.trim(),
      }).unwrap();

      tokenStorage.set(result.accessToken);
      dispatch(
        setCredentials({
          user: result.user,
          company: result.company,
        }),
      );
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Registration failed. Please try again.';
      setFormError(message);
    }
  };

  return (
    <SignupForm
      fullName={fullName}
      companyName={companyName}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      onFullNameChange={setFullName}
      onCompanyNameChange={setCompanyName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={(event) => void handleSubmit(event)}
    />
  );
}
