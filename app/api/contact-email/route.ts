// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
    
//     const fullName = formData.get('fullName') as string;
//     const email = formData.get('email') as string;
//     const organization = formData.get('organization') as string;
//     const subject = formData.get('subject') as string;
//     const message = formData.get('message') as string;
    
//     if (!fullName || !email || !subject || !message) {
//       return NextResponse.json(
//         { error: 'Missing required fields: fullName, email, subject, and message are required' },
//         { status: 400 }
//       );
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { error: 'Invalid email format' },
//         { status: 400 }
//       );
//     }
  
//     const transport = nodemailer.createTransport({
//          service: 'gmail', 
//          auth: {
//            user: process.env.MY_EMAIL, 
//            pass: process.env.MY_PASSWORD,
//          },
//        });
    
//     const toEmail = process.env.MY_EMAIL;
//     const adminEmail = process.env.ADMIN_EMAIL;

//     const enhancedMessage = `
// CONTACT FORM SUBMISSION

// Name: ${fullName}
// Email: ${email}
// Organization: ${organization || 'Not specified'}
// Subject: ${subject}

// Message:
// ${message}

// ---
// This email was automatically generated from the contact form.
// Reply to this email to respond directly to: ${email}
// Submitted on: ${new Date().toLocaleString()}
//     `.trim();

//     const mailOptions: Mail.Options = {
//       from: process.env.MY_EMAIL,
//       replyTo: email,
//       to: toEmail,
//       cc: adminEmail ? adminEmail : undefined,
//       subject: `[CONTACT FORM] ${subject}`,
//       text: enhancedMessage,
//     };
    
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
//       message: 'Contact form submitted successfully',
//       timestamp: new Date().toISOString(),
//       submitter: {
//         name: fullName,
//         email: email,
//         organization: organization || null
//       }
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to send message. Please try again later.' },
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
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const acknowledgmentOptions: Mail.Options = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: 'Thank You for Contacting Us - Message Received',
      text: `Dear ${fullName},

Thank you for reaching out to the Health Benefits and Tariffs Advisory Panel. We have successfully received your message and appreciate you taking the time to contact us.

Your message regarding "${subject}" has been forwarded to the appropriate team member who will review your inquiry. We strive to respond to all messages in a timely manner, and you can expect to hear back from us as soon as possible.

If your matter is urgent or requires immediate attention, please don't hesitate to contact us directly through our main office line.

We value your communication and look forward to assisting you.

Best regards,
Health Benefits and Tariffs Advisory Panel Team

---
This is an automated confirmation email.
Your message: "${subject}"
Submitted on: ${new Date().toLocaleDateString('en-KE', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})} at ${new Date().toLocaleTimeString('en-KE')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0; margin: 0; font-size: 24px;">Thank You for Contacting Us</h1>
              <div style="width: 50px; height: 3px; background-color: #2c5aa0; margin: 10px auto;"></div>
            </div>
            
            <p style="color: #333; line-height: 1.6;">Dear <strong>${fullName}</strong>,</p>
            
            <p style="color: #333; line-height: 1.6;">Thank you for reaching out to the <strong>Health Benefits and Tariffs Advisory Panel</strong>. We have successfully received your message and appreciate you taking the time to contact us.</p>
            
            <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
              <p style="margin: 0; color: #2c5aa0; font-weight: bold;">Message Confirmed:</p>
              <p style="margin: 5px 0 0 0; color: #333;">"${subject}"</p>
            </div>
            
            <p style="color: #333; line-height: 1.6;">Your message has been forwarded to the appropriate team member who will review your inquiry. We strive to respond to all messages in a timely manner, and you can expect to hear back from us within <strong>3-5 business days</strong>.</p>
            
            <p style="color: #333; line-height: 1.6;">If your matter is urgent or requires immediate attention, please don't hesitate to contact us directly through our main office line.</p>
            
            <p style="color: #333; line-height: 1.6;">We value your communication and look forward to assisting you.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #2c5aa0; font-weight: bold; margin-bottom: 5px;">Best regards,</p>
              <p style="color: #333; font-weight: bold;">Benefits Package  and Tariffs Advisory Panel Team</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 30px; font-size: 12px; color: #666;">
              <p style="margin: 0 0 5px 0;"><strong>Submission Details:</strong></p>
              <p style="margin: 2px 0;">• Contact: ${fullName} (${email})</p>
              ${organization ? `<p style="margin: 2px 0;">• Organization: ${organization}</p>` : ''}
              <p style="margin: 2px 0;">• Subject: "${subject}"</p>
              <p style="margin: 2px 0;">• Submitted: ${new Date().toLocaleDateString('en-KE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at ${new Date().toLocaleTimeString('en-KE')}</p>
              <p style="margin: 5px 0 0 0; font-style: italic;">This is an automated confirmation email.</p>
            </div>
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
    
    await sendAcknowledgmentPromise();
    
    return NextResponse.json({ 
      message: 'Contact form submitted successfully and acknowledgment sent',
      timestamp: new Date().toISOString(),
      acknowledgmentSent: true,
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