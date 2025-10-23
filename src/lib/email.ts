import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendOrderConfirmationEmail(
  to: string,
  orderData: {
    orderNumber: string
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    tax: number
    total: number
    pickupTime?: Date
    qrCode: string
  }
) {
  const qrCodeImage = await QRCode.toDataURL(orderData.qrCode)

  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e6e0db;">${item.quantity} x ${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e6e0db; text-align: right;">${item.price.toFixed(2)}€</td>
    </tr>
  `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Epilogue', Arial, sans-serif; line-height: 1.6; color: #181411; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background-color: #f8f7f6; }
    .logo { font-size: 24px; font-weight: bold; color: #ec7f13; }
    .content { padding: 20px; background-color: white; }
    .qr-code { text-align: center; margin: 30px 0; }
    .qr-code img { width: 200px; height: 200px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .total-row { font-weight: bold; font-size: 18px; }
    .footer { text-align: center; padding: 20px; color: #897561; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🥖 Boulangerie</div>
      <h1>Merci pour votre commande !</h1>
    </div>
    
    <div class="content">
      <p>Bonjour,</p>
      <p>Votre commande #${orderData.orderNumber} a bien été enregistrée.</p>
      
      <h2>Récapitulatif de la commande</h2>
      <table class="table">
        ${itemsHtml}
        <tr>
          <td style="padding: 8px;">Sous-total</td>
          <td style="padding: 8px; text-align: right;">${orderData.subtotal.toFixed(2)}€</td>
        </tr>
        <tr>
          <td style="padding: 8px;">TVA</td>
          <td style="padding: 8px; text-align: right;">${orderData.tax.toFixed(2)}€</td>
        </tr>
        <tr class="total-row">
          <td style="padding: 12px; border-top: 2px solid #181411;">Total</td>
          <td style="padding: 12px; border-top: 2px solid #181411; text-align: right;">${orderData.total.toFixed(2)}€</td>
        </tr>
      </table>
      
      ${orderData.pickupTime ? `<p><strong>Heure de retrait estimée :</strong> ${new Date(orderData.pickupTime).toLocaleString('fr-FR')}</p>` : ''}
      
      <div class="qr-code">
        <h3>QR Code de retrait</h3>
        <p>Présentez ce QR code lors du retrait de votre commande</p>
        <img src="${qrCodeImage}" alt="QR Code" />
      </div>
      
      <p style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #ec7f13; margin: 20px 0;">
        <strong>Important :</strong> Conservez cet email. Le QR code sera scanné lors du retrait de votre commande pour mettre à jour automatiquement notre stock.
      </p>
    </div>
    
    <div class="footer">
      <p>Boulangerie - 123 Rue du Pain<br>Merci de votre confiance !</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Confirmation de commande #${orderData.orderNumber}`,
    html,
  })
}
