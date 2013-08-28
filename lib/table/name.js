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

Name.prototype.embed = function(charMap) {
  var postscriptName = null
  for (var i = 0; i < this.records.length; ++i) {
    var record = this.records[i]
    if (record.nameID === 6) {
      if (postscriptName === null) postscriptName = record.string
      this.records.splice(i--, 1)
    }
  }
  this.records.push(new Record({
    platformID: 1,
    encodingID: 0,
    languageID: 0,
    nameID: 6,
    length: 0,
    offset: 0,
    string: "MARKUS+" + postscriptName
  }))
  
  // sample text
  // var sample = this.records.filter(function(record) {
  //   return record.nameID === 19
  // })[0]
  // if (!sample) {
  //   sample = new Record({
  //     platformID: 0,
  //     encodingID: 3,
  //     languageID: 0,
  //     nameID: 19,
  //     length: 0,
  //     offset: 0
  //   })
  //   this.records.push(sample)
  // }
  // sample.string = String.fromCharCode.apply(String, Object.keys(charMap))
}