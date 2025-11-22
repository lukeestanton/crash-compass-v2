"use client";
import { useState } from "react";
import OutlookCard from "./OutlookCard";

interface CategoryData {
  key: string;
  title: string;
  score: number | null;
  color: string;
  heroSeriesData: { name: string; series: { date: string; value: string }[] };
  description: string;
  otherSeriesIds: string[];
}

interface DashboardGridProps {
  categoriesData: CategoryData[];
}

export default function DashboardGrid({ categoriesData }: DashboardGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
      {categoriesData.map((cat) => (
        <div
          key={cat.key}
          className={`transition-all duration-300 ease-in-out ${
            expandedId === cat.key ? "md:col-span-2" : ""
          }`}
        >
          <OutlookCard
            title={cat.title}
            category={cat.key}
            score={cat.score}
            color={cat.color}
            heroSeriesData={cat.heroSeriesData}
            description={cat.description}
            otherSeriesIds={cat.otherSeriesIds}
            isExpanded={expandedId === cat.key}
            onToggle={() => handleToggle(cat.key)}
          />
        </div>
      ))}
    </div>
  );
}

