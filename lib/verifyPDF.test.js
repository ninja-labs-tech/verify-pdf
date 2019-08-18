const fs = require('fs');
const { default: SignPdf } = require('node-signpdf');
const verifyPDF = require('./verifyPDF');
const { extractSignature } = require('./helpers');
const VerifyPDFError = require('./VerifyPDFError');
const { createPDF, getResourceAbsolutePath } = require('./test.utils');


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

  it('return { verified: true } if input is valid', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));

    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const verifyResult = verifyPDF(signedPdfBuffer);
    expect(verifyResult.verified).toBe(true);
  });

  fs.readdirSync(getResourceAbsolutePath('samples'))
    .filter((sampleName) => sampleName.endsWith('.pdf'))
    .forEach((sampleName) => {
      it(`expects sample: '${sampleName}' to be valid`, () => {
        const signedPdfBuffer = fs.readFileSync(getResourceAbsolutePath(`samples/${sampleName}`));
        const verifyResult = verifyPDF(signedPdfBuffer);
        if (!verifyResult.verified) console.log(verifyResult.message);
        expect(verifyResult.verified).toBe(true);
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

  it('return { verified: false } if the verify throws', async () => {
    const pdfBuffer = await createPDF();
    const p12Buffer = fs.readFileSync(getResourceAbsolutePath('certificate.p12'));

    const signedPdfBuffer = SignPdf.sign(pdfBuffer, p12Buffer);
    const { ByteRange } = extractSignature(signedPdfBuffer);
    // manipulate signture byte
    const bytePosition = ByteRange[1] + 1000;
    const originalByte = signedPdfBuffer[bytePosition];
    signedPdfBuffer[bytePosition] = originalByte + 1;
    const verifyResult = verifyPDF(signedPdfBuffer);
    expect(verifyResult.verified).toBe(false);
  });
});
