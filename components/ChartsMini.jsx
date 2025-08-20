import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#60a5fa', '#34d399'];

export function MiniPie({ data, title, compact = false }) {  // ✅ default value
  return (
    <div className="tile">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className={compact ? 'h-40' : 'h-48'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60}>
              {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
