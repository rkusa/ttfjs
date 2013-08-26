var Subset = module.exports = function(font) {
  this.font = font
  this.subset  = {}
  this.mapping = {}
  this.pos    = 33
}

Subset.prototype.use = function(chars) {
  for (var i = 0, len = chars.length; i < len; ++i) {
    var code = chars.charCodeAt(i)
    this.subset[this.pos] = code
    this.mapping[code] = this.pos++
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
    mapping[code] = this.font.codeMap[this.subset[code]]
  }
  return mapping
}

Subset.prototype.embed = function() {
  // cmap
  
  // glyf
  
  // loca
  
  // name (new Name)
}