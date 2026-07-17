
require('dotenv').config();
const express = require('expres');
const cors = require('cors');
const entriesRoutes = require('./routes/entriesRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));