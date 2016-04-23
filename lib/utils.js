'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const URL = require('url');
const qs = require('querystring');

function orderQueryString(url) {
    const parsed = URL.parse(url);
    const qsObject = qs.parse(parsed.query);
    const inverted = _.invert(qsObject);
    const sorted = _.orderBy(qsObject);
    const newObject = {};

    _.each(sorted, item => newObject[inverted[item]] = item);

    const qstring = qs.stringify(newObject);
    // const parsedPathname = '/' + encodeURIComponent(parsed.pathname.slice(1));
    const parsedPathname = encodeURI(parsed.pathname);

    return (qstring ? parsedPathname + '?' + qstring : parsedPathname);
}

function handleTryCatch(fn) {
    let retVal = {
        value: null,
        error: null
    };

    try {
        retVal.value = fn();
    } catch (ex) {
        retVal.error = ex;
    }

    return retVal;
}

function getRelativeUrl(url) {
    return orderQueryString(url);
}

module.exports = {
    orderQueryString,
    handleTryCatch,
    getRelativeUrl,
};
