const {
  verifyCaBundle,
  sortCertificateChain,
  verifyRootCert,
  isCertsExpired,
} = require('./index');
const {
  createCertificateChain,
  validitySamples: {
    validDates,
    expiredNotAfter,
  },
} = require('./../testHelpers');

describe('Verfications', () => {
  it('should verify CA bundle and return true if the chain is valid', async () => {
    const certs = createCertificateChain({
      clientValidity: validDates,
      intermediateValidity: validDates,
      rootValidity: validDates,
    });
    const sortedCertificateChain = sortCertificateChain(certs);
    const valid = verifyCaBundle(sortedCertificateChain);
    expect(valid).toBe(true);
  });

  it('should verify CA bundle and return false if the chain is not valid', async () => {
    const certs = createCertificateChain({
      clientValidity: validDates,
      intermediateValidity: validDates,
      rootValidity: validDates,
    });
    const valid = verifyCaBundle(certs);
    expect(valid).toBe(false);
  });

  it('should verify root CA and return false if the root certificate is not recognized', async () => {
    const certs = createCertificateChain({
      clientValidity: validDates,
      intermediateValidity: validDates,
      rootValidity: validDates,
    });
    const valid = verifyRootCert(certs[certs.length - 1]);
    expect(valid).toBe(false);
  });

  it('should verify if the certs expired and return false if all the chain dates is not expired', async () => {
    const certs = createCertificateChain({
      clientValidity: validDates,
      intermediateValidity: validDates,
      rootValidity: validDates,
    });
    const expired = isCertsExpired(certs);
    expect(expired).toBe(false);
  });

  it('should verify if the certs expired and return true if the clientCertificate is expired', async () => {
    const certs = createCertificateChain({
      clientValidity: expiredNotAfter,
      intermediateValidity: validDates,
      rootValidity: validDates,
    });
    const expired = isCertsExpired(certs);
    expect(expired).toBe(true);
  });
});
