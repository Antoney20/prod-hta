import { validateEmail } from "@/lib/email";
import type { FormData } from "@/types/form";

/* ================================================================== */
/* Rich-text fields                                                   */
/* ================================================================== */
export const RICH_FIELDS: (keyof FormData)[] = [
  "beneficiary", "justification", "expectedImpact", "additionalInfo",
];

/* ================================================================== */
/* DOM HTML sanitizer (canonical) — shared with the RichEditor.       */
/*                                                                    */
/* Allowlist model:                                                   */
/*  - HTML_ALLOWED_TAGS survive with zero attributes (href re-added   */
/*    on <a> after validation).                                       */
/*  - HARD_STRIP are removed entirely (tag + children), silently —    */
/*    hazards that would execute the instant they enter the DOM.      */
/*  - BLOCK_TAGS are kept but made inert (handlers/foreign attrs      */
/*    stripped) so the author can see + delete them; while any are    */
/*    present the field is invalid and the form can't continue.       */
/*  - Comment nodes are stripped FIRST (Word/Outlook smuggle <xml>,   */
/*    <style>, <w:*> markup inside conditional comments, which        */
/*    querySelectorAll("*") never sees).                              */
/*  - Foreign XML namespaces (o:p, w:*, m:*, v:*) are removed.        */
/*  - Anything else is unwrapped: the tag goes, its text stays.       */
/*  - RETAG maps near-miss block tags onto the editor's vocabulary.   */
/*                                                                    */
/* DOM-based, so it only runs in the browser; guarded for SSR.        */
/* ================================================================== */

const HTML_ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li",
  "a", "b", "strong", "i", "em", "u", "code", "br", "tr","td"
]);

const HARD_STRIP = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "noscript",
  "svg", "math", "form", "input", "button", "select", "textarea", "template",
  "base", "frame", "frameset", "source", "xml",
]);

const BLOCK_TAGS = new Set(["img", "picture", "video", "audio", "track"]);

/* The only attributes a blocked tag keeps so it still renders enough to be
   found + deleted. src is intentionally dropped from img/video/audio so a
   pasted tracker can't phone home while it waits to be removed. */
const BLOCK_KEEP: Record<string, Set<string>> = {
  img: new Set(["alt"]),
  video: new Set(["controls"]),
  audio: new Set(["controls"]),
};

const BLOCK_LABELS: Record<string, string> = {
  img: "images", picture: "images",
  video: "videos", audio: "audio clips", track: "captions",
};

const RETAG: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4" };

/* Validates an href: strips control chars / embedded whitespace first so
   obfuscations like "java\nscript:alert(1)" can't slip past. Only absolute
   http(s) and mailto pass; no relative URLs, no "../". */
function safeHref(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.replace(/[\u0000-\u001f\u007f\s]/g, "");
  if (!/^(https?:|mailto:)/i.test(v)) return null;
  if (/(^|\/)\.\.(\/|$)/.test(v) || v.includes("..\\")) return null;
  return v;
}

/* Strips markup that arrives as TEXT, not as elements — tag/comment sequences
   someone pasted as plain text, which the editor HTML-escaped. Reads the
   element's joined direct-text (decoded), so it matches the raw "<…>" form.
   Requires a letter after "<", so "5 < 10" / "<3" are left alone. */
function stripMarkupText(s: string): string {
  return s
    .replace(/<!--[\s\S]*?-->/g, "")                // comment syntax as text
    .replace(/<\/?[a-z][\w:-]*(?:\s[^>]*)?>/gi, ""); // any tag-like token as text
}

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || typeof html !== "string") return "";
  const tpl = document.createElement("template");
  tpl.innerHTML = html;

  // 1) Strip every comment node FIRST. Word/Outlook paste smuggles <xml>,
  //    <style>, and <w:*>/<m:*> Office markup inside conditional comments
  //    (<!--[if gte mso 9]>…<![endif]-->). querySelectorAll("*") walks
  //    ELEMENTS only, so without this the whole blob survives into the payload.
  //    Collect-then-remove: mutating mid-walk is undefined behaviour.
  const cw = document.createTreeWalker(tpl.content, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (cw.nextNode()) comments.push(cw.currentNode as Comment);
  for (const c of comments) c.remove();

  // 2) Element pass.
  for (const el of [...tpl.content.querySelectorAll("*")]) {
    if (!tpl.content.contains(el)) continue; // detached by an earlier removal
    let tag = el.tagName.toLowerCase();

    // foreign XML namespace (o:p, w:WordDocument, m:mathPr, v:shape …) or hazard
    if (tag.includes(":") || HARD_STRIP.has(tag)) {
      el.remove();
      continue;
    }

    if (BLOCK_TAGS.has(tag)) {
      // kept + inert: strip everything not explicitly allowlisted (incl. all on*)
      const keep = BLOCK_KEEP[tag];
      for (const a of [...el.attributes]) {
        if (!keep?.has(a.name.toLowerCase())) el.removeAttribute(a.name);
      }
      continue; // left in place; flagged via findBlocked()
    }

    if (RETAG[tag]) {
      const next = document.createElement(RETAG[tag]);
      next.append(...el.childNodes);
      el.replaceWith(next);
      tag = RETAG[tag]; // children already snapshotted; new el has no attrs
      continue;
    }

    if (!HTML_ALLOWED_TAGS.has(tag)) {
      el.replaceWith(...el.childNodes); // unwrap: keep content, drop the tag
      continue;
    }

    // strip every attribute, then re-add only what we explicitly allow
    const href = tag === "a" ? safeHref(el.getAttribute("href")) : null;
    for (const a of [...el.attributes]) el.removeAttribute(a.name);

    if (tag === "a") {
      if (!href) {
        el.replaceWith(...el.childNodes); // bad/missing href -> plain text
        continue;
      }
      el.setAttribute("href", href);
      el.setAttribute("rel", "noopener noreferrer nofollow");
      el.setAttribute("target", "_blank");
    }
  }

  // 3) Loose-text pass. Real elements are handled above; this catches markup
  //    pasted as PLAIN TEXT and HTML-escaped, so it never became an element
  //    ("&lt;!-- … --&gt;&lt;picture&gt;&lt;img …&gt;"). Such markup may be split
  //    across several adjacent text nodes, so we clean each element's run of
  //    DIRECT text children as one joined string and write it back. Child
  //    elements (real <p>, <a>, …) are untouched — only loose text is cleaned.
  const hosts: (DocumentFragment | Element)[] = [
    tpl.content,
    ...[...tpl.content.querySelectorAll("*")],
  ];
  for (const host of hosts) {
    const kids = [...host.childNodes];
    const directText = kids
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent ?? "")
      .join("");
    if (!directText) continue;
    const cleaned = stripMarkupText(directText);
    if (cleaned === directText) continue;
    // wipe the existing direct text nodes, then re-insert the cleaned text
    // ahead of the first element child (order is preserved well enough for
    // loose prose; structured children keep their own positions).
    let first: ChildNode | null = null;
    for (const n of kids) {
      if (n.nodeType === 3) {
        if (!first) first = n;
        else n.remove();
      }
    }
    if (first) first.textContent = cleaned;
    else if (cleaned) host.insertBefore(document.createTextNode(cleaned), host.firstChild);
  }

  return tpl.innerHTML;
}

/* Scans HTML for disallowed media tags. Drives the editor's persistent error
   and the form's hard submit gate. */
export function findBlocked(html: string): Set<string> {
  const found = new Set<string>();
  if (typeof window === "undefined" || !html) return found;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  for (const el of tpl.content.querySelectorAll("*")) {
    const t = el.tagName.toLowerCase();
    if (BLOCK_TAGS.has(t)) found.add(t);
  }
  return found;
}

export function describeBlocked(tags: Set<string>): string {
  const labels = [...new Set([...tags].map((t) => BLOCK_LABELS[t] ?? t))];
  const list =
    labels.length === 1 ? labels[0]
    : labels.length === 2 ? `${labels[0]} and ${labels[1]}`
    : `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
  return `Remove the embedded ${list} to continue — they aren’t allowed here.`;
}

/* True when HTML carries no visible text (empty markup like "<p><br></p>"). */
export function isBlankHtml(html: string): boolean {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim();
  return text.length === 0;
}

/* Plain-text projection of rich HTML, for length/emptiness validation only.
   Strips comments + tags and decodes the common entities so length checks
   measure real content, not markup. */
export function htmlToText(html: string): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/<!--[\s\S]*?-->/g, "")                 // markup that was escaped (pasted as plain text):
    .replace(/<\/?[a-z][\w:-]*(?:\s[^>]*)?>/gi, " ")  // strip it after decoding so length checks see real text
    .replace(/\s+/g, " ")
    .trim();
}

/* ================================================================== */
/* Regex text sanitizer — for PLAIN fields (name, county, signature…) */
/* Not HTML-aware by design; the DOM sanitizer above owns rich fields.*/
/* ================================================================== */
const ALLOWED_TAGS = new Set([
  "p", "b", "strong", "i", "em", "u", "br", "a",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "span",
]);

function isAllowedTag(rawInner: string): boolean {
  const name = rawInner.trim().replace(/^\//, "").split(/[\s/]/)[0].toLowerCase();
  return ALLOWED_TAGS.has(name);
}

const INJECTION_RE = /<script|<\/script|<iframe|<!doctype|<\?xml|<xml|javascript:|vbscript:|data:|on\w+\s*=/i;
const TRAVERSAL_RE = /(?:\.\.[/\\]){1,}|%2e%2e|\.\.%2f|\0/i;

function hasInjection(value: string): boolean {
  return INJECTION_RE.test(value) || TRAVERSAL_RE.test(value);
}

/** Sanitizes free text: strips control chars, dangerous schemes/handlers,
 *  comments, style/xml blocks, disallowed tags (keeping inner text), and
 *  path-escape sequences. */
export function sanitizeText(value: string): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")                                   // HTML comments incl. Word conditional blocks
    .replace(/<(style|xml|script|title|head)\b[\s\S]*?<\/\1\s*>/gi, "") // tag + inner content (kills CSS/XML dumps)
    .replace(/(?:javascript|vbscript|data):/gi, "")
    .replace(/(?:\.\.[/\\])+/g, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/<([^>]+)>/g, (full, inner) => (isAllowedTag(inner) ? full : "")) // remaining disallowed tags (w:/o:/m: fall here)
    .replace(/(\r?\n){3,}/g, "\n\n")
    .trim();
}

export function sanitizePhone(value: string): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d\s+\-()]/g, "").trim();
}

export function sanitizeEmail(value: string): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w.@+\-]/g, "").trim();
}

/* Per-field sanitization: rich fields go through the DOM allowlist sanitizer,
   plain fields through the regex text sanitizer, files pass through. */
export function sanitizeFormData(data: FormData): FormData {
  return {
    name: sanitizeText(data.name),
    phone: sanitizePhone(data.phone),
    email: sanitizeEmail(data.email),
    profession: sanitizeText(data.profession),
    organization: sanitizeText(data.organization),
    county: sanitizeText(data.county),
    interventionName: sanitizeText(data.interventionName),
    interventionType: sanitizeText(data.interventionType),
    beneficiary: sanitizeHtml(data.beneficiary),
    justification: sanitizeHtml(data.justification),
    expectedImpact: sanitizeHtml(data.expectedImpact),
    additionalInfo: sanitizeHtml(data.additionalInfo),
    signature: sanitizeText(data.signature),
    date: sanitizeText(data.date),
    uploaded_documents: data.uploaded_documents,
  };
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Required text field: presence + length range + injection check. */
function checkText(
  value: string,
  label: string,
  { min = 0, max, required = true } = {} as { min?: number; max: number; required?: boolean }
): string | undefined {
  const v = value.trim();
  if (!v) return required ? `${label} is required.` : undefined;
  if (min && v.length < min) return `Please provide a more detailed ${label.toLowerCase()}.`;
  if (v.length > max) return `${label} is too long.`;
  if (hasInjection(value)) return `${label} contains invalid characters.`;
  return undefined;
}

export function validateFormData(data: FormData): FormErrors {
  const errors: FormErrors = {};

  errors.name = checkText(data.name, "Name", { min: 2, max: 100 });

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else {
    const cleanedPhone = data.phone.trim().replace(/\s+/g, "");
    if (!PHONE_RE.test(cleanedPhone)) {
      errors.phone = "Enter a valid phone number (e.g. +254 712 345 678).";
    }
  }

  const email = data.email.trim();
  if (!email) errors.email = "Email address is required.";
  else errors.email = validateEmail(email) || (email.length > 50 ? "Email address is too long." : undefined);

  errors.profession = checkText(data.profession, "Profession", { max: 50 });
  errors.organization = checkText(data.organization, "Organization", { max: 100 });
  if (!data.county.trim()) errors.county = "County is required.";
  errors.interventionName = checkText(data.interventionName, "Intervention name", { max: 600 });
  if (!data.interventionType.trim()) errors.interventionType = "Please select an intervention type.";
  errors.beneficiary = checkText(data.beneficiary, "Beneficiary", { max: 6000 });
  errors.justification = checkText(data.justification, "Justification", { min: 10, max: 10000 });
  errors.expectedImpact = checkText(data.expectedImpact, "Expected impact", { min: 10, max: 12000 });
  errors.additionalInfo = checkText(data.additionalInfo, "Additional information", { max: 12000, required: false });
  errors.signature = checkText(data.signature, "Signature", { max: 100 });

  if (data.uploaded_documents.length > MAX_FILES) {
    errors.uploaded_documents = `You can attach at most ${MAX_FILES} files.`;
  } else {
    for (const file of data.uploaded_documents) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.uploaded_documents = `${file.name}: only PDF, XLSX, and DOCX files are accepted.`;
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.uploaded_documents = `${file.name}: file size must be under 10 MB.`;
        break;
      }
    }
  }

  // drop undefined entries so callers can rely on Object.keys length
  (Object.keys(errors) as (keyof FormErrors)[]).forEach((k) => {
    if (errors[k] === undefined) delete errors[k];
  });

  return errors;
}

export function validateField(field: keyof FormData, data: FormData): string | undefined {
  return validateFormData(data)[field];
}