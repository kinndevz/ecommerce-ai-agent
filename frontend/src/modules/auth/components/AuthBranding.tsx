import { Leaf, FlaskConical, Rabbit } from 'lucide-react'

export const AuthBranding = () => {
  return (
    <div className='relative hidden lg:flex flex-col justify-between p-16 bg-muted'>
      {/* Background Image */}
      <div className='absolute inset-0 z-0'>
        <img
          src='https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop'
          alt='Brand Texture'
          className='w-full h-full object-cover brightness-[0.7]'
        />
        <div className='absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent' />
      </div>

      {/* Content Layer */}
      <div className='relative z-10 h-full flex flex-col justify-center items-center text-center space-y-10'>
        {/* Logo */}
        <div className='w-24 h-24 rounded-full bg-card/10 backdrop-blur-xl border border-border/20 flex items-center justify-center shadow-2xl'>
          <Leaf className='w-10 h-10 text-primary drop-shadow-lg' />
        </div>

        {/* Typography */}
        <div className='space-y-6'>
          <h1 className='font-serif text-6xl lg:text-7xl font-medium tracking-tight text-foreground drop-shadow-md'>
            Timeless <br />
            <span className='italic text-primary'>Beauty</span>
          </h1>
          <p className='text-foreground/80 max-w-md mx-auto text-lg font-light leading-relaxed tracking-wide'>
            Experience the synergy of nature and science. <br />
            Join our exclusive circle for skincare that transcends time.
          </p>
        </div>

        {/* Features Icons */}
        <div className='grid grid-cols-3 gap-16 pt-12 border-t border-border/20 mt-12'>
          {[
            { icon: Leaf, label: 'ORGANIC' },
            { icon: FlaskConical, label: 'CLINICAL' },
            { icon: Rabbit, label: 'ETHICAL' },
          ].map((item, idx) => (
            <div
              key={idx}
              className='flex flex-col items-center gap-4 group cursor-pointer'
            >
              <div className='p-3 rounded-full bg-card/10 group-hover:bg-primary/20 transition-all duration-300'>
                <item.icon className='w-6 h-6 text-foreground/90 group-hover:text-primary transition-colors' />
              </div>
              <span className='text-[10px] uppercase tracking-[0.2em] font-medium text-foreground/60 group-hover:text-foreground transition-colors'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
