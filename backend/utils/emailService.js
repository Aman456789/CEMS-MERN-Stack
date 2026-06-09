const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

const verificationEmailTemplate = (fullName, verificationUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4F46E5;">Welcome to CEMS, ${fullName}!</h2>
    <p>Please verify your institutional email address to activate your account.</p>
    <a href="${verificationUrl}" 
       style="display:inline-block; padding:12px 24px; background:#4F46E5; color:#fff; 
              border-radius:6px; text-decoration:none; font-weight:bold;">
      Verify My Account
    </a>
    <p style="color:#6B7280; font-size:13px; margin-top:20px;">
      This link expires in 24 hours. If you did not register on CEMS, ignore this email.
    </p>
  </div>
`;

module.exports = { sendEmail, verificationEmailTemplate };