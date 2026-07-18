process.on('exit', (code) => {
    console.log('Process exiting with code:', code);
});


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const entriesRoutes = require('./routes/entriesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', entriesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.on('close', () => console.log('Server closed'));
server.on('error', (err) => console.log('Server error:', err));