import { MiniPie } from './ChartsMini';

export default function TileCard({
  icon,
  title,
  bigNumber,
  subText,
  pieData,
  compact = false,
  pieTitle,
}) {
  const isCompact = Boolean(compact);

  return (
    <div className="tile relative">
      <div className={`absolute top-3 right-3 ${isCompact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>{icon}</div>
      <div className={`${isCompact ? 'min-h-[68px] md:min-h-0' : ''} mb-2`}>
        <div className={`${isCompact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-semibold text-black dark:text-white`}>{title}</div>
        <div className={`${isCompact ? 'text-xl md:text-2xl' : 'text-3xl'} font-bold my-1`}>{bigNumber}</div>
        {subText && (
          <div className={`opacity-80 ${isCompact ? 'text-[11px] md:text-xs' : 'text-sm'}`}>{subText}</div>
        )}
      </div>
      {pieData && <MiniPie data={pieData} title={pieTitle} compact={isCompact} />}
    </div>
  );
}
