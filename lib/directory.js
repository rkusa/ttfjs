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
  searchRange:   Struct.Uint16.with({
    $packing: function() {
      var searchRange, next = 1
      while ((next = next * 2) <= this.numTables) {
        searchRange = next
      }
      return searchRange * 16
    }
  }),
  entrySelector: Struct.Uint16.with({
    $packing: function() {
      return Math.log(this.searchRange / 16) / Math.LN2
    }
  }),
  rangeShift:    Struct.Uint16.with({
    $packing: function() {
      return this.numTables * 16 - this.searchRange
    }
  }),
  entries:       Struct.Hash(Entry, 'tag', Struct.Ref('numTables'))
})