require('dotenv').config(); // Sets up dotenv as soon as our application starts

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
// mongoose.set('debug', true);
mongoose.Promise = global.Promise;

const app = express();
const router = express.Router();

const enableCORS = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Access-Token');
    if ('OPTIONS' == req.method) {
        return res.sendStatus(200);
    }
    next();
};
app.use(enableCORS);
app.use(helmet());

const environment = process.env.NODE_ENV; // development
const stage = require('./config')[environment];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Connecting to the database
mongoose.connect(process.env.MONGO_LOCAL_CONN_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

const routes = require('./routes/index.routes');
app.use('/api/', routes(router));

if (environment !== 'production') {
    app.use(logger('dev'));
}

app.listen(process.env.PORT, () => {
    console.log('Server now listening on ' + process.env.PORT);
});

module.exports = app;