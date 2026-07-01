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
    <div className="h-80 w-full mt-2 font-mono text-[11px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderWidth: 1,
              borderRadius: 6,
              fontSize: 11,
              boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: 'var(--font-sans)', fontWeight: 500 }} />
          <Line
            type="monotone"
            dataKey="pv"
            name="全站总浏览量 (PV)"
            stroke="var(--chart-1)"
            strokeWidth={2}
            activeDot={{ r: 4, strokeWidth: 1, stroke: 'var(--card)' }}
          />
          <Line
            type="monotone"
            dataKey="uv"
            name="独立IP数 (UV)"
            stroke="var(--chart-2)"
            strokeWidth={2}
            activeDot={{ r: 4, strokeWidth: 1, stroke: 'var(--card)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
