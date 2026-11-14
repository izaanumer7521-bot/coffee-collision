import { useCallback, useEffect, useState } from 'react';
import { api, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, ConfirmModal, Empty, Icon, PageHead, useToast } from './ui.jsx';

export default function Messages() {
  const { token } = useAuth();
  const toast = useToast();
  const [list, setList] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => { api('/contact', { token }).then(setList).catch((e) => setError(e.message)); }, [token]);
  useEffect(load, [load]);
  const remove = async () => {
    try { await api(`/contact/${deleting._id}`, { method: 'DELETE', token }); toast('Message deleted'); }
    catch (e) { toast(e.message, 'err'); }
    setDeleting(null); load();
  };
  return (
    <div className="a-stack">
      <PageHead title="Messages" sub="Messages sent from the Contact page." />
      <Card>
        {error && <p className="a-error">{error}</p>}
        {!list ? <div className="a-skel tall" /> : list.length === 0 ? <Empty icon="mail" text="No messages yet." /> : (
          <ul className="a-list big">
            {list.map((m) => (
              <li key={m._id}>
                <span className="a-ev-ico"><Icon name="mail" size={18} /></span>
                <div className="grow">
                  <b>{m.name} <a className="a-link" href={`mailto:${m.email}`}>{m.email}</a></b>
                  <small className="msg">{m.message}</small>
                  <small>{timeAgo(m.createdAt)}</small>
                </div>
                <button className="a-icon danger" aria-label="Delete message" onClick={() => setDeleting(m)}><Icon name="trash" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {deleting && <ConfirmModal title="Delete message?" text={`The message from ${deleting.name} will be removed.`} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </div>
  );
}
