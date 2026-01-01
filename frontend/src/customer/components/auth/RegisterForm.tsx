import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { z } from 'zod'

// Register Schema
const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
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

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)

    // TODO: Implement actual registration API call
    console.log('Register values:', values)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center lg:text-left'>
        <h3 className='text-2xl font-serif font-bold text-foreground'>
          Create Account
        </h3>
        <p className='text-sm text-muted-foreground'>
          Join us and discover your perfect beauty routine
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* 2 Column Grid Layout */}
          <div className='grid sm:grid-cols-2 gap-4'>
            {/* Full Name */}
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='sm:col-span-2'>
                  <FormLabel className='text-sm font-medium text-foreground'>
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        placeholder='John Doe'
                        className='pl-10 h-11 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-foreground'>
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        className='pl-10 h-11 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-foreground'>
                    Phone{' '}
                    <span className='text-xs text-muted-foreground'>
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        type='tel'
                        placeholder='+84 123 456 789'
                        className='pl-10 h-11 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-foreground'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Min 6 characters'
                        className='pl-10 pr-12 h-11 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-foreground'>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Shield className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Repeat password'
                        className='pl-10 pr-12 h-11 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>

          {/* Terms & Conditions */}
          <FormField
            control={form.control}
            name='agreeToTerms'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-start space-x-3 p-4 rounded-xl bg-muted/30 border border-border/50'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className='mt-0.5'
                    />
                  </FormControl>
                  <div className='flex-1'>
                    <label className='text-sm text-muted-foreground cursor-pointer leading-relaxed'>
                      I agree to the{' '}
                      <button
                        type='button'
                        className='text-primary hover:underline font-semibold'
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type='button'
                        className='text-primary hover:underline font-semibold'
                      >
                        Privacy Policy
                      </button>
                    </label>
                    <FormMessage className='text-xs mt-1' />
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full h-12 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </Button>

          {/* Switch to Login */}
          <div className='text-center pt-2'>
            <p className='text-sm text-muted-foreground'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={onSwitchToLogin}
                className='text-primary font-bold hover:underline'
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
