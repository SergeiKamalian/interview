import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/model/authSlice';
import { useAppDispatch } from '@app/store/hooks';
import { tokenStorage } from '@shared/lib/token-storage';
import { LoginForm } from '@shared/ui/login-form';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
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
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
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
          : 'Sign in failed. Please try again.';
      setFormError(message);
    }
  };

  return (
    <LoginForm
      email={email}
      password={password}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={(event) => void handleSubmit(event)}
    />
  );
}
