const fs = require('fs');
const { default: SignPdf } = require('node-signpdf');
const verifyPDF = require('./verifyPDF');
const { extractSignature } = require('./helpers');
const VerifyPDFError = require('./VerifyPDFError');
const { createPDF, getResourceAbsolutePath, pdfSamples } = require('./testHelpers');

describe('Test verification', () => {
  it('expects PDF to be Buffer', () => {
    try {
      verifyPDF(1);
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
  Object.keys(pdfSamples)
    .forEach((sampleName) => {
      const { notSupported } = pdfSamples[sampleName];
      const signedPdfBuffer = fs.readFileSync(getResourceAbsolutePath(`samples/${sampleName}`));
      if (notSupported) {
        it(`expects sample: '${sampleName}' to be notSupported}`, () => {
          let thrownError;
          try {
            verifyPDF(signedPdfBuffer);
          } catch (error) {
            thrownError = error;
          }
          expect(thrownError.type).toEqual(VerifyPDFError.UNSUPPORTED_SUBFILTER);
        });
      } else {
        it(`expects sample: '${sampleName}' to be ${!pdfSamples[sampleName].verified && 'not'} valid`, () => {
          const verifyResult = verifyPDF(signedPdfBuffer);
          expect(verifyResult.verified).toBe(pdfSamples[sampleName].verified);
          expect(verifyResult.integrity).toBe(pdfSamples[sampleName].integrity);
          expect(verifyResult.authenticity).toBe(pdfSamples[sampleName].authenticity);
          expect(verifyResult.expired).toBe(pdfSamples[sampleName].expired);
        });
      }
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
    const {
      verified, integrity, authenticity, expired,
    } = verifyPDF(signedPdfBuffer);
    expect(verified).toBe(false);
    expect(integrity).toBe(false);
    expect(authenticity).toBe(false);
    expect(expired).toBe(false);
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
    const {
      verified, integrity, authenticity, expired,
    } = verifyPDF(signedPdfBuffer);
    expect(verified).toBe(false);
    expect(integrity).toBe(undefined);
    expect(authenticity).toBe(undefined);
    expect(expired).toBe(undefined);
  });
});
