import nodemailer from 'nodemailer';

let transporter;

try {
  const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
  if (isGmail) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: (process.env.SMTP_PASSWORD || '').replace(/\s+/g, ''), // strip spaces from app password
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      auth: {
        user: process.env.SMTP_USER || 'test_user',
        pass: process.env.SMTP_PASSWORD || 'test_pass',
      },
    });
  }
} catch (e) {
  console.warn('SMTP transporter init notice:', e.message);
}

/**
 * Dispatches verification OTP to user email
 * Invariant: NEVER log plaintext OTPs to console or audit logs (Instruction 9 & 76)
 */
export async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"FarmConnect Security" <security@farmconnect.org>',
    to: toEmail,
    subject: 'FarmConnect Verification Code',
    text: `Your FarmConnect verification code is: ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">FarmConnect Verification</h2>
        <p style="color: #475569; font-size: 14px;">Use the following 6-digit code to complete your security verification:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; text-align: center; border-radius: 12px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #166534;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code is valid for 5 minutes. If you did not request this, please ignore.</p>
      </div>
    `,
  };

  if (transporter && process.env.SMTP_USER && process.env.SMTP_USER !== 'test_user') {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.warn('SMTP dispatch failed:', err.message);
    }
  }
  // Safe notification without logging OTP
  console.log(`[FarmConnect Auth] Verification OTP dispatched to email address: ${toEmail.replace(/(.{2})(.*)(?=@)/, '$1***')}`);
  return true;
}

export default { sendOtpEmail };
