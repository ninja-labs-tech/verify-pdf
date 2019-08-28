const attrs = {
  rootCaAttrs: [{
    name: 'commonName',
    value: 'root-ca.com',
  }, {
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Virginia',
  }, {
    name: 'localityName',
    value: 'Blacksburg',
  }, {
    name: 'organizationName',
    value: 'Test',
  }, {
    shortName: 'OU',
    value: 'Test',
  }],
  intermediateCaAttrs: [{
    name: 'commonName',
    value: 'intermediate-ca.com',
  }, {
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Virginia',
  }, {
    name: 'localityName',
    value: 'Blacksburg',
  }, {
    name: 'organizationName',
    value: 'Test',
  }, {
    shortName: 'OU',
    value: 'Test',
  }],
  clientAttrs: [{
    name: 'commonName',
    value: 'client-ca.com',
  }, {
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Virginia',
  }, {
    name: 'localityName',
    value: 'Blacksburg',
  }, {
    name: 'organizationName',
    value: 'Test',
  }, {
    shortName: 'OU',
    value: 'Test',
  }],
};

const pdfs = {
  'samplecertifiedpdf.pdf': {
    verified: false,
    integrity: true,
    authenticity: false,
  },
  'pdf_digital_signature_timestamp.pdf': {
    verified: false,
    integrity: true,
    authenticity: false,
  },
  '25-certificado-firmado.pdf': {
    verified: false,
    integrity: true,
    authenticity: false,
  },
  'blank_signed.pdf': {
    verified: false,
    integrity: true,
    authenticity: true,
    expired: true,
  },
};
module.exports = {
  attrs,
  pdfs,
};
