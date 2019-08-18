const fs = require('fs');
const { default: SignPdf } = require('node-signpdf');
const { getCertificatesInfoFromPDF } = require('./certificateDetails');
const VerifyPDFError = require('./VerifyPDFError');
const { createPDF, getResourceAbsolutePath } = require('./test.utils');

describe('Test signature details', () => {
  it('expects PDF to be Buffer', () => {
    try {
      getCertificatesInfoFromPDF('non-buffer');
      expect('here').not.toBe('here');
    } catch (e) {
      expect(e instanceof VerifyPDFError).toBe(true);
      expect(e.type).toBe(VerifyPDFError.TYPE_INPUT);
    }
  });

  it('return certificates details if input is valid', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));
    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const certs = getCertificatesInfoFromPDF(signedPdfBuffer);
    expect(certs).toHaveLength(1);
    expect(certs[0].clientCertificate).toBe(true);
  });
});
