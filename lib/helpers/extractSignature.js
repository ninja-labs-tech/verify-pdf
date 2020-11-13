const { Buffer } = require('../../packages/buffer');

const VerifyPDFError = require('../VerifyPDFError');
const { getSignatureMeta, preparePDF } = require('./general');

const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';

const getByteRange = (pdfBuffer) => {
  const byteRangeStrings = pdfBuffer.toString().match(/\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*\]{1}/g);
  if (!byteRangeStrings) {
    throw new VerifyPDFError(
      'Failed to locate ByteRange.',
      VerifyPDFError.TYPE_PARSE,
    );
  }

  const byteRangePlaceholder = byteRangeStrings.find((s) => s.includes(`/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`));
  const byteRanges = byteRangeStrings.map((brs) => brs.match(/[^[\s]*(?:\d|\/\*{10})/g));

  const byteRange = byteRanges[0].map(Number);

  return {
    byteRangePlaceholder,
    byteRange,
  };
};

const extractSignature = (pdf) => {
  const pdfBuffer = preparePDF(pdf);

  const { byteRange } = getByteRange(pdfBuffer);

  const signedData = Buffer.concat([
    pdfBuffer.slice(byteRange[0], byteRange[0] + byteRange[1]),
    pdfBuffer.slice(byteRange[2], byteRange[2] + byteRange[3]),
  ]);
  const signatureHex = pdfBuffer.slice(byteRange[0] + byteRange[1] + 1, byteRange[2]).toString('latin1');

  const signature = Buffer.from(signatureHex, 'hex').toString('latin1');
  return {
    byteRange,
    signature,
    signedData,
    signatureMeta: getSignatureMeta(signedData),
  };
};

module.exports = extractSignature;
