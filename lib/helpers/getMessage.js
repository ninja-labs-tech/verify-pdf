const forge = require('node-forge');

module.exports = (signature) => {
  const p7Asn1 = forge.asn1.fromDer(signature);
  return forge.pkcs7.messageFromAsn1(p7Asn1);
};
