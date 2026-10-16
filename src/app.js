const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/errors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.all('*', (req, _res, next) => {
  next(new NotFoundError(`Cannot find ${req.method} ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
