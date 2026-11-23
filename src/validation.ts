import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email address.').pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Enter your password.'),
});

export type LoginFields = z.infer<typeof loginSchema>;
export type LoginErrors = Partial<Record<keyof LoginFields, string>>;

export function validateLogin(values: LoginFields): LoginErrors {
  const errors: LoginErrors = {};
  const result = loginSchema.safeParse(values);
  if (result.success) return errors;
  result.error.issues.forEach(issue => {
    const field = issue.path[0];
    if (field === 'email' || field === 'password') errors[field] ??= issue.message;
  });
  return errors;
}
