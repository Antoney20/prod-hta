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
    
    await sendMailPromise();
    
    return NextResponse.json({ 
      message: 'Email sent successfully',
      from: process.env.MY_EMAIL, 
      replyTo: userEmail, 
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