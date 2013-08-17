var Struct = require('structjs')

var SubTable = new Struct({
  platformID:         Struct.Uint16,
  platformSpecificID: Struct.Uint16,
  offset:             Struct.Uint32,
  format:             Struct.Uint16.from(function() {
    return this.offset
  })
})

SubTable.prototype.$initialize = function() {
  if (!this.isUnicode) return
  this.build()
}

SubTable.prototype.build = function() {
  var format
  switch (this.format) {
    case 4:  format = new (require('./cmap/format4')); break
    default: return
  }
  format.unpack(this._view, this.offset)
  this.codeMap = format.codeMap
}

Object.defineProperty(SubTable.prototype, 'isUnicode', {
  enumerable: true,
  get: function() {
           //this.format === 4 &&
    return ((this.platformID === 3 // Windows platform-specific encoding
             && this.platformSpecificID === 1) // http://www.microsoft.com/typography/otspec/name.htm
           || this.platformID === 0) // Unicode platform-specific encoding
  }
})

module.exports = new Struct({
  version:         Struct.Uint16,
  numberSubtables: Struct.Uint16,
  subtables:       Struct.Array(SubTable, function() {
    return this.numberSubtables
  })
})