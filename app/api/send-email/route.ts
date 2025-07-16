// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
    
//     const userEmail = formData.get('from') as string;
//     const subject = formData.get('subject') as string;
//     const body = formData.get('body') as string;
//     const attachment = formData.get('attachment') as Blob;
//     const additionalAttachment = formData.get('additionalAttachment') as Blob;
    
//     if (!userEmail || !subject || !body) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
  
//     const transport = nodemailer.createTransport({
//       service: 'gmail', 
//       auth: {
//         user: process.env.MY_EMAIL, 
//         pass: process.env.MY_PASSWORD,
//       },
//     });
    
//     const toEmail = process.env.MY_EMAIL;
//     const adminEmail = process.env.ADMIN_EMAIL;

//     const enhancedBody = `
// BENEFIT PACKAGE INTERVENTION PROPOSAL SUBMISSION

// Submitted by: ${userEmail}
// Reply to this email to respond directly to the submitter.

// ${body}

// ---
// This email was automatically generated from the HBPTAP intervention proposal form.
// Original sender: ${userEmail}
//     `.trim();

//     const mailOptions: Mail.Options = {
//       from: process.env.MY_EMAIL, 
//       replyTo: userEmail,
//       to: toEmail,
//       cc: adminEmail,
//       subject: `[FORM SUBMISSION] ${subject}`,
//       text: enhancedBody,
//       attachments: []
//     };
    
//     if (attachment) {
//       try {
//         const buffer = Buffer.from(await attachment.arrayBuffer());
//         const filename = formData.get('filename') as string || 'intervention_proposal.pdf';
        
//         mailOptions.attachments!.push({
//           filename,
//           content: buffer,
//           contentType: 'application/pdf',
//         });
//       } catch (attachmentError) {
//       }
//     }
    
//     if (additionalAttachment) {
//       try {
//         const additionalBuffer = Buffer.from(await additionalAttachment.arrayBuffer());
//         const additionalFilename = formData.get('additionalFilename') as string || 'supporting_document.pdf';
        
//         mailOptions.attachments!.push({
//           filename: additionalFilename,
//           content: additionalBuffer,
//           contentType: 'application/pdf',
//         });
//       } catch (additionalAttachmentError) {
//       }
//     }
    
//     const sendMailPromise = () => new Promise<string>((resolve, reject) => {
//       transport.sendMail(mailOptions, function (err, info) {
//         if (!err) {
//           resolve('Email sent');
//         } else {
//           reject(err.message);
//         }
//       });
//     });
    
//     await sendMailPromise();
    
//     return NextResponse.json({ 
//       message: 'Email sent successfully',
//       from: process.env.MY_EMAIL, 
//       replyTo: userEmail, 
//       attachments: {
//         mainPDF: !!attachment,
//         additionalDocument: !!additionalAttachment
//       }
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to send email. Please try again later.' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const userEmail = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const attachment = formData.get('attachment') as Blob;
    const additionalAttachment = formData.get('additionalAttachment') as Blob;
    
    if (!userEmail || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
  
    const transport = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.MY_EMAIL, 
        pass: process.env.MY_PASSWORD,
      },
    });
    
    const toEmail = process.env.MY_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    const enhancedBody = `
BENEFIT PACKAGE INTERVENTION PROPOSAL SUBMISSION

Submitted by: ${userEmail}
Reply to this email to respond directly to the submitter.

${body}

---
This email was automatically generated from the HBPTAP intervention proposal form.
Original sender: ${userEmail}
    `.trim();

    const mailOptions: Mail.Options = {
      from: process.env.MY_EMAIL, 
      replyTo: userEmail,
      to: toEmail,
      cc: adminEmail,
      subject: `[FORM SUBMISSION] ${subject}`,
      text: enhancedBody,
      attachments: []
    };
    
    if (attachment) {
      try {
        const buffer = Buffer.from(await attachment.arrayBuffer());
        const filename = formData.get('filename') as string || 'intervention_proposal.pdf';
        
        mailOptions.attachments!.push({
          filename,
          content: buffer,
          contentType: 'application/pdf',
        });
      } catch (attachmentError) {
      }
    }
    
    if (additionalAttachment) {
      try {
        const additionalBuffer = Buffer.from(await additionalAttachment.arrayBuffer());
        const additionalFilename = formData.get('additionalFilename') as string || 'supporting_document.pdf';
        
        mailOptions.attachments!.push({
          filename: additionalFilename,
          content: additionalBuffer,
          contentType: 'application/pdf',
        });
      } catch (additionalAttachmentError) {
      }
    }
    
    const sendMailPromise = () => new Promise<string>((resolve, reject) => {
      transport.sendMail(mailOptions, function (err, info) {
        if (!err) {
          resolve('Email sent');
        } else {
          reject(err.message);
        }
      });
    });
    
    // Send the main email first
    await sendMailPromise();
    
   
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Send acknowledgment email to the user
    const acknowledgmentOptions: Mail.Options = {
      from: process.env.MY_EMAIL,
      to: userEmail,
      subject: 'Acknowledgement of Receipt of Health Intervention Proposal',
      text: `Dear ${userEmail.split('@')[0]},

Thank you for reaching out to share your proposal on health interventions with the Health Benefits and Tariffs Advisory Panel. We sincerely appreciate your interest in contributing to the improvement of health outcomes in Kenya.

Please note that we receive a high volume of suggestions and proposals from the public, and each submission is important to us, and we strive to review them thoroughly. While we are not able to respond to every submission individually, please be assured that your proposal has been received and will be considered as part of our review process.

Should your proposal be selected for further consideration or discussion, a member of our team will contact you directly.

Thank you once again for your commitment to enhancing health services. We value public input and collaboration as we work toward better health for all.

Sincerely,
Benefits and Tariffs Advisory Panel Secretariat

---
This is an automated acknowledgment email.
Original submission: "${subject}"
Submitted on: ${new Date().toLocaleDateString('en-KE', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
            Acknowledgement of Receipt of Health Intervention Proposal
          </h2>
          
          <p>Dear ${userEmail.split('@')[0]},</p>
          
          <p>Thank you for reaching out to share your proposal on health interventions with the <strong>Health Benefits and Tariffs Advisory Panel</strong>. We sincerely appreciate your interest in contributing to the improvement of health outcomes in Kenya.</p>
          
          <p>Please note that we receive a high volume of suggestions and proposals from the public, and each submission is important to us, and we strive to review them thoroughly. While we are not able to respond to every submission individually, please be assured that your proposal has been received and will be considered as part of our review process.</p>
          
          <p>Should your proposal be selected for further consideration or discussion, a member of our team will contact you directly.</p>
          
          <p>Thank you once again for your commitment to enhancing health services. We value public input and collaboration as we work toward better health for all.</p>
          
          <p>Sincerely,<br>
          <strong>Benefits and Tariffs Advisory Panel Secretariat</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 12px; color: #666;">
            <p><strong>Submission Details:</strong></p>
            <p>• Subject: "${subject}"</p>
            <p>• Submitted on: ${new Date().toLocaleDateString('en-KE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p>• This is an automated acknowledgment email.</p>
          </div>
        </div>
      `
    };
    
    const sendAcknowledgmentPromise = () => new Promise<string>((resolve, reject) => {
      transport.sendMail(acknowledgmentOptions, function (err, info) {
        if (!err) {
          resolve('Acknowledgment sent');
        } else {
          reject(err.message);
        }
      });
    });
    
    // Send the acknowledgment email
    await sendAcknowledgmentPromise();
    
    return NextResponse.json({ 
      message: 'Email sent successfully and acknowledgment sent to user',
      from: process.env.MY_EMAIL, 
      replyTo: userEmail, 
      acknowledgmentSent: true,
      attachments: {
        mainPDF: !!attachment,
        additionalDocument: !!additionalAttachment
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}