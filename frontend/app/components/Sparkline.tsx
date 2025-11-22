"use client";
import ReactECharts from "echarts-for-react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({ data, color = "#8884d8", height = 50 }: SparklineProps) {
  const option = {
    grid: { top: 0, bottom: 0, left: 0, right: 0 },
    xAxis: {
      type: "category",
      show: false,
      data: data.map((_, i) => i),
    },
    yAxis: {
      type: "value",
      show: false,
      min: "dataMin",
      max: "dataMax",
    },
    series: [
      {
        data: data,
        type: "line",
        showSymbol: false,
        smooth: true,
        lineStyle: {
          color: color,
          width: 2,
        },
        areaStyle: {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: color // 0% 
                }, {
                    offset: 1, color: 'rgba(255, 255, 255, 0)' // 100% 
                }],
                global: false
            },
            opacity: 0.3
        }
      },
    ],
    tooltip: {
        trigger: 'axis',
        formatter: '{c}',
        position: function (pt: any[]) {
            return [pt[0], '10%'];
        }
    }
  };

  return <ReactECharts option={option} style={{ height: height, width: "100%" }} />;
}

