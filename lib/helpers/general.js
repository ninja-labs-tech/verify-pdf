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


const checkForSubFilter = (pdfBuffer) => {
  const matches = pdfBuffer.toString().match(/\/SubFilter\s*\/([\w.]*)(\/.*|)?/);
  const subFilter = Array.isArray(matches) && matches[1];
  if (!subFilter) {
    throw new VerifyPDFError(
      'cannot find subfilter',
      VerifyPDFError.TYPE_PARSE,
    );
  }
  const supportedTypes = ['adbe.pkcs7.detached', 'etsi.cades.detached'];
  if (!supportedTypes.includes(subFilter.trim().toLowerCase())) throw new VerifyPDFError(`subFilter ${subFilter} not supported`, VerifyPDFError.UNSUPPORTED_SUBFILTER);
};
const getMessageFromSignature = (signature) => {
  const p7Asn1 = forge.asn1.fromDer(signature);
  return forge.pkcs7.messageFromAsn1(p7Asn1);
};

module.exports = {
  checkForPDFBuffer,
  checkForSubFilter,
  getMessageFromSignature,
};
