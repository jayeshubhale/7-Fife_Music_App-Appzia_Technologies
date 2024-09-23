

module.exports.generateBaseUrl = function (req) {
    return req.protocol + '://' + req.headers.host;
};
