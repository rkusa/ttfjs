var Struct = require('structjs')

var AdvanceWidth = new Struct({
  advanceWidth:    Struct.Uint16,
  leftSideBearing: Struct.Int16
})

module.exports = function(numOfLongHorMetrics, numGlyphs) {
  var Hmtx = new Struct({
    hMetrics:        Struct.Array(AdvanceWidth, numOfLongHorMetrics),
    leftSideBearing: Struct.Array(Struct.Uint16, numGlyphs - numOfLongHorMetrics)
  })
  
  Hmtx.prototype.$unpacked = function() {
    var metrics = this.metrics = []
    this.hMetrics.forEach(function(e) {
      metrics.push(e.advanceWidth)
    })
    var last = metrics[metrics.length - 1]
    this.leftSideBearing.forEach(function(mapping) {
      metrics.push(last)
    })
  }
  
  Hmtx.prototype.for = function(id) {
    if (id in this.hMetrics) return this.hMetrics[id]
    
    return new AdvanceWidth({
      advanceWidth:    this.hMetrics[this.hMetrics.length - 1].advance,
      leftSideBearing: this.leftSideBearing[id - this.hMetrics.length]
    })
  }
  
  Hmtx.prototype.embed = function(ids) {
    var self = this, metrics = []
    ids.forEach(function(id) {
      metrics.push(self.for(id))
    })
    
    this.hMetrics = metrics
    this.leftSideBearing = []
    
    this._definition.hMetrics._length = ids.length
    this._definition.leftSideBearing._length = 0
  }
  
  return Hmtx
}

