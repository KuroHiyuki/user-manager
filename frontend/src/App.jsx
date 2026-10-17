import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({name: '', email: ""});
  const [error, setError] = useState('');

  const reload = () => fetch(api).then((res) => res.json()).then(setUsers);

  useEffect(() => {
    fetch(api).then((res) => res.json()).then(setUsers);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch(api, {
      method: "POST",
      headers: {'Content-Type': "application/json"},
      body: JSON.stringify(form)
    })

    if(!res.ok) {
      setError((await res.json()).error);
      return;
    }

    setForm({name: '', email: ""});
    reload;
  }

  const remove = async(id) => {
    await fetch(`${api}/${id}`, {method: "DELETE"});
    reload();
  }

  return (
    <main style = {{maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif'}}>
      <h1>Quản lý user</h1>
      <form onSubmit={submit} style={{display: "flex", gap : 8}}>
        <input type="text" placeholder='Tên' value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required/>
        <input type="email" placeholder='Email' value={form.email} onChange={(e) => e.target.value} required/>
        <button type='submit'>Thêm</button>
      </form>

      {error && <p style={{color: "crimson"}}>{error}</p>}

      <ul>
        {users.map((user) => (
          <li key={u.id}>
            {user.name} - {user.email} <button onClick={() => remove(user.id)}>Xoá</button>   
          </li>
        ))}
      </ul>
    </main>
  )
  
}

export default App
