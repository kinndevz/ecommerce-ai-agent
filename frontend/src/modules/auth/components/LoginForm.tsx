import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { IoLockClosedOutline } from 'react-icons/io5'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { loginSchema, type LoginFormValues } from '../auth.schema'
import { NavLink } from 'react-router-dom'

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {}

  return (
    <div className='flex flex-col h-full bg-card p-6 sm:p-8 overflow-hidden relative'>
      <div className='flex justify-between items-center shrink-0 h-10'>
        <span className='font-serif text-2xl font-bold tracking-wide text-foreground'>
          LUMIÈRE
        </span>
        <NavLink to='/home'>
          <Button
            variant='ghost'
            className='text-[10px] font-medium tracking-widest text-muted-foreground hover:text-primary uppercase gap-2 h-8'
          >
            Back to Shop <ArrowRight className='w-3 h-3' />
          </Button>
        </NavLink>
      </div>

      <div className='flex-1 flex flex-col justify-center w-full max-w-95 mx-auto z-10'>
        {/* Toggle Buttons */}
        <div className='flex p-1 bg-muted rounded-full w-fit mx-auto border border-border mb-5'>
          <Button
            type='button'
            variant={isLogin ? 'default' : 'ghost'}
            onClick={() => setIsLogin(true)}
            className={`px-6 h-7 rounded-full text-[10px] font-bold tracking-widest transition-all ${
              isLogin
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }`}
          >
            SIGN IN
          </Button>
          <Button
            type='button'
            variant={!isLogin ? 'default' : 'ghost'}
            onClick={() => setIsLogin(false)}
            className={`px-6 h-7 rounded-full text-[10px] font-bold tracking-widest transition-all ${
              !isLogin
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }`}
          >
            SIGN UP
          </Button>
        </div>

        <div className='text-center space-y-1 mb-5'>
          <h2 className='font-serif text-3xl text-foreground'>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className='text-muted-foreground font-light text-xs'>
            {isLogin
              ? 'Enter details to access your collection.'
              : 'Sign up to start your beauty journey.'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-0.5'>
                  <FormLabel className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1'>
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Input
                        placeholder='johndoe@lumiere.com'
                        className='pl-9 pr-4 h-10 text-sm bg-muted/50 border-border rounded-lg focus-visible:ring-primary'
                        {...field}
                      />
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    </div>
                  </FormControl>
                  <FormMessage className='text-[10px]' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-0.5'>
                  <FormLabel className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        className='pl-9 pr-10 h-10 text-sm bg-muted/50 border-border rounded-lg focus-visible:ring-primary'
                        {...field}
                      />
                      <IoLockClosedOutline className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none disabled:opacity-50'
                      >
                        {showPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-[10px]' />
                </FormItem>
              )}
            />

            {isLogin && (
              <div className='flex justify-end pt-1'>
                <NavLink
                  to='/forgot-password'
                  className='text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors tracking-widest'
                >
                  FORGOT PASSWORD?
                </NavLink>
              </div>
            )}

            <Button
              type='submit'
              className='w-full h-10 text-xs font-bold tracking-widest rounded-lg mt-2'
            >
              Sign in
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className='relative my-4'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-[9px] uppercase tracking-widest font-bold'>
            <span className='bg-card px-2 text-muted-foreground/50'>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className='grid grid-cols-2 gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              // TODO: Implement Google OAuth
              console.log('Google login - Coming soon')
            }}
            className='h-9 text-xs rounded-lg border-border bg-transparent hover:bg-muted disabled:opacity-50'
          >
            <FaGoogle className='mr-2 w-3 h-3' /> Google
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              // TODO: Implement GitHub OAuth
              console.log('GitHub login - Coming soon')
            }}
            className='h-9 text-xs rounded-lg border-border bg-transparent hover:bg-muted disabled:opacity-50'
          >
            <FaGithub className='mr-2 w-3 h-3' /> Github
          </Button>
        </div>

        {/* Additional Links */}
        {isLogin && (
          <p className='text-center text-xs text-muted-foreground mt-6'>
            Don't have an account?{' '}
            <button
              type='button'
              onClick={() => setIsLogin(false)}
              className='text-primary font-semibold hover:underline'
            >
              Sign up
            </button>
          </p>
        )}

        {!isLogin && (
          <p className='text-center text-xs text-muted-foreground mt-6'>
            Already have an account?{' '}
            <button
              type='button'
              onClick={() => setIsLogin(true)}
              className='text-primary font-semibold hover:underline'
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
