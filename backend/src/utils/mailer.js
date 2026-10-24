const ApiError = require('./ApiError');

// Transactional email through Brevo's HTTP API (https://developers.brevo.com/reference/sendtransacemail).
// Needs BREVO_API_KEY and MAIL_FROM_EMAIL (a sender verified in Brevo); MAIL_FROM_NAME is optional.
async function sendMail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.MAIL_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Email not sent: BREVO_API_KEY or MAIL_FROM_EMAIL is not set');
      throw new ApiError(503, 'Email service is not configured. Please try again later.');
    }
    // Local development without Brevo: print the email instead of sending it.
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: fromEmail, name: process.env.MAIL_FROM_NAME || 'StackPrep' },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15000),
  }).catch((err) => {
    console.error('Brevo request failed:', err.message);
    return null;
  });

  if (!res || !res.ok) {
    if (res) console.error(`Brevo responded ${res.status}: ${await res.text().catch(() => '')}`);
    throw new ApiError(502, 'Could not send the email. Please try again in a moment.');
  }
}

module.exports = { sendMail };
