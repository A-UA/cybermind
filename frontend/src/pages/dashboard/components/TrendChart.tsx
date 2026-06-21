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
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
          />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderWidth: 2,
              borderRadius: 8,
              fontSize: 11,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
          <Line
            type="monotone"
            dataKey="pv"
            name="全站总浏览量 (PV)"
            stroke="#3b82f6"
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--border)' }}
          />
          <Line
            type="monotone"
            dataKey="uv"
            name="独立IP数 (UV)"
            stroke="#10b981"
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--border)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
