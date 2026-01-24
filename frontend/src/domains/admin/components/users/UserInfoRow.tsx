interface UserInfoRowProps {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
}

export function UserInfoRow({ icon, label, value, mono = false }: UserInfoRowProps) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {icon}
        <span className='font-medium'>{label}</span>
      </div>
      <div className={`text-sm text-right ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
