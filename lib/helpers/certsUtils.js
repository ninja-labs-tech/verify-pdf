const sortCertificateChain = (certs) => Array.from(certs).sort((a, b) => (b.issued(a) ? -1 : 0));

const getClientCertificate = (certs) => sortCertificateChain(certs)[0];

module.exports = {
  sortCertificateChain,
  getClientCertificate,
};
