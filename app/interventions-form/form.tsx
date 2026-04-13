'use client'

import React, { useState, ChangeEvent, useEffect } from 'react';
import type { FormErrors, FormData, EmailResponse } from '../services/types';
import { ApiResponse, submitProposal } from '../api/interventions';
import { sanitizeEmail, sanitizeFormData, sanitizePhone, sanitizeText, validateField, validateFormData } from './validate';



const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
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

  // ── State (unchanged) ────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
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
    uploadedDocument: null, 
    signature: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<EmailResponse | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  // ── Reset after success (unchanged) ─────────────────────────────────────
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setFormData({
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
          uploadedDocument: null, 
          signature: '',
          date: new Date().toISOString().split('T')[0]
        });
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

  // On keystroke: only strip null bytes and control chars — NO trim()
  // Full sanitization runs on submit via sanitizeFormData()
  let clean = value;
  if (name === 'phone')      clean = sanitizePhone(value);


  const updated = { ...formData, [name]: clean } as FormData;
  setFormData(updated);
  setFormTouched(true);

  if (errors[name as keyof FormData]) {
    const fieldErr = validateField(name as keyof FormData, updated);
    setErrors(prev => {
      const next = { ...prev };
      if (fieldErr) next[name as keyof FormData] = fieldErr;
      else delete next[name as keyof FormData];
      return next;
    });
  }
};

  // ── File change: validate immediately, show inline error (replaces alert) 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    const updated = { ...formData, uploadedDocument: file };
    setFormData(updated);
    setFormTouched(true);

    const fieldErr = validateField('uploadedDocument', updated);
    setErrors(prev => {
      const next = { ...prev };
      if (fieldErr) {
        next.uploadedDocument = fieldErr;
        e.target.value = ''; // reset native input on error
      } else {
        delete next.uploadedDocument;
      }
      return next;
    });
  };

  // ── Submit: sanitize → validate → submit ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

  // 1. VALIDATE RAW DATA FIRST (no sanitization)
  const newErrors = validateFormData(formData);
  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    const firstErrorField = Object.keys(newErrors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (errorElement as HTMLElement).focus();
    }
    return;
  }

  // 2. SANITIZE ONLY AFTER VALIDATION PASSES
  const clean = sanitizeFormData(formData);
  setFormData(clean);

    // 3. Submit clean, validated data
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
      setFormTouched(false);
    }
  };


  // ── Success screen (unchanged) ────────────────────────────────────────────
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

  // ── Form JSX (completely unchanged from your original) ───────────────────
  return (
    <form onSubmit={handleSubmit} className="container  mx-auto p-6 py-24 bg-white rounded-lg shadow-lg">
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
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
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
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
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
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
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
              aria-describedby={errors.profession ? "profession-error" : undefined}
              className={`w-full px-4 py-2 border ${errors.profession ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.profession && (
              <p id="profession-error" className="text-sm text-red-600 mt-1">{errors.profession}</p>
            )}
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
              aria-describedby={errors.organization ? "organization-error" : undefined}
              className={`w-full px-4 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.organization && (
              <p id="organization-error" className="text-sm text-red-600 mt-1">{errors.organization}</p>
            )}
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
              aria-describedby={errors.county ? "county-error" : undefined}
              className={`w-full px-4 py-2 border ${errors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <datalist id="counties-list">
              {counties.map(county => (
                <option key={county} value={county} />
              ))}
            </datalist>
            {errors.county && (
              <p id="county-error" className="text-sm text-red-600 mt-1">{errors.county}</p>
            )}
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
            aria-describedby={errors.interventionName ? "interventionName-error" : undefined}
            className={`w-full px-4 py-2 border ${errors.interventionName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.interventionName && (
            <p id="interventionName-error" className="text-sm text-red-600 mt-1">{errors.interventionName}</p>
          )}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1.5">7. Type of intervention</legend>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="radiogroup" aria-labelledby="interventionType-label">
            {['Health Service', 'Vaccine', 'Drug', 'Medical Device', 'Other'].map(type => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={type.replace(' ', '')}
                  name="interventionType"
                  value={type}
                  checked={formData.interventionType === type}
                  onChange={handleChange}
                  aria-invalid={!!errors.interventionType}
                  aria-describedby={errors.interventionType ? "interventionType-error" : undefined}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={type.replace(' ', '')} className="ml-2 text-sm text-gray-700">
                  {type}
                </label>
              </div>
            ))}
          </div>
          {errors.interventionType && (
            <p id="interventionType-error" className="text-sm text-red-600 mt-1">{errors.interventionType}</p>
          )}
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="beneficiary-input">
            8. Proposed beneficiary for the proposed intervention 
            <span className="text-gray-500 italic text-xs ml-1">e.g., sickle cell patients</span>
          </label>
          <input
            id="beneficiary-input"
            type="text"
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleChange}
            placeholder="e.g. sickle cell patients"
            aria-required="true"
            aria-invalid={!!errors.beneficiary}
            aria-describedby={errors.beneficiary ? "beneficiary-error" : undefined}
            className={`w-full px-4 py-2 border ${errors.beneficiary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.beneficiary && (
            <p id="beneficiary-error" className="text-sm text-red-600 mt-1">{errors.beneficiary}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="justification-textarea">9. Reasons/justification for proposal of the intervention</label>
          <textarea
            id="justification-textarea"
            name="justification"
            value={formData.justification}
            onChange={handleChange}
            rows={4}
            aria-required="true"
            aria-invalid={!!errors.justification}
            aria-describedby={errors.justification ? "justification-error" : undefined}
            className={`w-full px-4 py-2 border ${errors.justification ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.justification && (
            <p id="justification-error" className="text-sm text-red-600 mt-1">{errors.justification}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedImpact-textarea">10. Anticipated/Expected impact if the proposed intervention is included in the benefits package</label>
          <textarea
            id="expectedImpact-textarea"
            name="expectedImpact"
            value={formData.expectedImpact}
            onChange={handleChange}
            rows={5}
            aria-required="true"
            aria-invalid={!!errors.expectedImpact}
            aria-describedby={errors.expectedImpact ? "expectedImpact-error" : undefined}
            className={`w-full px-4 py-2 border ${errors.expectedImpact ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.expectedImpact && (
            <p id="expectedImpact-error" className="text-sm text-red-600 mt-1">{errors.expectedImpact}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="additionalInfo-textarea">
            11. Any additional information that you may want to provide about the intervention?
            <span className="text-gray-500 italic text-xs ml-1">*(You may attach a document in pdf format)*</span>
          </label>
          <textarea
            id="additionalInfo-textarea"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={3}
            placeholder="Optional: Provide any additional information about the intervention..."
            aria-required="false"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          {errors.additionalInfo && (
            <p className="text-sm text-red-600 mt-1">{errors.additionalInfo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="document-upload">
            Upload Supporting Document (Optional)
            <span className="text-gray-500 italic text-xs ml-1">*PDF format only, max 10MB</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="document-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    id="document-upload"
                    name="uploadedDocument"
                    type="file"
                    accept=".pdf,.xlsx,.docx"
                    onChange={handleFileChange}
                    aria-required="false"
                    className="sr-only"
                  />
                </label>
     

              </div>
              <p className="text-xs text-gray-500">PDF, XLSX or DOCX up to 10MB</p>
              {formData.uploadedDocument && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {formData.uploadedDocument.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, uploadedDocument: null }));
                      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-xs text-red-600 hover:text-red-800 mt-1"
                  >
                    Remove file
                  </button>
                </div>
              )}
              {errors.uploadedDocument && (
                <p className="text-sm text-red-600 mt-1">{errors.uploadedDocument}</p>
              )}
            </div>
          </div>
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
              aria-describedby={errors.signature ? "signature-error" : "signature-help"}
              className={`w-full px-4 py-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-handwriting`}
              style={{ fontFamily: 'cursive' }}
            />
            {errors.signature && (
              <p id="signature-error" className="text-sm text-red-600 mt-1">{errors.signature}</p>
            )}
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
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 italic mb-6">N.B. The form has to be duly filled for an intervention to be considered for selection</p>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Submitting form" : "Submit form"}
            className={`px-6 py-3 text-white rounded-md font-medium ${formTouched ? 'bg-[#1d8fc3] hover:bg-[#27aae1]' : 'bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
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