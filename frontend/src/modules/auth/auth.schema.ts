import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email({ message: 'Email không hợp lệ' }),
  password: z.string(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
