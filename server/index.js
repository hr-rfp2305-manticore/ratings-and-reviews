const express = require('express');
const morgan = require('morgan');
const router = require('./routes.js');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Set up our routes
app.use('/test', router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
})