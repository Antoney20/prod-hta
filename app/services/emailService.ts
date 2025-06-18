
import { FormData, EmailConfig } from './types';

interface EnhancedEmailConfig extends EmailConfig {
  from?: string;
}

export const sendEmailWithPDF = async (
  formData: FormData, 
  pdfBlob: Blob,
  config: EnhancedEmailConfig = {
    recipient: formData.email,
    subject: 'Benefit Package Intervention Proposal Submission',
    body: 'Please find attached the Benefit Package Intervention Proposal form submission.'
  },
  additionalDocument?: File | null
): Promise<boolean> => {
  try {
    const emailFormData = new globalThis.FormData();

    const fromEmail = formData.email;
    emailFormData.append('from', fromEmail);
    
    emailFormData.append('to', config.recipient);
    emailFormData.append('name', formData.name);
    emailFormData.append('subject', config.subject);
    emailFormData.append('body', config.body);
    
    const nameValue = formData.name || 'Unknown';
    const pdfFileName = `Intervention_Proposal_${nameValue.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    emailFormData.append('attachment', pdfBlob, pdfFileName);
    emailFormData.append('filename', pdfFileName);
    
    if (additionalDocument) {
      const additionalFileName = `Supporting_Document_${nameValue.replace(/\s+/g, '_')}_${additionalDocument.name}`;
      emailFormData.append('additionalAttachment', additionalDocument, additionalFileName);
      emailFormData.append('additionalFilename', additionalFileName);
    }
 
    const response = await fetch('/api/send-email', {
      method: 'POST',
      body: emailFormData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Email sending failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    return true;
  } catch (error) {
    return false;
  }
};
