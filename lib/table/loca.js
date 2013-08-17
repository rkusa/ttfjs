var Struct = require('structjs')
module.exports = function(indexToLocFormat, numGlyphs) {
  switch (indexToLocFormat) {
    case 0: return new Struct({
      offsets: Struct.Array(Struct.Uint16, numGlyphs + 1)
    })
    case 1: return new Struct({
      offsets: Struct.Array(Struct.Uint32, numGlyphs + 1)
    })
  }
}

