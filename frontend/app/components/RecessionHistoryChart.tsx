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
    animation: false,
    title: { 
      text: 'Model Confidence vs. Reality (20+ Years)', 
      left: 'left',
      textStyle: { color: "#111827", fontWeight: 700, fontSize: 18 } 
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: any) => {
        const p = params[0];
        if (!p) return '';
        return `<div class="font-bold mb-1">${p.name}</div>Probability: <b style="color: #D95B4A">${p.value}%</b>`;
      }
    },
    legend: {
      data: ['Recession Probability', 'Actual Recession'],
      right: 0,
      top: 0,
      itemGap: 20,
      textStyle: { color: '#6b7280' }
    },
    grid: { left: 40, right: 30, top: 60, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        formatter: (value: string) => value.substring(0, 4),
        color: '#6b7280'
      },
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#6b7280' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    series: [
      {
        name: 'Recession Probability',
        type: 'line',
        data: data.map(d => (d.prob * 100).toFixed(1)),
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#D95B4A' },
        areaStyle: {
            color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                    { offset: 0, color: 'rgba(217, 91, 74, 0.25)' },
                    { offset: 1, color: 'rgba(217, 91, 74, 0.0)' }
                ]
            }
        },
        markArea: {
          itemStyle: {
            color: 'rgba(100, 100, 100, 0.1)'
          },
          data: markAreas
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          label: {
            show: true,
            formatter: '{b}',
            color: '#fff',
            fontSize: 10,
            fontWeight: 'bold'
          },
          itemStyle: {
            color: '#4b5563'
          },
          data: [
            { name: 'Dot-com', coord: ['2001-03-01', 95], label: { offset: [0, -5] } },
            { name: '2008 Crisis', coord: ['2008-09-01', 98], label: { offset: [0, -5] } },
            { name: 'COVID-19', coord: ['2020-03-01', 98], label: { offset: [0, -5] } }
          ]
        }
      },
      // Dummy series for Legend only
      {
        name: 'Actual Recession',
        type: 'bar',
        data: [],
        itemStyle: { color: 'rgba(100, 100, 100, 0.15)' } 
      }
    ]
  };

  return (
    <div className="w-full mt-8 md:mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <ReactECharts option={option} style={{ height: 350 }} />
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          <strong>Historical Accuracy:</strong> Gray bars represent official recession periods defined by NBER. The red line shows our model's real-time probability signal.
        </p>
      </div>
    </div>
  );
}
