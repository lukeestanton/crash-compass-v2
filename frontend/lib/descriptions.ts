
export function getDescription(name: string, shap: number): string {
  const isRiskUp = shap > 0;
  const n = name.toUpperCase();

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
    return isRiskUp ? "Inflationary pressures persist." : "Inflation remains stable.";
  }
  if (n.includes("FEDFUNDS")) {
    return isRiskUp ? "High interest rates are tightening conditions." : "Interest rate levels are accommodative.";
  }

  return isRiskUp ? "Current trend contributes to recession risk." : "Current trend supports economic expansion.";
}

