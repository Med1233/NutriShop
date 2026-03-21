const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });
}

async function sendVerificationEmail(to, token, name) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; margin: 0;">NutriShop</h1>
      </div>
      <h2 style="color: #111;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background: #16a34a; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
    </div>
  `;

  const transport = createTransport();

  if (!transport) {
    console.log('[EMAIL] SMTP not configured. Verification link:', verifyUrl);
    return;
  }

  await transport.sendMail({
    from: `NutriShop <${from}>`,
    to,
    subject: 'Verify your NutriShop email',
    html,
    text: `Hi ${name}, verify your email: ${verifyUrl} (expires in 24 hours)`,
  });

  console.log(`[EMAIL] Verification email sent to ${to}`);
}

module.exports = { sendVerificationEmail };
