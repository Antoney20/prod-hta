"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, Search } from "lucide-react";
import type { Activity, SubActivity, UrgencyLevel, ActivityStatus } from "@/types/new/activity";
import type { Member } from "@/types/dashboard/members";

type FormState = {
  name: string;
  urgency: UrgencyLevel;
  status: ActivityStatus;
  start_date: string;
  end_date: string;
  notes: string;
  send_email_alert: boolean;
  assigned_to: number[];
};

const empty: FormState = {
  name: "", urgency: "medium", status: "pending",
  start_date: "", end_date: "", notes: "",
  send_email_alert: false, assigned_to: [],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<SubActivity>) => Promise<void>;
  defaultValues?: SubActivity;
  activity: Activity | null;
  members: Member[];
  isSubmitting: boolean;
}

export function SubActivityForm({
  open, onClose, onSubmit, defaultValues, activity, members, isSubmitting,
}: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [memberSearch, setMemberSearch] = useState("");
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    if (!open) return;
    setMemberSearch("");
    setErrors({});
    setForm(defaultValues ? {
      name:             defaultValues.name,
      urgency:          defaultValues.urgency,
      status:           defaultValues.status,
      start_date:       defaultValues.start_date ?? "",
      end_date:         defaultValues.end_date ?? "",
      notes:            defaultValues.notes,
      send_email_alert: defaultValues.send_email_alert,
      assigned_to:      defaultValues.assigned_to,
    } : empty);
  }, [open, defaultValues]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      m.first_name?.toLowerCase().includes(q) ||
      m.last_name?.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const toggleMember = (id: number) =>
    setForm((f) => ({
      ...f,
      assigned_to: f.assigned_to.includes(id)
        ? f.assigned_to.filter((x) => x !== id)
        : [...f.assigned_to, id],
    }));

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      name:             form.name.trim(),
      urgency:          form.urgency,
      status:           form.status,
      start_date:       form.start_date || null,
      end_date:         form.end_date || null,
      notes:            form.notes.trim(),
      send_email_alert: form.send_email_alert,
      assigned_to:      form.assigned_to,
    });
  };

  const ROLE_COLOR: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    secretariat: "bg-blue-100 text-blue-700",
    swg: "bg-purple-100 text-purple-700",
    panel: "bg-amber-100 text-amber-700",
    user: "bg-slate-100 text-slate-600",
    content_manager: "bg-teal-100 text-teal-700",
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-xl lg:max-w-2xl overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle className="text-2xl">{isEdit ? "Edit Task" : "New Task"}</SheetTitle>
          <SheetDescription>
            {activity && (
              <span>
                Under activity: <strong>{activity.name}</strong>
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <Label>Task Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Draft stakeholder report"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm((f) => ({ ...f, urgency: v as UrgencyLevel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ActivityStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional context..."
              rows={2}
            />
          </div>

          {/* Email alert */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Send email alert</p>
              <p className="text-xs text-muted-foreground">Notify assignees by email</p>
            </div>
            <Switch
              checked={form.send_email_alert}
              onCheckedChange={(v) => setForm((f) => ({ ...f, send_email_alert: v }))}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Assign To</Label>

            {form.assigned_to.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.assigned_to.map((id) => {
                  const m = members.find((x) => Number(x.id) === id);
                  if (!m) return null;
                  return (
                    <span key={id} className="flex items-center gap-1 bg-[#27aae1]/10 text-[#27aae1] text-xs px-2 py-1 rounded-full">
                      {m.first_name || m.username}
                      <button type="button" onClick={() => toggleMember(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="border rounded-md overflow-hidden">
              <div className="relative border-b">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="w-full pl-8 pr-3 py-2 text-sm outline-none bg-transparent"
                  placeholder="Filter by name, email or role..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y">
                {filteredMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No members found.</p>
                ) : filteredMembers.map((m) => {
                  const selected = form.assigned_to.includes(Number(m.id));
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(Number(m.id))}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/40 transition-colors ${selected ? "bg-[#27aae1]/5" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-[#27aae1]/20 flex items-center justify-center text-xs font-medium text-[#27aae1] shrink-0">
                          {(m.first_name?.[0] || m.username[0]).toUpperCase()}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-medium truncate">
                            {m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge className={`text-xs px-1.5 py-0 border-0 ${ROLE_COLOR[m.role] ?? "bg-slate-100"}`}>
                          {m.role}
                        </Badge>
                        {selected && <span className="text-[#27aae1] text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}