import type { FormData } from "@/types/form";

// ─── Sanitization ────────────────────────────────────────────────────────────

/**
 * Strips characters that are unsafe in most text contexts while
 * allowing plain text, newlines, and HTML paragraph tags (<p>, </p>).
 *
 * Blocked: all other HTML/XML tags, JS injection patterns, null bytes,
 * non-printable control characters (except \n \r \t).
 */
export function sanitizeText(value: string): string {
  if (typeof value !== "string") return "";

  return (
    value
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control chars except newline (\n), carriage return (\r), tab (\t)
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Strip ALL HTML/XML tags EXCEPT <p> and </p>
      .replace(/<(?!\/?p\s*\/?>)[^>]*>/gi, "")
      // Remove javascript: / vbscript: / data: URI schemes (case-insensitive)
      .replace(/(?:javascript|vbscript|data):/gi, "")
      // Remove on* event handler attributes (e.g. onclick=)
      .replace(/\bon\w+\s*=/gi, "")
      // Collapse runs of more than 3 consecutive newlines to 2
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

  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  } else if (data.email.length > 50) {
    errors.email = "Email address is too long.";
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
    errors.interventionName = "Intervention name too long";
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
    errors.justification = "Justification too  long.";
  } else if (hasInjection(data.justification)) {
    errors.justification = "Justification contains invalid characters.";
  }

  if (!data.expectedImpact.trim()) {
    errors.expectedImpact = "Expected impact is required.";
  } else if (data.expectedImpact.trim().length < 10) {
    errors.expectedImpact = "Please describe the expected impact too short.";
  } else if (data.expectedImpact.trim().length > 3000) {
    errors.expectedImpact = "Expected impact too long.";
  } else if (hasInjection(data.expectedImpact)) {
    errors.expectedImpact = "Expected impact field contains invalid characters.";
  }

  // ── Optional: additional info ─────────────────────────────────────────────

  if (data.additionalInfo && data.additionalInfo.trim().length > 2000) {
    errors.additionalInfo = "Additional information too long.";
  } else if (data.additionalInfo && hasInjection(data.additionalInfo)) {
    errors.additionalInfo = "Additional information contains invalid characters.";
  }

  // ── File upload  only pdf accepterd──────────────────────

  if (data.uploadedDocument) {
    if (data.uploadedDocument.type !== "application/pdf") {
      errors.uploadedDocument = "Only PDF files are accepted.";
    } else if (data.uploadedDocument.size > 10 * 1024 * 1024) {
      errors.uploadedDocument = "File size must be under 10 MB.";
    }
  }

  // ── Signature ─────────────────────────────────────────────────────────────

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