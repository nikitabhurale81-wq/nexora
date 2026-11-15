"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Bot,
  BrainCircuit,
  CircleDollarSign,
  Download,
  Gauge,
  Settings2,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { costSeries, modelUsage } from "./admin-data";
import {
  ActionButton,
  CHART_COLORS,
  downloadCsv,
  Field,
  inputClass,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  SegmentedControl,
  StatusBadge,
  tooltipStyle,
} from "./admin-ui";

export function AiUsagePage() {
  const [period, setPeriod] = useState("This month");
  const [budget, setBudget] = useState(30000);
  const [draftBudget, setDraftBudget] = useState("30000");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [routingOptimized, setRoutingOptimized] = useState(false);
  const totalCost = modelUsage.reduce((sum, model) => sum + model.cost, 0);
  const usage = Math.round((totalCost / budget) * 100);

  function saveBudget(event: FormEvent) {
    event.preventDefault();
    const amount = Number(draftBudget);
    if (!Number.isFinite(amount) || amount < 1000) {
      toast.error("Set a monthly budget of at least $1,000.");
      return;
    }
    setBudget(amount);
    setBudgetOpen(false);
    toast.success(`Demo monthly budget set to $${amount.toLocaleString()}.`);
  }

  function exportCosts() {
    downloadCsv("nexora-ai-costs.csv", [
      ["Model", "Provider", "Requests", "Tokens", "Cost", "Share"],
      ...modelUsage.map((model) => [model.model, model.provider, model.requests, model.tokens, model.cost, `${model.share}%`]),
    ]);
    toast.success("AI cost breakdown downloaded.");
  }

  function optimizeRouting() {
    setRoutingOptimized((value) => !value);
    toast.success(routingOptimized ? "Demo routing restored to standard." : "Cost-aware routing preview enabled.", {
      description: "This only changes the local interface state.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inference economics"
        title="AI Usage & Costs"
        description="Track token volume, model mix, budgets, and estimated inference costs across providers."
        actions={<><SegmentedControl options={["Today", "This week", "This month", "Quarter"]} value={period} onChange={setPeriod} ariaLabel="Cost period" /><ActionButton variant="ghost" onClick={exportCosts}><Download className="h-4 w-4" /> Export</ActionButton><ActionButton onClick={() => { setDraftBudget(String(budget)); setBudgetOpen(true); }}><Settings2 className="h-4 w-4" /> Budget</ActionButton></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Estimated cost" value={`$${totalCost.toLocaleString()}`} change="-4.2%" detail="vs forecast" icon={<CircleDollarSign className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Tokens processed" value="1.78B" change="+18.6%" detail="input + output" icon={<BrainCircuit className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="AI requests" value="4.57M" change="+12.8%" detail="98.7% successful" icon={<Sparkles className="h-5 w-5" />} tone="pink" />
        <MetricCard label="Cost / request" value="$0.0051" change="-7.3%" detail="efficiency gain" icon={<TrendingDown className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.7fr)]">
        <Panel glow>
          <PanelHeader title="Daily token cost" description={`Input, output, and cache savings · ${period.toLowerCase()}`} action={<StatusBadge tone="success">Within forecast</StatusBadge>} />
          <div className="h-[340px] p-4 pt-6 sm:p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costSeries} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`$${value}`, name === "input" ? "Input tokens" : name === "output" ? "Output tokens" : "Cache savings"]} />
                <Bar dataKey="input" stackId="cost" fill={CHART_COLORS.blue} radius={[0, 0, 0, 0]} />
                <Bar dataKey="output" stackId="cost" fill={CHART_COLORS.violet} />
                <Bar dataKey="cached" stackId="cost" fill={CHART_COLORS.emerald} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-5 border-t border-blue-500/10 px-5 py-3 text-[10px] text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue-500" />Input</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-500" />Output</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-400" />Cache savings</span></div>
        </Panel>

        <Panel>
          <PanelHeader title="Monthly budget" description="Local budget tracking preview" />
          <div className="p-5">
            <div className="relative mx-auto h-52 max-w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={[{ name: "Used", value: Math.min(totalCost, budget) }, { name: "Remaining", value: Math.max(0, budget - totalCost) }]} dataKey="value" innerRadius={66} outerRadius={88} startAngle={90} endAngle={-270} stroke="none"><Cell fill={CHART_COLORS.violet} /><Cell fill="#172033" /></Pie></PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-extrabold text-white">{usage}%</p><p className="text-[10px] uppercase tracking-wider text-slate-500">utilized</p></div></div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs"><span className="text-slate-500">${totalCost.toLocaleString()} used</span><strong className="text-white">${budget.toLocaleString()}</strong></div>
            <p className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-[11px] leading-5 text-slate-400">Projected month-end spend is <strong className="text-cyan-300">$27,420</strong>, leaving an estimated ${(budget - 27420).toLocaleString()} buffer.</p>
            <ActionButton variant={routingOptimized ? "primary" : "secondary"} className="mt-4 w-full" onClick={optimizeRouting}><Gauge className="h-4 w-4" />{routingOptimized ? "Optimized preview on" : "Preview optimized routing"}</ActionButton>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Cost by model" description="Usage and estimated cost allocation" action={<StatusBadge tone="info">4 providers</StatusBadge>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-blue-500/10 text-[9px] uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-5 py-3">Model</th><th className="px-5 py-3">Requests</th><th className="px-5 py-3">Tokens</th><th className="px-5 py-3">Cost share</th><th className="px-5 py-3 text-right">Estimated cost</th></tr></thead>
            <tbody className="divide-y divide-blue-500/10">
              {modelUsage.map((model) => <tr key={model.model} className="hover:bg-blue-500/5"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-blue-500/15 bg-blue-500/8"><Bot className="h-4 w-4" style={{ color: model.color }} /></span><div><p className="text-xs font-semibold text-white">{model.model}</p><p className="mt-0.5 text-[10px] text-slate-500">{model.provider}</p></div></div></td><td className="px-5 py-4 text-xs text-slate-300">{model.requests}</td><td className="px-5 py-4 text-xs text-slate-300">{model.tokens}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-24 rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${model.share}%`, background: model.color }} /></div><span className="text-[10px] text-slate-500">{model.share}%</span></div></td><td className="px-5 py-4 text-right text-xs font-bold text-white">${model.cost.toLocaleString()}</td></tr>)}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: Activity, title: "Peak request window", value: "14:00–16:00 UTC", detail: "742K requests" }, { icon: Bot, title: "Most efficient model", value: "Llama 3.3 70B", detail: "$0.0039 / request" }, { icon: Sparkles, title: "Cache hit rate", value: "34.8%", detail: "$2,184 saved" }].map((item) => { const Icon = item.icon; return <Panel key={item.title} className="flex items-center gap-4 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></span><div><p className="text-[10px] uppercase tracking-wider text-slate-600">{item.title}</p><p className="mt-1 text-sm font-bold text-white">{item.value}</p><p className="text-[10px] text-slate-500">{item.detail}</p></div></Panel>; })}
      </div>

      <Modal open={budgetOpen} onClose={() => setBudgetOpen(false)} title="Set monthly AI budget" description="Updates the budget gauge in this local frontend session." footer={<><ActionButton variant="ghost" onClick={() => setBudgetOpen(false)}>Cancel</ActionButton><ActionButton type="submit" form="budget-form">Save budget</ActionButton></>}>
        <form id="budget-form" onSubmit={saveBudget}><Field label="Monthly budget (USD)"><input type="number" min="1000" step="500" value={draftBudget} onChange={(event) => setDraftBudget(event.target.value)} className={inputClass} /></Field><p className="mt-3 text-xs leading-5 text-slate-500">This control is a visual planning tool. It does not change provider billing limits.</p></form>
      </Modal>
    </div>
  );
}
