const forge = require('node-forge');
const VerifyPDFError = require('../VerifyPDFError');

const checkForPDFBuffer = (pdfBuffer) => {
  if (!(pdfBuffer instanceof Buffer)) {
    throw new VerifyPDFError(
      'PDF expected as Buffer.',
      VerifyPDFError.TYPE_INPUT,
    );
  }
};

const getMessageFromSignature = (signature) => {
  const p7Asn1 = forge.asn1.fromDer(signature);
  return forge.pkcs7.messageFromAsn1(p7Asn1);
};

module.exports = {
  checkForPDFBuffer,
  getMessageFromSignature,
};
