// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { FormData } from './types';

// /**
//  * Generates a PDF document from form data
//  * @param formData The submitted form data
//  * @returns A Blob containing the PDF
//  */
// export const generatePDF = async (formData: FormData): Promise<Blob> => {
//   // Create a new PDF document
//   const doc = new jsPDF();
  

//   doc.setFontSize(16);
//   doc.setFont('helvetica', 'bold');
//   doc.text('REPUBLIC OF KENYA', 105, 20, { align: 'center' });
//   doc.setFontSize(14);
//   doc.text('SOCIAL HEALTH INSURANCE ACT, 2023', 105, 30, { align: 'center' });
//   doc.text('BENEFIT PACKAGE INTERVENTION PROPOSAL', 105, 40, { align: 'center' });
//   doc.setFontSize(12);
//   doc.text('FORM 4 (r. 45(2))', 105, 50, { align: 'center' });
  
//   // Add form data
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(11);
  
//   let y = 70;

//   const addField = (label: string, value: string, y: number): number => {
//     doc.setFont('helvetica', 'bold');
//     doc.text(label, 20, y);
//     doc.setFont('helvetica', 'normal');
//     doc.text(value, 80, y);
//     return y + 10; 
//   };
  
//   // Add all form fields
//   y = addField('1. Name:', formData.name, y);
//   y = addField('2. Phone number:', formData.phone, y);
//   y = addField('   Email address:', formData.email, y);
//   y = addField('3. Profession:', formData.profession, y);
//   y = addField('4. Organization:', formData.organization, y);
//   y = addField('5. County:', formData.county, y);
//   y = addField('6. Name of intervention:', formData.interventionName, y);
//   y = addField('7. Type of intervention:', formData.interventionType, y);
//   y = addField('8. Proposed beneficiary:', formData.beneficiary, y);
  
//   // For longer text, we need to handle multi-line
//   doc.setFont('helvetica', 'bold');
//   doc.text('9. Reasons/justification for proposal:', 20, y);
//   doc.setFont('helvetica', 'normal');
  
//   // Split long text into multiple lines
//   const justificationLines = doc.splitTextToSize(formData.justification, 170);
//   doc.text(justificationLines, 20, y + 10);
  
//   y += 10 + (justificationLines.length * 7); // Adjust Y based on number of lines
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('10. Anticipated/Expected impact:', 20, y);
//   doc.setFont('helvetica', 'normal');
  
//   // Split long text into multiple lines
//   const impactLines = doc.splitTextToSize(formData.expectedImpact, 170);
//   doc.text(impactLines, 20, y + 10);
  
//   y += 10 + (impactLines.length * 7); // Adjust Y based on number of lines
  
//   // Add signature and date
//   doc.setFont('helvetica', 'bold');
//   doc.text('Signature:', 20, y + 20);
//   doc.setFont('helvetica', 'italic');
//   doc.text(formData.signature, 80, y + 20);
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('Date:', 140, y + 20);
//   doc.setFont('helvetica', 'normal');
//   doc.text(formData.date, 160, y + 20);
  
//   // Add Official Use section
//   doc.setFont('helvetica', 'bold');
//   doc.text('FOR OFFICIAL USE ONLY', 20, y + 40);
//   doc.line(20, y + 45, 190, y + 45); // Horizontal line
  
//   doc.text('Receiving Officer Name:', 20, y + 55);
//   doc.line(80, y + 55, 190, y + 55); // Line for officer name
  
//   doc.text('Date:', 20, y + 65);
//   doc.line(40, y + 65, 100, y + 65); // Line for date
  
//   // Add note at the bottom
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'italic');
//   doc.text('N.B. The form has to be duly filled for an intervention to be considered for selection', 
//            105, y + 80, { align: 'center' });
  
//   // Return the PDF as a blob
//   return doc.output('blob');
// };

import { jsPDF } from 'jspdf';
import { FormData } from './types';

/**
 * Generates a PDF document from form data
 * @param formData The submitted form data
 * @returns A Blob containing the PDF
 */
export const generatePDF = async (formData: FormData): Promise<Blob> => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REPUBLIC OF KENYA', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('SOCIAL HEALTH INSURANCE ACT, 2023', 105, 30, { align: 'center' });
  doc.text('BENEFIT PACKAGE INTERVENTION PROPOSAL', 105, 40, { align: 'center' });
  doc.setFontSize(12);
  doc.text('FORM 4 (r. 45(2))', 105, 50, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  

  let y = 70;
  
  const addField = (label: string, value: string, y: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    return y + 10; 
  };
  
  y = addField('1. Name:', formData.name, y);
  y = addField('2. Phone number:', formData.phone, y);
  y = addField('   Email address:', formData.email, y);
  y = addField('3. Profession:', formData.profession, y);
  y = addField('4. Organization:', formData.organization, y);
  y = addField('5. County:', formData.county, y);
  y = addField('6. Name of intervention:', formData.interventionName, y);
  y = addField('7. Type of intervention:', formData.interventionType, y);
  y = addField('8. Proposed beneficiary:', formData.beneficiary, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('9. Reasons/justification for proposal:', 20, y);
  doc.setFont('helvetica', 'normal');
  

  const justificationLines = doc.splitTextToSize(formData.justification, 170);
  doc.text(justificationLines, 20, y + 10);
  
  y += 10 + (justificationLines.length * 7); 
  
  doc.setFont('helvetica', 'bold');
  doc.text('10. Anticipated/Expected impact:', 20, y);
  doc.setFont('helvetica', 'normal');
  
  const impactLines = doc.splitTextToSize(formData.expectedImpact, 170);
  doc.text(impactLines, 20, y + 10);
  
  y += 10 + (impactLines.length * 7); 
  doc.setFont('helvetica', 'bold');
  doc.text('Signature:', 20, y + 20);
  doc.setFont('helvetica', 'italic');
  doc.text(formData.signature, 80, y + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 140, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.date, 160, y + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('FOR OFFICIAL USE ONLY', 20, y + 40);
  doc.line(20, y + 45, 190, y + 45); 
  
  doc.text('Receiving Officer Name:', 20, y + 55);
  doc.line(80, y + 55, 190, y + 55); 
  
  doc.text('Date:', 20, y + 65);
  doc.line(40, y + 65, 100, y + 65); 
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('N.B. The form has to be duly filled for an intervention to be considered for selection', 
           105, y + 80, { align: 'center' });
  
  return doc.output('blob');
};