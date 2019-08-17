const verifyPDF = require('./verifyPDF');
const { getCertificatesInfoFromPDF } = require('./certificateDetails');

Object.assign(verifyPDF, { getCertificatesInfoFromPDF });

module.exports = verifyPDF;
