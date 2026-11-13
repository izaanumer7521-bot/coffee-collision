import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const u = await login(form.email, form.password); nav(u.role === 'admin' ? '/admin' : '/'); }
    catch (err) { setError(err.message); }
  };
  return (
    <section className="page dark narrow">
      <h1>Sign in</h1>
      <form className="form" onSubmit={submit}>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit">Sign in</button>
        <p className="alt">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
