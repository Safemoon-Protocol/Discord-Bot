const requiredString = {
  type: String,
  required: true
}

const requiredNumber = {
  type: Number,
  required: true
}

const requiredBool = {
  type: Boolean,
  required: true
}

const nonRequiredNumber = {
  type: Number,
}

const nonRequiredString = {
  type: String,
}

module.exports = {
  requiredString,
  requiredNumber,
  requiredBool,
  nonRequiredNumber,
  nonRequiredString,
}
