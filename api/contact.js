// Contact form → email via Resend REST API (zero npm deps, matches api/*.js pattern).
// Required env: RESEND_API_KEY. Optional: CONTACT_TO (defaults below).

const TO = process.env.CONTACT_TO || 'avigyapaudel045@gmail.com';
const FROM = process.env.CONTACT_FROM || 'Portfolio Contact <onboarding@resend.dev>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'not-configured' });
  }

  const body = req.body || {};

  // Honeypot: bots fill hidden fields. Pretend success and drop silently.
  if (clean(body.company, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid-email' });
  }
  if (!message) {
    return res.status(400).json({ error: 'empty-message' });
  }

  const who = name || 'Someone';
  const text =
    `From: ${name || '(no name)'} <${email}>\n\n` +
    `${message}\n\n` +
    `— sent via the contact form on avigyapaudel.com`;
  const html =
    `<p><strong>From:</strong> ${escapeHtml(name) || '(no name)'} ` +
    `&lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>` +
    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>` +
    `<hr><p style="color:#888;font-size:13px">sent via the contact form on avigyapaudel.com</p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New message from ${who} via avigyapaudel.com`,
        text,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ error: 'send-failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error', err);
    return res.status(502).json({ error: 'send-failed' });
  }
};
