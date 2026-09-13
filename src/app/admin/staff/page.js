"use client";

import { useEffect, useState } from "react";
import { Plus, UserCog } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Badge, { StatusBadge } from "@/components/admin/ui/Badge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Select from "@/components/admin/ui/form/Select";
import EmptyState from "@/components/admin/ui/EmptyState";
import { SkeletonRows } from "@/components/admin/ui/Skeleton";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatRelativeTime } from "@/lib/admin/utils/format";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";
import { STAFF_ROLES, ROLE_PERMISSIONS } from "@/lib/admin/types/staff";
import { listStaff, inviteStaff, updateStaffRole, setStaffStatus, removeStaff } from "@/lib/admin/services/staff-service";

const RESOURCES = ["orders", "products", "discounts", "content", "settings", "staff"];

export default function StaffPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Support" });
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  async function refresh() {
    setStaff(await listStaff());
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  async function handleInvite() {
    setSaving(true);
    try {
      await inviteStaff(form);
      toast({ title: "Invitation sent", description: form.email });
      setInviteOpen(false);
      setForm({ name: "", email: "", role: "Support" });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id, role) {
    await updateStaffRole(id, role);
    toast({ title: "Role updated" });
    refresh();
  }

  async function handleToggleStatus(member) {
    await setStaffStatus(member.id, member.status === "suspended" ? "active" : "suspended");
    refresh();
  }

  async function handleRemove() {
    await removeStaff(removeTarget.id);
    toast({ title: "Staff member removed", variant: "info" });
    setRemoveTarget(null);
    refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Staff"
        description="Manage who has access to your admin, and what they can do."
        actions={
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> Invite staff
          </Button>
        }
      />

      <Panel padded={false}>
        <PanelHeader title="Team members" className="px-5 pt-5 sm:px-6" />
        {!mounted || loading ? (
          <SkeletonRows rows={5} cols={3} />
        ) : staff.length === 0 ? (
          <EmptyState icon={UserCog} title="No staff yet" />
        ) : (
          <ul className="divide-y divide-[var(--admin-border)]">
            {staff.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: avatarColor(member.tone) }}>
                  {initials(member.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--admin-text)]">{member.name}</p>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">{member.email}</p>
                </div>
                <StatusBadge status={member.status} />
                <p className="hidden text-xs text-[var(--admin-text-muted)] sm:block">
                  {member.lastActiveAt ? `Active ${formatRelativeTime(member.lastActiveAt)}` : "Never signed in"}
                </p>
                <Select value={member.role} onChange={(e) => handleRoleChange(member.id, e.target.value)} className="!h-9 w-32">
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
                <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(member)}>
                  {member.status === "suspended" ? "Reactivate" : "Suspend"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(member)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel padded={false}>
        <PanelHeader title="Permission matrix" description="What each role can access — wired to Supabase row-level policies later." className="px-5 pt-5 sm:px-6" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)] sm:px-6">Role</th>
                {RESOURCES.map((r) => (
                  <th key={r} className="px-3 py-3 text-xs font-medium uppercase tracking-wide capitalize text-[var(--admin-text-muted)]">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAFF_ROLES.map((role) => (
                <tr key={role} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-5 py-3 font-medium text-[var(--admin-text)] sm:px-6">{role}</td>
                  {RESOURCES.map((resource) => {
                    const level = ROLE_PERMISSIONS[role][resource];
                    return (
                      <td key={resource} className="px-3 py-3">
                        <Badge tone={level === "manage" ? "success" : level === "edit" ? "info" : level === "view" ? "neutral" : "danger"} className="capitalize">
                          {level}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite staff member"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleInvite}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove staff member?"
        description={`${removeTarget?.name} will lose access to the admin.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
