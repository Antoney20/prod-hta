// 'use client'

// import React, { useState, ChangeEvent, FormEvent } from 'react';

// interface FormData {
//   name: string;
//   phone: string;
//   email: string;
//   profession: string;
//   organization: string;
//   county: string;
//   interventionName: string;
//   interventionType: string;
//   beneficiary: string;
//   justification: string;
//   expectedImpact: string;
//   signature: string;
//   date: string;
// }

// interface FormErrors {
//   [key: string]: string;
// }

// const BenefitsForm: React.FC = () => {
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     phone: '',
//     email: '',
//     profession: '',
//     organization: '',
//     county: '',
//     interventionName: '',
//     interventionType: '',
//     beneficiary: '',
//     justification: '',
//     expectedImpact: '',
//     signature: '',
//     date: new Date().toISOString().split('T')[0]
//   });

//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [submitted, setSubmitted] = useState<boolean>(false);
//   const [formTouched, setFormTouched] = useState<boolean>(false);

//   // Validate form fields
//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }
    
//     if (!formData.profession.trim()) newErrors.profession = "Profession is required";
//     if (!formData.organization.trim()) newErrors.organization = "Organization is required";
//     if (!formData.county.trim()) newErrors.county = "County is required";
//     if (!formData.interventionName.trim()) newErrors.interventionName = "Intervention name is required";
//     if (!formData.interventionType) newErrors.interventionType = "Intervention type must be selected";
//     if (!formData.beneficiary.trim()) newErrors.beneficiary = "Beneficiary is required";
//     if (!formData.justification.trim()) newErrors.justification = "Justification is required";
//     if (!formData.expectedImpact.trim()) newErrors.expectedImpact = "Expected impact is required";
//     if (!formData.signature.trim()) newErrors.signature = "Signature is required";
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle field changes
//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFormTouched(true);
    
//     // Clear error for this field when user types
//     if (errors[name]) {
//       setErrors(prev => {
//         const updated = {...prev};
//         delete updated[name];
//         return updated;
//       });
//     }
//   };

//   const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
//     e.preventDefault();
    
//     // Validate all fields before submission
//     const isValid = validateForm();
    
//     if (isValid) {
//       setIsSubmitting(true);
      
//       // Simulate form submission
//       setTimeout(() => {
//         setIsSubmitting(false);
//         setSubmitted(true);
//         // Reset form
//         setFormTouched(false);
//       }, 1500);
//     } else {
//       // Scroll to the first error
//       const firstErrorField = Object.keys(errors)[0];
//       const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
//       if (errorElement) {
//         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }
//   };

//   if (submitted) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
//         <div className="text-center py-16">
//           <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//           </svg>
//           <h2 className="mt-4 text-2xl font-bold text-gray-900">Form Submitted Successfully</h2>
//           <p className="mt-2 text-gray-600">Thank you for your submission. Your intervention proposal has been received.</p>
//           <button
//             onClick={() => {
//               setFormData({
//                 name: '',
//                 phone: '',
//                 email: '',
//                 profession: '',
//                 organization: '',
//                 county: '',
//                 interventionName: '',
//                 interventionType: '',
//                 beneficiary: '',
//                 justification: '',
//                 expectedImpact: '',
//                 signature: '',
//                 date: new Date().toISOString().split('T')[0]
//               });
//               setSubmitted(false);
//               setErrors({});
//               setFormTouched(false);
//             }}
//             className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Submit Another Form
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <div className="text-center mb-8">
//         {/* <div className="flex justify-center mb-4">
//           <img src="/api/placeholder/100/100" alt="Kenya Coat of Arms" className="h-16 w-16" />
//         </div> */}
//         <h1 className="text-2xl font-bold text-gray-800">REPUBLIC OF KENYA</h1>
//         <h2 className="text-xl font-semibold text-gray-700 mt-2">SOCIAL HEALTH INSURANCE ACT, 2023</h2>
//         <h3 className="text-lg font-medium text-gray-600 mt-1">BENEFIT PACKAGE INTERVENTION PROPOSAL</h3>
//         <p className="text-sm text-gray-500 mt-1">FORM 4 (r. 45(2))</p>
//       </div>

//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">1. Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.name && (
//               <p className="text-sm text-red-600 mt-1">{errors.name}</p>
//             )}
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">2. Phone number</label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               />
//               {errors.phone && (
//                 <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-600 mt-1">{errors.email}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">3. Profession</label>
//             <input
//               type="text"
//               name="profession"
//               value={formData.profession}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.profession ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.profession && (
//               <p className="text-sm text-red-600 mt-1">{errors.profession}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">4. Organization</label>
//             <input
//               type="text"
//               name="organization"
//               value={formData.organization}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.organization && (
//               <p className="text-sm text-red-600 mt-1">{errors.organization}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">5. County</label>
//             <input
//               type="text"
//               name="county"
//               value={formData.county}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.county && (
//               <p className="text-sm text-red-600 mt-1">{errors.county}</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">6. Name of intervention</label>
//           <input
//             type="text"
//             name="interventionName"
//             value={formData.interventionName}
//             onChange={handleChange}
//             className={`w-full px-4 py-2 border ${errors.interventionName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           />
//           {errors.interventionName && (
//             <p className="text-sm text-red-600 mt-1">{errors.interventionName}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">7. Type of intervention</label>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {['Health Service', 'Vaccine', 'Drug', 'Medical Device', 'Other'].map(type => (
//               <div key={type} className="flex items-center">
//                 <input
//                   type="radio"
//                   id={type.replace(' ', '')}
//                   name="interventionType"
//                   value={type}
//                   checked={formData.interventionType === type}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500"
//                 />
//                 <label htmlFor={type.replace(' ', '')} className="ml-2 text-sm text-gray-700">
//                   {type}
//                 </label>
//               </div>
//             ))}
//           </div>
//           {errors.interventionType && (
//             <p className="text-sm text-red-600 mt-1">{errors.interventionType}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             8. Proposed beneficiary for the proposed intervention 
//             <span className="text-gray-500 italic text-xs ml-1">e.g., sickle cell patients</span>
//           </label>
//           <input
//             type="text"
//             name="beneficiary"
//             value={formData.beneficiary}
//             onChange={handleChange}
//             className={`w-full px-4 py-2 border ${errors.beneficiary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           />
//           {errors.beneficiary && (
//             <p className="text-sm text-red-600 mt-1">{errors.beneficiary}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">9. Reasons/justification for proposal of the intervention</label>
//           <textarea
//             name="justification"
//             value={formData.justification}
//             onChange={handleChange}
//             rows={4}
//             className={`w-full px-4 py-2 border ${errors.justification ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           ></textarea>
//           {errors.justification && (
//             <p className="text-sm text-red-600 mt-1">{errors.justification}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">10. Anticipated/Expected impact if the proposed intervention is included in the benefits package</label>
//           <textarea
//             name="expectedImpact"
//             value={formData.expectedImpact}
//             onChange={handleChange}
//             rows={5}
//             className={`w-full px-4 py-2 border ${errors.expectedImpact ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           ></textarea>
//           {errors.expectedImpact && (
//             <p className="text-sm text-red-600 mt-1">{errors.expectedImpact}</p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Type your full name)</label>
//             <input
//               type="text"
//               name="signature"
//               value={formData.signature}
//               onChange={handleChange}
//               placeholder="Type your full name as signature"
//               className={`w-full px-4 py-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-handwriting`}
//               style={{ fontFamily: 'cursive' }}
//             />
//             {errors.signature && (
//               <p className="text-sm text-red-600 mt-1">{errors.signature}</p>
//             )}
//             <p className="text-xs text-gray-500 mt-1">
//               By typing your name above, you acknowledge that this constitutes your electronic signature.
//             </p>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.date && (
//               <p className="text-sm text-red-600 mt-1">{errors.date}</p>
//             )}
//           </div>
//         </div>

//         {/* <div className="bg-gray-100 p-4 rounded-md mt-8">
//           <h3 className="font-bold text-gray-700 mb-2">FOR OFFICIAL USE ONLY</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Receiving Officer Name:</label>
//               <div className="h-10 border-b border-gray-300 mt-1"></div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Date:</label>
//               <div className="h-10 border-b border-gray-300 mt-1"></div>
//             </div>
//           </div>
//         </div> */}

//         <div className="text-center mt-10">
//           <p className="text-sm text-gray-500 italic mb-6">N.B. The form has to be duly filled for an intervention to be considered for selection</p>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className={`px-6 py-3 text-white rounded-md font-medium ${formTouched ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
//           >
//             {isSubmitting ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </span>
//             ) : (
//               'Submit Form'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BenefitsForm;



// 'use client'

// import React, { useState, ChangeEvent, useEffect } from 'react';

// import { generatePDF } from '../services/pdfService';
// import { sendEmailWithPDF } from '../services/emailService';
// import { EmailResponse, FormErrors,FormData  } from '../services/types';

// const BenefitsForm: React.FC = () => {
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     phone: '',
//     email: '',
//     profession: '',
//     organization: '',
//     county: '',
//     interventionName: '',
//     interventionType: '',
//     beneficiary: '',
//     justification: '',
//     expectedImpact: '',
//     signature: '',
//     date: new Date().toISOString().split('T')[0]
//   });

//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [submitted, setSubmitted] = useState<boolean>(false);
//   const [formTouched, setFormTouched] = useState<boolean>(false);
//   const [emailStatus, setEmailStatus] = useState<EmailResponse | null>(null);

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }
    
//     if (!formData.profession.trim()) newErrors.profession = "Profession is required";
//     if (!formData.organization.trim()) newErrors.organization = "Organization is required";
//     if (!formData.county.trim()) newErrors.county = "County is required";
//     if (!formData.interventionName.trim()) newErrors.interventionName = "Intervention name is required";
//     if (!formData.interventionType) newErrors.interventionType = "Intervention type must be selected";
//     if (!formData.beneficiary.trim()) newErrors.beneficiary = "Beneficiary is required";
//     if (!formData.justification.trim()) newErrors.justification = "Justification is required";
//     if (!formData.expectedImpact.trim()) newErrors.expectedImpact = "Expected impact is required";
//     if (!formData.signature.trim()) newErrors.signature = "Signature is required";
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFormTouched(true);

//     if (errors[name]) {
//       setErrors(prev => {
//         const updated = {...prev};
//         delete updated[name];
//         return updated;
//       });
//     }
//   };

//   const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
//     e.preventDefault();
    
//     // Validate all fields before submission
//     const isValid = validateForm();
    
//     if (isValid) {
//       setIsSubmitting(true);
      
//       try {
//         // Generate PDF from form data
//         const pdfBlob = await generatePDF(formData);
        
//         // Send email with PDF attachment
//         const emailSuccess = await sendEmailWithPDF(formData, pdfBlob, {
//           recipient: 'tast@cema.africa',
//           subject: `Benefit Package Intervention Proposal - ${formData.name}`,
//           body: `Please find attached the Benefit Package Intervention Proposal submitted by ${formData.name} from ${formData.organization}.`
//         });
        
//         if (emailSuccess) {
//           setEmailStatus({
//             success: true,
//             message: 'Your proposal has been successfully submitted and emailed.'
//           });
//           setSubmitted(true);
//         } else {
//           setEmailStatus({
//             success: false,
//             message: 'Form submitted but there was an issue sending the email. Please try again or contact support.',
//             error: 'Email service error'
//           });
//         }
//       } catch (error) {
//         console.error('Error in form submission:', error);
//         setEmailStatus({
//           success: false,
//           message: 'There was an error processing your submission.',
//           error: error instanceof Error ? error.message : 'Unknown error'
//         });
//       } finally {
//         setIsSubmitting(false);
//         setFormTouched(false);
//       }
//     } else {
   
//       const firstErrorField = Object.keys(errors)[0];
//       const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
//       if (errorElement) {
//         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }
//   };

//   if (submitted) {
//     return (
//       <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
//         <div className="text-center py-16">
//           {emailStatus?.success ? (
//             <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//           ) : (
//             <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
//             </svg>
//           )}
//           <h2 className="mt-4 text-2xl font-bold text-gray-900">Form Submitted Successfully</h2>
//           <p className="mt-2 text-gray-600">{emailStatus?.message || 'Thank you for your submission. Your intervention proposal has been received.'}</p>
          
//           <button
//             onClick={() => {
//               setFormData({
//                 name: '',
//                 phone: '',
//                 email: '',
//                 profession: '',
//                 organization: '',
//                 county: '',
//                 interventionName: '',
//                 interventionType: '',
//                 beneficiary: '',
//                 justification: '',
//                 expectedImpact: '',
//                 signature: '',
//                 date: new Date().toISOString().split('T')[0]
//               });
//               setSubmitted(false);
//               setErrors({});
//               setFormTouched(false);
//               setEmailStatus(null);
//             }}
//             className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Submit Another Form
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <div className="text-center mb-8">
 
//         <h1 className="text-2xl font-bold text-gray-800">REPUBLIC OF KENYA</h1>
//         <h2 className="text-xl font-semibold text-gray-700 mt-2">SOCIAL HEALTH INSURANCE ACT, 2023</h2>
//         <h3 className="text-lg font-medium text-gray-600 mt-1">BENEFIT PACKAGE INTERVENTION PROPOSAL</h3>
//         <p className="text-sm text-gray-500 mt-1">FORM 4 (r. 45(2))</p>
//       </div>

//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">1. Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.name && (
//               <p className="text-sm text-red-600 mt-1">{errors.name}</p>
//             )}
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">2. Phone number</label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               />
//               {errors.phone && (
//                 <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-600 mt-1">{errors.email}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">3. Profession</label>
//             <input
//               type="text"
//               name="profession"
//               value={formData.profession}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.profession ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.profession && (
//               <p className="text-sm text-red-600 mt-1">{errors.profession}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">4. Organization</label>
//             <input
//               type="text"
//               name="organization"
//               value={formData.organization}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.organization && (
//               <p className="text-sm text-red-600 mt-1">{errors.organization}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">5. County</label>
//             <input
//               type="text"
//               name="county"
//               value={formData.county}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.county && (
//               <p className="text-sm text-red-600 mt-1">{errors.county}</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">6. Name of intervention</label>
//           <input
//             type="text"
//             name="interventionName"
//             value={formData.interventionName}
//             onChange={handleChange}
//             className={`w-full px-4 py-2 border ${errors.interventionName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           />
//           {errors.interventionName && (
//             <p className="text-sm text-red-600 mt-1">{errors.interventionName}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">7. Type of intervention</label>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {['Health Service', 'Vaccine', 'Drug', 'Medical Device', 'Other'].map(type => (
//               <div key={type} className="flex items-center">
//                 <input
//                   type="radio"
//                   id={type.replace(' ', '')}
//                   name="interventionType"
//                   value={type}
//                   checked={formData.interventionType === type}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500"
//                 />
//                 <label htmlFor={type.replace(' ', '')} className="ml-2 text-sm text-gray-700">
//                   {type}
//                 </label>
//               </div>
//             ))}
//           </div>
//           {errors.interventionType && (
//             <p className="text-sm text-red-600 mt-1">{errors.interventionType}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             8. Proposed beneficiary for the proposed intervention 
//             <span className="text-gray-500 italic text-xs ml-1">e.g., sickle cell patients</span>
//           </label>
//           <input
//             type="text"
//             name="beneficiary"
//             value={formData.beneficiary}
//             onChange={handleChange}
//             className={`w-full px-4 py-2 border ${errors.beneficiary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           />
//           {errors.beneficiary && (
//             <p className="text-sm text-red-600 mt-1">{errors.beneficiary}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">9. Reasons/justification for proposal of the intervention</label>
//           <textarea
//             name="justification"
//             value={formData.justification}
//             onChange={handleChange}
//             rows={4}
//             className={`w-full px-4 py-2 border ${errors.justification ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           ></textarea>
//           {errors.justification && (
//             <p className="text-sm text-red-600 mt-1">{errors.justification}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">10. Anticipated/Expected impact if the proposed intervention is included in the benefits package</label>
//           <textarea
//             name="expectedImpact"
//             value={formData.expectedImpact}
//             onChange={handleChange}
//             rows={5}
//             className={`w-full px-4 py-2 border ${errors.expectedImpact ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//           ></textarea>
//           {errors.expectedImpact && (
//             <p className="text-sm text-red-600 mt-1">{errors.expectedImpact}</p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Type your full name)</label>
//             <input
//               type="text"
//               name="signature"
//               value={formData.signature}
//               onChange={handleChange}
//               placeholder="Type your full name as signature"
//               className={`w-full px-4 py-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-handwriting`}
//               style={{ fontFamily: 'cursive' }}
//             />
//             {errors.signature && (
//               <p className="text-sm text-red-600 mt-1">{errors.signature}</p>
//             )}
//             <p className="text-xs text-gray-500 mt-1">
//               By typing your name above, you acknowledge that this constitutes your electronic signature.
//             </p>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.date && (
//               <p className="text-sm text-red-600 mt-1">{errors.date}</p>
//             )}
//           </div>
//         </div>

//         {/* <div className="bg-gray-100 p-4 rounded-md mt-8">
//           <h3 className="font-bold text-gray-700 mb-2">FOR OFFICIAL USE ONLY</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Receiving Officer Name:</label>
//               <div className="h-10 border-b border-gray-300 mt-1"></div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Date:</label>
//               <div className="h-10 border-b border-gray-300 mt-1"></div>
//             </div>
//           </div>
//         </div> */}

//         <div className="text-center mt-10">
//           <p className="text-sm text-gray-500 italic mb-6">N.B. The form has to be duly filled for an intervention to be considered for selection</p>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className={`px-6 py-3 text-white rounded-md font-medium ${formTouched ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
//           >
//             {isSubmitting ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </span>
//             ) : (
//               'Submit Form'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BenefitsForm;



'use client'

import React, { useState, ChangeEvent } from 'react';
import { generatePDF } from '../services/pdfService';
import type { FormErrors, FormData, EmailResponse } from '../services/types';
import { sendEmailWithPDF } from '../services/emailService';

const BenefitsForm: React.FC = () => {
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
    signature: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<EmailResponse | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.profession.trim()) newErrors.profession = "Profession is required";
    if (!formData.organization.trim()) newErrors.organization = "Organization is required";
    if (!formData.county.trim()) newErrors.county = "County is required";
    if (!formData.interventionName.trim()) newErrors.interventionName = "Intervention name is required";
    if (!formData.interventionType) newErrors.interventionType = "Intervention type must be selected";
    if (!formData.beneficiary.trim()) newErrors.beneficiary = "Beneficiary is required";
    if (!formData.justification.trim()) newErrors.justification = "Justification is required";
    if (!formData.expectedImpact.trim()) newErrors.expectedImpact = "Expected impact is required";
    if (!formData.signature.trim()) newErrors.signature = "Signature is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormTouched(true);

    if (errors[name]) {
      setErrors(prev => {
        const updated = {...prev};
        delete updated[name];
        return updated;
      });
    }
  };

//   const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
//     e.preventDefault();
    
//     const isValid = validateForm();
    
//     if (isValid) {
//       setIsSubmitting(true);
      
//       try {
//         const pdfBlob = await generatePDF(formData);
        
//         const apiFormData = new FormData();
        
//         apiFormData.append('to', 'test@cema.africa');
        
     
//         apiFormData.append('subject', `Benefit Package Intervention Proposal - ${formData.name}`);
//         apiFormData.append('body', `Please find attached the Benefit Package Intervention Proposal submitted by ${formData.name} from ${formData.organization}.
        
// Details:
// - Name: ${formData.name}
// - Phone: ${formData.phone}
// - Email: ${formData.email}
// - Profession: ${formData.profession}
// - Organization: ${formData.organization}
// - County: ${formData.county}
// - Intervention: ${formData.interventionName}
// - Type: ${formData.interventionType}
// - Beneficiary: ${formData.beneficiary}
        
// The complete details are provided in the attached PDF.`);
        
//         const fileName = `Intervention_Proposal_${formData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
//         apiFormData.append('attachment', pdfBlob, fileName);
        
//         const response = await fetch('/api/send-email', {
//           method: 'POST',
//           body: apiFormData
//         });
        
//         if (response.ok) {

//           const result = await response.json();
//           console.log('Email sent successfully:', result);
          
//           setEmailStatus({
//             success: true,
//             message: 'Your proposal has been successfully processed and submitted.'
//           });
//           setSubmitted(true);
//         } else {
          
//           const errorData = await response.json();
//           console.error('Email sending error:', errorData);
          
//           setEmailStatus({
//             success: false,
//             message: 'Form submitted but there was an issue sending the email. Please try again or contact support.',
//             error: errorData.error || 'Email service error'
//           });
//         }
//       } catch (error) {
//         console.error('Error in form submission:', error);
//         setEmailStatus({
//           success: false,
//           message: 'There was an error processing your submission.',
//           error: error instanceof Error ? error.message : 'Unknown error'
//         });
//       } finally {
//         setIsSubmitting(false);
//         setFormTouched(false);
//       }
//     } else {
//       const firstErrorField = Object.keys(errors)[0];
//       const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
//       if (errorElement) {
//         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }
//   };





//   const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
//     e.preventDefault();
    
//     const isValid = validateForm();
    
//     if (isValid) {
//       setIsSubmitting(true);
      
//       try {
//         const pdfBlob = await generatePDF(formData);
    
//         const apiFormData = new FormData();
        
//         apiFormData.append('to', 'test@cema.africa');
        
//         apiFormData.append('subject', `Benefit Package Intervention Proposal - ${formData.name}`);
//         apiFormData.append('body', `Please find attached the Benefit Package Intervention Proposal submitted by ${formData.name} from ${formData.organization}.
        
// Details:
// - Name: ${formData.name}
// - Phone: ${formData.phone}
// - Email: ${formData.email}
// - Profession: ${formData.profession}
// - Organization: ${formData.organization}
// - County: ${formData.county}
// - Intervention: ${formData.interventionName}
// - Type: ${formData.interventionType}
// - Beneficiary: ${formData.beneficiary}
        
// The complete details are provided in the attached PDF.`);
        
//         const fileName = `Intervention_Proposal_${formData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
//         apiFormData.append('attachment', pdfBlob, fileName);
        
//         const response = await fetch('/api/send-email', {
//           method: 'POST',
//           body: apiFormData
//         });
        
//         if (response.ok) {

//           const result = await response.json();
//           console.log('Email sent successfully:', result);
          
//           setEmailStatus({
//             success: true,
//             message: 'Your proposal has been successfully submitted and emailed.'
//           });
//           setSubmitted(true);
//         } else {

//           const errorData = await response.json();
//           console.error('Email sending error:', errorData);
          
//           setEmailStatus({
//             success: false,
//             message: 'Form submitted but there was an issue sending the email. Please try again or contact support.',
//             error: errorData.error || 'Email service error'
//           });
//         }
//       } catch (error) {
//         console.error('Error in form submission:', error);
//         setEmailStatus({
//           success: false,
//           message: 'There was an error processing your submission.',
//           error: error instanceof Error ? error.message : 'Unknown error'
//         });
//       } finally {
//         setIsSubmitting(false);
//         setFormTouched(false);
//       }
//     } else {
//       const firstErrorField = Object.keys(errors)[0];
//       const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
//       if (errorElement) {
//         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }
//   };



const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
  e.preventDefault();
  
  const isValid = validateForm();
  
  if (isValid) {
    setIsSubmitting(true);
    
    try {
 
      const pdfBlob = await generatePDF(formData);
      

      const emailSuccess = await sendEmailWithPDF(formData, pdfBlob, {
        recipient: formData.email,
        subject: `Benefit Package Intervention Proposal - ${formData.name}`,
        body: `Please find attached the Benefit Package Intervention Proposal submitted by ${formData.name} from ${formData.organization}.

Form Details:
- Name: ${formData.name}
- Phone: ${formData.phone}
- Email: ${formData.email}
- Profession: ${formData.profession}
- Organization: ${formData.organization}
- County: ${formData.county}
- Intervention: ${formData.interventionName}
- Type: ${formData.interventionType}
- Beneficiary: ${formData.beneficiary}
- Date: ${formData.date}

The complete details including justification and expected impact are provided in the attached PDF.

This is an automatically generated email. Please do not reply to this message.`
      });
      
      if (emailSuccess) {
        setEmailStatus({
          success: true,
          message: `Your proposal has been successfully submitted. Thankyou for your response.`
        });
        setSubmitted(true);
      } else {
        setEmailStatus({
          success: false,
          message: 'Form submitted but there was an issue sending the email. Please try again or contact support.',
          error: 'Email service error'
        });
      }
    } catch (error) {
    //   console.error('Error in form submission:', error);
      setEmailStatus({
        success: false,
        message: 'There was an error processing your submission.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
      setFormTouched(false);
    }
  } else {
    
    const firstErrorField = Object.keys(errors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
        <div className="text-center py-16">
          {emailStatus?.success ? (
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    <div className="container  mx-auto p-6 py-24 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
 
        <h1 className="text-2xl font-bold text-gray-800">REPUBLIC OF KENYA</h1>
        <h2 className="text-xl font-semibold text-gray-700 mt-2">SOCIAL HEALTH INSURANCE ACT, 2023</h2>
        <h3 className="text-lg font-medium text-gray-600 mt-1">BENEFIT PACKAGE INTERVENTION PROPOSAL</h3>
        <p className="text-sm text-gray-500 mt-1">FORM 4 (r. 45(2))</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1. Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Phone number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">3. Profession</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.profession ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.profession && (
              <p className="text-sm text-red-600 mt-1">{errors.profession}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4. Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.organization && (
              <p className="text-sm text-red-600 mt-1">{errors.organization}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">5. County</label>
            <input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.county && (
              <p className="text-sm text-red-600 mt-1">{errors.county}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">6. Name of intervention</label>
          <input
            type="text"
            name="interventionName"
            value={formData.interventionName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.interventionName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.interventionName && (
            <p className="text-sm text-red-600 mt-1">{errors.interventionName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">7. Type of intervention</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Health Service', 'Vaccine', 'Drug', 'Medical Device', 'Other'].map(type => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={type.replace(' ', '')}
                  name="interventionType"
                  value={type}
                  checked={formData.interventionType === type}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={type.replace(' ', '')} className="ml-2 text-sm text-gray-700">
                  {type}
                </label>
              </div>
            ))}
          </div>
          {errors.interventionType && (
            <p className="text-sm text-red-600 mt-1">{errors.interventionType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            8. Proposed beneficiary for the proposed intervention 
            <span className="text-gray-500 italic text-xs ml-1">e.g., sickle cell patients</span>
          </label>
          <input
            type="text"
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.beneficiary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.beneficiary && (
            <p className="text-sm text-red-600 mt-1">{errors.beneficiary}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">9. Reasons/justification for proposal of the intervention</label>
          <textarea
            name="justification"
            value={formData.justification}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border ${errors.justification ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.justification && (
            <p className="text-sm text-red-600 mt-1">{errors.justification}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">10. Anticipated/Expected impact if the proposed intervention is included in the benefits package</label>
          <textarea
            name="expectedImpact"
            value={formData.expectedImpact}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-2 border ${errors.expectedImpact ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.expectedImpact && (
            <p className="text-sm text-red-600 mt-1">{errors.expectedImpact}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Type your full name)</label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Type your full name as signature"
              className={`w-full px-4 py-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-handwriting`}
              style={{ fontFamily: 'cursive' }}
            />
            {errors.signature && (
              <p className="text-sm text-red-600 mt-1">{errors.signature}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              By typing your name above, you acknowledge that this constitutes your electronic signature.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 italic mb-6">N.B. The form has to be duly filled for an intervention to be considered for selection</p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 text-white rounded-md font-medium ${formTouched ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
};

export default BenefitsForm;