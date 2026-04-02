const nodemailer = require('nodemailer');

// Configure email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Generate HTML email template for order confirmation
 * @param {Object} order - Order object with orderItems, totalPrice, etc.
 * @param {String} userName - User's name
 * @param {String} userEmail - User's email
 * @returns {String} HTML email template
 */
const generateOrderConfirmationHTML = (order, userName, userEmail) => {
  const orderItems = order.orderItems || [];
  const itemsHTML = orderItems
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 16px; text-align: left;">
        <div style="font-weight: 600; color: #111827;">${item.name}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Qty: ${item.quantity}</div>
        ${
          item.customization?.previewImage
            ? `<div style="margin-top: 8px;">
                <img src="cid:design-${item.id}" alt="Customized Design" style="max-width: 100px; max-height: 100px; border-radius: 8px; border: 1px solid #d1d5db;" />
              </div>`
            : ''
        }
      </td>
      <td style="padding: 16px; text-align: right;">
        <div style="font-weight: 600; color: #111827;">₹${(
        parseFloat(item.price) * item.quantity
      ).toLocaleString('en-IN')}</div>
      </td>
    </tr>
  `
    )
    .join('');

  const attachments = orderItems
    .filter((item) => item.customization?.previewImage)
    .map((item) => {
      // Convert data URL to buffer if necessary
      const imageData = item.customization.previewImage;
      const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        return {
          filename: `design-${item.id}.png`,
          content: Buffer.from(matches[2], 'base64'),
          cid: `design-${item.id}`,
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }
          .order-id { font-size: 24px; font-weight: 700; margin-top: 10px; }
          .section { margin-top: 24px; }
          .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          .summary { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .summary-row.total { font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">✓ Order Confirmed</h1>
            <div class="order-id">Order #${String(order.id).padStart(6, '0')}</div>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin: 0;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #6b7280; margin: 12px 0 0 0;">Thank you for your order! We've received your purchase and will start preparing it for shipment.</p>

            <!-- Order Items -->
            <div class="section">
              <h2 class="section-title">Order Items</h2>
              <table>
                ${itemsHTML}
              </table>
            </div>

            <!-- Order Summary -->
            <div class="section">
              <h2 class="section-title">Order Summary</h2>
              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>₹${(parseFloat(order.totalPrice) - parseFloat(order.shippingPrice || 0) - parseFloat(order.taxPrice || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>${parseFloat(order.shippingPrice || 0) === 0 ? 'FREE' : `₹${parseFloat(order.shippingPrice || 0).toLocaleString('en-IN')}`}</span>
                </div>
                <div class="summary-row">
                  <span>Tax</span>
                  <span>₹${(parseFloat(order.taxPrice || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>₹${parseFloat(order.totalPrice).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            ${
              order.shippingAddress
                ? `
              <div class="section">
                <h2 class="section-title">Shipping Address</h2>
                <p style="color: #374151; line-height: 1.6; margin: 0;">
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>
            `
                : ''
            }

            <!-- Payment Method -->
            <div class="section">
              <h2 class="section-title">Payment Status</h2>
              <div style="padding: 12px; border-radius: 8px; ${order.isPaid ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                ${order.isPaid ? '✓ Payment Received' : `⚠ Payment Pending (${order.paymentMethod || 'COD'})`}
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://localhost:5173'}/orders/${order.id}" class="button">
                Track Your Order
              </a>
            </div>
          </div>

          <div class="footer">
            <p>If you have any questions, please contact our support team at ${process.env.SUPPORT_EMAIL || 'support@example.com'}</p>
            <p>© ${new Date().getFullYear()} Shopping Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments,
  };
};

/**
 * Send order confirmation email
 * @param {String} userEmail - Recipient email
 * @param {String} userName - User's name
 * @param {Object} order - Order object
 */
const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured. Skipping email.');
      return true;
    }

    const { html, attachments } = generateOrderConfirmationHTML(order, userName, userEmail);

    const mailOptions = {
      from: `"Shopping Store" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - #${String(order.id).padStart(6, '0')}`,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Order confirmation email sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error.message);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  generateOrderConfirmationHTML,
};
