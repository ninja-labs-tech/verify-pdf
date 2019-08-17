const VerifyPDFError = require('../VerifyPDFError');

const checkTypeOfPDF = (pdfBuffer) => {
  if (!(pdfBuffer instanceof Buffer)) {
    throw new VerifyPDFError(
      'PDF expected as Buffer.',
      VerifyPDFError.TYPE_INPUT,
    );
  }
};

module.exports = {
  checkTypeOfPDF,
};
