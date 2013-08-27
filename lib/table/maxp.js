var Struct = require('structjs')

var Maxp = module.exports = new Struct({
  version:               Struct.Int32,
  numGlyphs:             Struct.Uint16,
  maxPoints:             Struct.Uint16,
  maxContours:           Struct.Uint16,
  maxComponentPoints:    Struct.Uint16,
  maxComponentContours:  Struct.Uint16,
  maxZones:              Struct.Uint16,
  maxTwilightPoints:     Struct.Uint16,
  maxStorage:            Struct.Uint16,
  maxFunctionDefs:       Struct.Uint16,
  maxInstructionDefs:    Struct.Uint16,
  maxStackElements:      Struct.Uint16,
  maxSizeOfInstructions: Struct.Uint16,
  maxComponentElements:  Struct.Uint16,
  maxComponentDepth:     Struct.Uint16
})

Maxp.prototype.embed = function(ids) {
  this.numGlyphs = ids.length
}