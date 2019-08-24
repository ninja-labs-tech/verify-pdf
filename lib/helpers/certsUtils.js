const issued = (cert) => (anotherCert) => cert !== anotherCert && anotherCert.issued(cert);

const getIssuer = (certsArray) => (cert) => certsArray.find(issued(cert));

const inverse = (f) => (x) => !f(x);

const hasNoIssuer = (certsArray) => inverse(getIssuer(certsArray));

const getChainRootCertificateIdx = (certsArray) => certsArray.findIndex(hasNoIssuer(certsArray));

const isIssuedBy = (cert) => (anotherCert) => cert !== anotherCert && cert.issued(anotherCert);

const getChildIdx = (certsArray) => (parent) => certsArray.findIndex(isIssuedBy(parent));

const sortCertificateChain = (certs) => {
  const certsArray = Array.from(certs);
  const noOfCerts = certsArray.length;
  const rootCertIndex = getChainRootCertificateIdx(certsArray);
  const certificateChain = certsArray.splice(rootCertIndex, 1);
  while (certificateChain.length < noOfCerts) {
    const lastCert = certificateChain[certificateChain.length - 1];
    let childCertIdx = getChildIdx(certsArray)(lastCert);
    if (childCertIdx === -1) childCertIdx = 0;
    const [childCert] = certsArray.splice(childCertIdx, 1);
    certificateChain.push(childCert);
  }
  return certificateChain.reverse();
};

const getClientCertificate = (certs) => sortCertificateChain(certs)[0];

module.exports = {
  sortCertificateChain,
  getClientCertificate,
};
