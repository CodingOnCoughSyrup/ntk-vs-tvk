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

  const isCompact = !!compact;
  const innerR = isCompact ? 22 : 35;
  const outerR = isCompact ? 38 : 60;

  return (
    <div>
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className={isCompact ? 'h-24 md:h-36' : 'h-36 md:h-48'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={enriched} dataKey="value" nameKey="name" innerRadius={innerR} outerRadius={outerR}>
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
      <div className={`mt-2 ${isCompact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:gap-x-6`}>
        {enriched.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 md:w-3 md:h-3" style={{ backgroundColor: d.color }} />
            <span className="font-medium">{d.name}:</span>
            <span>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
