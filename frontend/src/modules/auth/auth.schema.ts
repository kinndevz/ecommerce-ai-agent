import { z } from 'zod'

// Login Schema
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

// OTP Verification Schema
export const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
})

export type OTPFormValues = z.infer<typeof otpSchema>
