const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { MONGO_URL, SERVER_PORT } = require('./config');

mongoose.connect(MONGO_URL, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
    console.log('✅ Successfully connected to database');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Could not connect to database.');
    throw err;
});

const app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/v1/offer', require('./routes/offer'));
app.use('/v1/diff', require('./routes/diff'));

app.listen(SERVER_PORT, () => {
    console.log(`🚀 Server running on port ${ SERVER_PORT }.`);
});

module.exports = app;