var Struct = require('structjs')
module.exports = function(indexToLocFormat, numGlyphs) {
  var Loca
  switch (indexToLocFormat) {
    case 0:
      Loca = new Struct({
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
      break
    case 1:
      Loca = new Struct({
        offsets: Struct.Array(Struct.Uint32, numGlyphs + 1)
      })
      break
  }
  
  Loca.prototype.indexOf = function(id) {
    return this.offsets[id]
  }

  Loca.prototype.lengthOf = function(id) {
    return this.offsets[id + 1] - this.offsets[id]
  }
  
  Loca.prototype.embed = function(offsets) {
    this._definition.offsets._length = offsets.length
    this.offsets = offsets
  }
  
  return Loca
}