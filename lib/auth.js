'use strict';

const schema = require('validate');
const crypto = require('crypto');

const utils = require('./utils');

function makeBasicAuth(username, password) {
    const token = username + ':' + password;

    return new Buffer(token).toString('base64');
}

function makeSignature(components, secret) {
    const component = schema({
        method: {
            type: 'string',
            required: true,
            message: 'method is required',
        },
        timestamp: {
            type: 'string',
            required: true,
            message: 'timestamp is required',
        },
        relativeUrl: {
            type: 'string',
            required: true,
            message: 'relativeUrl is required',
            match: /^\//,
        },
        accessToken: {
            type: 'string',
            required: true,
            message: 'accessToken is required',
        },
        requestBody: {
            type: 'string',
        },
    });

    const errors = component.validate(components);

    if (errors.length > 0) {
        throw errors.shift();
    }

    const upperMethod = components.method.toUpperCase();
    const relativeUrl = utils.orderQueryString(components.relativeUrl);
    const sha256Body = crypto.createHash('sha256')
        .update(components.requestBody)
        .digest('hex')
        .toLowerCase();

    const toBeHashed = [
        upperMethod,
        relativeUrl,
        components.accessToken,
        sha256Body,
        components.timestamp,
    ].join(':');

    return crypto.createHmac('sha256', secret)
        .update(toBeHashed)
        .digest('hex');
}

module.exports = {
    makeBasicAuth,
    makeSignature,
};

