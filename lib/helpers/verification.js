const tls = require('tls');
const forge = require('node-forge');
const rootCAs = require('./rootCAs');

const getRootCAs = () => tls.rootCertificates || rootCAs;

const verifyRootCert = (chainRootInForgeFormat) => !!getRootCAs()
  .find((rootCAInPem) => {
    try {
      const rootCAInForgeCert = forge.pki.certificateFromPem(rootCAInPem);
      return forge.pki.certificateToPem(chainRootInForgeFormat) === rootCAInPem
      || rootCAInForgeCert.issued(chainRootInForgeFormat);
    } catch (e) {
      return false;
    }
  });

const verifyCaBundle = (certs) => !!certs
  .find((cert, i) => certs[i + 1] && certs[i + 1].issued(cert));

const isCertsExpired = (certs) => !!certs
  .find(({ validity: { notAfter, notBefore } }) => notAfter.getTime() < Date.now()
  || notBefore.getTime() > Date.now());

const authenticateSignature = (certs) => verifyCaBundle(certs)
&& verifyRootCert(certs[certs.length - 1]);

module.exports = {
  authenticateSignature,
  verifyCaBundle,
  verifyRootCert,
  isCertsExpired,
};
