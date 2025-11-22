"use client";
import ReactECharts from "echarts-for-react";

export default function EChartLine({ title, points, height = 320 }: { title: string; points: { date: string; value: string }[]; height?: number }) {
  const formatAxisNumber = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1000000000) {
      const n = value / 1000000000;
      const s = n.toFixed(n % 1 === 0 ? 0 : 1);
      return s + "b";
    }
    if (abs >= 1000000) {
      const n = value / 1000000;
      const s = n.toFixed(n % 1 === 0 ? 0 : 1);
      return s + "m";
    }
    if (abs >= 1000) {
      const n = value / 1000;
      const s = n.toFixed(n % 1 === 0 ? 0 : 1);
      return s + "k";
    }
    return String(value);
  };
  const option = {
    title: { text: title, left: "center", textStyle: { color: "#4A4A4A", fontWeight: 600, fontSize: 14 } },
    grid: { left: 30, right: 30, top: 40, bottom: 40 },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: points.map((p) => p.date) },
    yAxis: { type: "value", scale: true, axisLabel: { formatter: (value: number) => formatAxisNumber(value) } },
    series: [
      {
        type: "line",
        showSymbol: false,
        lineStyle: { width: 2 },
        data: points.map((p) => (p.value === "" ? null : Number(p.value))),
      },
    ],
  } as const;
  return <div style={{ height }}><ReactECharts option={option} style={{ height: "100%" }} /></div>;
}


