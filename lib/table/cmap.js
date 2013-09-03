var Struct = require('structjs')

var Table = new Struct({
  format:        Struct.Uint16
}, { storage: true, offset: Struct.Ref('offset') })

Table.conditional(function() { return this.format === 4 }, {
  length:          Struct.Uint16,
  language:        Struct.Uint16,
  segCount:        Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  searchRange:     Struct.Uint16,
  entrySelector:   Struct.Uint16,
  rangeShift:      Struct.Uint16,
  endCode:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  reservedPad:     Struct.Uint16,
  startCode:       Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idDelta:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idRangeOffset:   Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  glyphIndexArray: Struct.Array(Struct.Uint16, function() {
    var length = (this.length - (8 + this.segCount * 4) * 2) / 2
    return length
  })
})

Table.prototype.$unpacked = function() {
  if (this.format !== 4) return
  this.codeMap = {}
  for (var i = 0, len = this.segCount; i < len; ++i) {
    var endCode = this.endCode[i], startCode = this.startCode[i]
      , idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i]
    
    for (var code = startCode; code <= endCode; ++code) {
      var id
      if (idRangeOffset === 0) id = code + idDelta
      else {
        var index = idRangeOffset / 2 + (code - startCode) - (this.segCount - i)
        id = this.glyphIndexArray[index] || 0 // because some TTF fonts are broken
        if (id != 0) id += idDelta
      }
      
      this.codeMap[code] = id & 0xFFFF
    }
  }
}

var SubTable = new Struct({
  platformID:         Struct.Uint16,
  platformSpecificID: Struct.Uint16,
  offset:             Struct.Uint32,
  format:             Struct.Uint16.from(Struct.Ref('offset')),
  table:              Table
})

Object.defineProperty(SubTable.prototype, 'isUnicode', {
  enumerable: true,
  get: function() {
           //this.format === 4 &&
    return ((this.platformID === 3 // Windows platform-specific encoding
             && this.platformSpecificID === 1) // http://www.microsoft.com/typography/otspec/name.htm
           || this.platformID === 0) // Unicode platform-specific encoding
  }
})

var Cmap = module.exports = new Struct({
  version:         Struct.Uint16,
  numberSubtables: Struct.Uint16,
  subtables:       Struct.Array(SubTable, Struct.Ref('numberSubtables')),
  tables:          Struct.Storage('subtables.table')
})

Cmap.prototype.embed = function(cmap) {
  var codes = Object.keys(cmap).sort(function(a, b) {
    return a - b
  })
  
  var nextId = 0, map = {}, charMap = {}, last = diff = null, endCodes = [], startCodes = []
  codes.forEach(function(code) {
    var old = cmap[code]
    if (map[old] === undefined) map[old] = ++nextId
    charMap[code] = { old: old, new: map[old] }
    var delta = map[old] - code
    if (last === null || delta !== diff) {
      if (last) endCodes.push(last)
      startCodes.push(code)
      diff = delta
    }
    last = code
  })
  
  if (last) endCodes.push(last)
  endCodes.push(0xFFFF)
  startCodes.push(0xFFFF)
  
  var segCount      = startCodes.length
    , segCountX2    = segCount * 2
    , searchRange   = 2 * Math.pow(Math.log(segCount) / Math.LN2, 2)
    , entrySelector = Math.log(searchRange / 2) / Math.LN2
    , rangeShift    = 2 * segCount - searchRange
  
  var deltas = []
    , rangeOffsets = []
    , glyphIDs = []
  
  for (var i = 0, len = startCodes.length; i < len; ++i) {
    var startCode = startCodes[i]
      , endCode = endCodes[i]
      
    if (startCode === 0xFFFF) {
      deltas.push(0)
      rangeOffsets.push(0)
      break
    }
    
    var startGlyph = charMap[startCode].new
    if (startCode - startGlyph >= 0x8000) {
      deltas.push(0)
      rangeOffsets.push(2 * (glyphIDs.length + segCount - i))
      
      for (var code = startCode; code < endCode; ++startCode) {
        glyphIDs.push(charMap[code].new)
      }
    } else {
      deltas.push(startGlyph - startCode)
      rangeOffsets.push(0)
    }
  }
  
  var subtable = new SubTable({
    platformID: 3,
    platformSpecificID: 1,
    offset: 12,
    table: new Table({
      format: 4,
      length: 16 + segCount * 8 + glyphIDs.length * 2,
      language: 0,
      segCount: segCount,
      searchRange: searchRange,
      entrySelector: entrySelector,
      rangeShift: rangeShift,
      endCode: endCodes,
      reservedPad: 0,
      startCode: startCodes,
      idDelta: deltas,
      idRangeOffset: rangeOffsets,
      glyphIndexArray: glyphIDs
    })
  })
      
  return {
    charMap: charMap,
    subtable: subtable,
    maxGlyphID: nextId + 1
  }
}