"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, CheckCircle2,
  NotepadTextDashed, Search,
} from "lucide-react";
import { toast } from "react-toastify";

import type { Activity, SubActivity } from "@/types/new/activity";
import type { Member } from "@/types/dashboard/members";
import {
  getActivities, createActivity, deleteActivity,
  getSubActivities, createSubActivity, updateSubActivity,
  deleteSubActivity, markSubActivityComplete,
} from "@/app/api/activities";
import { getMembers } from "@/app/api/dashboard/members";
import { SubActivityForm } from "./sub";
import { ActivityForm } from "./form";

const URGENCY_BADGE: Record<string, string> = {
  low:      "bg-slate-100 text-slate-600",
  medium:   "bg-amber-100 text-amber-700",
  high:     "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_BADGE: Record<string, string> = {
  pending:     "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed:   "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-600",
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminActivitiesPage() {
  const [activities, setActivities]         = useState<Activity[]>([]);
  const [subActivities, setSubActivities]   = useState<SubActivity[]>([]);
  const [members, setMembers]               = useState<Member[]>([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");

  const [activityFormOpen, setActivityFormOpen]     = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState(false);

  const [subFormOpen, setSubFormOpen]             = useState(false);
  const [subFormActivity, setSubFormActivity]     = useState<Activity | null>(null);
  const [editingSub, setEditingSub]               = useState<SubActivity | undefined>();
  const [submittingSub, setSubmittingSub]         = useState(false);

  const [deleteActivity_, setDeleteActivity]  = useState<Activity | null>(null);
  const [deleteSub, setDeleteSub]             = useState<SubActivity | null>(null);
  const [completeSub, setCompleteSub]         = useState<SubActivity | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [acts, subs, mems] = await Promise.all([
      getActivities(),
      getSubActivities(),
      getMembers().then((r) => r.results).catch(() => []),
    ]);
    setActivities(acts);
    setSubActivities(subs);
    setMembers(mems);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<number, SubActivity[]>();
    subActivities.forEach((s) => {
      if (!map.has(s.activity)) map.set(s.activity, []);
      map.get(s.activity)!.push(s);
    });
    return map;
  }, [subActivities]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return activities;
    return activities.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      (grouped.get(a.id) ?? []).some(
        (s) => s.name.toLowerCase().includes(q) || s.hta_id.toLowerCase().includes(q)
      )
    );
  }, [activities, search, grouped]);

  const resolveMembers = (ids: number[]) =>
    ids.map((id) => members.find((m) => Number(m.id) === id)).filter(Boolean) as Member[];

  const handleCreateActivity = async (values: Partial<Activity>) => {
    setSubmittingActivity(true);
    const { data, error } = await createActivity(values as any);
    if (error) { toast.error(error); }
    else { toast.success(`Activity '${data!.name}' created.`); setActivityFormOpen(false); await load(); }
    setSubmittingActivity(false);
  };

  const handleDeleteActivity = async () => {
    if (!deleteActivity_) return;
    const { ok, error } = await deleteActivity(deleteActivity_.id);
    if (ok) { toast.success("Activity deleted."); await load(); }
    else { toast.error(error ?? "Failed to delete."); }
    setDeleteActivity(null);
  };

  const openSubForm = (activity: Activity, sub?: SubActivity) => {
    setSubFormActivity(activity);
    setEditingSub(sub);
    setSubFormOpen(true);
  };

  const handleSubSubmit = async (values: Partial<SubActivity>) => {
    setSubmittingSub(true);
    const { data, error } = editingSub?.id
      ? await updateSubActivity(editingSub.id, values as any)
      : await createSubActivity({ ...values, activity: subFormActivity!.id } as any);
    if (error) { toast.error(error); }
    else {
      toast.success(editingSub?.id ? "Task updated." : `Task '${data!.name}' created.`);
      setSubFormOpen(false);
      await load();
    }
    setSubmittingSub(false);
  };

  const handleDeleteSub = async () => {
    if (!deleteSub) return;
    const { ok, error } = await deleteSubActivity(deleteSub.id);
    if (ok) { toast.success("Task deleted."); await load(); }
    else { toast.error(error ?? "Failed to delete."); }
    setDeleteSub(null);
  };

  const handleComplete = async () => {
    if (!completeSub) return;
    const { data, error } = await markSubActivityComplete(completeSub.id);
    if (error) { toast.error(error); }
    else { toast.success(`'${data!.name}' marked as complete.`); await load(); }
    setCompleteSub(null);
  };


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg">
            <NotepadTextDashed className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Activity Tracker</h1>
            <p className="text-sm text-muted-foreground">Manage activities and assigned tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setActivityFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Activity
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search activities or tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>


      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No activities found.</div>
      ) : (
        <div className="rounded-lg border overflow-hidden overflow-x-auto ">
          <table className="w-full ">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="text-left px-4 py-2.5 font-medium">Ref</th>
                <th className="text-left px-4 py-2.5 font-medium">Task</th>
                <th className="text-left px-4 py-2.5 font-medium">Priority</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-left px-4 py-2.5 font-medium">Assignees</th>
                <th className="text-left px-4 py-2.5 font-medium">Deadline</th>
                <th className="text-left px-4 py-2.5 font-medium">Notes</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((activity) => {
                const subs = grouped.get(activity.id) ?? [];
                return (
                  <>
                    <tr
                      key={`activity-${activity.id}`}
                      className="border-b"
                      style={{ backgroundColor: "rgba(39,170,225,0.07)" }}
                    >
                      <td colSpan={7} className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-sm">{activity.name}</span>
                          <Badge className={`text-xs px-2 py-0 rounded-full border-0 font-medium ${URGENCY_BADGE[activity.urgency]}`}>
                            {activity.urgency}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {subs.length} task{subs.length !== 1 ? "s" : ""}
                          </span>
                         
                        </div>
                         {activity.notes && (
                            <span className="text-xs text-muted-foreground  max-w-xs hidden md:inline line-clamp-1 ">
                            {activity.notes}
                            </span>
                          )}
                      </td>
                      {/* Add task + delete activity */}
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => openSubForm(activity)}
                          >
                            <Plus className="h-3 w-3 mr-1" />Add Task
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteActivity(activity)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />Delete Activity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>

                    {subs.length === 0 ? (
                      <tr key={`empty-${activity.id}`} className="border-b">
                        <td colSpan={8} className="px-4 py-3 text-xs text-muted-foreground text-center">
                          No tasks yet.{" "}
                          <button
                            className="text-[#27aae1] underline underline-offset-2"
                            onClick={() => openSubForm(activity)}
                          >
                            Add the first one.
                          </button>
                        </td>
                      </tr>
                    ) : subs.map((sub, i) => {
                      const assignees = resolveMembers(sub.assigned_to);
                      return (
                        <tr
                          key={sub.id}
                          className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {sub.hta_id}
                          </td>
                          <td className="px-4 py-3 font-medium max-w-[180px] truncate">{sub.name}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs px-2 py-0 rounded-full border-0 ${URGENCY_BADGE[sub.urgency]}`}>
                              {sub.urgency}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs px-2 py-0 rounded-full border-0 ${STATUS_BADGE[sub.status]}`}>
                              {sub.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {assignees.length === 0 ? (
                              <span className="text-muted-foreground text-xs">Unassigned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {assignees.slice(0, 2).map((m) => (
                                  <span key={m.id} className="text-xs bg-slate-100 rounded px-1.5 py-0.5">
                                    {m.first_name || m.username}
                                  </span>
                                ))}
                                {assignees.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{assignees.length - 2}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {fmt(sub.end_date)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                            <p className="line-clamp-1">{sub.notes || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 border bg-[#27aae1]/5 px-3 text-xs">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {sub.status !== "completed" && (
                                  <DropdownMenuItem onClick={() => setCompleteSub(sub)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />Mark Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => openSubForm(activity, sub)}>
                                  <Pencil className="h-4 w-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteSub(sub)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity create form */}
      <ActivityForm
        open={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        onSubmit={handleCreateActivity}
        isSubmitting={submittingActivity}
      />

      {/* Sub-activity create/edit form */}
      <SubActivityForm
        open={subFormOpen}
        onClose={() => { setSubFormOpen(false); setEditingSub(undefined); }}
        onSubmit={handleSubSubmit}
        defaultValues={editingSub}
        activity={subFormActivity}
        members={members}
        isSubmitting={submittingSub}
      />

      {/* Delete activity */}
      <AlertDialog open={!!deleteActivity_} onOpenChange={(v) => !v && setDeleteActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteActivity_?.name}</strong> and all its tasks will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteActivity}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete sub-activity */}
      <AlertDialog open={!!deleteSub} onOpenChange={(v) => !v && setDeleteSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteSub?.name}</strong> ({deleteSub?.hta_id}) will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteSub}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark complete */}
      <AlertDialog open={!!completeSub} onOpenChange={(v) => !v && setCompleteSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that <strong>{completeSub?.name}</strong> ({completeSub?.hta_id}) has been completed.
              This will record the time and your name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}