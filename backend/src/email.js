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

const statusMessages = {
  processing:
    "Great news! We've started preparing your order. Our team is carefully packing your products and it will be on its way soon.",
  shipped:
    'Your order is on its way! It has been shipped and is heading to your delivery address. You should receive it within the next few business days.',
  delivered:
    'Your order has been delivered! We hope you enjoy your products. If you have any questions, feel free to reach out.',
  cancelled:
    'Your order has been cancelled. If you did not request this or have any questions, please contact our support team.',
};

const statusSubjects = {
  processing: 'Your order is being prepared',
  shipped: 'Your order is on its way',
  delivered: 'Your order has been delivered',
  cancelled: 'Your order has been cancelled',
};

function buildItemsTable(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px 12px; text-align: left; color: #666; font-weight: 600;">Product</th>
          <th style="padding: 10px 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; color: #666; font-weight: 600;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function sendOrderStatusEmail(
  to,
  { name, status, total, items, shippingAddress, orderDate },
) {
  const apiKey = process.env.RESEND_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const message =
    statusMessages[status] || `The status has been updated to ${status}.`;
  const subject =
    statusSubjects[status] || `Order update — status changed to ${status}`;

  const statusColor =
    status === 'cancelled'
      ? '#dc2626'
      : status === 'delivered'
        ? '#16a34a'
        : '#d97706';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">NutriShop</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #111; margin: 0 0 8px;">Hi ${name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 24px;">${message}</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666;">Status</td>
              <td style="padding: 6px 0; text-align: right;">
                <span style="background: ${statusColor}; color: #fff; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${statusLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Order placed</td>
              <td style="padding: 6px 0; text-align: right; color: #111;">${orderDate ? formatDate(orderDate) : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Shipping to</td>
              <td style="padding: 6px 0; text-align: right; color: #111;">${shippingAddress || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-weight: 600;">Total</td>
              <td style="padding: 6px 0; text-align: right; color: #111; font-weight: 700; font-size: 16px;">${total}</td>
            </tr>
          </table>
        </div>
        ${buildItemsTable(items)}
        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="${frontendUrl}/profile" style="background: #16a34a; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px;">
            View My Orders
          </a>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">NutriShop — Premium nutrition products for athletes and health enthusiasts</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">You received this email because you placed an order on NutriShop.</p>
      </div>
    </div>
  `;

  const itemsList = (items || [])
    .map(
      (i) =>
        `  - ${i.name} x${i.quantity} — $${parseFloat(i.price).toFixed(2)}`,
    )
    .join('\n');

  const text = `Hi ${name},\n\n${message}\n\nStatus: ${statusLabel}\nTotal: ${total}\n${itemsList ? `\nItems:\n${itemsList}\n` : ''}\nView your orders: ${frontendUrl}/profile`;

  if (!apiKey) {
    console.log(`[EMAIL] Order status (${status}) — email to ${to}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NutriShop <onboarding@resend.dev>',
    to,
    subject,
    html,
    text,
  });

  console.log(`[EMAIL] Order status email sent to ${to}`);
}

async function sendNewOrderEmail(
  to,
  { name, total, customerName, customerEmail, items, shippingAddress },
) {
  const apiKey = process.env.RESEND_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">NutriShop</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #111; margin: 0 0 8px;">Hi ${name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 24px;">A new order has just been placed and needs your attention.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666;">Customer</td>
              <td style="padding: 6px 0; text-align: right; color: #111;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Email</td>
              <td style="padding: 6px 0; text-align: right; color: #111;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Shipping to</td>
              <td style="padding: 6px 0; text-align: right; color: #111;">${shippingAddress || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-weight: 600;">Total</td>
              <td style="padding: 6px 0; text-align: right; color: #111; font-weight: 700; font-size: 16px;">$${total}</td>
            </tr>
          </table>
        </div>
        ${buildItemsTable(items)}
        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="${frontendUrl}/manager" style="background: #16a34a; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px;">
            Manage Orders
          </a>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">NutriShop — Premium nutrition products for athletes and health enthusiasts</p>
      </div>
    </div>
  `;

  const itemsList = (items || [])
    .map(
      (i) =>
        `  - ${i.name} x${i.quantity} — $${parseFloat(i.price).toFixed(2)}`,
    )
    .join('\n');

  const text = `Hi ${name},\n\nA new order has been placed by ${customerName} (${customerEmail}).\n\nTotal: $${total}\nShipping to: ${shippingAddress || 'N/A'}\n${itemsList ? `\nItems:\n${itemsList}\n` : ''}\nManage orders: ${frontendUrl}/manager`;

  if (!apiKey) {
    console.log(
      `[EMAIL] New order ($${total}) by ${customerName} — email to ${to}`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NutriShop <onboarding@resend.dev>',
    to,
    subject: `New order from ${customerName} — $${total}`,
    html,
    text,
  });

  console.log(`[EMAIL] New order email sent to ${to}`);
}

module.exports = {
  sendVerificationEmail,
  sendOrderStatusEmail,
  sendNewOrderEmail,
};
