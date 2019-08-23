# verify-pdf

[![Build Status](https://travis-ci.com/ninja-labs-tech/verify-pdf.svg?branch=master)](https://travis-ci.com/ninja-labs-tech/verify-pdf)

verify pdf files in JS.

## Verifying PDF signature

The signed PDF file has the public certificate embedded in it, so all we need to verify a PDF file is the file itself.

## Installation

```
npm i @ninja-labs/verify-pdf
```

## Verifying

Verify the digital signature of the pdf and extract the certificates details

```javascript
const verifyPDF = require('@ninja-labs/verify-pdf');
...

const signedPdfBuffer = getSignedPDFBuffer();
const { verified, meta } = verifyPDF(signedPdfBuffer);
```

## Certificates

You can get the details of the certificate chain by using the following api.

```javascript
const { getCertificatesInfoFromPDF } = require('@ninja-labs/verify-pdf');
...

const signedPdfBuffer = getSignedPDFBuffer();
const certs = getCertificatesInfoFromPDF(signedPdfBuffer);
```
Each certificate will contain the following properties:

* issuedBy: The issuer of the certificate.
* issuedTo: The owner of the certificate.
* validityPeriod: The start and end date of the certificate.
* pemCertificate: Certificate in pem format.
* clientCertificate: true for the client certificate. 

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

## Credits

* The process of signing and verifying a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/acrobatetk/tools/DigSigDC/Acrobat_DigitalSignatures_in_PDF.pdf) document.
* This incredible [Stack Overflow answer](https://stackoverflow.com/questions/15969733/verify-pkcs7-pem-signature-unpack-data-in-node-js/16148331#16148331) for describing the whole process of verifying PKCS7 signatures.
