const { Buffer } = require('../../packages/buffer');

const VerifyPDFError = require('../VerifyPDFError');
const { getSignatureMeta, preparePDF } = require('./general');

const extractSignatures = (pdf) => {
  const result = [];

  const string = pdf.toString();
  const regexp = /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g;
  let match = regexp.exec(string);
  while (match) {
    delete match.input;
    result.push(match);
    match = regexp.exec(string);
  }

  return result;
};

const extractSignature = (pdf) => {
  const pdfBuffer = preparePDF(pdf);
  const ByteRangeMatch = extractSignatures(pdf).pop();

  if (!ByteRangeMatch) {
    throw new VerifyPDFError(
      'Failed to locate ByteRange.',
      VerifyPDFError.TYPE_PARSE,
    );
  }
  const ByteRange = ByteRangeMatch.slice(1).map(Number);

  const signedData = Buffer.concat([
    pdfBuffer.slice(ByteRange[0], ByteRange[0] + ByteRange[1]),
    pdfBuffer.slice(ByteRange[2], ByteRange[2] + ByteRange[3]),
  ]);
  const signatureHex = pdfBuffer.slice(ByteRange[0] + ByteRange[1] + 1, ByteRange[2]).toString('latin1');
  const signature = Buffer.from(signatureHex, 'hex').toString('latin1');

  return {
    ByteRange,
    signature,
    signedData,
    signatureMeta: getSignatureMeta(signedData),
  };
};

module.exports = extractSignature;
