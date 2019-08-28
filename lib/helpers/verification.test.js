const {
  verifyCaBundle,
  sortCertificateChain,
  verifyRootCert,
  isCertsExpired,
} = require('.');
const { createCertificateChain } = require('./../testHelpers');

describe('Verfications', () => {
  it('should verify CA bundle and return true', async () => {
    const certs = createCertificateChain();
    const sortedCertificateChain = sortCertificateChain(certs);
    const valid = verifyCaBundle(sortedCertificateChain);
    expect(valid).toBe(true);
  });

  it('should verify CA bundle and return false', async () => {
    const certs = createCertificateChain();
    const valid = verifyCaBundle(certs);
    expect(valid).toBe(false);
  });

  it('should verify root CA and return false', async () => {
    const certs = createCertificateChain();
    const valid = verifyRootCert(certs);
    expect(valid).toBe(false);
  });

  it('should verify if the certs expired and return false', async () => {
    const certs = createCertificateChain();
    const expired = isCertsExpired(certs);
    expect(expired).toBe(false);
  });

  it('should verify if the certs expired and return true', async () => {
    const certs = createCertificateChain({ clientExpired: true });
    const expired = isCertsExpired(certs);
    expect(expired).toBe(true);
  });
});
