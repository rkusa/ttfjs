var Struct = require('structjs')

var Record = new Struct({
  platformID: Struct.Uint16,
  encodingID: Struct.Uint16,
  languageID: Struct.Uint16,
  nameID:     Struct.Uint16,
  length:     Struct.Uint16,
  offset:     Struct.Uint16,
  string:     Struct.String({
    external: true,
    size:     2,
    length: function() { return this.length },
    offset: function() { return this.parent.stringOffset + this.offset }
  })
})

var Head = module.exports = new Struct({
  format:       Struct.Uint16,
  count:        Struct.Uint16,
  stringOffset: Struct.Uint16,
  records:      Struct.Array(Record, function() { return this.count })
})