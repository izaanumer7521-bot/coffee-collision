import { useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../i18n/LangContext.jsx';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api('/contact', { method: 'POST', body: form });
      setStatus({ type: 'ok', text: d.message });
      setForm({ name: '', email: '', message: '' });
    } catch (err) { setStatus({ type: 'err', text: err.message }); }
  };
  return (
    <section className="page light narrow">
      <h1>{t('contact')}</h1>
      <form className="form" onSubmit={submit}>
        <label>{t('name')}<input value={form.name} onChange={set('name')} required /></label>
        <label>{t('email')}<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>{t('message')}<textarea rows="5" value={form.message} onChange={set('message')} required /></label>
        {status.text && <p className={status.type === 'ok' ? 'form-ok' : 'form-error'}>{status.text}</p>}
        <button className="btn dark" type="submit">{t('sendMessage')}</button>
      </form>
    </section>
  );
}
