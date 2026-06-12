import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/model/authSlice';
import { useAppDispatch } from '@app/store/hooks';
import { tokenStorage } from '@shared/lib/token-storage';
import { Alert, Button, Input } from '@shared/ui';

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
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
        <p className="text-sm text-slate-600">
          Access your company dashboard.
        </p>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="text-brand-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
