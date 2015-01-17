---
layout: default
title: Program induction
desc: Hallucinating programs from data.
order: 3
---

We will use a PCFG and conditional reasoning to infer a program given examples of its input-output behavior.
In our generative model, we use a PCFG to sample the source code of an candidate programs.
The probability of sampling a program gives a measure of its complexity -- roughly speaking, more likely programs are less complex.
We then use `factor` to weight programs according to how well they explain a training set of input-output pairs.
We will end up preferring programs that have the best balance of complexity and explanatory power.

~~~
var myEval = function(str) {
  return window.eval("(function(s, k, a, x) {  k(s, " + str + ") })");
}

var w = function(string) {
  return string.split(/ +/);
}

var grammar = {
  "S":   map(w, ["x OP S", "S OP x", "N"]),
  "OP":  map(w, ["+","-","*"]),
  "N":   map(w,["1","2","3","4","5","6","7"])
};

var terminals = w("x + - * 1 2 3 4 5 6 7");

var isTerminal = function(x) {
  return _.contains(terminals, x);
}

var unfold = function(symbol) {
  if (isTerminal(symbol)) {
    return symbol
  }
  
  var rules = grammar[symbol];
  var sampledRule = rules[ randomInteger(rules.length) ];
  
  // convert sampled rule to a string
  var str = map(unfold, sampledRule).join(" ");
  
  // parenthesize the sampled rule if it's more than a single symbol
  return sampledRule.length > 1 ? "(" + str + ")" : str
}

var need = function(bool) { 
  factor(bool ? 0 : -Infinity)
}

print(Enumerate(function() {
  var str = unfold("S");
  
  var f = myEval(str);
  
  need( f(1) == 3 );
  
  // prevent f from being a constant
  // need( f(2) != f(1) );
  
  // eliminate increasing functions 
  // need( f(2) < f(1) )
  
  // require that f is kinda complicated
  // need( str.length > 10 )
  
  return str
  
}, 300));
~~~

Observe (marvel at?) how we can condition on abstract properties of the programs. While we can certainly impose concrete requirements (e.g., `f(1) = 3`), there is also much to be gained by imposing relational requirements (e.g., `f(2) < f(1)`).
