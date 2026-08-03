const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,

    options: {
        encrypt: true,
        trustServerCertificate: false
    },

    connectionTimeout: 30000,
    requestTimeout: 30000,

    pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const retryableErrors = new Set([
    40197,
    40501,
    40613,
    49918,
    49919,
    49920
]);

const retryDelays = [5000, 10000, 20000, 40000, 60000];

let pool = null;
let poolPromise = null;

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getErrorNumber(error) {
    return (
        error?.number ??
        error?.originalError?.info?.number ??
        error?.precedingErrors?.[0]?.number
    );
}

function isRetryable(error) {
    const errorNumber = getErrorNumber(error);

    return (
        retryableErrors.has(errorNumber) ||
        ['ETIMEOUT', 'ESOCKET', 'ECONNCLOSED'].includes(error?.code) ||
        /40613|not currently available/i.test(error?.message || '')
    );
}

async function closePool() {
    const existingPool = pool;

    pool = null;
    poolPromise = null;

    if (existingPool) {
        await existingPool.close().catch(() => {});
    }
}

async function openPool() {
    if (pool?.connected) {
        return pool;
    }

    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((connectedPool) => {
                pool = connectedPool;

                connectedPool.on('error', (error) => {
                    console.error('SQL pool error:', error.message);

                    if (pool === connectedPool) {
                        pool = null;
                    }
                });

                console.log('Connected to Azure SQL');
                return connectedPool;
            });
    }

    try {
        return await poolPromise;
    } finally {
        poolPromise = null;
    }
}

async function getPool() {
    let lastError;

    for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
        try {
            const connectedPool = await openPool();

            await connectedPool.request().query('SELECT 1 AS ready');

            return connectedPool;
        } catch (error) {
            lastError = error;
            await closePool();

            if (
                !isRetryable(error) ||
                attempt === retryDelays.length
            ) {
                throw error;
            }

            const delay = retryDelays[attempt];

            console.warn(
                `Azure SQL is resuming. Retrying in ${delay / 1000} seconds.`
            );

            await sleep(delay);
        }
    }

    throw lastError;
}

module.exports = {
    getPool,
    sql,
    closePool
};