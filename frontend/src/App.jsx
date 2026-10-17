import { useEffect, useState } from 'react';

const api = '/api/users';

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const reload = () => fetch(api).then((r) => r.json()).then(setUsers);

  useEffect(() => {
    fetch(api).then((r) => r.json()).then(setUsers);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    setForm({ name: '', email: '' });
    reload();
  };

  const remove = async (id) => {
    await fetch(`${api}/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Quản lý user</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <button type="submit">Thêm</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email} <button onClick={() => remove(u.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </main>
  );
}