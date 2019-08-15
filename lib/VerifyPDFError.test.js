const VerifyPDFError = require('./VerifyPDFError');

describe('VerifyPDFError', () => {
  it('VerifyPDFError extends Error', () => {
    const instance = new VerifyPDFError('Whatever message');
    expect(instance instanceof Error).toBe(true);
  });
  it('type defaults to UNKNOWN', () => {
    const instance = new VerifyPDFError('Whatever message');
    expect(instance.type).toBe(VerifyPDFError.TYPE_UNKNOWN);
  });
  it('type can be specified', () => {
    [
      VerifyPDFError.TYPE_UNKNOWN,
      VerifyPDFError.TYPE_INPUT,
      VerifyPDFError.TYPE_PARSE,
    ].forEach((type) => {
      const instance = new VerifyPDFError('Whatever message', type);
      expect(instance.type).toBe(type);
    });
  });
});
