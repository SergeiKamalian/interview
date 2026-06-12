import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/model/authSlice';
import { useAppDispatch } from '@app/store/hooks';
import { tokenStorage } from '@shared/lib/token-storage';
import { Alert, Button, Input } from '@shared/ui';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
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
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Create account</h2>
        <p className="text-sm text-slate-600">
          Register your company and start screening candidates.
        </p>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <Input
        label="Full name"
        name="fullName"
        autoComplete="name"
        placeholder="Jane Recruiter"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        error={fieldErrors.fullName}
      />

      <Input
        label="Company name"
        name="companyName"
        autoComplete="organization"
        placeholder="Acme Corp"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
        error={fieldErrors.companyName}
      />

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
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
