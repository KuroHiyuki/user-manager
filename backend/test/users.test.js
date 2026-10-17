import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDB } from '../src/db.js';

const makeApp = () => createApp(createDB(':memory:'));
const an = {name: "An", email: 'an@example.com'};

test('tạo user rồi thấy trong danh sách', async () => {
    const app = makeApp();
    const created = await request(app).post('/api/users').send(an);
    assert.equal(created.status, 201);
    const list = await request(app).get('/api/users');
    assert.equal(list.body.length, 1);
    assert.equal(list.body[0].email, an.email);
    assert.equal(list.body[0].name, an.name);
})

test('email trùng trả 409', async ()=> {
    const app = makeApp();
    await request(app).post('/api/users').send(an);
    const twice = await request(app).post('/api/users').send(an);
    assert.equal(twice.status, 409);
})

test('thiếu name hoặc email trả 400', async () => {
    const res = await request(makeApp()).post('/api/users').send({email: an.email});
    assert.equal(res.status, 400)
})

test('cập nhật thành công email mới', async () => {
    const app = makeApp();
    const newEmail = 'phuong@gmail.com'
    const newUser = await request(app).post('/api/users').send(an);
    const update = await request(app).put(`/api/users/${newUser.body.id}`).send({...newUser.body, email: newEmail});
    assert.equal(update.status, 200);
    assert.equal(update.body.email, newEmail);
})

test('xoá user rồi xoá lại trả 404', async () => {
    const app = makeApp();
    const {body} = await request(app).post('/api/users').send(an);
    assert.equal((await request(app).delete(`/api/users/${body.id}`)).status, 204);
    assert.equal((await request(app).delete(`/api/users/${body.id}`)).status, 404);
})