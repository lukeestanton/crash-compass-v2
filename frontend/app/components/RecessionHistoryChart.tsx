"use client";
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { apiGet } from '@/lib/api';

type HistoryPoint = {
  date: string;
  prob: number;
  is_recession: number;
};

export default function RecessionHistoryChart() {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<HistoryPoint[]>('/api/v1/ml/history')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load historical data");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-[320px] flex items-center justify-center text-gray-500 animate-pulse">Loading history...</div>;
  if (error) return null; // Fail silently or show error
  if (!data.length) return null;

  // Process recession areas for markArea
  const markAreas: any[] = [];
  let start: string | null = null;
  
  // We assume data is sorted by date
  for (let i = 0; i < data.length; i++) {
    const isRec = data[i].is_recession === 1;
    
    if (isRec && !start) {
      start = data[i].date;
    } else if (!isRec && start) {
      // Recession ended at previous point
      markAreas.push([{ xAxis: start }, { xAxis: data[i-1].date }]);
      start = null;
    }
  }
  // Close loop if ends in recession
  if (start) {
     markAreas.push([{ xAxis: start }, { xAxis: data[data.length - 1].date }]);
  }

  const option = {
    animation: false, // Disable animation for large datasets if needed, or keep it
    title: { 
      text: 'Model Confidence vs. Reality (20+ Years)', 
      left: 'left',
      textStyle: { color: "#4A4A4A", fontWeight: 600, fontSize: 16 } 
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0];
        if (!p) return '';
        return `${p.name}<br/>Probability: <b>${p.value}%</b>`;
      }
    },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
          formatter: (value: string) => value.substring(0, 4) // Show Year
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: 'Probability',
        type: 'line',
        data: data.map(d => (d.prob * 100).toFixed(1)),
        showSymbol: false,
        lineStyle: { width: 2, color: '#D95B4A' },
        areaStyle: {
            color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                    { offset: 0, color: 'rgba(217, 91, 74, 0.2)' },
                    { offset: 1, color: 'rgba(217, 91, 74, 0.0)' }
                ]
            }
        },
        markArea: {
          itemStyle: {
            color: 'rgba(100, 100, 100, 0.15)'
          },
          data: markAreas
        }
      }
    ]
  };

  return (
    <div className="w-full mt-8 md:mt-12">
      <ReactECharts option={option} style={{ height: 320 }} />
      <p className="text-sm text-gray-500 mt-2 pl-2 border-l-4 border-gray-300">
        <strong>Gray bars</strong> indicate actual recessions. 
        <strong> Red line</strong> is the model's recession probability signal.
        Notice how it spikes before the gray periods.
      </p>
    </div>
  );
}

