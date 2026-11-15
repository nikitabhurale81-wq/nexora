"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Check,
  CircleGauge,
  Clock3,
  Cpu,
  Play,
  Plus,
  Settings2,
  Star,
  Zap,
} from "lucide-react";
import { modelConfigs, type ModelConfig } from "./admin-data";
import {
  ActionButton,
  Field,
  inputClass,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  StatusBadge,
} from "./admin-ui";

const modelTones: Record<string, { icon: string; glow: string; dot: string }> = {
  cyan: { icon: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300", glow: "hover:border-cyan-400/30", dot: "bg-cyan-400" },
  violet: { icon: "border-violet-400/25 bg-violet-400/10 text-violet-300", glow: "hover:border-violet-400/30", dot: "bg-violet-400" },
  blue: { icon: "border-blue-400/25 bg-blue-400/10 text-blue-300", glow: "hover:border-blue-400/30", dot: "bg-blue-400" },
  pink: { icon: "border-pink-400/25 bg-pink-400/10 text-pink-300", glow: "hover:border-pink-400/30", dot: "bg-pink-400" },
  emerald: { icon: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", glow: "hover:border-emerald-400/30", dot: "bg-emerald-400" },
};

export function ModelsPage() {
  const [models, setModels] = useState(modelConfigs);
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [newModel, setNewModel] = useState({ name: "", provider: "", type: "General", context: "128K tokens" });

  function toggleModel(model: ModelConfig) {
    setModels((current) => current.map((item) => item.id === model.id ? { ...item, enabled: !item.enabled } : item));
    toast.success(`${model.name} ${model.enabled ? "disabled" : "enabled"} in this demo.`, { description: "No provider configuration was changed." });
  }

  function makePrimary(model: ModelConfig) {
    setModels((current) => current.map((item) => ({ ...item, primary: item.id === model.id, enabled: item.id === model.id ? true : item.enabled })));
    toast.success(`${model.name} is now the local primary model.`);
  }

  function testModel(model: ModelConfig) {
    setTestingId(model.id);
    window.setTimeout(() => {
      setTestingId(null);
      toast.success(`${model.name} demo check passed`, { description: `Simulated response latency: ${model.latency}.` });
    }, 650);
  }

  function saveConfig(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setModels((current) => current.map((item) => item.id === editing.id ? editing : item));
    setEditing(null);
    toast.success("Model configuration updated in this frontend session.");
  }

  function addModel(event: FormEvent) {
    event.preventDefault();
    if (!newModel.name.trim() || !newModel.provider.trim()) {
      toast.error("Enter a model name and provider.");
      return;
    }
    setModels((current) => [...current, {
      id: Date.now(), name: newModel.name.trim(), provider: newModel.provider.trim(), type: newModel.type,
      context: newModel.context, latency: "Not tested", cost: "Custom", enabled: false, primary: false,
      color: "cyan", temperature: 0.7, maxTokens: 4096,
    }]);
    setNewModel({ name: "", provider: "", type: "General", context: "128K tokens" });
    setAddOpen(false);
    toast.success("Custom model added to this demo configuration.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inference layer"
        title="Model Configuration"
        description="Control model availability, routing priority, and generation defaults in a safe frontend preview."
        actions={<ActionButton onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add model</ActionButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Configured models" value={models.length.toString()} detail={`${models.filter((model) => model.enabled).length} currently enabled`} icon={<Bot className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Primary route" value={models.find((model) => model.primary)?.name ?? "None"} detail="general requests" icon={<Star className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Avg. latency" value="1.18s" change="-84ms" detail="past 24 hours" icon={<Clock3 className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="Success rate" value="99.12%" change="+0.18%" detail="provider responses" icon={<CircleGauge className="h-5 w-5" />} tone="pink" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {models.map((model) => {
          const tone = modelTones[model.color] ?? modelTones.cyan;
          return (
            <Panel key={model.id} className={`p-5 transition ${tone.glow}`}>
              <div className="flex items-start gap-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-[0_0_25px_rgba(37,99,235,.1)] ${tone.icon}`}><Bot className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-white">{model.name}</h2>{model.primary && <StatusBadge tone="violet"><Star className="h-2.5 w-2.5 fill-current" />Primary</StatusBadge>}{!model.enabled && <StatusBadge>Disabled</StatusBadge>}</div>
                  <p className="mt-1 text-xs text-slate-500">{model.provider} · {model.type}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={model.enabled}
                  onClick={() => toggleModel(model)}
                  className={`relative h-6 w-11 shrink-0 rounded-full border transition ${model.enabled ? "border-cyan-300/30 bg-blue-600" : "border-slate-600 bg-slate-800"}`}
                  aria-label={`${model.enabled ? "Disable" : "Enable"} ${model.name}`}
                ><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${model.enabled ? "translate-x-5" : "translate-x-1"}`} /></button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-500/10 bg-[#03091d]/50 p-3"><p className="text-[9px] uppercase tracking-wider text-slate-600">Context</p><p className="mt-1 text-xs font-semibold text-slate-200">{model.context}</p></div>
                <div className="rounded-xl border border-blue-500/10 bg-[#03091d]/50 p-3"><p className="text-[9px] uppercase tracking-wider text-slate-600">Latency</p><p className="mt-1 text-xs font-semibold text-slate-200">{model.latency}</p></div>
                <div className="rounded-xl border border-blue-500/10 bg-[#03091d]/50 p-3"><p className="text-[9px] uppercase tracking-wider text-slate-600">Input</p><p className="mt-1 truncate text-xs font-semibold text-slate-200">{model.cost}</p></div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-blue-500/10 pt-4">
                <ActionButton variant="secondary" size="sm" onClick={() => setEditing({ ...model })}><Settings2 className="h-3.5 w-3.5" /> Configure</ActionButton>
                <ActionButton variant="ghost" size="sm" disabled={testingId === model.id || !model.enabled} onClick={() => testModel(model)}><Play className="h-3.5 w-3.5" /> {testingId === model.id ? "Testing..." : "Run test"}</ActionButton>
                {!model.primary && <ActionButton variant="ghost" size="sm" disabled={!model.enabled} onClick={() => makePrimary(model)} className="ml-auto"><Star className="h-3.5 w-3.5" /> Make primary</ActionButton>}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Zap className="h-5 w-5" /></span>
          <div className="flex-1"><p className="text-sm font-bold text-white">Smart routing active</p><p className="mt-1 text-xs text-slate-500">Requests are routed by task type, context length, model health, and configured availability.</p></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><Check className="h-4 w-4" /> Healthy</div>
        </div>
      </Panel>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Configure ${editing?.name ?? "model"}`} description="Changes are kept in local component state only." footer={<><ActionButton variant="ghost" onClick={() => setEditing(null)}>Cancel</ActionButton><ActionButton type="submit" form="model-config-form">Save configuration</ActionButton></>}>
        {editing && <form id="model-config-form" onSubmit={saveConfig} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Temperature"><input type="number" min="0" max="2" step="0.1" value={editing.temperature} onChange={(event) => setEditing({ ...editing, temperature: Number(event.target.value) })} className={inputClass} /></Field><Field label="Maximum output tokens"><input type="number" min="256" step="256" value={editing.maxTokens} onChange={(event) => setEditing({ ...editing, maxTokens: Number(event.target.value) })} className={inputClass} /></Field></div>
          <Field label="Context display"><input value={editing.context} onChange={(event) => setEditing({ ...editing, context: event.target.value })} className={inputClass} /></Field>
          <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-200"><Cpu className="h-4 w-4 text-cyan-300" /> Generation preview</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Temperature {editing.temperature} balances deterministic and creative output. Responses can use up to {editing.maxTokens.toLocaleString()} output tokens.</p></div>
        </form>}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add custom model" description="Creates a disabled model card in this frontend demo." footer={<><ActionButton variant="ghost" onClick={() => setAddOpen(false)}>Cancel</ActionButton><ActionButton type="submit" form="add-model-form">Add model</ActionButton></>}>
        <form id="add-model-form" onSubmit={addModel} className="grid gap-4 sm:grid-cols-2"><Field label="Model name"><input value={newModel.name} onChange={(event) => setNewModel({ ...newModel, name: event.target.value })} className={inputClass} placeholder="Model v1" /></Field><Field label="Provider"><input value={newModel.provider} onChange={(event) => setNewModel({ ...newModel, provider: event.target.value })} className={inputClass} placeholder="Provider name" /></Field><Field label="Type"><select value={newModel.type} onChange={(event) => setNewModel({ ...newModel, type: event.target.value })} className={inputClass}><option>General</option><option>Reasoning</option><option>Multimodal</option><option>Embedding</option></select></Field><Field label="Context window"><select value={newModel.context} onChange={(event) => setNewModel({ ...newModel, context: event.target.value })} className={inputClass}><option>32K tokens</option><option>128K tokens</option><option>200K tokens</option><option>1M tokens</option></select></Field></form>
      </Modal>
    </div>
  );
}
