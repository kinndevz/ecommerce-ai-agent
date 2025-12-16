import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Eye, EyeOff, ArrowRight, Chrome, Apple } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Separator } from '@/shared/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'

// Import Schema từ cùng module
import { loginSchema, type LoginFormValues } from '../auth.schema'

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    console.log('Submit:', values)
    // Call API here
  }

  return (
    <div className='relative flex flex-col h-full bg-card p-8 md:p-12 lg:p-16'>
      {/* Header */}
      <div className='flex justify-between items-center mb-auto'>
        <span className='font-serif text-3xl font-bold tracking-wide text-foreground'>
          LUMIÈRE
        </span>
        <Button
          variant='ghost'
          className='text-xs font-medium tracking-widest text-muted-foreground hover:text-primary uppercase gap-2'
        >
          Back to Shop <ArrowRight className='w-3 h-3' />
        </Button>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8'>
        {/* Toggle Buttons */}
        <div className='flex p-1 bg-muted rounded-full w-fit mx-auto border border-border'>
          <button
            type='button'
            onClick={() => setIsLogin(true)}
            className={`px-8 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 ${
              isLogin
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SIGN IN
          </button>
          <button
            type='button'
            onClick={() => setIsLogin(false)}
            className={`px-8 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 ${
              !isLogin
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SIGN UP
          </button>
        </div>

        <div className='text-center space-y-2'>
          <h2 className='font-serif text-4xl text-foreground'>Welcome Back</h2>
          <p className='text-muted-foreground font-light text-sm'>
            Enter your details to access your personal collection.
          </p>
        </div>

        {/* Form Start */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Input
                        placeholder='hello@lumiere.com'
                        className='pl-4 pr-10 h-12 bg-muted/50 border-border focus:border-primary/50 focus:bg-muted transition-all rounded-xl text-sm'
                        {...field}
                      />
                      <Mail className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex justify-between pl-1'>
                    <FormLabel className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
                      Password
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className='relative group'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        className='pl-4 pr-10 h-12 bg-muted/50 border-border focus:border-primary/50 focus:bg-muted transition-all rounded-xl text-sm'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                      >
                        {showPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='remember'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0 p-1'>
                  <div className='flex items-center space-x-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                      />
                    </FormControl>
                    <FormLabel className='text-sm text-muted-foreground/80 cursor-pointer font-light m-0'>
                      Remember me
                    </FormLabel>
                  </div>
                  <a
                    href='#'
                    className='text-xs font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide'
                  >
                    FORGOT PASSWORD?
                  </a>
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full h-12 text-sm font-bold tracking-widest rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all duration-300'
            >
              SIGN IN <ArrowRight className='ml-2 w-4 h-4' />
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full bg-border' />
          </div>
          <div className='relative flex justify-center text-[10px] uppercase tracking-widest font-bold'>
            <span className='bg-card px-4 text-muted-foreground/60'>
              Or continue with
            </span>
          </div>
        </div>

        {/* Socials */}
        <div className='grid grid-cols-2 gap-4'>
          <Button
            variant='outline'
            className='h-12 rounded-xl border-border bg-transparent hover:bg-muted hover:text-foreground transition-all'
          >
            <Chrome className='mr-2 w-4 h-4' /> Google
          </Button>
          <Button
            variant='outline'
            className='h-12 rounded-xl border-border bg-transparent hover:bg-muted hover:text-foreground transition-all'
          >
            <Apple className='mr-2 w-4 h-4' /> Apple
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto pt-6 text-center'>
        <p className='text-[10px] text-muted-foreground/40 uppercase tracking-widest font-medium'>
          By continuing, you agree to our{' '}
          <a
            href='#'
            className='underline decoration-muted-foreground/30 hover:text-foreground transition-colors'
          >
            Terms
          </a>{' '}
          and{' '}
          <a
            href='#'
            className='underline decoration-muted-foreground/30 hover:text-foreground transition-colors'
          >
            Privacy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
