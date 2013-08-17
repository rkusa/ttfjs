var Struct = require('structjs')

var Entry = module.exports = new Struct({
  tag:      Struct.String(4),
  checkSum: Struct.Uint32,
  offset:   Struct.Uint32,
  length:   Struct.Uint32
})

var Directory = module.exports = new Struct({
  scalerType:    Struct.Int32,
  numTables:     Struct.Uint16,
  searchRange:   Struct.Uint16,
  entrySelector: Struct.Uint16,
  rangeShift:    Struct.Uint16,
  entries:       Struct.Hash(Entry, 'tag', function() {
    return this.numTables
  })
})