import { AuthBranding } from '@/modules/auth/components/AuthBranding'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { ModeToggle } from '@/shared/components/mode-toggle'

const LoginPage = () => {
  return (
    <div className='h-screen w-full flex items-center justify-center bg-background p-4 font-sans overflow-hidden'>
      {/* Card Wrapper */}
      <div className='w-full max-w-400 h-[95vh] grid lg:grid-cols-2 overflow-hidden rounded-4xl border border-border bg-card shadow-2xl'>
        {/* Left Side */}
        <AuthBranding />

        {/* Right Side */}
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
