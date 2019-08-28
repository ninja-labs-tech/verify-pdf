const fs = require('fs');
const { default: SignPdf } = require('node-signpdf');
const verifyPDF = require('./verifyPDF');
const { extractSignature } = require('./helpers');
const VerifyPDFError = require('./VerifyPDFError');
const { createPDF, getResourceAbsolutePath, pdfs } = require('./testHelpers');

describe('Test verification', () => {
  it('expects PDF to be Buffer', () => {
    try {
      verifyPDF('non-buffer');
      expect('here').not.toBe('here');
    } catch (e) {
      expect(e instanceof VerifyPDFError).toBe(true);
      expect(e.type).toBe(VerifyPDFError.TYPE_INPUT);
    }
  });
  it('return { verified: true, integrity: true, authenticity: false } if input is valid', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));
    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const verifyResult = verifyPDF(signedPdfBuffer);
    expect(verifyResult.verified).toBe(false);
    expect(verifyResult.integrity).toBe(true);
    expect(verifyResult.authenticity).toBe(false);
  });
  Object.keys(pdfs)
    .filter((sampleName) => pdfs[sampleName].verified)
    .forEach((sampleName) => {
      it(`expects sample: '${sampleName}' to be valid`, () => {
        const signedPdfBuffer = fs.readFileSync(getResourceAbsolutePath(`samples/${sampleName}`));
        const verifyResult = verifyPDF(signedPdfBuffer);
        expect(verifyResult.verified).toBe(pdfs[sampleName].verified);
      });
    });
  Object.keys(pdfs)
    .filter((sampleName) => !pdfs[sampleName].verified)
    .forEach((sampleName) => {
      it(`expects sample: '${sampleName}' to be not valid`, () => {
        const signedPdfBuffer = fs.readFileSync(getResourceAbsolutePath(`samples/${sampleName}`));
        const verifyResult = verifyPDF(signedPdfBuffer);
        expect(verifyResult.verified).toBe(pdfs[sampleName].verified);
      });
    });
  it('return { verified: false } if pdf data is changed', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));
    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const { ByteRange } = extractSignature(signedPdfBuffer);
    // manipulate data byte
    const bytePosition = ByteRange[1] + ByteRange[2] + 100;
    const originalByte = signedPdfBuffer[bytePosition];
    signedPdfBuffer[bytePosition] = originalByte + 1;
    const verifyResult = verifyPDF(signedPdfBuffer);
    expect(verifyResult.verified).toBe(false);
  });
  it('return { verified: false } if signature is changed', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));
    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const { ByteRange } = extractSignature(signedPdfBuffer);
    // manipulate signture byte
    const bytePosition = ByteRange[1] + 2500;
    const originalByte = signedPdfBuffer[bytePosition];
    signedPdfBuffer[bytePosition] = originalByte + 1;
    const verifyResult = verifyPDF(signedPdfBuffer);
    expect(verifyResult.verified).toBe(false);
  });
});
