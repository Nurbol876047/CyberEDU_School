"use client";
import {
  Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList,
} from "recharts";
import type { ModuleAgg } from "@/lib/analytics";

const AXIS = { fill: "#475569", fontSize: 12 };
const TOOLTIP = { contentStyle: { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, color: "#0a1128", fontSize: 13 } };

export function PrePostChart({ data }: { data: ModuleAgg[] }) {
  const rows = data.map((d) => ({ name: d.title, "До модуля": d.pre ?? 0, "После модуля": d.post ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={{ ...AXIS, fontSize: 11 }} interval={0} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 13) + "…" : v)} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <Tooltip {...TOOLTIP} formatter={(v) => `${v ?? 0}%`} cursor={{ fill: "rgba(45,212,191,0.08)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#334155" }} />
        <Bar dataKey="До модуля" fill="#94a3b8" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="До модуля" position="top" formatter={(v) => `${v ?? 0}%`} style={{ fill: "#475569", fontSize: 11 }} />
        </Bar>
        <Bar dataKey="После модуля" fill="#14b8a6" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="После модуля" position="top" formatter={(v) => `${v ?? 0}%`} style={{ fill: "#0f766e", fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProfileRadar({ data }: { data: { subject: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} />
        <Radar name="Профиль" dataKey="value" stroke="#0d9488" fill="#2dd4bf" fillOpacity={0.45} isAnimationActive={false} />
        <Tooltip {...TOOLTIP} formatter={(v) => `${v ?? 0} / 100`} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
