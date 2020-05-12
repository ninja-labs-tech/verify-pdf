const forge = require('node-forge');
const { Buffer } = require('../../packages/buffer');

const VerifyPDFError = require('../VerifyPDFError');

const preparePDF = (pdf) => {
  try {
    if (Buffer.isBuffer(pdf)) return pdf;
    return Buffer.from(pdf);
  } catch (error) {
    throw new VerifyPDFError(
      'PDF expected as Buffer.',
      VerifyPDFError.TYPE_INPUT,
    );
  }
};

const checkForSubFilter = (pdfBuffer) => {
  const matches = pdfBuffer.toString().match(/\/SubFilter\s*\/([\w.]*)/);
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

const getMetaRegexMatch = (keyName) => (str) => {
  const regex = new RegExp(`/${keyName}\\s*\\(([\\w.\\s@,]*)`);
  const matches = str.match(regex);
  return matches && matches[1];
};

const getSignatureMeta = (signedData) => {
  const str = Buffer.isBuffer(signedData) ? signedData.toString() : signedData;
  return ({
    reason: getMetaRegexMatch('Reason')(str),
    contactInfo: getMetaRegexMatch('ContactInfo')(str),
    location: getMetaRegexMatch('Location')(str),
  });
};

module.exports = {
  checkForSubFilter,
  getSignatureMeta,
  getMessageFromSignature,
  preparePDF,
};
