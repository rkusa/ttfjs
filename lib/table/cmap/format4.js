var Struct = require('structjs')

var Format4 = module.exports = new Struct({
  format:        Struct.Uint16,
  length:        Struct.Uint16,
  language:      Struct.Uint16,
  segCountX2:    Struct.Uint16,
  searchRange:   Struct.Uint16,
  entrySelector: Struct.Uint16,
  rangeShift:    Struct.Uint16,
  endCode:       Struct.Array(Struct.Uint16, function() { return this.segCountX2 / 2 }),
  reservedPad:   Struct.Uint16,
  startCode:     Struct.Array(Struct.Uint16, function() { return this.segCountX2 / 2 }),
  idDelta:       Struct.Array(Struct.Uint16, function() { return this.segCountX2 / 2 }),
  idRangeOffset: Struct.Array(Struct.Uint16, function() { return this.segCountX2 / 2 })
})

Format4.prototype.$initialize = function() {
  this.codeMap = {}
  for (var i = 0, len = this.segCountX2 / 2; i < len; ++i) {
    var endCode = this.endCode[i], startCode = this.startCode[i]
      , idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i]
    
    for (var code = startCode; code < endCode; ++code) {
      var id
      if (idRangeOffset === 0) id = code + idDelta
      else id = this._view.getUint16(
        (this._offset + 22 + ((this.segCountX2 / 2) - 1) * 6) + i * 2
        + idRangeOffset + 2 * (code - startCode)
      )
      
      this.codeMap[code] = id & 0xFFFF
    }
  }
}