var Struct = require('structjs')

var Format4 = module.exports = new Struct({
  format:        Struct.Uint16,
  length:        Struct.Uint16,
  language:      Struct.Uint16,
  segCount:      Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  searchRange:   Struct.Uint16,
  entrySelector: Struct.Uint16,
  rangeShift:    Struct.Uint16,
  endCode:       Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  reservedPad:   Struct.Uint16,
  startCode:     Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idDelta:       Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idRangeOffset: Struct.Array(Struct.Uint16, Struct.Ref('segCount'))
})

Format4.prototype.$unpacked = function() {
  this.codeMap = {}
  for (var i = 0, len = this.segCount; i < len; ++i) {
    var endCode = this.endCode[i], startCode = this.startCode[i]
      , idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i]
    
    for (var code = startCode; code < endCode; ++code) {
      var id
      if (idRangeOffset === 0) id = code + idDelta
      else id = this._view.getUint16(
        (this._offset + 22 + (this.segCount - 1) * 6) + i * 2
        + idRangeOffset + 2 * (code - startCode)
      )
      
      this.codeMap[code] = id & 0xFFFF
    }
  }
}