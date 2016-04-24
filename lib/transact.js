'use strict';

const schema = require('validate');
const qs = require('querystring');
const utils = require('./utils');
const auth = require('./auth');
const request = require('./request');

function transactFactory(config) {
    return {
        topup(payload, token, done) {
            if (!token) {
                return done(new Error('accessToken is required'));
            }

            const payloadSchema = schema({
                CompanyCode: {
                    type: 'string',
                    required: true,
                    message: 'CompanyCode is required',
                },
                TransactionID: {
                    type: 'string',
                    required: true,
                    message: 'TransactionID is required',
                },
                CustomerNumber: {
                    type: 'string',
                    required: true,
                    message: 'CustomerNumber is required',
                },
                RequestDate: {
                    type: 'string',
                    required: true,
                    message: 'RequestDate ist required and must follow yyyy-MM-dd format',
                },
                Amount: {
                    type: 'string',
                    required: true,
                    message: 'Amount is required',
                },
                CurrencyCode: {
                    type: 'string',
                    required: false,
                },
            });

            const errors = payloadSchema.validate(payload);

            if (errors.length > 0) {
                return done(errors.shift());
            }

            const url =`${config.baseUrl}/ewallet/topup`;
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: JSON.stringify(payload).replace(/[ ]{1,}/g, ''),
                method: 'POST',
                origin: config.origin,
            };
            const boundFn = request.generateHeader.bind(null, headerOpt);
            const headers = utils.handleTryCatch(boundFn);

            if (headers.error) {
                return done(headers.error);
            }

            payload.CompanyCode = payload.CompanyCode || config.companyCode;

            const requestOpt = {
                url,
                header: headers.value,
                method: 'POST',
                body: payload,
            };

            // console.log(requestOpt);
            return request.makeRequest(requestOpt, done);
        },

        history(payload, token, done) {
            const payloadSchema = {
                StartDate: {
                    type: 'string',
                    required: true,
                    match: /([0-9]{4})\-([0-9]{2})\-([0-9]{2})/,
                    message: 'StartDate ist required and must follow yyyy-MM-dd format',
                },
                EndDate: {
                    type: 'string',
                    required: true,
                    match: /([0-9]{4})\-([0-9]{2})\-([0-9]{2})/,
                    message: 'EndDate ist required and must follow yyyy-MM-dd format',
                },
                LastAccountStatementID: {
                    type: 'string',
                    required: false,
                },
            };

            const errors = payloadSchema.validate(payload);

            if (errors.length > 0) {
                return done(errors.shift());
            }

            const query = qs.stringify({
                StartDate: payload.StartDate,
                EndDate: payload.EndDate,
                LastAccountStatementID: payload.LastAccountStatementID,
            });

            const url =`${config.baseUrl}/ewallet/transactions/${config.companyCode}/{payload.PrimaryID}?` + query;
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: '',
                method: 'GET',
                origin: config.origin,
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

            return request.makeRequest(requestOpt, done);
        },
    };
}

module.exports = transactFactory;
