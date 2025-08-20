import { MiniPie } from './ChartsMini';

export default function TileCard({
  icon,
  title,
  bigNumber,
  subText,
  pieData,
  compact = false,   // ✅ default value
}) {
  const isCompact = Boolean(compact); // ✅ avoid bare `compact` in JSX

  return (
    <div className="tile relative">
      <div className={`absolute top-3 right-3 ${isCompact ? 'text-xl' : 'text-2xl'}`}>{icon}</div>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} opacity-70`}>{title}</div>
      <div className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-bold my-1`}>{bigNumber}</div>
      {subText && (
        <div className={`opacity-80 ${isCompact ? 'text-xs' : 'text-sm'} mb-2`}>{subText}</div>
      )}
      {pieData && <MiniPie data={pieData} title="NTK vs TVK" compact={isCompact} />}
    </div>
  );
}
