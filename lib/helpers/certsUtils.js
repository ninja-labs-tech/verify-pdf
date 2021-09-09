const issued = (cert) => (anotherCert) => cert !== anotherCert && anotherCert.issued(cert);

const getIssuer = (certsArray) => (cert) => certsArray.find(issued(cert));

const inverse = (f) => (x) => !f(x);

const hasNoIssuer = (certsArray) => inverse(getIssuer(certsArray));

const getChainRootCertificateIdx = (certsArray) => certsArray.findIndex(hasNoIssuer(certsArray));

const isIssuedBy = (cert) => (anotherCert) => cert !== anotherCert && cert.issued(anotherCert);

const getChildIdx = (certsArray) => (parent) => certsArray.findIndex(isIssuedBy(parent));

const sortCertificateChain = (certs) => {
  const certsArray = Array.from(certs);
  const rootCertIndex = getChainRootCertificateIdx(certsArray);
  const certificateChain = certsArray.splice(rootCertIndex, 1);
  while (certsArray.length) {
    const lastCert = certificateChain[0];
    const childCertIdx = getChildIdx(certsArray)(lastCert);
    if (childCertIdx === -1) certsArray.splice(childCertIdx, 1);
    else {
      const [childCert] = certsArray.splice(childCertIdx, 1);
      certificateChain.unshift(childCert);
    }
  }
  return certificateChain;
};

const getClientCertificate = (certs) => sortCertificateChain(certs)[0];

module.exports = {
  sortCertificateChain,
  getClientCertificate,
};
