const forge = require('node-forge');
const VerifyPDFError = require('./VerifyPDFError');
const {
  extractSignature,
  getMessageFromSignature,
  getClientCertificate,
  checkForSubFilter,
  preparePDF,
  authenticateSignature,
  sortCertificateChain,
  isCertsExpired,
} = require('./helpers');
const { extractCertificatesDetails } = require('./certificateDetails');

const verify = (signature, signedData, signatureMeta) => {
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
  const hashAlgorithm = forge.pki.oids[hashAlgorithmOid].toLowerCase();
  const set = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.SET,
    true,
    attrs,
  );
  const clientCertificate = getClientCertificate(certificates);
  const digest = forge.md[hashAlgorithm]
    .create()
    .update(forge.asn1.toDer(set).data)
    .digest()
    .getBytes();
  const validAuthenticatedAttributes = clientCertificate.publicKey.verify(digest, sig);
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
  const dataDigest = forge.md[hashAlgorithm]
    .create()
    .update(signedData.toString('latin1'))
    .digest()
    .getBytes();
  const integrity = dataDigest === attrDigest;
  const sortedCerts = sortCertificateChain(certificates);
  const parsedCerts = extractCertificatesDetails(sortedCerts);
  const authenticity = authenticateSignature(sortedCerts);
  const expired = isCertsExpired(sortedCerts);
  return ({
    verified: integrity && authenticity && !expired,
    authenticity,
    integrity,
    expired,
    meta: { certs: parsedCerts, signatureMeta },
  });
};

module.exports = (pdf) => {
  const pdfBuffer = preparePDF(pdf);
  checkForSubFilter(pdfBuffer);
  try {
    const { signatureStr, signedData, signatureMeta } = extractSignature(pdfBuffer);

    const signatures = signedData.map((signed, index) => {
      return (verify(signatureStr[index], signed, signatureMeta[index]));
    })

    return {
      verified: signatures.every(o => o.verified === true),
      authenticity: signatures.every(o => o.authenticity === true),
      integrity: signatures.every(o => o.integrity === true),
      expired: signatures.some(o => o.expired === true),
      signatures
    };
  } catch (error) {
    return ({ verified: false, message: error.message, error });
  }
};
