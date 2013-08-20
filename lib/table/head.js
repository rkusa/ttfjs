var Struct = require('structjs')
module.exports = new Struct({
  version:            Struct.Int32,
  fontRevision:       Struct.Int32,
  checkSumAdjustment: Struct.Uint32,
  magicNumber:        Struct.Uint32,
  flags:              Struct.Uint16,
  unitsPerEm:         Struct.Uint16,
  createdA:           Struct.Int32,
  createdB:           Struct.Int32,
  modifiedA:          Struct.Int32,
  modifiedB:          Struct.Int32,
  xMin:               Struct.Int16,
  yMin:               Struct.Int16,
  xMax:               Struct.Int16,
  yMax:               Struct.Int16,
  macStyle:           Struct.Uint16,
  lowestRecPPEM:      Struct.Uint16,
  fontDirectionHint:  Struct.Int16,
  indexToLocFormat:   Struct.Int16,
  glyphDataFormat:    Struct.Int16
})