"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Shield,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { adminUsers, type AdminUser } from "./admin-data";
import {
  ActionButton,
  downloadCsv,
  EmptyState,
  Field,
  inputClass,
  MetricCard,
  Modal,
  PageHeader,
  Panel,
  SearchField,
  StatusBadge,
} from "./admin-ui";

const roleTone = { Admin: "violet", Analyst: "info", Member: "neutral", Viewer: "neutral" } as const;
const statusTone = { Active: "success", Invited: "warning", Suspended: "danger" } as const;
const pageSize = 5;

export function UsersPage() {
  const [users, setUsers] = useState(adminUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Member" as AdminUser["role"] });

  const filtered = useMemo(() => users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.plan}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) &&
      (roleFilter === "All roles" || user.role === roleFilter) &&
      (statusFilter === "All statuses" || user.status === statusFilter);
  }), [users, query, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleUsers = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function addUser(event: FormEvent) {
    event.preventDefault();
    if (!newUser.name.trim() || !newUser.email.includes("@")) {
      toast.error("Enter a name and valid email address.");
      return;
    }
    const user: AdminUser = {
      id: Date.now(),
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      plan: "Free",
      status: "Invited",
      joined: "Today",
      lastSeen: "Never",
      spend: 0,
    };
    setUsers((current) => [user, ...current]);
    setNewUser({ name: "", email: "", role: "Member" });
    setAddOpen(false);
    setPage(1);
    toast.success("User added to this demo view", { description: "No invitation was sent to a backend service." });
  }

  function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setUsers((current) => current.map((user) => user.id === editing.id ? editing : user));
    toast.success(`${editing.name}'s local role is now ${editing.role}.`);
    setEditing(null);
  }

  function toggleStatus(user: AdminUser) {
    const status: AdminUser["status"] = user.status === "Suspended" ? "Active" : "Suspended";
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status } : item));
    toast.success(`${user.name} marked ${status.toLowerCase()} in this demo.`);
  }

  function exportUsers() {
    downloadCsv("nexora-users.csv", [
      ["Name", "Email", "Role", "Plan", "Status", "Joined", "Spend"],
      ...filtered.map((user) => [user.name, user.email, user.role, user.plan, user.status, user.joined, user.spend]),
    ]);
    toast.success("Filtered user list downloaded.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access control"
        title="User Management"
        description="Review membership, roles, plans, and account state across NEXORA workspaces."
        actions={<><ActionButton variant="ghost" onClick={exportUsers}><Download className="h-4 w-4" /> Export</ActionButton><ActionButton onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add user</ActionButton></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value={users.length.toLocaleString()} change="+18" detail="this week" icon={<Users className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Active now" value={users.filter((user) => user.status === "Active").length.toString()} detail="in this demo dataset" icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <MetricCard label="Administrators" value={users.filter((user) => user.role === "Admin").length.toString()} detail="full access" icon={<Shield className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Pending invites" value={users.filter((user) => user.status === "Invited").length.toString()} detail="awaiting signup" icon={<UserMinus className="h-5 w-5" />} tone="amber" />
      </div>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-blue-500/10 p-4 lg:flex-row lg:items-center">
          <SearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search name, email, or plan..." className="w-full lg:max-w-sm" />
          <div className="flex flex-1 flex-wrap gap-2">
            <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} className={`${inputClass} w-auto min-w-32`} aria-label="Filter by role">
              <option>All roles</option><option>Admin</option><option>Analyst</option><option>Member</option><option>Viewer</option>
            </select>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className={`${inputClass} w-auto min-w-36`} aria-label="Filter by status">
              <option>All statuses</option><option>Active</option><option>Invited</option><option>Suspended</option>
            </select>
            <ActionButton variant="secondary" className="ml-auto" onClick={() => setMatrixOpen(true)}><Shield className="h-4 w-4" /> Role matrix</ActionButton>
          </div>
        </div>

        {visibleUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-blue-500/10 text-[9px] uppercase tracking-[0.14em] text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-bold">User</th><th className="px-5 py-3 font-bold">Role</th><th className="px-5 py-3 font-bold">Plan</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Last seen</th><th className="px-5 py-3 font-bold">Spend</th><th className="px-5 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10">
                {visibleUsers.map((user, index) => (
                  <tr key={user.id} className="group hover:bg-blue-500/5">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 place-items-center rounded-xl text-[11px] font-black text-white ${index % 3 === 0 ? "bg-gradient-to-br from-cyan-500 to-blue-600" : index % 3 === 1 ? "bg-gradient-to-br from-violet-500 to-fuchsia-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>{user.name.split(" ").map((part) => part[0]).join("")}</span>
                        <div><p className="text-xs font-semibold text-slate-200">{user.name}</p><p className="mt-0.5 text-[10px] text-slate-500">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge tone={roleTone[user.role]}>{user.role}</StatusBadge></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{user.plan}</td>
                    <td className="px-5 py-3.5"><StatusBadge tone={statusTone[user.status]}><i className="h-1.5 w-1.5 rounded-full bg-current" />{user.status}</StatusBadge></td>
                    <td className="px-5 py-3.5"><p className="text-xs text-slate-400">{user.lastSeen}</p><p className="mt-0.5 text-[9px] text-slate-600">Joined {user.joined}</p></td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-300">${user.spend}</td>
                    <td className="px-5 py-3.5"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => setEditing({ ...user })} className="grid h-8 w-8 place-items-center rounded-lg border border-blue-500/15 text-slate-500 hover:border-cyan-400/30 hover:text-cyan-300" aria-label={`Edit ${user.name}`}><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => toggleStatus(user)} className={`grid h-8 w-8 place-items-center rounded-lg border ${user.status === "Suspended" ? "border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10" : "border-rose-400/15 text-slate-500 hover:border-rose-400/30 hover:text-rose-300"}`} aria-label={user.status === "Suspended" ? `Activate ${user.name}` : `Suspend ${user.name}`}><UserMinus className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="No users match the current filters." />}

        <div className="flex flex-col gap-3 border-t border-blue-500/10 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {visibleUsers.length} of {filtered.length} matching users</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1} className="grid h-8 w-8 place-items-center rounded-lg border border-blue-500/15 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-16 text-center text-[10px]">Page {safePage} / {pageCount}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={safePage === pageCount} className="grid h-8 w-8 place-items-center rounded-lg border border-blue-500/15 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </Panel>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user" description="Adds a pending user to the local demo table only." footer={<><ActionButton variant="ghost" onClick={() => setAddOpen(false)}>Cancel</ActionButton><ActionButton type="submit" form="add-user-form">Add user</ActionButton></>}>
        <form id="add-user-form" onSubmit={addUser} className="space-y-4">
          <Field label="Full name"><input value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} className={inputClass} placeholder="Jordan Lee" /></Field>
          <Field label="Email address"><input type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} className={inputClass} placeholder="jordan@company.com" /></Field>
          <Field label="Role"><select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as AdminUser["role"] })} className={inputClass}><option>Admin</option><option>Analyst</option><option>Member</option><option>Viewer</option></select></Field>
        </form>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit user access" description={editing?.email} footer={<><ActionButton variant="ghost" onClick={() => setEditing(null)}>Cancel</ActionButton><ActionButton type="submit" form="edit-user-form">Save changes</ActionButton></>}>
        {editing && <form id="edit-user-form" onSubmit={saveEdit} className="space-y-4"><Field label="Full name"><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Role"><select value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value as AdminUser["role"] })} className={inputClass}><option>Admin</option><option>Analyst</option><option>Member</option><option>Viewer</option></select></Field><Field label="Status"><select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as AdminUser["status"] })} className={inputClass}><option>Active</option><option>Invited</option><option>Suspended</option></select></Field></div></form>}
      </Modal>

      <Modal open={matrixOpen} onClose={() => setMatrixOpen(false)} title="Role permission matrix" description="Reference permissions for this frontend demo." size="lg" footer={<ActionButton onClick={() => setMatrixOpen(false)}>Done</ActionButton>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="text-slate-500"><tr><th className="py-3">Permission</th><th>Admin</th><th>Analyst</th><th>Member</th><th>Viewer</th></tr></thead><tbody className="divide-y divide-blue-500/10 text-slate-300">{[["Manage billing","Yes","No","No","No"],["Configure models","Yes","View","No","No"],["Run analytics","Yes","Yes","Yes","View"],["Invite users","Yes","No","No","No"]].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className={`py-3 ${index === 0 ? "font-semibold text-white" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div>
      </Modal>
    </div>
  );
}
