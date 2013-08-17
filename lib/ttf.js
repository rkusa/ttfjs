var fs = require('fs')
  , Directory = require('./directory')

var TTFFont = module.exports = function(path) {
  var self = this
    , buffer = toArrayBuffer(fs.readFileSync(path))
  
  var directory = new Directory()
  directory.unpack(new DataView(buffer))

  var scalerType = directory.scalerType.toString(16)
  if (scalerType !== '74727565' && scalerType !== '10000') {
    throw new Error('Not a TrueType font')
  }
  
  this.tables = {}
  function unpackTable(table, args) {
    var name = table.replace(/[^a-z0-9]/ig, '').toLowerCase()
    var Table = require('./table/' + name)
      , view  = new DataView(buffer, directory.entries[table].offset, 
                                     directory.entries[table].length)
    if (Table.length) Table = Table.apply(undefined, args)
    self.tables[name] = (new Table).unpack(view)
  }
  
  unpackTable('cmap')
  // unpackTable('glyf')
  // console.log(this.tables.loca)
  unpackTable('head')
  unpackTable('hhea')
  unpackTable('maxp')
  unpackTable('hmtx', [this.tables.hhea.numOfLongHorMetrics, this.tables.maxp.numGlyphs])
  unpackTable('loca', [this.tables.head.indexToLocFormat, this.tables.maxp.numGlyphs])
  unpackTable('name')
  unpackTable('post')
  // I don't want to bother with version handling, therefore skip glyhp names
  // by setting version to 3.0, TODO: bother with it ...
  this.tables.post.version = 196608
  unpackTable('OS/2')
  
  this.postscriptName = this.tables.name.records.filter(function(record) {
    return record.nameID === 6
  })[0].string
}

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}