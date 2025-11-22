"use client";
import { useEffect, useState } from "react";
import EChartLine from "./EChartLine";
import { apiGet } from "@/lib/api";

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    key: string;
    title: string;
    score: number | null;
    color: string;
    heroSeriesData: { name: string; series: { date: string; value: string }[] };
    description: string;
    otherSeriesIds: string[];
  } | null;
}

export default function DrillDownModal({ isOpen, onClose, category }: DrillDownModalProps) {
  const [otherSeriesData, setOtherSeriesData] = useState<
    { id: string; name: string; citation?: string; series: { date: string; value: string }[] }[]
  >([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && category && category.otherSeriesIds.length > 0) {
      setLoadingMore(true);
      setOtherSeriesData([]); // Clear previous data
      
      Promise.all(
        category.otherSeriesIds.map(async (id) => {
          try {
            const res = await apiGet<{
              name: string;
              citation?: string;
              series: { date: string; value: string }[];
            }>(`/api/v1/fred/series/${id}`);
            return { id, ...res };
          } catch (error) {
            console.error(`Failed to fetch series ${id}`, error);
            return null;
          }
        })
      )
        .then((results) => {
          setOtherSeriesData(results.filter((r): r is NonNullable<typeof r> => r !== null));
        })
        .finally(() => {
          setLoadingMore(false);
        });
    } else {
      setOtherSeriesData([]);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-500">Deep Dive Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* AI Insight */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">AI Insight</h3>
              <p className="text-blue-800/80 leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          {/* Primary Indicator */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Primary Indicator
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Key Driver</span>
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <EChartLine
                  title={category.heroSeriesData.name}
                  points={category.heroSeriesData.series}
                  height={350}
                />
              </div>
            </div>
          </section>

          {/* Supporting Metrics */}
          {category.otherSeriesIds.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Metrics</h3>
              
              {loadingMore ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[1, 2].map(i => (
                     <div key={i} className="h-[300px] bg-gray-50 rounded-xl border border-gray-100 animate-pulse flex items-center justify-center">
                       <span className="text-gray-400 font-medium">Loading metrics...</span>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherSeriesData.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <EChartLine title={s.name} points={s.series} height={250} />
                      {s.citation && (
                        <p className="text-xs text-gray-400 mt-3 pl-1 border-l-2 border-gray-200">
                          Source: {s.citation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

