'use strict';
const _ = require('lodash');
const moment = require('moment-timezone');
const request = require('superagent');
const schema = require('validate');
const URL = require('url');
const auth = require('./auth');
const utils = require('./utils');

function makeRequest(option, done) {
    const validOptions = schema({
        url: {
            type: 'string',
            required: true,
            message: 'url is required',
        },
        method: {
            type: 'string',
            required: true,
            match: /[A-Z]{1,}/,
            message: 'method is required',
        },
        body: {
            type: 'object',
            required: false,
        },
        header: {
            type: 'object',
            required: true,
        },
    });

    const errors = validOptions.validate(option, { strip: false });

    if (errors.length > 0) {
        return done(errors.shift());
    }

    const headers = option.header || {};

    // console.log('SENT HEADERS', headers);

    let requestObject = request(option.method, option.url)
        .set(headers);

    if (!_.isEmpty(option.body)) {
        requestObject = requestObject.send(option.body);
    }

    return requestObject.end(done);
};

function generateHeader(options) {
    const timestamp = moment().toISOString();
    const relativeUrl = utils.orderQueryString(options.url);
    const header = {
        Authorization: 'Bearer ' + options.token,
        'X-BCA-Timestamp': timestamp,
        'X-BCA-Key': options.apiKey,
        Accept: 'application/json',
    };

    if (options.origin) {
        header.Origin = options.origin;
    }

    const signatureComps = {
        timestamp,
        relativeUrl,
        method: options.method,
        accessToken: options.token,
        requestBody: options.body,
    };

    const fn = auth.makeSignature.bind(null, signatureComps, options.apiSecret);
    const signature = utils.handleTryCatch(fn);

    if (signature.error) {
        throw signature.error;
    }

    header['X-BCA-Signature'] = signature.value;

    return header;
}

module.exports = {
    makeRequest,
    generateHeader,
};
