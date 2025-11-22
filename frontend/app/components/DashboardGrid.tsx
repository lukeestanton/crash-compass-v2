"use client";
import { useState } from "react";
import OutlookCard from "./OutlookCard";
import DrillDownModal from "./DrillDownModal";

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const handleOpen = (cat: CategoryData) => {
    setSelectedCategory(cat);
  };

  const handleClose = () => {
    setSelectedCategory(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all">
        {categoriesData.map((cat) => (
          <OutlookCard
            key={cat.key}
            title={cat.title}
            category={cat.key}
            score={cat.score}
            color={cat.color}
            heroSeriesData={cat.heroSeriesData}
            onToggle={() => handleOpen(cat)}
          />
        ))}
      </div>

      <DrillDownModal 
        isOpen={!!selectedCategory} 
        onClose={handleClose} 
        category={selectedCategory} 
      />
    </>
  );
}
