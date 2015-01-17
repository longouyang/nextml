---
layout: default
title: Latent variable models
desc: Inferring latent variables from observations. How good are you at ping pong?
order: 0
---

~~~
var sampleAttributes = function() {
  var skill = randomInteger(11);

  // compute performance variability.
  // variability goes down as skill increases
  // 
  // variability
  //
  //     |*
  //     | *
  //     |  *
  //     |   *
  //     |____*____ skill
  //
  var variability = Math.round(0.2 * (11 - skill));
  
  return {skill: skill,
          variability: variability};
}

var performance = function(p) {
  return p.skill + randomInteger(2 * p.variability) - p.variability;
}

var beats = function(p1, p2) {
  var perf1 = performance(p1);
  var perf2 = performance(p2);
  
  if (perf1 == perf2) {
    // coin flip
    factor(Math.log(0.5))
  }
  
  factor(perf1 > perf2 ? 0 : -Infinity)
}

var know = function(bool) {
  factor(bool ? 0 : -Infinity);
}

var compare = function(p1, p2) {
  if (p1.skill == p2.skill) {
    return "A = B";
  }
  if (p1.skill > p2.skill) {
    return "A > B";
  }
  return "A < B";
}

print(Enumerate(function() {
  
  var alice = sampleAttributes();
  var bob = sampleAttributes();
  
  beats(alice, bob)
  
  return alice.skill
  
  
  }, 5000))
~~~

other settings:

- how likely is it that alice is better than bob if they've each beaten each other once?
    - what if she has beaten him 2/2 times?
- how does our inference about alice's skill change as we see more observations of her winning?
