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
import type { UserSummary } from "@/app/api/users";

type FormState = {
  name:             string;
  urgency:          UrgencyLevel;
  status:           ActivityStatus;
  start_date:       string;
  end_date:         string;
  notes:            string;
  send_email_alert: boolean;
  assigned_to:      number[];  
};

const empty: FormState = {
  name: "", urgency: "medium", status: "pending",
  start_date: "", end_date: "", notes: "",
  send_email_alert: false, assigned_to: [],
};

interface Props {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (values: Partial<SubActivity>) => Promise<void>;
  defaultValues?: SubActivity;
  activity:       Activity | null;
  users:          UserSummary[];
  isSubmitting:   boolean;
}

const ROLE_COLOR: Record<string, string> = {
  admin:           "bg-red-100 text-red-700",
  secretariat:     "bg-blue-100 text-blue-700",
  swg:             "bg-purple-100 text-purple-700",
  panel:           "bg-amber-100 text-amber-700",
  user:            "bg-slate-100 text-slate-600",
  content_manager: "bg-teal-100 text-teal-700",
};

export function SubActivityForm({
  open, onClose, onSubmit, defaultValues, activity, users, isSubmitting,
}: Props) {
  const [form,       setForm]       = useState<FormState>(empty);
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [userSearch, setUserSearch] = useState("");
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    if (!open) return;
    setUserSearch("");
    setErrors({});
    setForm(defaultValues ? {
      name:             defaultValues.name,
      urgency:          defaultValues.urgency,
      status:           defaultValues.status,
      start_date:       defaultValues.start_date ?? "",
      end_date:         defaultValues.end_date   ?? "",
      notes:            defaultValues.notes,
      send_email_alert: defaultValues.send_email_alert,
      assigned_to:      defaultValues.assigned_to,
    } : empty);
  }, [open, defaultValues]);

  const assignableUsers = useMemo(() => users.filter((u) => u.is_active), [users]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return assignableUsers;
    return assignableUsers.filter((u) =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)     ||
      u.role.toLowerCase().includes(q)
    );
  }, [assignableUsers, userSearch]);

  const toggleUser = (userId: number) =>
    setForm((f) => ({
      ...f,
      assigned_to: f.assigned_to.includes(userId)
        ? f.assigned_to.filter((x) => x !== userId)
        : [...f.assigned_to, userId],
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
      end_date:         form.end_date   || null,
      notes:            form.notes.trim(),
      send_email_alert: form.send_email_alert,
      assigned_to:      form.assigned_to,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-xl lg:max-w-2xl overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle className="text-2xl">{isEdit ? "Edit Task" : "New Task"}</SheetTitle>
          <SheetDescription>
            {activity && <span>Under activity: <strong>{activity.name}</strong></span>}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <Label>Task Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. HTA assessment report"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm((f) => ({ ...f, urgency: v as UrgencyLevel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional context..."
              rows={2}
            />
          </div>

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
            <div className="flex items-center justify-between">
              <Label>Assign To</Label>
              {form.assigned_to.length > 0 && (
                <span className="text-xs text-muted-foreground">{form.assigned_to.length} selected</span>
              )}
            </div>

            {/* Selected pills — keyed and resolved by u.id */}
            {form.assigned_to.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.assigned_to.map((userId) => {
                  const u = users.find((x) => x.id === userId);
                  if (!u) return null;
                  return (
                    <span key={userId} className="flex items-center gap-1 bg-[#27aae1]/10 text-[#27aae1] text-xs px-2 py-1 rounded-full">
                      {u.full_name.split(" ")[0]}
                      <button type="button" onClick={() => toggleUser(userId)}>
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
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No users found.</p>
                ) : filteredUsers.map((u) => {
                  const selected = form.assigned_to.includes(u.id);  // ← u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}               // ← u.id
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/40 transition-colors ${selected ? "bg-[#27aae1]/5" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {u.profile_image ? (
                          <img src={u.profile_image} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-[#27aae1]/20 flex items-center justify-center text-xs font-medium text-[#27aae1] shrink-0">
                            {u.full_name[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <div className="text-left min-w-0">
                          <p className="font-medium truncate">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge className={`text-xs px-1.5 py-0 border-0 ${ROLE_COLOR[u.role] ?? "bg-slate-100"}`}>
                          {u.role}
                        </Badge>
                        {selected && <span className="text-[#27aae1] text-xs font-bold">✓</span>}
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