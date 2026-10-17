import { createApp } from './app.js';
import { createDB } from './db.js';

const port = process.env.PORT || 3000;

createApp(createDB()).listen(port, '0.0.0.0', () => {
    console.log(`API is running at port ${port}`)
})