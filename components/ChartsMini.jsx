import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#60a5fa', '#34d399'];

export function MiniPie({ data = [], title, compact = false }) {
  const safe = Array.isArray(data) ? data : [];
  const total = safe.reduce((sum, d) => sum + (Number(d?.value) || 0), 0);

  const enriched = safe.map((d, idx) => {
    const value = Number(d?.value) || 0;
    const pct = total ? Math.round((value / total) * 100) : 0;
    return { ...d, value, pct, color: COLORS[idx % COLORS.length] };
  });

  return (
    <div className="tile">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className={compact ? 'h-40' : 'h-48'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={enriched} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60}>
              {enriched.map((d, idx) => (
                <Cell key={idx} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
            {/* Removed <Legend /> */}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Single combined legend: square swatch + label + % */}
      <div className={`mt-2 ${compact ? 'text-xs' : 'text-sm'} flex items-center justify-center gap-6`}>
        {enriched.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3" style={{ backgroundColor: d.color }} />
            <span className="font-medium">{d.name}:</span>
            <span>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
