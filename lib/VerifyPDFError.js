const TYPE_UNKNOWN = 'TYPE_UNKNOWN';
const TYPE_INPUT = 'TYPE_INPUT';
const TYPE_PARSE = 'TYPE_PARSE';
const VERIFY_SIGNATURE = 'VERIFY_SIGNATURE';
const UNSUPPORTED_SUBFILTER = 'UNSUPPORTED_SUBFILTER';

class VerifyPDFError extends Error {
  constructor(msg, type = TYPE_UNKNOWN) {
    super(msg);
    this.type = type;
  }
}

// Shorthand
Object.assign(VerifyPDFError, {
  TYPE_UNKNOWN,
  TYPE_INPUT,
  TYPE_PARSE,
  VERIFY_SIGNATURE,
  UNSUPPORTED_SUBFILTER,
});

module.exports = VerifyPDFError;
