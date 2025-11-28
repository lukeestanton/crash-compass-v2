import MainDial from "./components/MainDial";
import RecessionHistoryChart from "./components/RecessionHistoryChart";
import ContributingFactors from "./components/ContributingFactors";
import DashboardGrid from "./components/DashboardGrid";
import { apiGet } from "@/lib/api";
import { toDisplayName } from "@/lib/slug";
import { getDescription } from "@/lib/descriptions";

// Force dynamic rendering to ensure data is fresh on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    // Attempt to fetch data. This will fail during build time but succeed at runtime.
    const [categories, dialScoreRaw] = await Promise.all([
      apiGet<Record<string, { series: string[]; outlook_score?: number }>>("/api/v1/fred/categories"),
      apiGet<any>("/api/v1/fred/dial_score").catch(() => 0)
    ]);

    const dialVal = typeof dialScoreRaw === "number" ? dialScoreRaw : (dialScoreRaw?.score ?? 0);
    const contributors = (typeof dialScoreRaw === "object" && dialScoreRaw !== null) ? dialScoreRaw.contributors : [];
    const categoryKeys = Object.keys(categories || {}).filter(key => key !== "Recession");

    // Pre-fetch hero data for each category
    const categoriesData = await Promise.all(
      categoryKeys.map(async (key) => {
        const catData = categories[key];
        const heroId = catData.series[0];
        const otherIds = catData.series.slice(1);

        const heroSeriesData = await apiGet<{ name: string; series: { date: string; value: string }[] }>(
          `/api/v1/fred/series/${heroId}`
        );

        let relevantContributor = contributors
          .filter((c: any) => catData.series.includes(c.name))
          .sort((a: any, b: any) => Math.abs(b.shap) - Math.abs(a.shap))[0];

        if (!relevantContributor) {
           relevantContributor = { name: heroId, shap: 0 };
        }

        const description = getDescription(relevantContributor.name, relevantContributor.shap);

        return {
          key,
          title: toDisplayName(key),
          score: typeof catData.outlook_score === "number" ? catData.outlook_score : null,
          color: "#c8bcab",
          heroSeriesData,
          description,
          otherSeriesIds: otherIds,
        };
      })
    );

    return (
      <main className="max-w-5xl mx-auto px-4 md:px-10 py-4 md:py-3 text-[var(--foreground)]">
        <MainDial dialVal={dialVal} />
        
        <ContributingFactors score={dialVal} contributors={contributors} />
        
        <section className="mb-16">
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-2">Stability Outlook</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Click any card to view detailed analysis and charts
            </p>
          </div>
          
          <DashboardGrid categoriesData={categoriesData} />
        </section>

        <section className="mb-24 grid md:grid-cols-3 gap-10 items-start">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-3">How it Works</h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Our dashboard crunches decades of official economic data using machine learning, so you don't have to. Here's how we turn raw numbers into the dial at the top of this page.
            </p>
            <ol className="space-y-7 text-gray-800 text-base leading-relaxed pl-4 border-l-4 border-accent/60">
              <li>
                <span className="font-bold text-accent">Track</span>
                &nbsp;· We gather fresh numbers from the Fed, BLS, and Treasury every morning.
              </li>
              <li>
                <span className="font-bold text-accent">Analyze</span>
                &nbsp;· Our advanced machine learning model scans 60+ years of trends to learn the signals that tend to show up before recessions or recoveries.
              </li>
              <li>
                <span className="font-bold text-accent">Predict</span>
                &nbsp;· The model weighs hundreds of indicators in real time, looking for subtle warning signs and healthy signals alike.
              </li>
              <li>
                <span className="font-bold text-accent">Interpret</span>
                &nbsp;· We display our model's findings as a simple percentage score, along with every chart and data point that influenced it for your own interpretation.
              </li>
            </ol>
          </div>
          <div className="bg-white border border-accent/30 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center max-w-sm mx-auto">
            <span className="text-6xl font-extrabold text-accent mb-4">🧠</span>
            <h3 className="font-semibold text-xl mb-2 text-accent">Machine Learning, Out in the Open</h3>
            <p className="text-gray-700 mb-3">
              Our code and models are open-source. <br />
              See exactly how the score is calculated, or just enjoy the insights.
            </p>
            <p>
              Help improve the model by contributing to the codebase or suggesting new indicators.
            </p>
            <a
              href="https://github.com/lukeestanton/crash-compass"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-accent underline font-medium hover:text-accent/80 transition"
            >
              View on GitHub →
            </a>
            <a
              href="https://fred.stlouisfed.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-accent underline font-medium hover:text-accent/80 transition"
            >
              View data sources →
            </a>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-3">Verify the Model</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Trust is earned. See how our model would have predicted previous major economic events compared to what actually happened.
            </p>
          </div>
          <RecessionHistoryChart />
        </section>
      </main>
    );
  } catch (error) {
    // This block runs if the backend is unreachable (e.g. during build time)
    // It renders a fallback UI instead of crashing the build
    console.error("Data fetch failed (likely build time):", error);
    return (
      <main className="min-h-screen flex items-center justify-center p-10 bg-gray-50 text-[var(--foreground)]">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">System Initializing</h1>
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 mb-2">The AI model is currently warming up and analyzing the latest economic data.</p>
          <p className="text-sm text-gray-400">Please check back in a few minutes.</p>
        </div>
      </main>
    );
  }
}