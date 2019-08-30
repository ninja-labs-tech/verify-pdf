const forge = require('node-forge');
const crypto = require('crypto');
const VerifyPDFError = require('./VerifyPDFError');
const {
  extractSignature,
  getMessageFromSignature,
  getClientCertificate,
  checkForPDFBuffer,
  checkForSubFilter,
  authenticateSignature,
  sortCertificateChain,
  isCertsExpired,
} = require('./helpers');
const { extractCertificatesDetails } = require('./certificateDetails');

module.exports = (pdfBuffer) => {
  checkForPDFBuffer(pdfBuffer);
  checkForSubFilter(pdfBuffer);
  try {
    const { signature, signedData } = extractSignature(pdfBuffer);
    const message = getMessageFromSignature(signature);
    const {
      certificates,
      rawCapture: {
        signature: sig,
        authenticatedAttributes: attrs,
        digestAlgorithm,
      },
    } = message;
    const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
    const hashAlgorithm = forge.pki.oids[hashAlgorithmOid].toUpperCase();
    const set = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SET,
      true,
      attrs,
    );
    const buf = Buffer.from(forge.asn1.toDer(set).data, 'latin1');
    const clientCertificate = getClientCertificate(certificates);
    const cert = forge.pki.certificateToPem(clientCertificate);
    const validAuthenticatedAttributes = crypto.createVerify(hashAlgorithm)
      .update(buf)
      .verify(cert, sig, 'latin1');
    if (!validAuthenticatedAttributes) {
      throw new VerifyPDFError(
        'Wrong authenticated attributes',
        VerifyPDFError.VERIFY_SIGNATURE,
      );
    }
    const messageDigestAttr = forge.pki.oids.messageDigest;
    const fullAttrDigest = attrs
      .find((attr) => forge.asn1.derToOid(attr.value[0].value) === messageDigestAttr);
    const attrDigest = fullAttrDigest.value[1].value[0].value;
    const dataDigest = crypto.createHash(hashAlgorithm)
      .update(signedData)
      .digest();
    const integrity = dataDigest.toString('latin1') === attrDigest;
    const sortedCerts = sortCertificateChain(certificates);
    const parsedCerts = extractCertificatesDetails(sortedCerts);
    const authenticity = authenticateSignature(sortedCerts);
    const expired = isCertsExpired(sortedCerts);
    return ({
      verified: integrity && authenticity && !expired,
      authenticity,
      integrity,
      expired,
      meta: { certs: parsedCerts },
    });
  } catch (err) {
    return ({ verified: false, message: err.message });
  }
};
