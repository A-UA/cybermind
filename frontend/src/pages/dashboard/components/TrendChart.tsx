import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { ITrendItem } from '@/types/dashboard'

interface TrendChartProps {
  data: ITrendItem[]
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'currentColor', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderWidth: 1,
              borderRadius: 12,
              fontSize: 12,
              boxShadow: 'var(--shadow-md)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Line
            type="monotone"
            dataKey="pv"
            name="全站总浏览量 (PV)"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            activeDot={{ r: 5, strokeWidth: 1.5, stroke: 'var(--card)' }}
          />
          <Line
            type="monotone"
            dataKey="uv"
            name="独立IP数 (UV)"
            stroke="var(--chart-2)"
            strokeWidth={2.5}
            activeDot={{ r: 5, strokeWidth: 1.5, stroke: 'var(--card)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
