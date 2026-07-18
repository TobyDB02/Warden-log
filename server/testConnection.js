// use here to test connection.
// cd ./server/
// node testConnection.js

require('dotenv').config();
const { getPool } = require('./config/db');

async function test() {
    try {
        console.log({
            user: process.env.DB_USER,
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME
        });
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM FireWardenEntries');
        console.log(result);
    } catch (error) {
        console.error('Could not fetch\n', error);
    }
}

test();