"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, Download, FileDown, ReceiptText, SearchX } from "lucide-react";
import { toast } from "sonner";
import { MetricTile, NeonSurface, PageIntro, Pill, SearchBox, SurfaceHeader, WorkspacePage, iconButton, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";

const payments = [
  { invoice: "INV-2048", date: "May 01, 2026", plan: "Pro", method: "Visa •••• 4242", amount: 9.99, status: "Paid" },
  { invoice: "INV-1982", date: "Apr 01, 2026", plan: "Pro", method: "Visa •••• 4242", amount: 9.99, status: "Paid" },
  { invoice: "INV-1916", date: "Mar 01, 2026", plan: "Pro", method: "Visa •••• 4242", amount: 9.99, status: "Paid" },
  { invoice: "INV-1844", date: "Feb 01, 2026", plan: "Pro", method: "Visa •••• 4242", amount: 9.99, status: "Paid" },
  { invoice: "INV-1761", date: "Jan 01, 2026", plan: "Pro", method: "Visa •••• 4242", amount: 9.99, status: "Refunded" },
  { invoice: "INV-1690", date: "Dec 01, 2025", plan: "Free", method: "—", amount: 0, status: "Paid" },
];

export function PaymentHistory() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [year, setYear] = useState("2026");
  const visible = useMemo(() => payments.filter((payment) => `${payment.invoice} ${payment.plan} ${payment.method}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || payment.status === status) && payment.date.includes(year)), [query, status, year]);
  function saveFile(name: string, content: string) { const url = URL.createObjectURL(new Blob([content], { type: "text/csv" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); toast.success(`${name} downloaded`); }
  function exportAll() { saveFile("nexora-payment-history.csv", ["Invoice,Date,Plan,Method,Amount,Status", ...visible.map((item) => `${item.invoice},${item.date},${item.plan},${item.method},${item.amount},${item.status}`)].join("\n")); }
  return <WorkspacePage><PageIntro eyebrow="Invoices & receipts" title="Payment History" description="Review subscription transactions and download individual or consolidated invoices." actions={<><Link href="/billing" className={secondaryButton}><ArrowLeft className="h-4 w-4" /> Billing</Link><button onClick={exportAll} className={primaryButton}><FileDown className="h-4 w-4" /> Export CSV</button></>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="Total Paid" value="$39.96" detail="During 2026" icon={CreditCard} tone="blue" /><MetricTile label="Transactions" value="5" detail="1 refunded" icon={ReceiptText} tone="violet" /><MetricTile label="Next Invoice" value="Jun 01" detail="$9.99 estimated" icon={CalendarDays} tone="cyan" /><MetricTile label="Outstanding" value="$0.00" detail="Account current" icon={Download} tone="emerald" /></div>
    <NeonSurface className="overflow-hidden"><SurfaceHeader title="Transactions" description={`${visible.length} payment records`} /><div className="flex flex-col gap-3 border-b border-[#18316b]/55 p-4 lg:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search invoice or payment method..." className="flex-1" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-[#244483]/65 bg-[#07152f] px-3 text-[11px] text-slate-300 outline-none"><option>All statuses</option><option>Paid</option><option>Refunded</option></select><select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-[#244483]/65 bg-[#07152f] px-3 text-[11px] text-slate-300 outline-none"><option>2026</option><option>2025</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="bg-[#07152f]"><tr>{["Invoice", "Date", "Plan", "Payment Method", "Amount", "Status", "Receipt"].map((heading) => <th key={heading} className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#17306a]/45">{visible.map((payment) => <tr key={payment.invoice} className="hover:bg-blue-500/5"><td className="px-4 py-3 text-[11px] font-semibold text-blue-300">{payment.invoice}</td><td className="px-4 py-3 text-[10px] text-slate-400">{payment.date}</td><td className="px-4 py-3"><Pill tone="violet">{payment.plan}</Pill></td><td className="px-4 py-3 text-[10px] text-slate-400">{payment.method}</td><td className="px-4 py-3 text-[11px] font-bold text-white">${payment.amount.toFixed(2)}</td><td className="px-4 py-3"><Pill tone={payment.status === "Paid" ? "green" : "amber"}>{payment.status}</Pill></td><td className="px-4 py-3"><button onClick={() => saveFile(`${payment.invoice}.txt`, `NEXORA Invoice ${payment.invoice}\nDate: ${payment.date}\nAmount: $${payment.amount.toFixed(2)}\nStatus: ${payment.status}`)} className={iconButton} aria-label={`Download ${payment.invoice}`}><Download className="h-4 w-4" /></button></td></tr>)}</tbody></table>{!visible.length && <div className="grid min-h-64 place-items-center text-center"><div><SearchX className="mx-auto h-10 w-10 text-slate-700" /><p className="mt-2 text-xs text-slate-500">No transactions match these filters.</p></div></div>}</div></NeonSurface>
  </WorkspacePage>;
}
