export default function CustomError (name, message) {
  this.name = name
  this.message = message
  this.stack = (new Error()).stack
}
CustomError.prototype = Object.create(Error.prototype)
CustomError.prototype.constructor = CustomError