const express = require('express');
const app = express();
// const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')

const rotaUsuarios = require('./routes/usuario')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(morgan('dev'));
app.use('/usuario',rotaUsuarios);

module.exports = app;