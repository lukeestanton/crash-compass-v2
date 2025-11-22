"use client";
import Sparkline from "./Sparkline";

interface OutlookCardProps {
  title: string;
  category: string;
  score?: number | null;
  color: string;
  heroSeriesData: { name: string; series: { date: string; value: string }[] };
  onToggle: () => void;
}

export default function OutlookCard({
  title,
  category,
  score = null,
  color,
  heroSeriesData,
  onToggle,
}: OutlookCardProps) {
  // Prepare sparkline data (last 24 points for trend)
  const sparklineValues = heroSeriesData.series
    .slice(-24)
    .map((p) => parseFloat(p.value))
    .filter((v) => !isNaN(v));

  return (
    <div
      onClick={onToggle}
      className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Colored status bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2" 
        style={{ backgroundColor: color }} 
      />

      <div className="p-5 pl-7 h-full flex flex-col justify-between gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">{category}</p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
          </div>
          
          <div className="text-right">
             <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {typeof score === "number" ? `${score}%` : "—"}
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Stability Score</div>
          </div>
        </div>

        {/* Sparkline Visual */}
        <div className="relative h-16 w-full mt-2">
          <Sparkline data={sparklineValues} color={color} height={64} />
          
          {/* Overlay gradient for polish */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
        </div>
        
        {/* Interactive Hint */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors mt-1">
          <span>View Analysis</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </div>
  );
}
