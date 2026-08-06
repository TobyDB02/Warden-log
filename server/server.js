process.on('exit', (code) => {
    console.log('Process exiting with code:', code);
});


require('dotenv').config();

const express = require('express');
const cors = require('cors');

const entriesRoutes = require('./routes/entriesRoutes');
const errorHandler = require('./middleware/errorHandler');
const { getPool } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

app.get('/api/health/database', async (req, res) => {
    try {
        await getPool();

        res.json({
            status: 'ok'
        });
    } catch (error) {
        console.error(
            'Database health check failed:',
            error.message
        );

        res.status(503).json({
            status: 'database unavailable'
        });
    }
});

app.use('/api', entriesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

server.on('close', () =>
    console.log('Server closed')
);

server.on('error', (err) =>
    console.log('Server error:', err)
);