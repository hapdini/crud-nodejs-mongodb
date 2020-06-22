const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const clearCache = require('../utils/redis.util');

const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
    login: (req, res) => {
        const { id, password } = req.body;
        let result = {};
        let status = 200;
        User.findOne({ id: id })
            .then((data) => {
                if (data) {
                    console.log('data : ' + data)
                    console.log('data : ' + data.password)
                    bcrypt.compare(password, data.password).then(match => {
                        if (match) {
                            status = 200;
                            // Create a token
                            const payload = { data: data.id };
                            const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                            const secret = process.env.JWT_SECRET;
                            const token = jwt.sign(payload, secret, options);

                            // console.log('TOKEN', token);
                            result.token = token;
                            result.status = status;
                            result.result = data;
                        } else {
                            status = 401;
                            result.status = status;
                            result.error = `Authentication error`;
                        }
                        res.status(status).send(result);
                    }).catch(err => {
                        status = 500;
                        result.status = status;
                        result.error = err;
                        res.status(status).send(result);
                    });
                } else {
                    status = 404;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                }
            })
            .catch((err) => {
                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);
            })
    },

    add: async (req, res) => {
        let result = {};
        let status = 200;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            const { id, userName, accountNumber, emailAddress, identityNumber, password } = req.body;
            const user = new User({ id, userName, accountNumber, emailAddress, identityNumber, password }); // document = instance of a model
            user.save()
                .then((data) => {
                    result.status = status;
                    result.result = data;
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    },

    getAll: async (req, res) => {
        let result = {};
        let status = 200;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            User.find({})
                .then((data) => {
                    result.status = status;
                    result.result = data;
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    },

    getByAccountNumber: async (req, res) => {
        let result = {};
        let status = 200;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            User.findOne({ accountNumber: req.params.accountNumber }, (err, user) => {
            if (err) {
                console.log('error : ' + err)
                console.log('user : ' + user)
            }})
                .cache(req.params.accountNumber)
                .then((data) => {
                    result.status = status;
                    result.result = data;
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    },

    getByIdentityNumber: async (req, res) => {
        let result = {};
        let status = 200;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            User.find({ identityNumber: req.params.identityNumber })
                .cache(req.params.identityNumber)
                .then((data) => {
                    result.status = status;
                    result.result = data;
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    },

    update: async (req, res) => {
        let result = {};
        let status = 200;
        const { id, userName, accountNumber, emailAddress, identityNumber, password } = req.body;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            User.findByIdAndUpdate(req.params.userId, {
                id: id,
                userName: userName,
                accountNumber: accountNumber,
                emailAddress: emailAddress,
                identityNumber: identityNumber,
                password: password
            })
                .then((data) => {
                    result.status = status;
                    result.result = data;
                    clearCache(data._id)
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    },

    delete: async (req, res) => {
        let result = {};
        let status = 200;
        const payload = req.decoded;
        if (payload && payload.data === 'admin') {
            User.findByIdAndRemove(req.params.userId)
                .then(() => {
                    result.status = status;
                    result.result = "Delete Successfully";
                    clearCache(data.id)
                    res.status(status).send(result);
                })
                .catch((err) => {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                })
        } else {
            status = 401;
            result.status = status;
            result.error = `Authentication error`;
            res.status(status).send(result);
        }
    }
}