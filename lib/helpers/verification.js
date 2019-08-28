const tls = require('tls');
const forge = require('node-forge');
const rootCAs = require('./rootCAs');

const verifyRootCert = (chainRootInForgeFormat) => !!(tls.rootCertificates || rootCAs)
  .find((rootCAInPem) => {
    try {
      const rootCAInForgeCert = forge.pki.certificateFromPem(rootCAInPem);
      return forge.pki.certificateToPem(chainRootInForgeFormat) === rootCAInPem
      || rootCAInForgeCert.issued(chainRootInForgeFormat);
    } catch (e) {
      return false;
    }
  });

const verifyCaBundle = (certs) => {
  let verified = true;
  for (let i = certs.length - 1; i > 0; i -= 1) {
    try {
      verified = certs[i].verify(certs[i - 1]);
    } catch (error) {
      return false;
    }
  }
  return verified;
};

const isCertsExpired = (certs) => !!certs
  .find((cert) => cert.validity.notAfter.getTime() < Date.now());


const authenticateSignature = (certs) => verifyCaBundle(certs)
&& verifyRootCert(certs[certs.length - 1]);

module.exports = {
  authenticateSignature,
  verifyCaBundle,
  verifyRootCert,
  isCertsExpired,
};
