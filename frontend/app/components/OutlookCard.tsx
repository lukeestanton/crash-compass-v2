"use client";
import { useState } from "react";
import Sparkline from "./Sparkline";
import EChartLine from "./EChartLine";
import { apiGet } from "@/lib/api";

interface OutlookCardProps {
  title: string;
  category: string;
  score?: number | null;
  color: string;
  heroSeriesData: { name: string; series: { date: string; value: string }[] };
  description: string;
  otherSeriesIds: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export default function OutlookCard({
  title,
  category,
  score = null,
  color,
  heroSeriesData,
  description,
  otherSeriesIds,
  isExpanded,
  onToggle,
}: OutlookCardProps) {
  const [showMore, setShowMore] = useState(false);
  const [otherSeriesData, setOtherSeriesData] = useState<
    { id: string; name: string; citation?: string; series: { date: string; value: string }[] }[]
  >([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Prepare sparkline data (last 24 points for trend)
  const sparklineValues = heroSeriesData.series
    .slice(-24)
    .map((p) => parseFloat(p.value))
    .filter((v) => !isNaN(v));

  const handleShowMore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMore) {
      setShowMore(false);
      return;
    }

    if (otherSeriesData.length === 0 && otherSeriesIds.length > 0) {
      setLoadingMore(true);
      try {
        const data = await Promise.all(
          otherSeriesIds.map(async (id) => {
            const res = await apiGet<{
              name: string;
              citation?: string;
              series: { date: string; value: string }[];
            }>(`/api/v1/fred/series/${id}`);
            return { id, ...res };
          })
        );
        setOtherSeriesData(data);
      } catch (error) {
        console.error("Failed to fetch secondary series", error);
      } finally {
        setLoadingMore(false);
      }
    }
    setShowMore(true);
  };

  return (
    <div
      onClick={onToggle}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
        isExpanded ? "col-span-1 md:col-span-2 ring-2 ring-offset-2 ring-gray-200" : ""
      }`}
    >
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <div>
            <h3 className="font-semibold text-gray-900">{title} Stability</h3>
            <p className="text-sm text-gray-500 capitalize">{category}</p>
          </div>
        </div>

        {/* Sparkline for collapsed view */}
        {!isExpanded && (
          <div className="flex-1 h-10 mx-4 hidden sm:block">
            <Sparkline data={sparklineValues} color={color} height={40} />
          </div>
        )}

        <div className="text-right pl-4">
          <div className="text-lg font-bold text-gray-800">
            {typeof score === "number" ? `${score}%` : "—%"}
          </div>
          <div className="text-xs text-gray-500">Status</div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 cursor-auto" onClick={(e) => e.stopPropagation()}>
          <div className="mb-6">
             <p className="text-lg text-gray-700 font-medium italic border-l-4 border-gray-300 pl-4 py-1">
               "{description}"
             </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
            <EChartLine
              title={heroSeriesData.name}
              points={heroSeriesData.series}
              height={300}
            />
          </div>

          {otherSeriesIds.length > 0 && (
            <div className="text-center mt-4">
              <button
                onClick={handleShowMore}
                disabled={loadingMore}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline decoration-dotted underline-offset-4"
              >
                {loadingMore
                  ? "Loading..."
                  : showMore
                  ? "Hide detailed metrics"
                  : `Show ${otherSeriesIds.length} more metrics`}
              </button>
            </div>
          )}

          {showMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {otherSeriesData.map((s) => (
                <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <EChartLine title={s.name} points={s.series} height={250} />
                  {s.citation && (
                    <p className="text-xs text-gray-400 mt-2">Source: {s.citation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
                Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
