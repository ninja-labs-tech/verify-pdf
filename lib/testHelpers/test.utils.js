const forge = require('node-forge');
const path = require('path');
const PDFDocument = require('pdfkit');
const { pdfkitAddPlaceholder } = require('node-signpdf/dist/helpers');
const {
  attrs: { rootCaAttrs, intermediateCaAttrs, clientAttrs },
} = require('./../testHelpers/test.data');
/**
 * Creates a Buffer containing a PDF.
 * Returns a Promise that is resolved with the resulting Buffer of the PDFDocument.
 * @returns {Promise<Buffer>}
 */
const createPDF = (params = { placeholder: {}, text: 'node-signpdf' }) => new Promise((resolve) => {
  const pdf = new PDFDocument({
    autoFirstPage: true,
    size: 'A4',
    layout: 'portrait',
    bufferPages: true,
  });
  pdf.info.CreationDate = '';

  // Add some content to the page
  pdf
    .fillColor('#333')
    .fontSize(25)
    .moveDown()
    .text(params.text);

  // Collect the ouput PDF
  // and, when done, resolve with it stored in a Buffer
  const pdfChunks = [];
  pdf.on('data', (data) => {
    pdfChunks.push(data);
  });
  pdf.on('end', () => {
    resolve(Buffer.concat(pdfChunks));
  });

  // Externally (to PDFKit) add the signature placeholder.
  const refs = pdfkitAddPlaceholder({
    pdf,
    reason: 'I am the author',
    ...params.placeholder,
  });
    // Externally end the streams of the created objects.
    // PDFKit doesn't know much about them, so it won't .end() them.
  Object.keys(refs).forEach((key) => refs[key].end());

  // Also end the PDFDocument stream.
  // See pdf.on('end'... on how it is then converted to Buffer.
  pdf.end();
});


const getResourceAbsolutePath = (resourceRelativePath = '') => path.join(__dirname, '../../test-resources', resourceRelativePath);

const createCertificate = ({
  subjectAttrs,
  issuerAttrs,
  serialNumber,
  selfSignedCertificate,
  privateKey,
  password,
  notBefore,
  notAfter,
}) => {
  const { pki } = forge;
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialNumber;
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  cert.setSubject(subjectAttrs);
  cert.setIssuer(issuerAttrs);
  const signingKey = selfSignedCertificate ? keys.privateKey : privateKey;
  cert.sign(signingKey);
  const pkcs12Asn1 = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey, [cert], password,
    { generateLocalKeyId: true, friendlyName: 'test' },
  );
  return {
    pkcs12Cert: forge.asn1.toDer(pkcs12Asn1).getBytes(),
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    pemCertificate: forge.pki.certificateToPem(cert),
  };
};

const parseAttrs = (attrs) => attrs.reduce((agg, ele) => {
  const key = ele.name
  || (ele.shortName === 'ST' && 'stateOrProvinceName')
  || (ele.shortName === 'OU' || 'organizationalUnitName');
  agg[key] = ele.value;
  return agg;
}, {});

const createCertificateChain = ({
  clientExpired = false,
  intermediateExpired = false,
  rootExpired = false,
} = {}) => {
  const { pki: { certificateFromPem } } = forge;
  const passphrase = 'password';
  const notBefore = new Date('2015');
  // const notAfter = new Date('2020');
  const {
    pemCertificate: rootPemCertificate,
    privateKey: rootPrivateKey,
  } = createCertificate({
    subjectAttrs: rootCaAttrs,
    issuerAttrs: rootCaAttrs,
    serialNumber: '01',
    selfSignedCertificate: true,
    password: passphrase,
    notBefore,
    notAfter: rootExpired ? new Date('2017') : new Date('2030'),
  });
  const {
    pemCertificate: intermediatePemCertificate,
    privateKey: intermediatePrivateKey,
  } = createCertificate({
    subjectAttrs: intermediateCaAttrs,
    issuerAttrs: rootCaAttrs,
    serialNumber: '02',
    password: passphrase,
    notBefore,
    notAfter: intermediateExpired ? new Date('2017') : new Date('2030'),
    privateKey: rootPrivateKey,
  });
  const { pemCertificate: clientPemCertificate } = createCertificate({
    subjectAttrs: clientAttrs,
    issuerAttrs: intermediateCaAttrs,
    serialNumber: '03',
    password: passphrase,
    notBefore,
    notAfter: clientExpired ? new Date('2017') : new Date('2030'),
    privateKey: intermediatePrivateKey,
  });
  return [
    certificateFromPem(intermediatePemCertificate),
    certificateFromPem(clientPemCertificate),
    certificateFromPem(rootPemCertificate),
  ];
};

module.exports = {
  createPDF,
  getResourceAbsolutePath,
  createCertificate,
  parseAttrs,
  createCertificateChain,
};
