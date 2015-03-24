var Struct = require('structjs')

var Record = new Struct({
  platformID: Struct.Uint16,
  encodingID: Struct.Uint16,
  languageID: Struct.Uint16,
  nameID:     Struct.Uint16,
  length:     Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  offset:     Struct.Uint16,
  string:     Struct.String({
    storage: true, size: 2,
    length: Struct.Ref('length'),
    offset: Struct.Ref('offset')
  })
})

var Name = module.exports = new Struct({
  format:       Struct.Uint16,
  count:        Struct.Uint16,
  stringOffset: Struct.Uint16,
  records:      Struct.Array(Record, Struct.Ref('count')),
  names:        Struct.Storage('records.string', Struct.Ref('stringOffset'))
})

Name.prototype.embed = function(charMap, trimNames) {
  var postscriptName = null
  for (var i = 0; i < this.records.length; ++i) {
    var record = this.records[i]

    if (trimNames && record.platformID !== 0) { // unicode
      this.records.splice(i--, 1)
      continue
    }

    switch (record.nameID) {
      case 0: // copyright
      case 2: // font subfamily name
      case 5: // version string
      case 7: // trademark
      case 13: // license description
      case 14: // license info URL
        // preserve
        break
      case 1: // font family name
      case 3: // unique font identifier
      case 4: // full font name
      case 6: // postscript name
        record.string = "TTFJS+" + record.string
        break
      default:
        this.records.splice(i--, 1)
        break
    }
  }
}