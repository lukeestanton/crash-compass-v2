"use client";
import Link from "next/link";

interface OutlookCardProps {
  title: string;
  category: string;
  score?: number | null;
  color: string;
  href: string;
  loading?: boolean;
}

export default function OutlookCard({ title, category, score = null, color, href, loading = false }: OutlookCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
        <div 
          className="p-4 flex items-center justify-between"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{title} Stability</h3>
              <p className="text-sm text-gray-500 capitalize">{category}</p>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#c8bcab] rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-800">
                  {typeof score === "number" ? `${score}%` : "—%"}
                </div>
                <div className="text-xs text-gray-500">Status</div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 