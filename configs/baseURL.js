// module.exports.generateBaseUrl = function (req) {
//     return req.protocol + '://' + req.headers.host;
// };

// const baseURL = 'https://192.168.0.115:4500/';

// module.exports = {
//   baseURL,
// };

module.exports.getBaseUrl = (req) => {
  return `${req.protocol}s://${req.get('host')}`;
};