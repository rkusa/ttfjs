var Struct = require('structjs')

module.exports = function(loca) {
  return new Glyf(loca)
}

var Glyf = function(loca) {
  this.loca  = loca
  this.cache = {}
}

Glyf.prototype.clone = function() {
  var clone = new Glyf(this.loca)
  clone.cache = this.cache
  return clone
}

Glyf.prototype.embed = function(glyphs, mapping, old2new) {
  var offsets = [], offset = 0
  this.mapping = mapping
  this.glyphs = glyphs
  mapping.forEach(function(id) {
    var glyph = glyphs[id]
    offsets.push(offset)
    if (!glyph) return
    glyph.embed(old2new)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
  offsets.push(offset)
  return offsets
}

Glyf.prototype.for = function(id) {
  if (id in this.cache) return this.cache[id]
  
  var index  = this.loca.indexOf(id)
    , length = this.loca.lengthOf(id)
    
  if (length === 0) return this.cache[id] = null
  return this.cache[id] = (new Glyph()).unpack(new DataView(this.view.buffer, this.view.byteOffset + index, length))
}

Glyf.prototype.unpack = function(view) {
  this.view = view
  return this
}

Glyf.prototype.pack = function(view, offset) {
  var self = this
  this.mapping.forEach(function(id) {
    var glyph = self.glyphs[id]
    if (!glyph) return
    glyph.pack(view, offset)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
}

Glyf.prototype.lengthFor = function() {
  return 1
}

Glyf.prototype.sizeFor = function() {
  var size = 0
  for (var id in this.cache) {
    var glyph = this.cache[id]
    if (!glyph) continue
    size += glyph.lengthFor() * glyph.sizeFor()
  }
  return size
}

var ARG_1_AND_2_ARE_WORDS    = 0x0001
  , WE_HAVE_A_SCALE          = 0x0008
  , MORE_COMPONENTS          = 0x0020
  , WE_HAVE_AN_X_AND_Y_SCALE = 0x0040
  , WE_HAVE_A_TWO_BY_TWO     = 0x0080
  , WE_HAVE_INSTRUCTIONS     = 0x0100

// Currently, it is all about being able to create font subsets.
// Therefore, it is not necessary to actually decompose the glyph
// into it's parts. Important are the locations within the provided
// buffer to be able to rewrite the glyph ids for subsets.
var Glyph = function() {
}

Glyph.prototype.unpack = function(view) {
  this.view = view
  this.isCompound = view.getInt16(0) === -1
  
  if (this.isCompound) {
    this.ids = []
    this.offsets = []
    var offset = 10

    // thanks to https://github.com/prawnpdf/ttfunk
    while(true) {
      var flags = this.view.getInt16(offset)
        , id    = this.view.getInt16(offset + 2)
      this.ids.push(id)
      this.offsets.push(offset + 2)
      
      if (!(flags & MORE_COMPONENTS)) break
      
      offset += 4
      
      if (flags & ARG_1_AND_2_ARE_WORDS) offset += 4
      else                               offset += 2
      
      if (flags & WE_HAVE_A_TWO_BY_TWO)          offset += 8
      else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) offset += 4
      else if (flags & WE_HAVE_A_SCALE)          offset += 2
    }
  }
  
  return this
}

Glyph.prototype.pack = function(view, offset) {
  for (var i = 0, len = this.view.byteLength; i < len; ++i) {
    view.setUint8(offset + i, this.view.getUint8(i))
  }
}

Glyph.prototype.lengthFor = function() {
  return 1
}

Glyph.prototype.sizeFor = function() {
  return this.view.byteLength
}

Glyph.prototype.embed = function(mapping) {
  if (!this.isCompound) return
  var self = this
  this.ids.forEach(function(id, i) {
    self.view.setUint16(self.offsets[i], mapping[id])
  })
}