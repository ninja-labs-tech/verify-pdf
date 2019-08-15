const TYPE_UNKNOWN = 1;
const TYPE_INPUT = 2;
const TYPE_PARSE = 3;
const VERIFY_SIGNATURE = 4;

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
});

module.exports = VerifyPDFError;
