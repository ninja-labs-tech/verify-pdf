const extractSignature = require('./extractSignature');
const certsUtils = require('./certsUtils');

module.exports = {
  extractSignature,
  ...certsUtils,
};
