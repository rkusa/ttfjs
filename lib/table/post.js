var Struct = require('structjs')

var Post = module.exports = new Struct({
  version:            Struct.Int32,
  italicAngleHi:      Struct.Int16,
  italicAngleLow:     Struct.Int16,
  underlinePosition:  Struct.Int16,
  underlineThickness: Struct.Int16,
  isFixedPitch:       Struct.Uint32,
  minMemType42:       Struct.Uint32,
  maxMemType42:       Struct.Uint32,
  minMemType1:        Struct.Uint32,
  maxMemType1:        Struct.Uint32
})