const VerifyPDFError = require('../VerifyPDFError');

const extractSignature = (pdf) => {
  const byteRangePos = pdf.indexOf('/ByteRange [');
  if (byteRangePos === -1) {
    throw new VerifyPDFError(
      'Failed to locate ByteRange.',
      VerifyPDFError.TYPE_PARSE,
    );
  }

  const byteRangeEnd = pdf.indexOf(']', byteRangePos);
  if (byteRangeEnd === -1) {
    throw new VerifyPDFError(
      'Failed to locate the end of the ByteRange.',
      VerifyPDFError.TYPE_PARSE,
    );
  }

  const byteRangeText = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
  const ByteRange = /\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+)\]/.exec(byteRangeText).slice(1).map(Number);

  const signedData = Buffer.concat([
    pdf.slice(ByteRange[0], ByteRange[0] + ByteRange[1]),
    pdf.slice(ByteRange[2], ByteRange[2] + ByteRange[3]),
  ]);
  const signatureHex = pdf.slice(ByteRange[0] + ByteRange[1] + 1, ByteRange[2]).toString('latin1');
  const signature = Buffer.from(signatureHex, 'hex').toString('latin1');
  return {
    ByteRange,
    signature,
    signedData,
  };
};

module.exports = extractSignature;
