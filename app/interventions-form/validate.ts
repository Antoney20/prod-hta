import { validateEmail } from "@/lib/email";
import type { FormData } from "@/types/form";

// ─── Sanitization ────────────────────────────────────────────────────────────

/**
 * Allowed HTML tags in text fields.
 * Extend this list if you need more (e.g. "table", "td", "tr").
 */
const ALLOWED_TAGS = new Set([
  "p", "b", "strong", "i", "em", "u", "br", "a",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "span",
]);

/**
 * Returns true if the tag name is in the allow-list.
 * Handles closing tags (</p>), self-closing tags (<br/>), and tags with
 * attributes (<a href="...">).
 */
function isAllowedTag(rawInner: string): boolean {
  // rawInner is everything between < and >, e.g. 'p', '/p', 'a href="..."', 'br/'
  const name = rawInner.trim().replace(/^\//, "").split(/[\s/]/)[0].toLowerCase();
  return ALLOWED_TAGS.has(name);
}

/**
 * Sanitizes free-text fields while preserving:
 *   - All whitespace: spaces, tabs, newlines
 *   - Allowed HTML/formatting tags: <p>, <b>, <strong>, <i>, <em>, <u>,
 *     <br>, <a>, headings, lists, <blockquote>, <span>
 *
 * Stripped / blocked:
 *   - Unknown or dangerous HTML/XML tags (tag removed, inner text kept)
 *   - javascript: / vbscript: / data: URI schemes
 *   - on* event handler attributes (onclick=, onload=, etc.)
 *   - Null bytes and non-printable control characters (keeps \t \n \r)
 *   - Runs of 3+ consecutive newlines collapsed to 2
 */
export function sanitizeText(value: string): string {
  if (typeof value !== "string") return "";

  return (
    value
      // 1. Remove null bytes
      .replace(/\0/g, "")
      // 2. Remove non-printable control chars; keep \t (0x09), \n (0x0A), \r (0x0D)
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // 3. Neutralise dangerous URI schemes inside attribute values
      .replace(/(?:javascript|vbscript|data):/gi, "")
      // 4. Strip on* event handler attributes wherever they appear in a tag
      .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
      // 5. Drop tags that are NOT in the allow-list (keep their inner text)
      .replace(/<([^>]+)>/g, (fullMatch, inner) =>
        isAllowedTag(inner) ? fullMatch : ""
      )
      // 6. Collapse 3+ consecutive newlines down to 2
      .replace(/(\r?\n){3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Sanitizes a phone number: keeps only digits, +, -, spaces, and parentheses.
 */
export function sanitizePhone(value: string): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d\s+\-()]/g, "").trim();
}

/**
 * Sanitizes an email address: strips whitespace and obvious injection chars.
 */
export function sanitizeEmail(value: string): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w.@+\-]/g, "").trim();
}

/**
 * Sanitize every field of FormData and return a clean copy.
 */
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
    beneficiary: sanitizeText(data.beneficiary),
    justification: sanitizeText(data.justification),
    expectedImpact: sanitizeText(data.expectedImpact),
    additionalInfo: sanitizeText(data.additionalInfo),
    signature: sanitizeText(data.signature),
    date: sanitizeText(data.date),
    uploadedDocument: data.uploadedDocument,
  };
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INJECTION_RE = /<script|javascript:|on\w+=/i;

function hasInjection(value: string): boolean {
  return INJECTION_RE.test(value);
}

/**
 * Validates sanitized FormData.
 * Returns an errors map; empty map means the form is valid.
 */
export function validateFormData(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Full name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (data.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  } else if (hasInjection(data.name)) {
    errors.name = "Name contains invalid characters.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_RE.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number (e.g. +254 712 345 678).";
  }

  const email = data.email.trim();

  if (!email) {
    errors.email = "Email address is required.";
  } else {
    const emailError = validateEmail(email);

    if (emailError) {
      errors.email = emailError;
    } else if (email.length > 50) {
      errors.email = "Email address is too long.";
    }
  }

  if (!data.profession.trim()) {
    errors.profession = "Profession is required.";
  } else if (data.profession.trim().length > 50) {
    errors.profession = "Profession is too long.";
  } else if (hasInjection(data.profession)) {
    errors.profession = "Profession contains invalid characters.";
  }

  if (!data.organization.trim()) {
    errors.organization = "Organization is required.";
  } else if (data.organization.trim().length > 100) {
    errors.organization = "Organization name too long.";
  } else if (hasInjection(data.organization)) {
    errors.organization = "Organization contains invalid characters.";
  }

  if (!data.county.trim()) {
    errors.county = "County is required.";
  }

  if (!data.interventionName.trim()) {
    errors.interventionName = "Intervention name is required.";
  } else if (data.interventionName.trim().length > 300) {
    errors.interventionName = "Intervention name too long.";
  } else if (hasInjection(data.interventionName)) {
    errors.interventionName = "Intervention name contains invalid characters.";
  }

  if (!data.interventionType.trim()) {
    errors.interventionType = "Please select an intervention type.";
  }

  if (!data.beneficiary.trim()) {
    errors.beneficiary = "Beneficiary information is required.";
  } else if (data.beneficiary.trim().length > 600) {
    errors.beneficiary = "Beneficiary description too long.";
  } else if (hasInjection(data.beneficiary)) {
    errors.beneficiary = "Beneficiary field contains invalid characters.";
  }

  if (!data.justification.trim()) {
    errors.justification = "Justification is required.";
  } else if (data.justification.trim().length < 10) {
    errors.justification = "Please provide a more detailed justification.";
  } else if (data.justification.trim().length > 3000) {
    errors.justification = "Justification too long.";
  } else if (hasInjection(data.justification)) {
    errors.justification = "Justification contains invalid characters.";
  }

  if (!data.expectedImpact.trim()) {
    errors.expectedImpact = "Expected impact is required.";
  } else if (data.expectedImpact.trim().length < 10) {
    errors.expectedImpact = "Please describe the expected impact in more detail.";
  } else if (data.expectedImpact.trim().length > 3000) {
    errors.expectedImpact = "Expected impact too long.";
  } else if (hasInjection(data.expectedImpact)) {
    errors.expectedImpact = "Expected impact field contains invalid characters.";
  }

  if (data.additionalInfo && data.additionalInfo.trim().length > 2000) {
    errors.additionalInfo = "Additional information too long.";
  } else if (data.additionalInfo && hasInjection(data.additionalInfo)) {
    errors.additionalInfo = "Additional information contains invalid characters.";
  }

  if (data.uploadedDocument) {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    if (!allowed.includes(data.uploadedDocument.type)) {
      errors.uploadedDocument = "Only PDF, XLSX, and DOCX files are accepted.";
    } else if (data.uploadedDocument.size > 10 * 1024 * 1024) {
      errors.uploadedDocument = "File size must be under 10 MB.";
    }
  }

  if (!data.signature.trim()) {
    errors.signature = "Signature is required.";
  } else if (data.signature.trim().length > 100) {
    errors.signature = "Signature must be 100 characters or fewer.";
  } else if (hasInjection(data.signature)) {
    errors.signature = "Signature contains invalid characters.";
  }

  return errors;
}

/**
 * Convenience helper used in onChange handlers to re-validate a single field
 * without running the full form check.
 *
 * Returns the error string for that field, or undefined if it's clean.
 */
export function validateField(
  field: keyof FormData,
  data: FormData
): string | undefined {
  const allErrors = validateFormData(data);
  return allErrors[field];
}