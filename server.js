const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 4000;
const apiRouter = require('./api/api');

app.use(bodyParser.json())
app.use(cors());
app.use(morgan('dev'));
app.use('/api', apiRouter);
app.use(errorhandler());

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 4000');
});

module.exports = app;