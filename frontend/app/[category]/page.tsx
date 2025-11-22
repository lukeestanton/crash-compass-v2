import EChartLine from "../components/EChartLine";
import { apiGet } from "@/lib/api";
import { slugify, toDisplayName } from "@/lib/slug";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categories = await apiGet<Record<string, { series: string[] }>>("/api/v1/fred/categories");
  const originalKey = Object.keys(categories).find((k) => slugify(k) === category);
  if (!originalKey) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </main>
    );
  }

  const seriesIds = categories[originalKey].series || [];
  const seriesData = await Promise.all(
    seriesIds.map(async (id) => {
      const data = await apiGet<{ name: string; citation?: string; series: { date: string; value: string }[] }>(`/api/v1/fred/series/${id}`);
      return { id, ...data };
    })
  );

  const displayName = toDisplayName(originalKey);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between mb-6 gap-y-2">
        <h1 className="text-3xl font-bold">{displayName} Outlook & Analysis</h1>
      </div>

      <div className="flex flex-col gap-10">
        {seriesData.map((s) => (
          <article key={s.id} className="bg-white border border-accent/30 rounded-2xl shadow-sm p-8">
            <EChartLine title={s.name || s.id} points={s.series} height={320} />
            {s.citation && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Source:</span> {s.citation}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}