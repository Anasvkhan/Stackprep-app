const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'StackPrep API' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/progress', require('./routes/progress'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
