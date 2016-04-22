'use strict';

const schema = require('validate');
const utils = require('./utils');
const request = require('./request');

function userLibFactory(config) {
    return {
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
                CustomerNumber: {
                    type: 'string',
                    required: true,
                    message: 'CustomerNumber is required',
                },
            });

            const errors = validSchema.validate(userData, { strip: false });
            if (errors.length > 1) {
                return done(errors.shift());
            }

            const url = config.baseUrl + '/ewallet/customers';
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

            userData.CompanyCode = config.companyCode;

            const requestOpt = {
                url,
                header: headers.value,
                method: 'POST',
                body: userData,
            };

            // console.log(requestOpt);
            return request.makeRequest(requestOpt, done);
        },

        inquiry(primaryID, token, done) {
            if (!primaryID) {
                return done(new Error('PrimaryID is required'));
            }

            if (!token) {
                return done(new Error('Access token is required'));
            }

            const url =`${config.baseUrl}/ewallet/customers/${config.companyCode}/${primaryID}`;
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: '',
                method: 'GET',
            };

            const boundFn = request.generateHeader.bind(null, headerOpt);
            const headers = utils.handleTryCatch(boundFn);

            if (headers.error) {
                return done(headers.error);
            }

            const requestOpt = {
                url,
                header: headers.value,
                method: 'GET',
                body: {},
            };

            // console.log(requestOpt);
            return request.makeRequest(requestOpt, done);
        },

        update(payload, token, done) {
            const payloadSchema = schema({
                PrimaryID: {
                    type: 'string',
                    required: true,
                    message: 'PrimaryID is required',
                },
                CustomerName: {
                    type: 'string',
                    required: false,
                },
                DateOfBirth: {
                    type: 'string',
                    required: false,
                    match: /([0-9]{4})\-([0-9]{2})\-([0-9]{2})/,
                    message: 'DateOfBirth must be in yyyy-MM-dd format',
                },
                MobileNumber: {
                    type: 'string',
                    required: false,
                },
                EmailAddress: {
                    type: 'string',
                    required: false,
                },
                WalletStatus: {
                    type: 'string',
                    required: false,
                    match: /ACTIVE|BLOCKED/,
                    message: 'WalletStatus must be either ACTIVE or BLOCKED',
                },
            });

            const errors = payloadSchema.validate(payload);

            if (errors.length > 0) {
                return done(errors.shift());
            }

            const url =`${config.baseUrl}/ewallet/customers/${config.companyCode}/${payload.PrimaryID}`;
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: JSON.stringify(payload),
                method: 'PUT',
            };
            const boundFn = request.generateHeader.bind(null, headerOpt);
            const headers = utils.handleTryCatch(boundFn);

            if (headers.error) {
                return done(headers.error);
            }

            const requestOpt = {
                url,
                header: headers.value,
                method: 'PUT',
                body: payload,
            };

            // console.log(requestOpt);
            return request.makeRequest(requestOpt, done);
        },
    };
}

module.exports = userLibFactory;
