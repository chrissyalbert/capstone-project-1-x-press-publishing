const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const app = express();

app.use(bodyParser.json())
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler());
};
app.use(morgan('tiny'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);


const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 4000');
});

module.exports = app;