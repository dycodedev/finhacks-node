'use strict';

const moment = require('moment-timezone');
const schema = require('validate');
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

        register(userData, token, done) {
            const validSchema = schema({
                CustomerName: {
                    type: 'string',
                    required: true,
                    message: 'CustomerName is required',
                },
                PrimaryID: {
                    type: 'string',
                    required: true,
                    message: 'PrimaryID is required',
                },
                MobileNumber: {
                    type: 'string',
                    required: true,
                    message: 'MobileNumber is required',
                },
                CompanyCode: {
                    type: 'string',
                    required: true,
                    message: 'CompanyCode is required',
                },
                CustomerNumber: {
                    type: 'string',
                    required: true,
                    message: 'CustomerNumber is required',
                },
            });

            const errors = validSchema.validate(userData);
            if (errors.length > 1) {
                return done(errors.shift());
            }

            const url = baseUrl + '/ewallet/customers';
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: JSON.stringify(userData),
                method: 'POST',
            };

            const boundFn = request.generateHeader.bind(null, headerOpt);
            const headers = utils.handleTryCatch(boundFn);

            if (headers.error) {
                return done(headers.error);
            }

            const requestOpt = {
                url,
                header: headers.value,
                method: 'POST',
                body: userData,
            };

            return request.makeRequest(requestOpt, done);
        }
    };
};

