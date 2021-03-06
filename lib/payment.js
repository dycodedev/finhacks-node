'use strict';

const schema = require('validate');
const utils = require('./utils');
const auth = require('./auth');
const request = require('./request');

function paymentFactory(config) {
    return {
        pay(payload, token, done) {
            if (!token) {
                return done(new Error('accessToken is required'));
            }

            const payloadSchema = schema({
                PrimaryID: {
                    type: 'string',
                    required: true,
                    message: 'PrimaryID is required',
                },
                TransactionID: {
                    type: 'string',
                    required: true,
                    message: 'TransactionID is required',
                },
                ReferenceID: {
                    type: 'string',
                    required: true,
                    message: 'ReferenceID is required',
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
                    required: true,
                    message: 'CurrencyCode is required',
                },
                CompanyCode: {
                    type: 'string',
                    required: true,
                    message: 'CompanyCode is required',
                },

            });

            const errors = payloadSchema.validate(payload);

            if (errors.length > 0) {
                return done(errors.shift());
            }

            const url =`${config.baseUrl}/ewallet/payments`;
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
    };
}

module.exports = paymentFactory;
