"use client";

import { useState } from "react";
import {
  Bot,
  Bug,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Gauge,
  Lightbulb,
  Play,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { NeonSurface, PageIntro, Pill, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";
import { cn } from "@/lib/utils";

const snippets: Record<string, string> = {
  Python: `def hello_nexora(name: str) -> str:\n    """Return a personalized greeting."""\n    return f"Hello, {name}!"\n\n\nif __name__ == "__main__":\n    print(hello_nexora("Alex"))`,
  TypeScript: `type User = { name: string };\n\nfunction helloNexora(user: User): string {\n  return \`Hello, \${user.name}!\`;\n}\n\nconsole.log(helloNexora({ name: "Alex" }));`,
  JavaScript: `const helloNexora = (name) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(helloNexora("Alex"));`,
};

type Panel = "Editor" | "Output" | "Explanation";

export function CodeStudio() {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState(snippets.Python);
  const [panel, setPanel] = useState<Panel>("Editor");
  const [output, setOutput] = useState("Ready. Run the code to see output.");
  const [assistant, setAssistant] = useState("Ask NEXORA to explain, debug, or optimize your code.");
  const [running, setRunning] = useState(false);

  function changeLanguage(next: string) {
    setLanguage(next);
    setCode(snippets[next]);
    setOutput("Ready. Run the code to see output.");
  }

  function run() {
    setRunning(true);
    setOutput("Executing in a safe frontend simulation…");
    window.setTimeout(() => {
      setOutput(language === "Python" ? "Hello, Alex!\n\nProcess finished with exit code 0" : "Hello, Alex!\n\nCompleted in 42ms");
      setRunning(false);
      setPanel("Output");
      toast.success("Mock execution completed");
    }, 650);
  }

  function ask(action: "explain" | "debug" | "optimize") {
    const messages = {
      explain: "This function accepts a typed name, builds a personalized greeting, and prints it only when the file runs directly.",
      debug: "No blocking errors found. The function has clear input and output types. Add input normalization if names may contain whitespace.",
      optimize: "The code is already O(1). For production, add validation, unit tests, and separate console output from the pure greeting function.",
    };
    setAssistant(messages[action]);
    setPanel("Explanation");
    toast.success(`${action[0].toUpperCase() + action.slice(1)} analysis generated`);
  }

  function download() {
    const extension = language === "Python" ? "py" : language === "TypeScript" ? "ts" : "js";
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `nexora-snippet.${extension}`; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <WorkspacePage className="flex min-h-full flex-col">
      <PageIntro eyebrow="AI development workspace" title="Code Studio" description="Write, run, explain, debug, and optimize code in a focused editor." actions={<><button onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied"); }} className={secondaryButton}><Copy className="h-4 w-4" /> Copy</button><button onClick={run} disabled={running} className={primaryButton}><Play className="h-4 w-4 fill-current" /> {running ? "Running…" : "Run Code"}</button></>} />

      <div className="grid min-h-[680px] flex-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.7fr)]">
        <NeonSurface className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18316b]/60 px-4 py-3">
            <div className="flex items-center gap-2"><span className="flex h-8 items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 text-[10px] font-semibold text-blue-200"><FileCode2 className="h-3.5 w-3.5" /> main.{language === "Python" ? "py" : language === "TypeScript" ? "ts" : "js"}<span className="h-1.5 w-1.5 rounded-full bg-amber-300" /></span></div>
            <div className="flex items-center gap-2"><select value={language} onChange={(event) => changeLanguage(event.target.value)} className="h-8 rounded-lg border border-[#234382]/65 bg-[#07152f] px-3 text-[10px] text-slate-300 outline-none"><option>Python</option><option>TypeScript</option><option>JavaScript</option></select><button onClick={() => toast.success("Saved locally") } className={iconButton} aria-label="Save code"><Save className="h-4 w-4" /></button><button onClick={download} className={iconButton} aria-label="Download code"><Download className="h-4 w-4" /></button></div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden bg-[#030817]">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 border-r border-[#152b60]/60 bg-[#050d20]" />
            <div className="pointer-events-none absolute left-0 top-5 z-10 w-12 select-none text-right font-mono text-[12px] leading-6 text-slate-700">{code.split("\n").map((_, index) => <div key={index} className="pr-3">{index + 1}</div>)}</div>
            <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="Code editor" className="absolute inset-0 resize-none bg-transparent py-5 pl-16 pr-5 font-mono text-[12px] leading-6 text-cyan-100 caret-cyan-300 outline-none selection:bg-blue-500/30" />
          </div>

          <div className="flex items-center justify-between border-t border-[#18316b]/60 px-4 py-2 text-[9px] text-slate-600"><span>Ln {code.split("\n").length}, Col 1 · Spaces: 4</span><span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> No issues</span></div>
        </NeonSurface>

        <div className="flex min-h-0 flex-col gap-4">
          <NeonSurface className="overflow-hidden">
            <div className="flex border-b border-[#18316b]/60 p-1">{(["Editor", "Output", "Explanation"] as Panel[]).map((value) => <button key={value} onClick={() => setPanel(value)} className={cn("h-9 flex-1 rounded-lg text-[10px] font-bold", panel === value ? "bg-blue-600/80 text-white" : "text-slate-500 hover:text-white")}>{value}</button>)}</div>
            <div className="min-h-[220px] p-4">{panel === "Editor" && <div><Pill tone="green">Ready</Pill><h3 className="mt-3 text-[14px] font-bold text-white">{language} workspace</h3><p className="mt-2 text-[11px] leading-5 text-slate-400">The browser uses a safe mock runner. Backend sandbox execution will be connected later.</p><div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px]"><div className="rounded-lg bg-blue-500/8 p-3 text-blue-300">{code.split("\n").length} lines</div><div className="rounded-lg bg-violet-500/8 p-3 text-violet-300">UTF-8</div></div></div>}{panel === "Output" && <pre className="whitespace-pre-wrap font-mono text-[11px] leading-6 text-emerald-300">{output}</pre>}{panel === "Explanation" && <div className="text-[11px] leading-6 text-slate-300"><div className="mb-3 flex items-center gap-2 text-violet-300"><Bot className="h-4 w-4" /><strong>NEXORA Analysis</strong></div>{assistant}</div>}</div>
          </NeonSurface>

          <NeonSurface className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#18316b]/60 px-4 py-3"><Sparkles className="h-4 w-4 text-violet-300" /><h2 className="text-[13px] font-bold text-white">AI Coding Assistant</h2></div>
            <div className="grid gap-2 p-4"><button onClick={() => ask("explain")} className="flex items-center gap-3 rounded-xl border border-[#203f7e]/60 bg-[#07152f] p-3 text-left hover:border-blue-400/35"><Lightbulb className="h-4 w-4 text-amber-300" /><span><strong className="block text-[11px] text-white">Explain code</strong><span className="text-[9px] text-slate-500">Understand logic and flow</span></span></button><button onClick={() => ask("debug")} className="flex items-center gap-3 rounded-xl border border-[#203f7e]/60 bg-[#07152f] p-3 text-left hover:border-rose-400/35"><Bug className="h-4 w-4 text-rose-300" /><span><strong className="block text-[11px] text-white">Debug code</strong><span className="text-[9px] text-slate-500">Find errors and edge cases</span></span></button><button onClick={() => ask("optimize")} className="flex items-center gap-3 rounded-xl border border-[#203f7e]/60 bg-[#07152f] p-3 text-left hover:border-emerald-400/35"><Gauge className="h-4 w-4 text-emerald-300" /><span><strong className="block text-[11px] text-white">Optimize code</strong><span className="text-[9px] text-slate-500">Improve clarity and speed</span></span></button><button onClick={() => { setCode(`${code}\n\n# Suggested by NEXORA\n# Add tests for edge cases`); toast.success("Suggestion inserted"); }} className={`${secondaryButton} mt-1`}><WandSparkles className="h-4 w-4" /> Insert suggestion</button></div>
          </NeonSurface>
        </div>
      </div>
    </WorkspacePage>
  );
}
