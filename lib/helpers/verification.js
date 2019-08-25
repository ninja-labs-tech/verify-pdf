const tls = require('tls');
const forge = require('node-forge');

const verifyRootCert = (chainRootInForgeFormat) => {
  const chainRootInPem = forge.pki.certificateToPem(chainRootInForgeFormat);
  return !!tls.rootCertificates.find((rootCAInPem) => {
    try {
      const rootCAInForgeCert = forge.pki.certificateFromPem(rootCAInPem);
      return chainRootInPem === rootCAInPem
      || rootCAInForgeCert.issued(chainRootInForgeFormat);
    } catch (e) {
      return false;
    }
  });
};

const verifyCaBundle = (certs) => {
  let verified = true;
  for (let i = certs.length - 1; i > 0; i -= 1) {
    verified = certs[i].verify(certs[i - 1]);
  }
  return verified;
};

const authenticateSignature = (certs) => verifyCaBundle(certs)
&& verifyRootCert(certs[certs.length - 1]);


module.exports = {
  authenticateSignature,
};
