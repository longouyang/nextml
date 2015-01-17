---
layout: page
title: Probabilistic Context-Free Grammars
desc: Sentences are trees. Who had the binoculars?
order: 2.5
---

<center><img src="{{ site.baseurl}}/assets/img/pcfg.png" style='width: 50%;' /></center>


~~~
/* global map, _, randomInteger, reduce, globalStore, factor */

/*

 S -> NP VP
 NP -> N | D N | D N PP
 VP -> V NP | V' PP
 V' -> V NP
 PP -> P NP
 
 */

// extract words from a single string
// assumes that whitespace is the delimiter
var w = function(string) {
  return string.split(/ +/);
}

var mapw = function(arrayOfStrings) {
  return map(w, arrayOfStrings);
}

var grammar = {
  "S":  map(w, ["NP VP"]),
  "NP": map(w, ["N", "D N", "D N PP"]),
  "VP": map(w, ["V NP", "Vb PP"]),
  "Vb": map(w, ["V NP"]),
  "PP": map(w, ["P N"]),
  "P":  map(w, ["with"]),
  "N":  map(w, ["Joan", "man", "binoculars"]),
  "V":  map(w, ["saw"]),
  "D":  map(w, ["the"]) 
};

var getLeaves = function(x) {
  if (x.length > 1) {
    return reduce(function(x, acc) { return getLeaves(x).concat(acc)},
                  [],
                  x.slice(1));
  }
  
  return [ x[0] ]
}

var preTerminals = ["P", "N", "V", "D"];
var terminals = _.flatten(map(function(x) { return grammar[x]},
                              ["P", "N", "V", "D"]
                             ));

var isTerminal = function(x) {
  return _.contains(terminals, x);
}

var isPreTerminal = function(symbol) {
  return _.contains(["P","N","V","D"], symbol);
}

var samplePreTerminal = function(symbol) {
  var rules = grammar[symbol];
  return rules[ randomInteger(rules.length) ];
}

// trueYield is an array
var _unfold = function(symbol) {
  
  var yieldLeft = globalStore.yieldLeft;

  if (yieldLeft.length == 0) {
    factor(-Infinity);
  }
  
  if (isPreTerminal(symbol)) {
    var terminal = samplePreTerminal(symbol);

    factor(terminal == yieldLeft[0] ? 0 : -Infinity);

    globalStore.yieldLeft =  yieldLeft.slice(1);
    
    return [symbol, terminal];
  }

  var rules = grammar[symbol];

  var sampledRewrite = rules[ randomInteger(rules.length) ];

  return [symbol].concat(map(function(x) { return _unfold(x) }, sampledRewrite));

};

var unfold = function() {
  return _.flatten(_unfold("S")).join(" ");
}

ParticleFilter(function() {
  globalStore.yieldLeft = "Joan saw the man with binoculars".split(" ");
  
  var x = _unfold("S");

  factor(globalStore.yieldLeft.length == 0 ? 0 : -Infinity);

  return JSON.stringify(x);
}, 1000);

~~~
