import express from 'express';

const isDuplicate = (err) => err.code === 'SQLITE_CONSTRAINT_UNIQUE';

export function createApp(db) {
    const app = express();

    app.use(express.json());

    const findUser = db.prepare('SELECT * FROM users WHERE id = ?');

    app.get('/api/health', (req,res) => {
        res.json({status: 'Ok'})
    })

    app.get('/api/users', (req,res) => {
        res.json(db.prepare('SELECT * FROM users ORDER BY id DESC').all());
    })

    app.post('/api/users' , (req,res) => {
        const {name, email} = req.body ?? {};

        if(!name || !email) {
            return res.status(400).json({error: 'name và email là bắt buộc '})
        }

        try {
            const info = db.prepare('INSERT INTO users (name, email) VALUES (?,?)').run(name, email);
            res.status(201).json(findUser.get(info.lastInsertRowid));
        } catch (err) {
            if(isDuplicate(err)) return res.status(409).json({error: 'email da ton tai'});
            throw err
        } 
    })

    app.put('/api/users/:id', (req, res) => {
        const {name, email} = req.body ?? {};

        if(!name || !email) {
            return res.status(400).json({error: "name va email la bat buoc"});
        }

        try {
            const info = db.prepare('UPDATE users SET name = ?, email =? WHERE id = ?').run(name, email, req.params.id);

            if(info.changes === 0) return res.status(404).json({error: "khong tim thay user"});

            res.json(findUser.get(req.params.id));
        } catch (err) {
            if(isDuplicate(err)) return res.status(409).json({error: 'email da ton tai'})
            
            throw err;
        }
    })

    app.delete('/api/users/:id', (req,res) => {
        const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

        if(info.changes === 0) return res.status(404).json({error: 'khong tim thay user'});

        res.status(204).end();
    })

    return app
}