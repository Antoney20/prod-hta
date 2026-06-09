import { validateEmail } from "@/lib/email";
import type { FormData } from "@/types/form";

/** Allowed HTML tags in rich-text fields. */
const ALLOWED_TAGS = new Set([
  "p", "b", "strong", "i", "em", "u", "br", "a",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "span",
]);

function isAllowedTag(rawInner: string): boolean {
  const name = rawInner.trim().replace(/^\//, "").split(/[\s/]/)[0].toLowerCase();
  return ALLOWED_TAGS.has(name);
}

/** Blocks scripts, dangerous schemes, event handlers, and path-escape sequences. */
const INJECTION_RE = /<script|<\/script|<iframe|<!doctype|<\?xml|javascript:|vbscript:|data:|on\w+\s*=/i;
const TRAVERSAL_RE = /(?:\.\.[/\\]){1,}|%2e%2e|\.\.%2f|\0/i;

function hasInjection(value: string): boolean {
  return INJECTION_RE.test(value) || TRAVERSAL_RE.test(value);
}

/** Sanitizes free text: strips control chars, dangerous schemes/handlers,
 *  disallowed tags (keeping inner text), and path-escape sequences. */
export function sanitizeText(value: string): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/(?:javascript|vbscript|data):/gi, "")
    .replace(/(?:\.\.[/\\])+/g, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/<([^>]+)>/g, (full, inner) => (isAllowedTag(inner) ? full : ""))
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

  if (!data.phone.trim()) errors.phone = "Phone number is required.";
  else if (!PHONE_RE.test(data.phone.trim())) errors.phone = "Enter a valid phone number (e.g. +254 712 345 678).";

  const email = data.email.trim();
  if (!email) errors.email = "Email address is required.";
  else errors.email = validateEmail(email) || (email.length > 50 ? "Email address is too long." : undefined);

  errors.profession = checkText(data.profession, "Profession", { max: 50 });
  errors.organization = checkText(data.organization, "Organization", { max: 100 });
  if (!data.county.trim()) errors.county = "County is required.";
  errors.interventionName = checkText(data.interventionName, "Intervention name", { max: 300 });
  if (!data.interventionType.trim()) errors.interventionType = "Please select an intervention type.";
  errors.beneficiary = checkText(data.beneficiary, "Beneficiary", { max: 2000 });
  errors.justification = checkText(data.justification, "Justification", { min: 10, max: 10000 });
  errors.expectedImpact = checkText(data.expectedImpact, "Expected impact", { min: 10, max: 1000 });
  errors.additionalInfo = checkText(data.additionalInfo, "Additional information", { max: 10000, required: false });
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