const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 [Email Skipped - No SMTP config]\nTo: ${to}\nSubject: ${subject}\n${text}`)
      return
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"LabLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #007fd4, #0ca1ee); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🧪 LabLink</h1>
          </div>
          <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
            <pre style="font-family: inherit; white-space: pre-wrap; color: #374151; line-height: 1.6;">${text}</pre>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
            © ${new Date().getFullYear()} LabLink. All rights reserved.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Email error:', err.message)
  }
}

module.exports = { sendEmail }
