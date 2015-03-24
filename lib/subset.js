var Subset = module.exports = function(font, opts) {
  this.font    = font.clone()
  this.opts    = opts || {}
  this.subset  = { '32': 32 }
  this.mapping = { '32': 32 }
  this.pos     = 33
}

Subset.prototype.use = function(chars) {
  for (var i = 0, len = chars.length; i < len; ++i) {
    var code = chars.charCodeAt(i)
    if (code in this.mapping || code < 33) {
      continue
    }

    if (this.opts.remap === false) {
      this.subset[code] = code
      this.mapping[code] = code
    } else {
      this.subset[this.pos] = code
      this.mapping[code] = this.pos++
    }
  }
}

Subset.prototype.encode = function(str) {
  var codes = []
  for (var i = 0, len = str.length; i < len; ++i) {
    codes.push(this.mapping[str.charCodeAt(i)])
  }
  return String.fromCharCode.apply(String, codes)
}

Subset.prototype.cmap = function() {
  var mapping = {}
  for (code in this.subset) {
    var value = this.font.codeMap[this.subset[code]]
    if (value !== undefined) mapping[code] = value
  }
  return mapping
}

Subset.prototype.glyphs = function() {
  // collect used glyph ids
  var self = this, ids = [0]
  for (var pos in this.subset) {
    var code = this.subset[pos]
      , val = this.font.codeMap[code]
    if (val !== undefined && !!!~ids.indexOf(val))
      ids.push(val)
  }
  ids.sort()

  // collect the actual glyphs
  function collect(ids) {
    var glyphs = {}
    ids.forEach(function(id) {
      var glyph = self.font.tables.glyf.for(id)
      glyphs[id] = glyph
      if (glyph !== null ? glyph.isCompound : false) {
        var compounds = collect(glyph.ids)
        for (id in compounds) {
          glyphs[id] =  compounds[id]
        }
      }
    })
    return glyphs
  }

  return collect(ids)
}

Subset.prototype.embed = function() {
  var cmap   = this.font.tables.cmap.embed(this.cmap())
    , glyphs = this.glyphs()

  this.font.tables.cmap.subtables = [cmap.subtable]

  var old2new = { 0: 0 }
  for (var code in cmap.charMap) {
    var ids = cmap.charMap[code]
    old2new[ids.old] = ids.new
  }

  var nextGlyphID = cmap.maxGlyphID
  for (var oldID in glyphs) {
    if (!(oldID in old2new))
      old2new[oldID] = nextGlyphID++
  }

  var new2old = {}
  for (var id in old2new) {
    new2old[old2new[id]] = id
  }
  var newIDs = Object.keys(new2old).sort(function(a, b) {
    return a - b
  })
  var oldIDs = newIDs.map(function(id) {
    return new2old[id]
  })

  // encode the font tables
  var offsets = this.font.tables.glyf.embed(glyphs, oldIDs, old2new)
  this.font.tables.loca.embed(offsets)
  this.font.tables.hmtx.embed(oldIDs)
  this.font.tables.hhea.embed(oldIDs)
  this.font.tables.maxp.embed(oldIDs)
  this.font.tables.name.embed(cmap.charMap, this.opts.trimNames)
}

Subset.prototype.save = function() {
  return this.font.save()
}