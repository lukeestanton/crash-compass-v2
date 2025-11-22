import React from 'react';
import { getFriendlyName } from "@/lib/seriesMapping";

interface Contributor {
  name: string;
  value: number;
  shap: number;
}

interface ContributingFactorsProps {
  score: number;
  contributors: Contributor[];
}

export default function ContributingFactors({ score, contributors }: ContributingFactorsProps) {
  if (!contributors || contributors.length === 0) return null;

  // Classify contributors
  // Risk is the score. High score = High Risk.
  // SHAP > 0 pushes score UP (Increases Risk).
  // SHAP < 0 pushes score DOWN (Decreases Risk/Increases Stability).
  
  // We want to frame this as "What is happening?"
  // If SHAP > 0: "Contributing to Risk" (Bad if risk is high, or just "Risk Factor")
  // If SHAP < 0: "Supporting Stability" (Good)
  
  // Sort: We already have top 3 absolute.
  
  return (
    <section className="max-w-5xl mx-auto mt-8 mb-16">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-800">Key Drivers</h3>
        <span className="text-sm text-gray-500">Top factors influencing the model</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contributors.map((c, idx) => {
          const isRiskIncreaser = c.shap > 0;
          const impactLabel = isRiskIncreaser ? "Increasing Risk" : "Supporting Stability";
          const impactColor = isRiskIncreaser ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50";
          const barColor = isRiskIncreaser ? "bg-red-500" : "bg-green-500";
          
          // Intensity bar (visualize magnitude relative to others or fixed scale)
          // Just use a simple visual indicator for now.
          
          return (
            <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${impactColor}`}>
                     {impactLabel}
                   </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {getFriendlyName(c.name)}
                </h4>
                <p className="text-sm text-gray-500">
                   {getDescription(c.name, c.shap)}
                </p>
              </div>
              
              {/* Simple Impact Bar */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3 text-sm">
                <span className="text-gray-400 font-medium text-xs">IMPACT</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${barColor}`} 
                    style={{ width: `${Math.min(Math.abs(c.shap) * 500, 100)}%` }} // Arbitrary scaling for visual
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Helper to generate a "Google-like" brief explanation
function getDescription(name: string, shap: number): string {
  const isRiskUp = shap > 0;
  const n = name.toUpperCase();

  // Logic to determine "Why" based on economics
  // This mimics the PM requirement for "Context"
  
  if (n.includes("UNRATE")) {
    return isRiskUp ? "Unemployment is rising, signaling labor weakness." : "Low unemployment is supporting the economy.";
  }
  if (n.includes("PAYEMS")) {
    return isRiskUp ? "Job growth has slowed significantly." : "Robust job creation continues.";
  }
  if (n.includes("AHETPI")) {
    return isRiskUp ? "Wage growth is cooling." : "Strong wage growth is boosting consumption.";
  }
  if (n.includes("CSCICP") || n.includes("SENTIMENT")) {
    return isRiskUp ? "Consumer confidence is declining." : "Consumers remain optimistic.";
  }
  if (n.includes("T10Y2Y") || n.includes("SPREAD")) {
    return isRiskUp ? "The yield curve is inverted (recession signal)." : "Yield curve spread is normalizing.";
  }
  if (n.includes("AAA10Y")) {
    return isRiskUp ? "Credit spreads are widening (financial stress)." : "Credit conditions remain favorable.";
  }
  if (n.includes("HOUST") || n.includes("PERMIT")) {
    return isRiskUp ? "Housing activity is contracting." : "Housing market shows resilience.";
  }
  if (n.includes("INDPRO")) {
    return isRiskUp ? "Industrial output is weakening." : "Manufacturing activity is strong.";
  }
  if (n.includes("CPI") || n.includes("PCE")) {
    // Inflation is tricky. Usually High Inflation = Bad (Risk Up), but Low Inflation can be bad too.
    // Assuming Model treats High Inflation as Risk.
    return isRiskUp ? "Inflationary pressures persist." : "Inflation remains stable.";
  }

  // Fallback
  return isRiskUp ? "Current trend contributes to recession risk." : "Current trend supports economic expansion.";
}
