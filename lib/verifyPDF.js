const forge = require('node-forge');
const crypto = require('crypto');
const VerifyPDFError = require('./VerifyPDFError');
const {
  extractSignature,
  getMessageFromSignature,
  getClientCertificate,
  checkTypeOfPDF,
} = require('./helpers');
const { extractCertificatesDetails } = require('./certificateDetails');

module.exports = (pdfBuffer) => {
  checkTypeOfPDF(pdfBuffer);
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
    // TODO: when node-forge implemets pkcs7.verify method,
    // we should use message.verify to verify the whole signature
    // instead of validating authenticatedAttributes only
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
    const validContentDigest = dataDigest.toString('latin1') === attrDigest;
    if (!validContentDigest) {
      throw new VerifyPDFError(
        'Wrong content digest',
        VerifyPDFError.VERIFY_SIGNATURE,
      );
    }
    return ({
      verified: true,
      meta: {
        certs: extractCertificatesDetails(certificates),
      },
    });
  } catch (err) {
    return ({ verified: false, message: err.message });
  }
};
