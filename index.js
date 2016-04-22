'use strict';

const moment = require('moment-timezone');
const schema = require('validate');
const _ = require('lodash');
const auth = require('./lib/auth');
const request = require('./lib/request');
const utils = require('./lib/utils');

module.exports = function sdkFactory(config) {
    const validSchema = schema({
        clientId: {
            type: 'string',
            required: true,
            message: 'clientId is required',
        },
        clientSecret: {
            type: 'string',
            required: true,
            message: 'clientSecret is required',
        },
        apiKey: {
            type: 'string',
            required: true,
            message: 'apiKey is required',
        },
        apiSecret: {
            type: 'string',
            required: true,
            message: 'apiSecret is required',
        },
        origin: {
            type: 'string',
            required: true,
            message: 'origin host is required',
        },
        companyCode: {
            type: 'string',
            required: true,
            message: 'companyCode is required',
        },
    });

    const baseUrl = config.baseUrl || 'https://api.finhacks.id'
    const errors = validSchema.validate(config, { strip: false });

    if (errors.length > 1) {
        throw errors.shift();
    }

    return {
        token(done) {
            const creds = new Buffer(config.clientId + ':' + config.clientSecret);
            const header = {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + creds.toString('base64'),
            };

            const body = {
                grant_type: 'client_credentials',
            };

            const requestConfig = {
                body,
                header,
                method: 'POST',
                url: baseUrl + '/api/oauth/token',
            };

            return request.makeRequest(requestConfig, done);
        },

        user: require('./lib/user')(config),
        payment: require('./lib/payment')(config),
    };
};

