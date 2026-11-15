"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const activity = [
  { day: "Mon", value: 18 },
  { day: "Tue", value: 36 },
  { day: "Wed", value: 29 },
  { day: "Thu", value: 58 },
  { day: "Fri", value: 41 },
  { day: "Sat", value: 63 },
  { day: "Sun", value: 49 },
  { day: "Mon", value: 72 },
  { day: "Tue", value: 57 },
  { day: "Wed", value: 76 },
];

export function UsageChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Recharts needs the browser's measured width. This SVG keeps the first
  // server paint complete, then Recharts takes over after hydration.
  if (!mounted) return <StaticActivityChart />;

  return (
    <div className="h-full min-h-[190px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={190}>
        <AreaChart data={activity} margin={{ top: 12, right: 4, left: -26, bottom: -2 }}>
          <defs>
            <linearGradient id="nexoraLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="48%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="nexoraArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.48} />
              <stop offset="55%" stopColor="#2563eb" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#172554" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(59,130,246,0.14)" vertical />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748b", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            cursor={{ stroke: "rgba(34,211,238,0.32)" }}
            contentStyle={{
              background: "#07132f",
              border: "1px solid rgba(59,130,246,.38)",
              borderRadius: 10,
              color: "#f8fafc",
              fontSize: 11,
              boxShadow: "0 12px 30px rgba(0,0,0,.35)",
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="AI activity"
            stroke="url(#nexoraLine)"
            strokeWidth={3}
            fill="url(#nexoraArea)"
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "#22d3ee", stroke: "#082f49", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StaticActivityChart() {
  return (
    <svg
      viewBox="0 0 700 205"
      preserveAspectRatio="none"
      className="h-full min-h-[190px] w-full"
      role="img"
      aria-label="AI activity trend chart"
    >
      <defs>
        <linearGradient id="staticLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="staticArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#172554" stopOpacity="0.03" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[35, 75, 115, 155].map((y) => (
        <line key={`h-${y}`} x1="25" y1={y} x2="690" y2={y} stroke="#2563eb" strokeOpacity="0.16" />
      ))}
      {[25, 120, 215, 310, 405, 500, 595, 690].map((x) => (
        <line key={`v-${x}`} x1={x} y1="18" x2={x} y2="175" stroke="#2563eb" strokeOpacity="0.1" />
      ))}

      <path
        d="M25 164 C58 152 70 123 103 128 C134 133 143 149 176 137 C208 125 221 78 256 72 C286 67 306 111 339 107 C370 103 384 68 416 65 C449 62 458 96 491 90 C525 84 540 43 574 48 C607 54 625 84 654 75 C672 70 681 52 690 42 L690 175 L25 175 Z"
        fill="url(#staticArea)"
      />
      <path
        d="M25 164 C58 152 70 123 103 128 C134 133 143 149 176 137 C208 125 221 78 256 72 C286 67 306 111 339 107 C370 103 384 68 416 65 C449 62 458 96 491 90 C525 84 540 43 574 48 C607 54 625 84 654 75 C672 70 681 52 690 42"
        fill="none"
        stroke="url(#staticLine)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#lineGlow)"
      />
    </svg>
  );
}
