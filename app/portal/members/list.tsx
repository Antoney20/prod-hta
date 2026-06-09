"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Member } from '@/types/dashboard/members';
import { updateMember, deleteMember } from '@/app/api/dashboard/members';

interface MembersListProps {
  members: Member[];
  onRefresh: () => void;
  canEdit: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  secretariat: 'Secretariat',
  swg: 'SWG',
  content_manager: 'Content Manager',
  panel: 'Panel',
  assessment: 'Assessment Group',
  user: 'User',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  secretariat: 'bg-purple-50 text-purple-700 border-purple-200',
  swg: 'bg-blue-50 text-blue-700 border-blue-200',
  content_manager: 'bg-amber-50 text-amber-700 border-amber-200',
  panel: 'bg-green-50 text-green-900 border-green-200',
  assessment: 'bg-teal-50 text-teal-700 border-teal-200',
  user: 'bg-slate-50 text-slate-600 border-slate-200',
};

// render order for the grouped sections
const ROLE_ORDER = ['admin', 'secretariat', 'swg', 'content_manager', 'panel', 'assessment', 'user'];

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${ROLE_COLORS[role] ?? ROLE_COLORS.user}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function getInitials(firstName: string | null, lastName: string | null, username: string) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  return username[0].toUpperCase();
}

function getFullName(firstName: string | null, lastName: string | null, username: string) {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return username;
}

function fmt(dateString: string | null) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDT(dateString: string | null) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface EditForm {
  phone_number: string;
  notes: string;
  organization: string;
  role: Member['role'];
}

const MembersList: React.FC<MembersListProps> = ({ members, onRefresh, canEdit }) => {
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<EditForm>({ phone_number: '', notes: '', organization: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      phone_number: m.phone_number ?? '',
      notes: m.notes ?? '',
      organization: m.organization ?? '',
      role: m.role as Member['role'],
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateMember(editing.id, form);
      toast.success('Member updated.');
      setEditing(null);
      onRefresh();
    } catch {
      toast.error('Failed to update member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this member? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteMember(id);
      toast.success('Member deleted.');
      onRefresh();
    } catch {
      toast.error('Failed to delete member.');
    } finally {
      setDeletingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <Card><CardContent className="p-8 text-center"><p className="text-gray-500">No members found.</p></CardContent></Card>
    );
  }

  // group members by role, preserving ROLE_ORDER; unknown roles fall to the end
  const grouped = members.reduce<Record<string, Member[]>>((acc, m) => {
    (acc[m.role] ??= []).push(m);
    return acc;
  }, {});
  const orderedRoles = [
    ...ROLE_ORDER.filter((r) => grouped[r]?.length),
    ...Object.keys(grouped).filter((r) => !ROLE_ORDER.includes(r)),
  ];

  const renderRow = (member: Member, isAssessment: boolean) => (
    <TableRow key={member.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.profile_image ?? undefined} />
            <AvatarFallback>{getInitials(member.first_name, member.last_name, member.username)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{getFullName(member.first_name, member.last_name, member.username)}</div>
            <div className="text-xs text-gray-500">@{member.username}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{member.email}</TableCell>
      <TableCell className="text-sm font-medium">{member.organization || '—'}</TableCell>
      {isAssessment && (
        <TableCell className="text-sm font-medium text-teal-700">
          {member.assessment_group_name || '—'}
        </TableCell>
      )}
      <TableCell className="text-sm">{member.phone_number || '—'}</TableCell>
      <TableCell>
        <Badge variant={member.is_active ? 'default' : 'secondary'}>
          {member.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{fmtDT(member.last_login)}</TableCell>
      <TableCell className="text-sm">{fmt(member.created_at)}</TableCell>
      <TableCell className="text-sm text-gray-600 max-w-xs truncate">{member.notes || '—'}</TableCell>
      {canEdit && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(member)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon" variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(member.id)}
              disabled={deletingId === member.id}
            >
              {deletingId === member.id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <>
      <div className="space-y-8">
        {orderedRoles.map((role) => {
          const group = grouped[role];
          const isAssessment = role === 'assessment';
          return (
            <div key={role} className="space-y-3">
              <div className="flex items-center gap-2">
                <RoleBadge role={role} />
                <span className="text-sm text-gray-500">({group.length})</span>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Organization</TableHead>
                          {isAssessment && <TableHead>Institution</TableHead>}
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Notes</TableHead>
                          {canEdit && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.map((member) => renderRow(member, isAssessment))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 pb-2 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={editing.profile_image ?? undefined} />
                  <AvatarFallback>{getInitials(editing.first_name, editing.last_name, editing.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{getFullName(editing.first_name, editing.last_name, editing.username)}</p>
                  <p className="text-xs text-gray-500">@{editing.username}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Organization</label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Phone Number</label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Role</label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Member['role'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="secretariat">Secretariat</SelectItem>
                    <SelectItem value="swg">SWG</SelectItem>
                    <SelectItem value="content_manager">Content Manager</SelectItem>
                    <SelectItem value="panel">Panel</SelectItem>
                    <SelectItem value="assessment">Assessment Group</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MembersList;
