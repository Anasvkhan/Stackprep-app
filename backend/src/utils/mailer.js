const ApiError = require('./ApiError');

// Transactional email. Two providers, picked by which variables are set:
//   EmailJS  (sends from your own Gmail): EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
//            EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY  -> https://www.emailjs.com/docs/rest-api/send/
//   Mailjet: MAILJET_API_KEY, MAILJET_SECRET_KEY, MAIL_FROM_EMAIL (verified sender)
// EmailJS wins when both are configured. MAIL_FROM_NAME is optional.

const EMAILJS_VARS = ['EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_PRIVATE_KEY'];
const MAILJET_VARS = ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'MAIL_FROM_EMAIL'];
const has = (vars) => vars.every((k) => process.env[k]);

function provider() {
  if (has(EMAILJS_VARS)) return 'emailjs';
  if (has(MAILJET_VARS)) return 'mailjet';
  return null;
}

// a***@gmail.com: enough to recognise in logs without writing the full address.
const maskEmail = (email) => String(email).replace(/^(.)[^@]*/, '$1***');

const sendFailed = () => new ApiError(502, 'Could not send the email. Please try again in a moment.');

async function post(name, url, init) {
  const res = await fetch(url, { method: 'POST', ...init, signal: AbortSignal.timeout(15000) }).catch((err) => {
    console.error(`${name} request failed:`, err.message);
    return null;
  });
  if (!res) throw sendFailed();
  return res;
}

// `params` are extra values for the EmailJS template (e.g. {{code}}, {{to_name}}).
async function viaEmailJs({ to, subject, text, params }) {
  const res = await post('EmailJS', 'https://api.emailjs.com/api/v1.0/email/send', {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: to,
        subject,
        message: text,
        from_name: process.env.MAIL_FROM_NAME || 'StackPrep',
        ...params,
      },
    }),
  });
  const body = await res.text().catch(() => '');
  if (!res.ok) {
    console.error(`EmailJS responded ${res.status}: ${body}`);
    throw sendFailed();
  }
  console.log(`[mail] accepted by EmailJS for ${maskEmail(to)}`);
}

async function viaMailjet({ to, subject, text, html }) {
  const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');
  const res = await post('Mailjet', 'https://api.mailjet.com/v3.1/send', {
    headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: process.env.MAIL_FROM_EMAIL, Name: process.env.MAIL_FROM_NAME || 'StackPrep' },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.Messages?.[0]?.Status !== 'success') {
    console.error(`Mailjet responded ${res.status}: ${JSON.stringify(body)}`);
    throw sendFailed();
  }
  const sent = body.Messages[0].To?.[0] || {};
  console.log(`[mail] accepted by Mailjet for ${maskEmail(to)} (MessageID ${sent.MessageID})`);
}

async function sendMail(mail) {
  const p = provider();
  if (p === 'emailjs') return viaEmailJs(mail);
  if (p === 'mailjet') return viaMailjet(mail);

  // Render sets RENDER=true on its services, so a missing NODE_ENV there still counts as production.
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    console.error('Email not sent: no email provider configured (EmailJS or Mailjet variables missing)');
    throw new ApiError(503, 'Email service is not configured. Please try again later.');
  }
  // Local development without a provider: print the email instead of sending it.
  console.log(`[mail:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
}

/// Startup summary for the logs: provider name only, never key values.
function describeMailConfig() {
  const p = provider();
  if (p === 'emailjs') return '[mail] using EmailJS';
  if (p === 'mailjet') return `[mail] using Mailjet, sender ${process.env.MAIL_FROM_EMAIL}`;
  const missingJs = EMAILJS_VARS.filter((k) => !process.env[k]);
  return `[mail] NOT configured. For EmailJS set: ${missingJs.join(', ')}`;
}

module.exports = { sendMail, maskEmail, describeMailConfig };
