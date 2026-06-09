'use client'

import React, { useState, ChangeEvent, useEffect } from 'react';
import type { FormErrors, FormData, EmailResponse } from '../services/types';
import { ApiResponse, submitProposal } from '../api/interventions';
import { sanitizeEmail, sanitizeFormData, sanitizePhone, sanitizeText, validateField, validateFormData } from './validate';
import RichEditor from '@/components/shared/editor';


const RICH_FIELDS: (keyof FormData)[] = ['beneficiary','justification',  'expectedImpact', 'additionalInfo'];

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXT = ['.pdf', '.xlsx', '.docx'];
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const isAccepted = (file: File): boolean => {
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  return ACCEPTED_EXT.includes(ext) || ACCEPTED_MIME.includes(file.type);
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent || '').replace(/\u00a0/g, ' ').trim();
};

const isBlankHtml = (html: string): boolean => stripHtml(html).length === 0;


const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  ) : null;


const BenefitsForm: React.FC = () => {
  const counties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
    'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
    "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ].sort((a, b) => a.localeCompare(b));

  const blank = (): FormData => ({
    name: '',
    phone: '',
    email: '',
    profession: '',
    organization: '',
    county: '',
    interventionName: '',
    interventionType: '',
    beneficiary: '',
    justification: '',
    expectedImpact: '',
    additionalInfo: '',
    uploaded_documents: [],
    signature: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [formData, setFormData] = useState<FormData>(blank);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<EmailResponse | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleRichChange = (name: keyof FormData) => (val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    setFormTouched(true);
    // clear a "required" error as soon as the editor has real content
    setErrors((prev) => {
      if (!prev[name]) return prev;
      if (!isBlankHtml(val)) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setFormData(blank());
        setErrors({});
        setSubmitted(false);
        setFormTouched(false);
        setApiResponse(null);
        setEmailStatus(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    let clean = value;
    if (name === 'phone') clean = sanitizePhone(value);

    const updated = { ...formData, [name]: clean } as FormData;
    setFormData(updated);
    setFormTouched(true);

    if (errors[name as keyof FormData]) {
      const fieldErr = validateField(name as keyof FormData, updated);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErr) next[name as keyof FormData] = fieldErr;
        else delete next[name as keyof FormData];
        return next;
      });
    }
  };


  const addFiles = (incoming: FileList | File[]): void => {
      const list = Array.from(incoming);
      const next = [...formData.uploaded_documents];
      let err: string | undefined;

      for (const file of list) {
        if (next.length >= MAX_FILES) { err = `You can attach at most ${MAX_FILES} files.`; break; }
        if (!isAccepted(file)) { err = `${file.name}: only PDF, XLSX or DOCX allowed.`; continue; }
        if (file.size > MAX_SIZE) { err = `${file.name}: exceeds the 10MB limit.`; continue; }
        if (next.some((f) => f.name === file.name && f.size === file.size)) continue; // dedupe
        next.push(file);
      }

      setFormData((prev) => ({ ...prev, uploaded_documents: next }));
      setFormTouched(true);
      setErrors((prev) => {
        const n = { ...prev };
        if (err) n.uploaded_documents = err;
        else delete n.uploaded_documents;
        return n;
      });
    };



const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeFile = (idx: number): void => {
    setFormData((prev) => ({
      ...prev,
      uploaded_documents: prev.uploaded_documents.filter((_, i) => i !== idx),
    }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.uploaded_documents;
      return n;
    });
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };


  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // validate against plain text for the rich fields so empty markup
    // (e.g. "<p><br></p>") is correctly treated as empty.
    const forValidation: FormData = { ...formData };
    RICH_FIELDS.forEach((f) => {
      if (typeof forValidation[f] === 'string') {
        (forValidation[f] as unknown) = stripHtml(forValidation[f] as string);
      }
    });

    const newErrors = validateFormData(forValidation);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      // native inputs expose [name]; the RichEditor exposes [data-field]
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"], [data-field="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus();
      }
      return;
    }

    const clean = sanitizeFormData(formData);
    // Preserve the editor's sanitized HTML — sanitizeFormData would otherwise
    // flatten the tags and we'd lose all formatting.
    RICH_FIELDS.forEach((f) => {
      (clean[f] as unknown) = formData[f];
    });
    // Preserve the File[] — sanitizeFormData only handles strings.
    clean.uploaded_documents = formData.uploaded_documents;
      setFormData(clean);
      
    setIsSubmitting(true);
    try {
      const response = await submitProposal(clean);
      setApiResponse(response);
      if (response.success) {
        setSubmitted(true);
        if (response.submission_id) {
          localStorage.setItem('lastSubmissionId', response.submission_id);
        }
      }
    } catch (error) {
      setApiResponse({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
      setFormTouched(false);
    }
  };


  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
        <div className="text-center py-16">
          {emailStatus?.success ? (
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Success icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warning icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          )}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Form Submitted Successfully</h2>
          <p className="mt-2 text-gray-600">{emailStatus?.message || 'Thank you for your submission. Your intervention proposal has been received.'}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-6 py-24 bg-white ">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">REPUBLIC OF KENYA</h1>
        <h2 className="text-xl font-semibold text-gray-700 mt-2">SOCIAL HEALTH INSURANCE ACT, 2023</h2>
        <h3 className="text-lg font-medium text-gray-600 mt-1">BENEFIT PACKAGE INTERVENTION PROPOSAL</h3>
        <p className="text-sm text-gray-500 mt-1">FORM 4 (r. 45(2))</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name-input">1. Name</label>
            <input
              id="name-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <FieldError message={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone-input">2. Phone number</label>
              <input
                id="phone-input"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 712 345 678"
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <FieldError message={errors.phone} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email-input">Email address</label>
              <input
                id="email-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <FieldError message={errors.email} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profession-input">3. Profession</label>
            <input
              id="profession-input"
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Enter your profession"
              aria-required="true"
              aria-invalid={!!errors.profession}
              aria-describedby={errors.profession ? 'profession-error' : undefined}
              className={`w-full px-4 py-2 border ${errors.profession ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <FieldError message={errors.profession} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="organization-input">4. Organization</label>
            <input
              id="organization-input"
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter your organization"
              aria-required="true"
              aria-invalid={!!errors.organization}
              aria-describedby={errors.organization ? 'organization-error' : undefined}
              className={`w-full px-4 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <FieldError message={errors.organization} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="county-input">5. County</label>
            <input
              id="county-input"
              list="counties-list"
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              placeholder="Select a county"
              aria-required="true"
              aria-invalid={!!errors.county}
              aria-describedby={errors.county ? 'county-error' : undefined}
              className={`w-full px-4 py-2 border ${errors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <datalist id="counties-list">
              {counties.map((county) => (
                <option key={county} value={county} />
              ))}
            </datalist>
            <FieldError message={errors.county} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interventionName-input">6. Name of intervention</label>
          <input
            id="interventionName-input"
            type="text"
            name="interventionName"
            value={formData.interventionName}
            onChange={handleChange}
            placeholder="Provide a name for the intervention.."
            aria-required="true"
            aria-invalid={!!errors.interventionName}
            aria-describedby={errors.interventionName ? 'interventionName-error' : undefined}
            className={`w-full px-4 py-2 border ${errors.interventionName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <FieldError message={errors.interventionName} />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1.5">7. Type of intervention</legend>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="radiogroup" aria-labelledby="interventionType-label">
            {['Health Service', 'Vaccine', 'Drug', 'Medical Device', 'Other'].map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={type.replace(' ', '')}
                  name="interventionType"
                  value={type}
                  checked={formData.interventionType === type}
                  onChange={handleChange}
                  aria-invalid={!!errors.interventionType}
                  aria-describedby={errors.interventionType ? 'interventionType-error' : undefined}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={type.replace(' ', '')} className="ml-2 text-sm text-gray-700">
                  {type}
                </label>
              </div>
            ))}
          </div>
          <FieldError message={errors.interventionType} />
        </fieldset>

         <div>
          <RichEditor
            name="beneficiary-input"
            label=" 8. Proposed beneficiary for the proposed intervention"
            required
            invalid={!!errors.beneficiary}
            value={formData.beneficiary}
            onChange={handleRichChange('beneficiary')}
            placeholder="e.g., sickle cell patients…"
          />
          <FieldError message={errors.beneficiary} />
        </div>


        <div>
          <RichEditor
            name="justification"
            label="9. Reasons/justification for proposal of the intervention"
            required
            invalid={!!errors.justification}
            value={formData.justification}
            onChange={handleRichChange('justification')}
            placeholder="Explain why this intervention is being proposed…"
          />
          <FieldError message={errors.justification} />
        </div>

        <div>
          <RichEditor
            name="expectedImpact"
            label="10. Anticipated/Expected impact if the proposed intervention is included in the benefits package"
            required
            invalid={!!errors.expectedImpact}
            value={formData.expectedImpact}
            onChange={handleRichChange('expectedImpact')}
            minHeight={180}
            placeholder="Describe the expected impact…"
          />
          <FieldError message={errors.expectedImpact} />
        </div>

        <div>
          <RichEditor
            name="additionalInfo"
            label="11. Any additional information that you may want to provide about the intervention?"
            hint="You may attach a document in PDF format."
            invalid={!!errors.additionalInfo}
            value={formData.additionalInfo}
            onChange={handleRichChange('additionalInfo')}
            minHeight={120}
            placeholder="Optional: provide any additional information about the intervention…"
          />
          <FieldError message={errors.additionalInfo} />
        </div>



<div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="document-upload">
            Upload Supporting Documents (Optional)
            <span className="text-gray-500 italic text-xs ml-1">
              *PDF, XLSX or DOCX — up to {MAX_FILES} files, 10MB each
            </span>
          </label>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              dragActive ? 'border-[#27aae1] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex justify-center text-sm text-gray-600">
                <label htmlFor="document-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input
                    id="document-upload"
                    name="uploaded_documents"
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.docx"
                    onChange={handleFileChange}
                    disabled={formData.uploaded_documents.length >= MAX_FILES}
                    aria-required="false"
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, XLSX or DOCX up to 10MB each (max {MAX_FILES})
              </p>
            </div>
          </div>

          {formData.uploaded_documents.length > 0 && (
            <ul className="mt-3 space-y-2">
              {formData.uploaded_documents.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center justify-between border border-gray-200 px-3 py-2 text-sm rounded-md">
                  <span className="flex items-center gap-2 text-gray-700 min-w-0">
                    <svg className="h-4 w-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-xs text-red-600 hover:text-red-800 shrink-0 ml-3"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <FieldError message={errors.uploaded_documents} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signature-input">Signature (Type your full name)</label>
            <input
              id="signature-input"
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Type your full name as signature"
              aria-required="true"
              aria-invalid={!!errors.signature}
              aria-describedby={errors.signature ? 'signature-error' : 'signature-help'}
              className={`w-full px-4 py-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ fontFamily: 'cursive' }}
            />
            <FieldError message={errors.signature} />
            <p id="signature-help" className="text-xs text-gray-500 mt-1">
              By typing your name above, you acknowledge that this constitutes your electronic signature.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date-input">Date</label>
            <input
              id="date-input"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              aria-required="true"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {apiResponse && !apiResponse.success && (
          <p role="alert" className="text-sm text-red-600 text-center">{apiResponse.message}</p>
        )}

        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 italic mb-6">N.B. The form has to be duly filled for an intervention to be considered for selection</p>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Submitting form' : 'Submit form'}
            className={`px-8 py-2 text-white font-medium ${formTouched ? 'bg-[#1d8fc3] hover:bg-[#27aae1]' : 'bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center" aria-hidden="true">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BenefitsForm;