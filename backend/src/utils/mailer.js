const ApiError = require('./ApiError');

// Transactional email through Mailjet's Send API v3.1 (https://dev.mailjet.com/email/guides/send-api-v31/).
// Needs MAILJET_API_KEY, MAILJET_SECRET_KEY and MAIL_FROM_EMAIL (a sender verified in Mailjet);
// MAIL_FROM_NAME is optional.
async function sendMail({ to, subject, text, html }) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const fromEmail = process.env.MAIL_FROM_EMAIL;

  if (!apiKey || !secretKey || !fromEmail) {
    // Render sets RENDER=true on its services, so a missing NODE_ENV there still counts as production.
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.error('Email not sent: MAILJET_API_KEY, MAILJET_SECRET_KEY or MAIL_FROM_EMAIL is not set');
      throw new ApiError(503, 'Email service is not configured. Please try again later.');
    }
    // Local development without Mailjet: print the email instead of sending it.
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString('base64')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: fromEmail, Name: process.env.MAIL_FROM_NAME || 'StackPrep' },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  }).catch((err) => {
    console.error('Mailjet request failed:', err.message);
    return null;
  });

  const body = res ? await res.json().catch(() => null) : null;
  const status = body?.Messages?.[0]?.Status;
  if (!res || !res.ok || status !== 'success') {
    if (res) console.error(`Mailjet responded ${res.status}: ${JSON.stringify(body)}`);
    throw new ApiError(502, 'Could not send the email. Please try again in a moment.');
  }
  const sent = body.Messages[0].To?.[0] || {};
  console.log(`[mail] accepted by Mailjet for ${maskEmail(to)} from ${fromEmail} (MessageID ${sent.MessageID}, UUID ${sent.MessageUUID})`);
}

// a***@gmail.com: enough to recognise in logs without writing the full address.
const maskEmail = (email) => String(email).replace(/^(.)[^@]*/, '$1***');

module.exports = { sendMail, maskEmail };
