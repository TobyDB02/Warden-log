const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let poolPromise;

function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
        .then(pool => {
            console.log(`Connected to Azure SQL`);
            return pool;
        })
            .catch(err => {
                console.error('DB connection error:', err);
                throw err;
            });
    }
    return poolPromise;
}

module.exports = {getPool, sql};