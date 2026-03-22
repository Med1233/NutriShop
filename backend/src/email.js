const { Resend } = require('resend');

async function sendVerificationEmail(to, token, name) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  const apiKey = process.env.RESEND_API_KEY;

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

  if (!apiKey) {
    console.log('[EMAIL] Resend not configured. Verification link:', verifyUrl);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NutriShop <onboarding@resend.dev>',
    to,
    subject: 'Verify your NutriShop email',
    html,
    text: `Hi ${name}, verify your email: ${verifyUrl} (expires in 24 hours)`,
  });

  console.log(`[EMAIL] Verification email sent to ${to}`);
}

const statusLabels = {
  processing: 'is now being processed',
  shipped: 'has been shipped',
  delivered: 'has been delivered',
  cancelled: 'has been cancelled',
};

async function sendOrderStatusEmail(to, { name, orderId, status, total }) {
  const apiKey = process.env.RESEND_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const label = statusLabels[status] || `status changed to ${status}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; margin: 0;">NutriShop</h1>
      </div>
      <h2 style="color: #111;">Order #${orderId} ${label}</h2>
      <p>Hi ${name},</p>
      <p>Your order <strong>#${orderId}</strong> (${total}) ${label}.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${frontendUrl}/profile" style="background: #16a34a; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          View My Orders
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">NutriShop — Premium nutrition products</p>
    </div>
  `;

  if (!apiKey) {
    console.log(`[EMAIL] Order #${orderId} ${label} — email to ${to}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NutriShop <onboarding@resend.dev>',
    to,
    subject: `Order #${orderId} ${label}`,
    html,
    text: `Hi ${name}, your order #${orderId} (${total}) ${label}. View at ${frontendUrl}/profile`,
  });

  console.log(`[EMAIL] Order status email sent to ${to}`);
}

async function sendNewOrderEmail(to, { name, orderId, total, customerName }) {
  const apiKey = process.env.RESEND_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; margin: 0;">NutriShop</h1>
      </div>
      <h2 style="color: #111;">New Order #${orderId}</h2>
      <p>Hi ${name},</p>
      <p>A new order has been placed:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; color: #666;">Order</td><td style="padding: 8px; font-weight: bold;">#${orderId}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Customer</td><td style="padding: 8px;">${customerName}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Total</td><td style="padding: 8px; font-weight: bold;">$${total}</td></tr>
      </table>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${frontendUrl}/manager" style="background: #16a34a; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Manage Orders
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">NutriShop — Premium nutrition products</p>
    </div>
  `;

  if (!apiKey) {
    console.log(
      `[EMAIL] New order #${orderId} ($${total}) by ${customerName} — email to ${to}`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NutriShop <onboarding@resend.dev>',
    to,
    subject: `New Order #${orderId} — $${total}`,
    html,
    text: `Hi ${name}, new order #${orderId} by ${customerName} for $${total}. Manage at ${frontendUrl}/manager`,
  });

  console.log(`[EMAIL] New order email sent to ${to}`);
}

module.exports = {
  sendVerificationEmail,
  sendOrderStatusEmail,
  sendNewOrderEmail,
};
