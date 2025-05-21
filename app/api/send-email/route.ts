// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
    
//     const to = formData.get('to') as string;
//     const subject = formData.get('subject') as string;
//     const body = formData.get('body') as string;
//     const attachment = formData.get('attachment') as Blob;
    
//     if (!to || !subject || !body || !attachment) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
    

//     const buffer = Buffer.from(await attachment.arrayBuffer());
//     const filename = formData.get('filename') as string || 'intervention_proposal.pdf';

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//       port: parseInt(process.env.EMAIL_PORT || '587'),
//       secure: process.env.EMAIL_SECURE === 'true',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
    
//     const mailOptions: Mail.Options = {
//       from: process.env.EMAIL_FROM || 'noreply@cema.africa',
//       to,
//       subject,
//       text: body,
//       attachments: [
//         {
//           filename,
//           content: buffer,
//           contentType: 'application/pdf',
//         },
//       ],
//     };
    
//     const info = await transporter.sendMail(mailOptions);
    
//     return NextResponse.json(
//       {
//         message: 'Email sent successfully',
//         messageId: info.messageId,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error sending email:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to send email' },
//       { status: 500 }
//     );
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the multipart form data
//     const formData = await request.formData();
    
//     // Get form values
//     const to = formData.get('to') as string;
//     const subject = formData.get('subject') as string;
//     const body = formData.get('body') as string;
//     const attachment = formData.get('attachment') as Blob;
    
//     console.log('Email request received:', {
//       to,
//       subject,
//       bodyPreview: body?.substring(0, 50),
//       hasAttachment: !!attachment
//     });
    
//     // Validate form data
//     if (!to || !subject || !body) {
//       console.error('Missing required fields');
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
    
//     // Setup the email transport with Gmail service
//     const transport = nodemailer.createTransport({
//       service: 'gmail', // Using 'gmail' service preset
//       auth: {
//         user: process.env.MY_EMAIL, // Your Gmail address
//         pass: process.env.MY_PASSWORD, // Your app password (from app named "Test")
//       },
//     });
    
//     // Configure email options
//     const mailOptions: Mail.Options = {
//       from: process.env.MY_EMAIL,
//       to,
//       subject,
//       text: body,
//     };
    
//     // Add attachment if provided
//     if (attachment) {
//       try {
//         // Convert attachment to Buffer
//         const buffer = Buffer.from(await attachment.arrayBuffer());
//         const filename = 'intervention_proposal.pdf';
        
//         mailOptions.attachments = [
//           {
//             filename,
//             content: buffer,
//             contentType: 'application/pdf',
//           },
//         ];
        
//         console.log('PDF attachment processed');
//       } catch (attachmentError) {
//         console.error('Error processing attachment:', attachmentError);
//       }
//     }
    
//     // Send email using Promise-based approach
//     const sendMailPromise = () => new Promise<string>((resolve, reject) => {
//       transport.sendMail(mailOptions, function (err, info) {
//         if (!err) {
//           console.log('Email sent successfully:', info.messageId);
//           resolve('Email sent');
//         } else {
//           console.error('Error sending email:', err);
//           reject(err.message);
//         }
//       });
//     });
    
//     // Send the email
//     await sendMailPromise();
    
//     return NextResponse.json({ 
//       message: 'Email sent successfully' 
//     });
//   } catch (error) {
//     console.error('Error in email API:', error);
    
//     return NextResponse.json(
//       { error:  'Failed to send email ... h' },
//       { status: 500 }
//     );
//   }
// }







// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the multipart form data
//     const formData = await request.formData();

//     // Get form values
//     const to = formData.get('to') as string;
//     const subject = formData.get('subject') as string;
//     const body = formData.get('body') as string;
//     const attachment = formData.get('attachment') as Blob;

//     console.log('Email request received:', {
//       to,
//       subject,
//       bodyPreview: body?.substring(0, 50),
//       hasAttachment: !!attachment
//     });

//     // Validate form data
//     if (!to || !subject || !body) {
//       console.error('Missing required fields');
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Setup the email transport with Gmail service
//     const transport = nodemailer.createTransport({
//       service: 'gmail', // Using 'gmail' service preset
//       auth: {
//         user: process.env.MY_EMAIL, // Your Gmail address
//         pass: process.env.MY_PASSWORD, // Your app password (from app named "Test")
//       },
//     });

//     // Configure email options
//     const mailOptions: Mail.Options = {
//       from: process.env.MY_EMAIL,
//       to,
//       subject,
//       text: body,
//     };

//     // Add attachment if provided
//     if (attachment) {
//       try {
//         // Convert attachment to Buffer
//         const buffer = Buffer.from(await attachment.arrayBuffer());
//         const filename = 'intervention_proposal.pdf';

//         mailOptions.attachments = [
//           {
//             filename,
//             content: buffer,
//             contentType: 'application/pdf',
//           },
//         ];

//         console.log('PDF attachment processed');
//       } catch (attachmentError) {
//         console.error('Error processing attachment:', attachmentError);
//       }
//     }

//     // Send email using Promise-based approach
//     const sendMailPromise = () => new Promise<string>((resolve, reject) => {
//       transport.sendMail(mailOptions, function (err, info) {
//         if (!err) {
//           console.log('Email sent successfully:', info.messageId);
//           resolve('Email sent');
//         } else {
//           console.error('Error sending email:', err);
//           reject(err.message);
//         }
//       });
//     });

//     // Send the email
//     await sendMailPromise();

//     return NextResponse.json({ 
//       message: 'Email sent successfully' 
//     });
//   } catch (error) {
//     console.error('Error in email API:', error);

//     return NextResponse.json(
//       { error:  'Failed to send email ... h' },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';

// export async function POST(request: NextRequest) {
//   try {

//     const formData = await request.formData();
    
//     const to = formData.get('to') as string;
//     const subject = formData.get('subject') as string;
//     const body = formData.get('body') as string;
//     const attachment = formData.get('attachment') as Blob;
    

//     if (!to || !subject || !body) {
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
    
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.MY_EMAIL;
    
//     const mailOptions: Mail.Options = {
//       from: process.env.MY_EMAIL,
//       to,
//       cc: adminEmail,
//       subject,
//       text: body,
//     };
    
//     if (attachment) {
//       try {
//         const buffer = Buffer.from(await attachment.arrayBuffer());
//         const filename = 'intervention_proposal.pdf';
        
//         mailOptions.attachments = [
//           {
//             filename,
//             content: buffer,
//             contentType: 'application/pdf',
//           },
//         ];
        
//         console.log('PDF attachment processed');
//       } catch (attachmentError) {
//         console.error('Error processing attachment:', attachmentError);
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
//       message: 'Email sent successfully' 
//     });
//   } catch (error) {
//     // console.error('Error in email API:', error);
    
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
    
    const fromEmail = formData.get('from') as string; 
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const attachment = formData.get('attachment') as Blob;
    

    if (!fromEmail || !subject || !body) {
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
    
    const toEmail = process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || process.env.MY_EMAIL;
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MY_EMAIL;
    
  
    const mailOptions: Mail.Options = {
      from: `"< ${fromEmail}  || 'Form Submission'}" `,
      replyTo: fromEmail,
      to: toEmail,
      cc: adminEmail,
      subject,
      text: `From: ${fromEmail}\n\n${body}`,
    };
    
    if (attachment) {
      try {
        const buffer = Buffer.from(await attachment.arrayBuffer());
        const filename = formData.get('filename') as string || 'intervention_proposal.pdf';
        
        mailOptions.attachments = [
          {
            filename,
            content: buffer,
            contentType: 'application/pdf',
          },
        ];
      } catch (attachmentError) {
        console.error('Error processing attachment:', attachmentError);
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
      message: 'Email sent successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}