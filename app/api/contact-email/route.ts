import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const organization = formData.get('organization') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    const enhancedMessage = `
CONTACT FORM SUBMISSION

Name: ${fullName}
Email: ${email}
Organization: ${organization || 'Not specified'}
Subject: ${subject}

Message:
${message}

---
This email was automatically generated from the contact form.
Reply to this email to respond directly to: ${email}
Submitted on: ${new Date().toLocaleString()}
    `.trim();

    const mailOptions: Mail.Options = {
      from: process.env.MY_EMAIL,
      replyTo: email,
      to: toEmail,
      cc: adminEmail ? adminEmail : undefined,
      subject: `[CONTACT FORM] ${subject}`,
      text: enhancedMessage,
    };
    
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
      message: 'Contact form submitted successfully',
      timestamp: new Date().toISOString(),
      submitter: {
        name: fullName,
        email: email,
        organization: organization || null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}