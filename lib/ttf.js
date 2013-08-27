var fs = require('fs')
  , Directory = require('./directory')

var TTFFont = module.exports = function(path) {
  var self = this
    , buffer = this.buffer = toArrayBuffer(fs.readFileSync(path))
  
  this.directory = new Directory()
  this.directory.unpack(new DataView(buffer))
  
  var scalerType = this.directory.scalerType.toString(16)
  if (scalerType !== '74727565' && scalerType !== '10000') {
    throw new Error('Not a TrueType font')
  }
  
  this.tables = {}
  function unpackTable(table, args) {
    var name = table.replace(/[^a-z0-9]/ig, '').toLowerCase()
    var Table = require('./table/' + name)
      , view  = new DataView(buffer, self.directory.entries[table].offset, 
                                     self.directory.entries[table].length)
    if (args) Table = Table.apply(undefined, args)
    self.tables[name] = self.tables[table] = (typeof Table === 'function' ? new Table : Table).unpack(view)
  }
  
  unpackTable('cmap')
  for (var i = 0, len = this.tables.cmap.subtables.length; i < len; ++i) {
    var subtable = this.tables.cmap.subtables[i]
    if (subtable.isUnicode) {
      self.codeMap = subtable.table.codeMap
      break
    }
  }
  if (!this.codeMap) throw new Error('Font does not contain a Unicode Cmap.')
  
  unpackTable('head')
  unpackTable('hhea')
  unpackTable('maxp')
  unpackTable('hmtx', [this.tables.hhea.numOfLongHorMetrics, this.tables.maxp.numGlyphs])
  unpackTable('loca', [this.tables.head.indexToLocFormat, this.tables.maxp.numGlyphs])
  unpackTable('glyf', [this.tables.loca])
  unpackTable('name')
  unpackTable('post')
  // I don't want to bother with post's versions, therefore skip glyhp names
  // by setting version to 3.0, TODO: bother with it ...
  this.tables.post.version = 196608
  unpackTable('OS/2')
  
  this.postscriptName = this.tables.name.records.filter(function(record) {
    return record.nameID === 6
  })[0].string
}


TTFFont.prototype.save = function() {
  var self = this, tables = ['cmap', 'glyf', 'loca', 'hmtx', 'hhea', 'maxp', 'post', 'name', 'head', 'OS/2', 'cvt', 'fpgm', 'prep']
  for (var name in this.directory.entries) {
    if (!!!~tables.indexOf(name)) delete this.directory.entries[name]
  }
  
  // calculate total size
  var size = offset = this.directory.lengthFor(this.directory, true) * this.directory.sizeFor(this.directory, true)

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name]
    var length = table ? table.lengthFor(table, true) * table.sizeFor(table, true)
                       : self.directory.entries[name].length
    size += length + length % 4
  })
  
  // prepare head
  this.tables.head.checkSumAdjustment = 0
  
  var view = new DataView(new ArrayBuffer(size + 1000))

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name], entry = self.directory.entries[name]
    if (!table) {
      var from = new DataView(self.buffer, entry.offset, entry.length)
      for (var i = 0; i < entry.length; ++i) view.setUint8(offset + i, from.getUint8(i))
      entry.offset = offset
    } else {
      table.pack(view, offset)
      entry.offset = offset
      entry.length = table.lengthFor(table, true) * table.sizeFor(table, true)
    }
    
    // pad up to a length completely divisible by 4
    var padding = entry.length % 4, length = entry.length + padding
    for (var i = entry.offset + entry.length, to = i + padding; i < to; ++i)
      view.setInt8(i, 0)
    
    // checksum
    var sum = 0
    for (var i = 0; i < length; i += 4)
      sum += view.getInt32(offset + i)
    entry.checkSum = sum
    
    // update offset for the next table
    offset += length
  })
  
  this.directory.pack(view, 0)
  
  // file checksum
  var sum = 0
  for (var i = 0; i < size; i += 4)
    sum += view.getInt32(i)
  this.tables.head.checkSumAdjustment = 0xB1B0AFBA - sum
  this.tables.head.pack(view, this.directory.entries.head.offset)
  
  return view.buffer
}

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}