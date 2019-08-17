const sortCertificateChain = (certs) => Array.from(certs).sort((a, b) => (b.issued(a) ? -1 : 1));

const getClientCertificate = (certs) => sortCertificateChain(certs)[0];

module.exports = {
  sortCertificateChain,
  getClientCertificate,
};
