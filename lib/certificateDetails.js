const {
  extractSignature,
  getMessageFromSignature,
  sortCertificateChain,
  checkTypeOfPDF,
} = require('./helpers');

const mapEntityAtrributes = (attrs) => attrs.reduce((agg, { name, value }) => {
  if (!name) return agg;
  agg[name] = value;
  return agg;
}, {});

const extractSingleCertificateDetails = (cert, i) => {
  const { issuer, subject, validity } = cert;
  return {
    clientCertificat: !i,
    issuedBy: mapEntityAtrributes(issuer.attributes),
    issuedTo: mapEntityAtrributes(subject.attributes),
    validityPeriod: validity,
  };
};

const extractCertificatesDetails = (certs) => sortCertificateChain(certs)
  .map(extractSingleCertificateDetails);

const getCertificatesInfoFromPDF = (pdfBuffer) => {
  checkTypeOfPDF(pdfBuffer);
  const { signature } = extractSignature(pdfBuffer);
  const { certificates } = getMessageFromSignature(signature);
  return extractCertificatesDetails(certificates);
};

module.exports = {
  extractCertificatesDetails,
  getCertificatesInfoFromPDF,
};
