import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@shared/ui/field';
import { Input } from '@shared/ui/input';
import { Alert, AlertDescription } from '@shared/ui/alert';

type SignupFormProps = Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fieldErrors?: {
    fullName?: string;
    companyName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  formError?: string | null;
  isLoading?: boolean;
  onFullNameChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SignupForm({
  className,
  fullName,
  companyName,
  email,
  password,
  confirmPassword,
  fieldErrors,
  formError,
  isLoading = false,
  onFullNameChange,
  onCompanyNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  ...props
}: SignupFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Register your company to start screening candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={fieldErrors?.fullName ? true : undefined}>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Recruiter"
                  value={fullName}
                  onChange={(event) => onFullNameChange(event.target.value)}
                  aria-invalid={fieldErrors?.fullName ? true : undefined}
                />
                <FieldError>{fieldErrors?.fullName}</FieldError>
              </Field>

              <Field data-invalid={fieldErrors?.companyName ? true : undefined}>
                <FieldLabel htmlFor="companyName">Company name</FieldLabel>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(event) => onCompanyNameChange(event.target.value)}
                  aria-invalid={fieldErrors?.companyName ? true : undefined}
                />
                <FieldError>{fieldErrors?.companyName}</FieldError>
              </Field>

              <Field data-invalid={fieldErrors?.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  aria-invalid={fieldErrors?.email ? true : undefined}
                />
                <FieldError>{fieldErrors?.email}</FieldError>
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field
                    data-invalid={fieldErrors?.password ? true : undefined}
                  >
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        onPasswordChange(event.target.value)
                      }
                      aria-invalid={fieldErrors?.password ? true : undefined}
                    />
                    <FieldError>{fieldErrors?.password}</FieldError>
                  </Field>
                  <Field
                    data-invalid={fieldErrors?.confirmPassword ? true : undefined}
                  >
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        onConfirmPasswordChange(event.target.value)
                      }
                      aria-invalid={
                        fieldErrors?.confirmPassword ? true : undefined
                      }
                    />
                    <FieldError>{fieldErrors?.confirmPassword}</FieldError>
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create account'}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  <Link to="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
