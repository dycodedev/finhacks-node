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
                    match: /([0-9]{4})\-([0-9]{2})\-([0-9]{2})/,
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

            const url =`${config.baseUrl}/ewallet/payments`;
            const headerOpt = {
                url,
                token,
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                body: JSON.stringify(payload),
                method: 'POST',
            };
            const boundFn = request.generateHeader.bind(null, headerOpt);
            const headers = utils.handleTryCatch(boundFn);

            if (headers.error) {
                return done(headers.error);
            }

            payload.CompanyCode = config.companyCode || payload.CompanyCode;

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
