"use client";
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function buildOption(value: number): echarts.EChartsOption {
  const BORDER = '#8E7757';
  const widthPx = 600; // container width
  const heightPx = 320; // container height
  const oR = 285; // outer radius
  const iR = 180; // inner radius
  const bandWidth = oR - iR; // thickness of colored arc

  const segments: Array<[number, string]> = [
    [0.05, '#86B99A'],
    [0.20, '#A9CBB6'],
    [0.35, '#CEDDCB'],
    [0.65, '#D1C5AF'],
    [0.80, '#E6B2A6'],
    [0.95, '#E49588'],
    [1.0, '#D95B4A']
  ];

  return {
    animation: true,
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [
      // Outer border ring
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        center: [widthPx / 2, heightPx],
        radius: oR + 4,
        pointer: { show: false },
        progress: { show: false },
        axisLine: {
          roundCap: false,
          lineStyle: {
            width: 8,
            color: [[1, BORDER]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        title: { show: false },
        z: 1
      },

      // Colored segments band
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        center: [widthPx / 2, heightPx],
        radius: oR - 4,
        pointer: { show: false },
        progress: { show: false },
        axisLine: {
          roundCap: false,
          lineStyle: {
            width: bandWidth,
            color: segments
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        title: { show: false },
        z: 2
      },

      // Needle + anchor
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        center: [widthPx / 2, heightPx],
        radius: oR,
        axisLine: { lineStyle: { width: 0 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        title: { show: false },
        pointer: {
          show: true,
          length: '88%',
          width: 8,
          itemStyle: { color: BORDER }
        },
        anchor: {
          show: true,
          size: 20,
          icon: 'circle',
          itemStyle: {
            color: BORDER,
            borderColor: BORDER,
            borderWidth: 10,
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.25)'
          }
        },
        data: [{ value }],
        z: 10,
        zlevel: 1
      }
    ]
  };
}

export default function MainDial({ dialVal }: { dialVal: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const score = Math.round(dialVal);

  let statusText = "";
  let statusColor = "";

  if (score < 30) {
    statusText = "Low Risk";
    statusColor = "text-green-600";
  } else if (score <= 60) {
    statusText = "Elevated Risk";
    statusColor = "text-orange-500";
  } else {
    statusText = "Critical Warning";
    statusColor = "text-red-600";
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;
    chart.setOption(buildOption(dialVal));

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(buildOption(dialVal), { notMerge: true, lazyUpdate: true });
    }
  }, [dialVal]);

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex flex-col w-fit">
        <div className="flex items-end gap-x-16">
          <div className="flex flex-col justify-end">
            <span className="font-semibold tracking-wide text-gray-600 text-4xl mb-2">
              Live Recession Forecast
            </span>

            <div className="flex items-end gap-4">
               <span className="text-8xl font-extrabold leading-none text-gray-900">{score}%</span>
               <div className={`flex flex-col pb-3 ${statusColor}`}>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Status</span>
                  <span className="text-3xl font-bold whitespace-nowrap leading-none">{statusText}</span>
               </div>
            </div>
          </div>
          <div className="hidden md:flex">
            <div ref={containerRef} style={{ width: 600, height: 320 }} />
          </div>
        </div>
        <div className="border-b-2 border-gray-300 w-full mt-0" />
      </div>
    </section>
  );
}
