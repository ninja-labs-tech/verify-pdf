const verifyPDF = require('./lib/verifyPDF');
const { getCertificatesInfoFromPDF } = require('./lib/certificateDetails');

Object.assign(verifyPDF, { getCertificatesInfoFromPDF });

module.exports = verifyPDF;
