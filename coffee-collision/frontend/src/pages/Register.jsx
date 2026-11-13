import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { await register(form.name, form.email, form.password); nav('/'); }
    catch (err) { setError(err.message); }
  };
  return (
    <section className="page dark narrow">
      <h1>Create account</h1>
      <form className="form" onSubmit={submit}>
        <label>Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Password (6+ characters)<input type="password" minLength="6" value={form.password} onChange={set('password')} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit">Create account</button>
        <p className="alt">Have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </section>
  );
}
