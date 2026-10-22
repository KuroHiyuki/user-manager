import { useEffect, useMemo, useState } from 'react';
import './App.css';

const api = '/api/users';

const STATUS_MESSAGES = {
  400: 'Vui lòng nhập đầy đủ tên và email.',
  404: 'Không tìm thấy user, có thể đã bị xóa trước đó.',
  409: 'Email này đã tồn tại.',
};

const ICONS = {
  users:
    'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z',
  trash:
    'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  alert:
    'M12 8v5M12 16.5v.01M10.3 3.9L2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  close: 'M6 6l12 12M18 6L6 18',
};

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Không kết nối được tới server.');
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(STATUS_MESSAGES[res.status] || data.error || 'Có lỗi xảy ra, thử lại sau.');
  }
  return data;
}

// SQLite CURRENT_TIMESTAMP trả về "YYYY-MM-DD HH:MM:SS" theo UTC
const parseDate = (value) => new Date(`${value.replace(' ', 'T')}Z`);

const formatDate = (value) =>
  parseDate(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const initials = (name) => {
  const words = name.trim().split(/\s+/);
  const first = words[0][0];
  return (words.length > 1 ? first + words[words.length - 1][0] : first).toUpperCase();
};

const hueOf = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);

function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Avatar({ user }) {
  return (
    <span className="avatar" style={{ '--hue': hueOf(user.email) }} aria-hidden="true">
      {initials(user.name)}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const reload = async () => setUsers(await request(api));

  useEffect(() => {
    request(api)
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: users.length,
      today: users.filter((u) => parseDate(u.created_at).toDateString() === today).length,
      domains: new Set(users.map((u) => u.email.split('@')[1]?.toLowerCase())).size,
    };
  }, [users]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await request(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });
      setForm({ name: '', email: '' });
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    setError('');
    setDeletingId(id);
    try {
      await request(`${api}/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="app">
      <header className="header">
        <div className="logo">
          <Icon name="users" />
        </div>
        <div>
          <h1>Quản lý user</h1>
          <p className="subtitle">Thêm, tìm kiếm và xóa người dùng trong hệ thống</p>
        </div>
      </header>

      <section className="stats" aria-label="Thống kê">
        <Stat value={stats.total} label="Tổng số user" />
        <Stat value={stats.today} label="Thêm hôm nay" />
        <Stat value={stats.domains} label="Tên miền email" />
      </section>

      <form className="card form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Tên</label>
          <input
            id="name"
            placeholder="Nguyễn Văn A"
            autoComplete="off"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="a@example.com"
            autoComplete="off"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          <Icon name="plus" />
          {submitting ? 'Đang thêm…' : 'Thêm user'}
        </button>
      </form>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
          <button className="alert-close" aria-label="Đóng thông báo" onClick={() => setError('')}>
            <Icon name="close" />
          </button>
        </div>
      )}

      <section className="card list-card">
        <div className="toolbar">
          <h2>
            Danh sách user <span className="badge">{users.length}</span>
          </h2>
          <div className="search">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Tìm theo tên hoặc email"
              aria-label="Tìm user"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div aria-busy="true" aria-label="Đang tải">
            {[0, 1, 2].map((i) => (
              <div className="skeleton" key={i}>
                <i className="sk-avatar" />
                <div className="sk-lines">
                  <i className="sk-line" />
                  <i className="sk-line" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="empty">
            <div className="empty-icon">
              <Icon name="users" />
            </div>
            <strong>Chưa có user nào</strong>
            <p>Nhập tên và email ở form phía trên để thêm user đầu tiên.</p>
          </div>
        )}

        {!loading && users.length > 0 && visible.length === 0 && (
          <div className="empty">
            <div className="empty-icon">
              <Icon name="search" />
            </div>
            <strong>Không có kết quả</strong>
            <p>Không tìm thấy user nào khớp với “{query.trim()}”.</p>
          </div>
        )}

        <ul className="users">
          {visible.map((u) => (
            <li className="user" key={u.id}>
              <Avatar user={u} />
              <div className="user-info">
                <div className="user-name">{u.name}</div>
                <div className="user-email" title={u.email}>
                  {u.email}
                </div>
              </div>
              <time className="user-date" dateTime={parseDate(u.created_at).toISOString()}>
                {formatDate(u.created_at)}
              </time>
              <div className="actions">
                {confirmId === u.id ? (
                  <>
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={deletingId === u.id}
                      onClick={() => setConfirmId(null)}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={deletingId === u.id}
                      onClick={() => remove(u.id)}
                    >
                      Xóa
                    </button>
                  </>
                ) : (
                  <button
                    className="icon-btn"
                    aria-label={`Xóa ${u.name}`}
                    title="Xóa"
                    onClick={() => setConfirmId(u.id)}
                  >
                    <Icon name="trash" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
