// api/send-email.js - Vercel Serverless Function to send emails with attachments via Resend API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, pdfBase64, pdfFilename } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required parameters: to, subject, html' });
  }

  // Get Resend API Key from environment variables
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not configured.');
    return res.status(500).json({ error: 'Mail server credentials not configured. Please add RESEND_API_KEY to your environment variables.' });
  }

  try {
    const payload = {
      from: 'AYETEA Phone Discovery <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    };

    // If PDF attachment is provided, add it
    if (pdfBase64 && pdfFilename) {
      payload.attachments = [
        {
          filename: pdfFilename,
          content: pdfBase64,
        }
      ];
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Resend API');
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message });
  }
}
