import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { loginSchema, type LoginFormValues } from './auth.schema'
import { useAuth } from '@/hooks/useAuth'

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const { login, isLoading } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
      // Success! Context will:
      // 1. Save access token

      // 2. Fetch user profile
      // 3. Show success toast
      // 4. Redirect to home
    } catch (error) {
      // Error already handled by context (toast shown)
      // Form stays on page for user to retry
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center lg:text-left'>
        <h3 className='text-2xl font-serif font-bold text-foreground'>
          Welcome Back
        </h3>
        <p className='text-sm text-muted-foreground'>
          Sign in to access your beauty collection
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Email Field */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-foreground'>
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className='relative group'>
                    <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      className='pl-10 h-12 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30'
                      disabled={isFetching}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          {/* Password Field */}
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
                      placeholder='Enter your password'
                      className='pl-10 pr-12 h-12 bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30'
                      disabled={isFetching}
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                      disabled={isFetching}
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

          {/* Remember Me & Forgot Password */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Checkbox id='remember' className='border-border' />
              <label
                htmlFor='remember'
                className='text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors'
              >
                Remember me
              </label>
            </div>
            <button
              type='button'
              className='text-sm font-semibold text-primary hover:underline transition-colors'
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full h-12 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group'
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className='relative my-8'>
        <div className='absolute inset-0 flex items-center'>
          <Separator />
        </div>
        <div className='relative flex justify-center'>
          <span className='px-4 py-2 text-sm font-semibold text-foreground bg-card border border-border/50 rounded-full shadow-sm'>
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className='grid grid-cols-2 gap-3'>
        {[
          {
            id: 'google',
            label: 'Google',
            icon: FcGoogle,
            onClick: () => console.log('Google OAuth - Coming soon'),
          },
          {
            id: 'facebook',
            label: 'Facebook',
            icon: FaFacebook,
            iconClass: 'text-blue-500',
            onClick: () => console.log('Facebook OAuth - Coming soon'),
          },
        ].map((provider) => {
          const Icon = provider.icon
          return (
            <Button
              key={provider.id}
              type='button'
              variant='default'
              size='default'
              className='h-11'
              disabled={isFetching}
              onClick={provider.onClick}
              aria-label={`Sign in with ${provider.label}`}
            >
              <Icon className={`w-5 h-5 ${provider.iconClass || ''}`} />
              <span className='font-medium'>{provider.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
