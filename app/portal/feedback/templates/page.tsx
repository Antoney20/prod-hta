"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RichEditor } from "@/components/shared/editor";
import {
  getAllFeedbackCategories,
  createFeedbackCategory,
  updateFeedbackCategory,
  deleteFeedbackCategory,
} from "@/app/api/feedback";
import type { FeedbackCategory, FeedbackCategoryCreatePayload } from "@/types/new/feedback";

const BASE_TEMPLATE = `<p>Dear {{ submitter_name }},</p>

<p>Thank you for submitting your health intervention proposal to the
<strong>Benefits Package and Tariffs Advisory Panel</strong>.
We have reviewed your submission and wish to provide you with the following update.</p>

<p>If you have any questions, please contact us at
<a href="mailto:{{ bptap_email }}">{{ bptap_email }}</a>.</p>

<p>Sincerely,<br><strong style="color:#27aae1;">{{ bptap }} Secretariat</strong></p>`;


const DECISION_SNIPPET = `\n{% if decision_type or decision_date %}
<div class="detail-block">
  {% if decision_type %}<p><strong>Decision:</strong> {{ decision_type }}</p>{% endif %}
  {% if decision_date %}<p><strong>Decision Date:</strong> {{ decision_date }}</p>{% endif %}
</div>
{% endif %}\n`;

const FEEDBACK_SNIPPET = `\n{% if feedback %}
<div class="feedback-block">
  <p><strong>Feedback from the Panel:</strong></p>
  <p>{{ feedback }}</p>
</div>
{% endif %}\n`;


const TEMPLATE_VARS = [
  { var: "{{ submitter_name }}",  label: "Submitter Name" },
  { var: "{{ submitter_email }}", label: "Submitter Email" },
  { var: "{{ decision_type }}",   label: "Decision Type" },
  { var: "{{ decision_date }}",   label: "Decision Date" },
  { var: "{{ feedback }}",        label: "Feedback Text" },
  { var: "{{ bptap }}",        label: "Org Name" },
  { var: "{{ bptap_email }}",       label: "Org Email" },
  { var: "{{ current_year }}",    label: "Current Year" },
];

const EMPTY_FORM: FeedbackCategoryCreatePayload = {
  name: "",
  description: "",
  subject: "",
  template: BASE_TEMPLATE,
  is_active: true,
};

interface PreviewData {
  submitter_name: string;
  submitter_email: string;
  decision_type: string;
  decision_date: string;
  feedback: string;
  bptap: string;
  bptap_email: string;
}

const DEFAULT_PREVIEW: PreviewData = {
  submitter_name:  "Dr. A Much",
  submitter_email: "hbtap@uonbi.ac.ke",
  decision_type:   "Approved",
  decision_date:   "15 July 2025",
  feedback:        "Your proposal meets clinical effectiveness and cost criteria. It has been approved for inclusion in the next benefits package review cycle.",
  bptap:        "BPTAP",
  bptap_email:       "hbtap@uonbi.ac.ke",
};

function renderPreview(template: string, data: PreviewData): string {
  let html = template;

  const vars: Record<string, string> = {
    "{{ submitter_name }}":  data.submitter_name,
    "{{ submitter_email }}": data.submitter_email,
    "{{ decision_type }}":   data.decision_type,
    "{{ decision_date }}":   data.decision_date,
    "{{ feedback }}":        data.feedback,
    "{{ bptap }}":        data.bptap,
    "{{ bptap_email }}":       data.bptap_email,
    "{{ current_year }}":    String(new Date().getFullYear()),
  };
  for (const [k, v] of Object.entries(vars)) html = html.replaceAll(k, v);

  // evaluate {% if %}...{% endif %}
  html = html.replace(
    /\{%\s*if\s+([^%]+?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
    (_m, condition, inner) => {
      const lookup: Record<string, string> = {
        decision_type: data.decision_type,
        decision_date: data.decision_date,
        feedback:      data.feedback,
      };
      const truthy = condition.split(/\s+or\s+/).some(
        (c: string) => Boolean(lookup[c.trim()])
      );
      if (!truthy) return "";
      return inner.replace(
        /\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
        (_m2: string, k: string, body: string) => lookup[k] ? body : ""
      );
    }
  );

  return html;
}

function CategoryCard({ category, onEdit, onDelete }: {
  category: FeedbackCategory;
  onEdit: (c: FeedbackCategory) => void;
  onDelete: (c: FeedbackCategory) => void;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={nameStyle}>{category.name}</span>
            <span style={category.is_active ? activeBadge : inactiveBadge}>
              {category.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          {category.description && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.5 }}>
              {category.description}
            </p>
          )}
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Subject: <span style={{ color: "#374151", fontStyle: "italic" }}>{category.subject || "—"}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => onEdit(category)} style={editBtnStyle}>Edit</button>
          <button onClick={() => onDelete(category)} style={deleteBtnStyle}>Delete</button>
        </div>
      </div>

      <div style={previewStyle}>
        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
          {stripHtml(category.template).slice(0, 160)}
          {category.template.length > 160 ? "…" : ""}
        </span>
      </div>

      <p style={{ fontSize: 11, color: "#d1d5db", margin: "8px 0 0", textAlign: "right" }}>
        Updated {new Date(category.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
}


function CategoryForm({ initial, onSave, isSaving }: {
  initial: FeedbackCategoryCreatePayload;
  onSave: (data: FeedbackCategoryCreatePayload) => void;
  isSaving: boolean;
}) {
  const [form, setForm]         = useState<FeedbackCategoryCreatePayload>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData>(DEFAULT_PREVIEW);

  useEffect(() => { setForm(initial); }, [initial]);

  const set = (key: keyof FeedbackCategoryCreatePayload, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }));

  const insertSnippet = (snippet: string) => {
    // insert before the closing sign-off paragraph if possible
    const current = form.template ?? "";
    const signoffIdx = current.lastIndexOf("<p>If you have any questions");
    if (signoffIdx !== -1) {
      set("template", current.slice(0, signoffIdx) + snippet + current.slice(signoffIdx));
    } else {
      set("template", current + snippet);
    }
  };

  const hasDecision = (form.template ?? "").includes("decision_type");
  const hasFeedback = (form.template ?? "").includes("feedback-block");

  const renderedPreview = useMemo(
    () => renderPreview(form.template ?? "", previewData),
    [form.template, previewData]
  );

  const canSave = form.name.trim() && form.subject.trim() && !isSaving;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Name + Active */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
        <label style={labelStyle}>
          Category Name *
          <input value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g. Approved, Rejected, Needs More Info" style={inputStyle} />
        </label>
        <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 2 }}>
          <input type="checkbox" checked={form.is_active ?? true}
            onChange={e => set("is_active", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#27aae1" }} />
          <span>Active</span>
        </label>
      </div>

      {/* Description */}
      <label style={labelStyle}>
        Description
        <textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)}
          placeholder="Brief note about when this category is used"
          rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
      </label>

      {/* Subject */}
      <label style={labelStyle}>
        Email Subject *
        <input value={form.subject} onChange={e => set("subject", e.target.value)}
          placeholder="e.g. Update on your proposal — {{ decision_type }}" style={inputStyle} />
      </label>

      {/* Optional block buttons */}
      <div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>
          Optional blocks — insert into body:
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" disabled={hasDecision}
            onClick={() => insertSnippet(DECISION_SNIPPET)}
            style={insertBtnStyle(hasDecision)}>
            {hasDecision ? "✓ Decision block added" : "+ Decision block"}
          </button>
          <button type="button" disabled={hasFeedback}
            onClick={() => insertSnippet(FEEDBACK_SNIPPET)}
            style={insertBtnStyle(hasFeedback)}>
            {hasFeedback ? "✓ Feedback block added" : "+ Feedback block"}
          </button>
        </div>
      </div>

      {/* Template variable chips */}
      <div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>
          Available variables — click to copy:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEMPLATE_VARS.map(({ var: v, label }) => (
            <button key={v} type="button"
              onClick={() => { navigator.clipboard.writeText(v); toast.info(`Copied ${v}`, { autoClose: 1200 }); }}
              title={label} style={varChipStyle}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body editor */}
      <label style={labelStyle}>
        Email Body (HTML) *
        <div style={{ marginTop: 6 }}>
          <RichEditor
            value={form.template ?? ""}
            onChange={val => set("template", val)}
            placeholder="Write the email body…"
            minHeight={200}
            maxHeight={400}
          />
        </div>
       Edit this keenly, use preview to see the details.
      </label>


      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        {/* Preview button */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <button type="button" style={outlineBtnStyle}>Preview</button>
          </DialogTrigger>
          <DialogContent style={previewDialogStyle}>
            <DialogHeader>
              <DialogTitle style={dialogTitleStyle}>Email Preview</DialogTitle>
              <DialogDescription style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Fill in sample values to see how the email will look.
              </DialogDescription>
            </DialogHeader>

            {/* Preview data fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0 10px" }}>
              {(["submitter_name", "decision_type", "decision_date"] as const).map(field => (
                <label key={field} style={{ ...labelStyle, fontSize: 11 }}>
                  {field.replace(/_/g, " ")}
                  <input value={previewData[field]}
                    onChange={e => setPreviewData(p => ({ ...p, [field]: e.target.value }))}
                    style={{ ...inputStyle, fontSize: 12 }} />
                </label>
              ))}
              <label style={{ ...labelStyle, fontSize: 11, gridColumn: "1 / -1" }}>
                feedback
                <textarea value={previewData.feedback}
                  onChange={e => setPreviewData(p => ({ ...p, feedback: e.target.value }))}
                  rows={2} style={{ ...inputStyle, fontSize: 12, resize: "vertical", fontFamily: "inherit" }} />
              </label>
            </div>

            {/* Rendered email */}
            <div style={{ overflowY: "auto", maxHeight: "50vh", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <div style={{ background: "#27aae1", color: "#fff", padding: "14px 20px", textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{form.name || "Category Name"}</h2>
              </div>
              <div style={{ background: "#fff", padding: "20px 24px", borderLeft: "1px solid #27aae1", borderRight: "1px solid #27aae1" }}>
                <style>{`
                  .detail-block{background:#f4f9fd;border-left:4px solid #27aae1;padding:10px 14px;margin:12px 0;border-radius:0 4px 4px 0}
                  .detail-block p{margin:3px 0;font-size:13px}
                  .detail-block strong{color:#27aae1}
                  .feedback-block{background:#fffbe6;border-left:4px solid #f0a500;padding:10px 14px;margin:12px 0;border-radius:0 4px 4px 0}
                  .feedback-block p{margin:3px 0;font-size:13px}
                `}</style>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, lineHeight: 1.6, color: "#000" }}
                  dangerouslySetInnerHTML={{ __html: renderedPreview }} />
              </div>
              <div style={{ background: "#111827", color: "#fff", padding: "12px 20px", textAlign: "center", fontSize: 11 }}>
                <p style={{ margin: "3px 0 0" }}>© {new Date().getFullYear()} {previewData.bptap}</p>
              </div>
            </div>

            <DialogFooter style={{ marginTop: 14 }}>
              <DialogClose asChild>
                <button style={outlineBtnStyle}>Close</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save */}
        <button type="button" onClick={() => onSave(form)} disabled={!canSave}
          style={saveBtnStyle(!canSave)}>
          {isSaving ? "Saving…" : "Save Category"}
        </button>
      </div>
    </div>
  );
}


function DeleteDialog({ category, onConfirm, isDeleting }: {
  category: FeedbackCategory;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <DialogContent style={{ ...dialogContentStyle, maxWidth: 420 }}>
      <DialogHeader>
        <DialogTitle style={dialogTitleStyle}>Delete Category</DialogTitle>
        <DialogDescription style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
          Are you sure you want to delete <strong>"{category.name}"</strong>? This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <DialogClose asChild>
          <button style={cancelBtnStyle}>Cancel</button>
        </DialogClose>
        <button onClick={onConfirm} disabled={isDeleting} style={confirmDeleteBtnStyle}>
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function FeedbackTemplatePage() {
  const [categories, setCategories]     = useState<FeedbackCategory[]>([]);
  const [loading, setLoading]           = useState(true);
  const [createOpen, setCreateOpen]     = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [editTarget, setEditTarget]     = useState<FeedbackCategory | null>(null);
  const [editOpen, setEditOpen]         = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackCategory | null>(null);
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllFeedbackCategories();
      if (res.success) setCategories(res.data);
      else toast.error(res.message || "Failed to load categories");
    } catch { toast.error("Failed to load feedback categories"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form: FeedbackCategoryCreatePayload) => {
    setIsSaving(true);
    try {
      const res = await createFeedbackCategory(form);
      if (res.success) { toast.success("Category created"); setCreateOpen(false); await load(); }
      else toast.error(typeof res.message === "string" ? res.message : "Validation error");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Failed to create";
      toast.error(msg);
    } finally { setIsSaving(false); }
  };

  const handleEdit = async (form: FeedbackCategoryCreatePayload) => {
    if (!editTarget) return;
    setIsEditing(true);
    try {
      const res = await updateFeedbackCategory(editTarget.id, form);
      if (res.success) { toast.success("Category updated"); setEditOpen(false); setEditTarget(null); await load(); }
      else toast.error(typeof res.message === "string" ? res.message : "Validation error");
    } catch { toast.error("Failed to update category"); }
    finally { setIsEditing(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteFeedbackCategory(deleteTarget.id);
      if (res.success) { toast.success("Category deleted"); setDeleteOpen(false); setDeleteTarget(null); await load(); }
      else toast.error(res.message || "Failed to delete");
    } catch { toast.error("Failed to delete"); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="mx-auto container py-8 px-4" >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div>
          <h1 style={h1Style}>Feedback Email Templates</h1>
          <p style={subtitleStyle}>
            Manage email templates sent to proposal submitters. Each category has its own editable subject and body.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button style={primaryBtnStyle}>+ New Category</button>
          </DialogTrigger>
          <DialogContent style={dialogContentStyle}>
            <DialogHeader>
              <DialogTitle style={dialogTitleStyle}>New Feedback Category</DialogTitle>
              <DialogDescription style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                Build a template for this category. Insert optional decision and feedback blocks as needed.
              </DialogDescription>
            </DialogHeader>
            <div style={{ marginTop: 16, maxHeight: "72vh", overflowY: "auto", paddingRight: 2 }}>
              <CategoryForm initial={EMPTY_FORM} onSave={handleCreate} isSaving={isSaving} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={emptyStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: "#9ca3af", marginTop: 12 }}>Loading templates…</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
          <p style={{ color: "#6b7280", fontSize: 15 }}>No feedback categories yet.</p>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Create one to start sending templated emails.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {categories.map(c => (
            <CategoryCard key={c.id} category={c}
              onEdit={cat => { setEditTarget(cat); setEditOpen(true); }}
              onDelete={cat => { setDeleteTarget(cat); setDeleteOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* ── Edit dialog ── */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent style={dialogContentStyle}>
          <DialogHeader>
            <DialogTitle style={dialogTitleStyle}>Edit — {editTarget?.name}</DialogTitle>
            <DialogDescription style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
              Changes take effect on the next email sent using this category.
            </DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: 16, maxHeight: "72vh", overflowY: "auto", paddingRight: 2 }}>
            {editTarget && (
              <CategoryForm
                initial={{ name: editTarget.name, description: editTarget.description, subject: editTarget.subject, template: editTarget.template, is_active: editTarget.is_active }}
                onSave={handleEdit}
                isSaving={isEditing}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={o => { setDeleteOpen(o); if (!o) setDeleteTarget(null); }}>
        {deleteTarget && (
          <DeleteDialog category={deleteTarget} onConfirm={handleDelete} isDeleting={isDeleting} />
        )}
      </Dialog>
    </div>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}


const headerStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  marginBottom: 36, gap: 20, flexWrap: "wrap",
};
const h1Style: React.CSSProperties = {
  fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.3px",
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 14, color: "#6b7280", margin: 0, maxWidth: 600, lineHeight: 1.6,
};
const gridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20,
};
const cardStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
  padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const nameStyle: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "#111827" };
const activeBadge: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "2px 8px",
};
const inactiveBadge: React.CSSProperties = {
  ...activeBadge, background: "#f3f4f6", color: "#6b7280",
};
const previewStyle: React.CSSProperties = {
  background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 6,
  padding: "8px 10px", marginTop: 12, wordBreak: "break-word",
};
const editBtnStyle: React.CSSProperties = {
  padding: "6px 14px", fontSize: 13, fontWeight: 500,
  border: "1px solid #27aae1", borderRadius: 6, background: "#fff", color: "#27aae1", cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "6px 14px", fontSize: 13, fontWeight: 500,
  border: "1px solid #fca5a5", borderRadius: 6, background: "#fff", color: "#ef4444", cursor: "pointer",
};
const primaryBtnStyle: React.CSSProperties = {
  padding: "9px 18px", fontSize: 14, fontWeight: 600,
  background: "#27aae1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
};
const dialogContentStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
  maxWidth: 900, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};
const previewDialogStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 14, padding: "36px 40px",
  maxWidth: 900, width: "100%", boxShadow: "20px 20px 60px rgba(0,0,0,0.15)",
};
const dialogTitleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 };
const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "#374151",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6,
  fontSize: 13, color: "#111827", outline: "none", background: "#fff",
  width: "100%", boxSizing: "border-box" as const,
};
const varChipStyle: React.CSSProperties = {
  padding: "3px 10px", fontSize: 11, fontFamily: "monospace",
  background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, color: "#0369a1", cursor: "pointer",
};
const insertBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: active ? "default" : "pointer",
  border: `1px solid ${active ? "#86efac" : "#27aae1"}`,
  background: active ? "#f0fdf4" : "#fff",
  color: active ? "#16a34a" : "#27aae1",
});
const outlineBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "1px solid #d1d5db",
  borderRadius: 6, background: "#fff", color: "#374151", cursor: "pointer",
};
const saveBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "9px 20px", fontSize: 14, fontWeight: 600,
  background: disabled ? "#e5e7eb" : "#27aae1",
  color: disabled ? "#9ca3af" : "#fff",
  border: "none", borderRadius: 8,
  cursor: disabled ? "not-allowed" : "pointer",
});
const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, border: "1px solid #d1d5db",
  borderRadius: 6, background: "#fff", color: "#374151", cursor: "pointer",
};
const confirmDeleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px", fontSize: 13, fontWeight: 600,
  background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer",
};
const emptyStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", padding: "80px 20px", textAlign: "center",
};
const spinnerStyle: React.CSSProperties = {
  width: 32, height: 32, border: "3px solid #e5e7eb",
  borderTop: "3px solid #27aae1", borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};