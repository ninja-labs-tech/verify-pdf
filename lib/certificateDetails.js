const forge = require('node-forge');
const {
  extractSignature,
  getMessageFromSignature,
  checkForPDFBuffer,
} = require('./helpers');

const mapEntityAtrributes = (attrs) => attrs.reduce((agg, { name, value }) => {
  if (!name) return agg;
  agg[name] = value;
  return agg;
}, {});

const extractSingleCertificateDetails = (cert) => {
  const { issuer, subject, validity } = cert;
  return {
    issuedBy: mapEntityAtrributes(issuer.attributes),
    issuedTo: mapEntityAtrributes(subject.attributes),
    validityPeriod: validity,
    pemCertificate: forge.pki.certificateToPem(cert),
  };
};

const extractCertificatesDetails = (certs) => certs
  .map(extractSingleCertificateDetails)
  .map((cert, i) => {
    if (i) return cert;
    return {
      clientCertificate: true,
      ...cert,
    };
  });

const getCertificatesInfoFromPDF = (pdfBuffer) => {
  checkForPDFBuffer(pdfBuffer);
  const { signature } = extractSignature(pdfBuffer);
  const { certificates } = getMessageFromSignature(signature);
  return extractCertificatesDetails(certificates);
};

module.exports = {
  extractCertificatesDetails,
  getCertificatesInfoFromPDF,
};
