import React, { useState } from 'react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('send-failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '', company: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <h2 className="contact-heading">Get in touch</h2>
      <p className="contact-lead">
        Have a question, an idea, or just want to say hello? Drop a note below and
        I'll get back to you.
      </p>

      <form className="contact-card" onSubmit={handleSubmit}>
        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            required
            value={form.message}
            onChange={update('message')}
            placeholder="Write your message…"
            rows={6}
          />
        </div>

        {/* Honeypot — hidden from humans, catches bots. */}
        <div className="contact-hp" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input
            id="contact-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={update('company')}
          />
        </div>

        <div className="contact-actions">
          <button type="submit" className="contact-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {status === 'sent' && (
            <span className="contact-status is-ok">Thanks — your message is on its way.</span>
          )}
          {status === 'error' && (
            <span className="contact-status is-error">
              Something went wrong. Email me directly at{' '}
              <a href="mailto:paudela@union.edu">paudela@union.edu</a>.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactPage;
