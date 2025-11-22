export const SERIES_NAMES: Record<string, string> = {
  "UNRATE": "Unemployment Rate",
  "PAYEMS": "Nonfarm Payrolls",
  "AHETPI": "Hourly Wages",
  "IC4WSA": "Jobless Claims",
  "PCE": "Personal Consumption",
  "DSPIC96": "Disposable Income",
  "CPIAUCSL": "CPI (Inflation)",
  "CPILFESL": "Core CPI",
  "CSCICP03USM665S": "Consumer Confidence",
  "FEDFUNDS": "Fed Funds Rate",
  "GS10": "10-Year Treasury",
  "T10Y2Y": "Yield Curve Spread",
  "DGS10": "10-Year Treasury",
  "GS1": "1-Year Treasury",
  "AAA10Y": "Corporate Bond Spread",
  "M2REAL": "Real Money Supply (M2)",
  "WM2NS": "Money Supply",
  "INDPRO": "Industrial Production",
  "IPMAN": "Manufacturing Output",
  "WPSFD49207": "Producer Prices (PPI)",
  "HOUST": "Housing Starts",
  "PERMIT": "Building Permits",
  "USREC": "Recession Status"
};

export function getFriendlyName(id: string): string {
    // Strip suffix like _YoY
    const cleanId = id.replace("_YoY", "").replace("_", "");
    return SERIES_NAMES[cleanId] || cleanId;
}

