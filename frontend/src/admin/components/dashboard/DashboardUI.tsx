import { ChartAreaInteractive } from '../sidebar/chart-area-interactive'
import { DataTable, schema } from '../sidebar/data-table'
import { SectionCards } from '../sidebar/section-cards'
import rawData from '../../data.json'
import type z from 'zod'

type Task = z.infer<typeof schema>
const tasks: Task[] = rawData as Task[]

export default function DashboardUI() {
  return (
    // 👇 Thêm p-4 (mobile) và md:p-8 (desktop) để căn lề chuẩn
    <div className='flex flex-1 flex-col gap-4 p-4 md:p-8 @container/main'>
      <div className='block w-full'>
        <SectionCards />
      </div>

      <div className='grid gap-4 grid-cols-1'>
        <ChartAreaInteractive />
      </div>

      <div className='min-h-screen flex-1 rounded-xl md:min-h-min'>
        <DataTable data={tasks} />
      </div>
    </div>
  )
}
