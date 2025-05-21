// // // app/services/emailService.ts
// // import { FormData, EmailConfig } from './types';

// // /**
// //  * Service for sending emails with attached PDFs
// //  */
// // export const sendEmailWithPDF = async (
// //   formData: FormData, 
// //   pdfBlob: Blob,
// //   config: EmailConfig = {
// //     recipient: process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'test@cema.africa',
// //     subject: 'Benefit Package Intervention Proposal Submission',
// //     body: 'Please find attached the Benefit Package Intervention Proposal form submission.'
// //   }
// // ): Promise<boolean> => {
// //   try {
// //     // Create FormData for the API request
// //     const emailFormData = new globalThis.FormData();
    
// //     // Log the recipient for debugging
// //     console.log('Sending email to recipient:', config.recipient);
    
// //     // Append email details to FormData
// //     emailFormData.append('to', config.recipient);
// //     emailFormData.append('subject', config.subject);
// //     emailFormData.append('body', config.body);
    
// //     // Create a descriptive filename for the attachment
// //     const nameValue = formData.name || 'Unknown';
// //     const fileName = `Intervention_Proposal_${nameValue.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
// //     // Append the PDF attachment
// //     emailFormData.append('attachment', pdfBlob, fileName);
 
// //     // Make the API request to the backend
// //     const response = await fetch('/api/send-email', {
// //       method: 'POST',
// //       body: emailFormData,
// //     });
    
// //     // Handle API response
// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(`Email sending failed: ${errorData.error || response.statusText}`);
// //     }
    
// //     // Process successful response
// //     const result = await response.json();
// //     console.log('Email sent successfully:', result);
    
// //     return true;
// //   } catch (error) {
// //     console.error('Error sending email:', error);
// //     return false;
// //   }
// // };


// // // // app/services/emailService.ts
// // // import { FormData, EmailConfig } from './types';

// // // /**
// // //  * Service for sending emails with attached PDFs
// // //  */
// // // export const sendEmailWithPDF = async (
// // //   formData: FormData, 
// // //   pdfBlob: Blob,
// // //   config: EmailConfig = {
// // //     recipient: process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'test@cema.africa',
// // //     subject: 'Benefit Package Intervention Proposal Submission',
// // //     body: 'Please find attached the Benefit Package Intervention Proposal form submission.'
// // //   }
// // // ): Promise<boolean> => {
// // //   try {
// // //     // Create FormData for the API request
// // //     const emailFormData = new globalThis.FormData();
    
// // //     // Log the recipient for debugging
// // //     console.log('Sending email to recipient:', config.recipient);
    
// // //     // Append email details to FormData
// // //     emailFormData.append('to', config.recipient);
// // //     emailFormData.append('subject', config.subject);
// // //     emailFormData.append('body', config.body);
    
// // //     // Create a descriptive filename for the attachment
// // //     const nameValue = formData.name || 'Unknown';
// // //     const fileName = `Intervention_Proposal_${nameValue.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
// // //     // Append the PDF attachment
// // //     emailFormData.append('attachment', pdfBlob, fileName);
 
// // //     // Make the API request to the backend
// // //     const response = await fetch('/api/send-email', {
// // //       method: 'POST',
// // //       body: emailFormData,
// // //     });
    
// // //     // Handle API response
// // //     if (!response.ok) {
// // //       const errorData = await response.json();
// // //       throw new Error(`Email sending failed: ${errorData.error || response.statusText}`);
// // //     }
    
// // //     // Process successful response
// // //     const result = await response.json();
// // //     console.log('Email sent successfully:', result);
    
// // //     return true;
// // //   } catch (error) {
// // //     console.error('Error sending email:', error);
// // //     return false;
// // //   }
// // // };



// import { FormData, EmailConfig } from './types';

// export const sendEmailWithPDF = async (
//   formData: FormData, 
//   pdfBlob: Blob,
//   config: EmailConfig = {
//     recipient: formData.email || process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'test@cema.africa',
//     subject: 'Benefit Package Intervention Proposal Submission',
//     body: 'Please find attached the Benefit Package Intervention Proposal form submission.'
//   }
// ): Promise<boolean> => {
//   try {
  
//     const emailFormData = new globalThis.FormData();
    
//     const recipientEmail = config.recipient === 'test@cema.africa' ? 
//       (formData.email || process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'test@cema.africa') : 
//       config.recipient;
    


//     emailFormData.append('to', recipientEmail);
//     emailFormData.append('subject', config.subject);
//     emailFormData.append('body', config.body);
    

//     const nameValue = formData.name || 'Unknown';
//     const fileName = `Intervention_Proposal_${nameValue.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
//     emailFormData.append('attachment', pdfBlob, fileName);
 
//     const response = await fetch('/api/send-email', {
//       method: 'POST',
//       body: emailFormData,
//     });
    
//     // Handle API response
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Email sending failed: ${errorData.error || response.statusText}`);
//     }
    
//     const result = await response.json();
//     console.log('Email sent successfully:', result);
    
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// };




import { FormData, EmailConfig } from './types';

export const sendEmailWithPDF = async (
  formData: FormData, 
  pdfBlob: Blob,
  config: EmailConfig = {
    recipient: process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'test@cema.africa',
    subject: 'Benefit Package Intervention Proposal Submission',
    body: 'Please find attached the Benefit Package Intervention Proposal form submission.'
  }
): Promise<boolean> => {
  try {
    const emailFormData = new globalThis.FormData();
    
    emailFormData.append('from', formData.email);
    emailFormData.append('name', formData.name);
    emailFormData.append('subject', config.subject);
    emailFormData.append('body', config.body);
    

    const nameValue = formData.name || 'Unknown';
    const fileName = `Intervention_Proposal_${nameValue.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    emailFormData.append('attachment', pdfBlob, fileName);
    emailFormData.append('filename', fileName);
 
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
    console.error('Error sending email:', error);
    return false;
  }
};