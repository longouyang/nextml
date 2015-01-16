---
layout: default
title: Latent variable models
desc: Inferring latent variables from observations. How good are you at ping pong?
order: 0
---

~~~
var sampleAttributes = function() {
  // sample skill from a gaussian and constrain it to lie in [0, 100]
  var skill = Math.min(Math.max(gaussian(50,10), 0), 100);

  // compute performance variability.
  // variability goes down as skill increases
  // 
  // variability
  //
  //     |
  //     |*
  //     | *
  //     |  *
  //     |   *
  //     |____*____ skill
  //
  var variability = 0.05 * (110 - skill);
  

  return {skill: skill,
          variability: variability
                  };
  
}

// returns true if x wins
var match = function(x,y) {
  var performanceX = x.skill + gaussian(0, x.variability);
  var performanceY = y.skill + gaussian(0, y.variability);

  return (performanceX > performanceY);
}

var know = function(bool) {
  factor(bool ? 0 : -Infinity);
}

print(MH(function() {
  
  var alice = sampleAttributes();
  
  var bob = sampleAttributes();
  
  var numMatches = 30;
  
  var numAliceWins = filter(function(x) { return x },
                            repeat(numMatches, function() { return match(alice, bob) })).length;
  
  
  know( numAliceWins == 0 )
  
  return [Math.round( alice.skill ) ]
  
  }, 1000))
~~~
