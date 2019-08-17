const verifyPDF = require('./lib/verifyPDF');
const { getCertificatesInfoFromPDF } = require('./lib/certificateDetails');

module.exports = {
  verifyPDF,
  getCertificatesInfoFromPDF,
};
