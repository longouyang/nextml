var State = (function() {
  var o = {};

  return {
    get: function(k) { return o[k]},
    set: function(k, v) {
      o[k] = v; 
    }
  }
})



module.exports = {
  State: State
}
