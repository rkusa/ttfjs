var Struct = require('structjs')
module.exports = function(indexToLocFormat, numGlyphs) {
  switch (indexToLocFormat) {
    case 0:
      var Loca = new Struct({
        offsets: Struct.Array(Struct.Uint16, numGlyphs + 1)
      })
      Loca.prototype.$unpacked = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] *= 2
        }
      }
      Loca.prototype.$packing = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] /= 2
        }
      }
      return Loca
    case 1:
      return new Struct({
        offsets: Struct.Array(Struct.Uint32, numGlyphs + 1)
      })
  }
}