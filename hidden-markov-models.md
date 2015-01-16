---
layout: default
title: Hidden Markov models
desc: Sentences are fences. Is "man" a verb or a noun?
order: 2
---

~~~
var states = "_start noun verb det adj".split(" ");
var M = states.length; 

var vocab = "saw walked dog man fort old the a boats".split(" ");
var N = vocab.length;

var grammar = [
    ["noun", "dog man fort old saw boats".split(" ")],
    ["det", "the a".split(" ")],
    ["verb","man saw walked".split(" ")],
    ["adj","old".split(" ")]
];

var E_fixed = _.object(
    map(function(entry) {
        var category = entry[0]; 
        var members = entry[1];
        
        var memberNumbers = map(function(x) { return vocab.indexOf(x) }, members);

        var rangeN = _.range(N);
        
        return [category,
                map(function(n) { return memberNumbers.indexOf(n) > -1 ? 1 : 0 },
                    rangeN)];
    },
        grammar));

var stateParams = repeat(M - 1, function() { return 0.3 });
var vocabParams = repeat(N, function() { return 1 });

var pluck = function(xs, property) {
    return map(function(x) { return x[property]},
               xs
              );
}

var model = function() {

    // transition matrix represented as dictionary
    // a key is a state; its corresponding value
    // is an array of transition probabilities to states
    var T = _.object(map(
        function(s) {
            // prevent transitions to ^ 
            return [s, [0].concat(dirichlet(stateParams))]; 
        },
        states));

    // emission matrix represented as dictionary
    // a key is a state; its corresponding value
    // is an array of transition probabilities to states

    var E = E_fixed;
    // var E = _.object(map(
    //     function(s) {
    //         return [s, dirichlet(vocabParams)];
    //     },
    //     states));

    // given a current state, sample the next state
    var transition = function(state) {
        var probs = T[state];
        return states[discrete( probs )];
    }

    // given a current state, emit a word for that state
    var emit = function(state) {
        var probs = E[state];
        return vocab[discrete( probs )];
    }

    var _observePairs = function(pairsLeft, pairsSoFar) {
        
        if (pairsLeft.length == 0) {
            return pairsSoFar;
        }
        
        var prevPair = pairsSoFar[pairsSoFar.length - 1];
        var prevState = prevPair.state;
        
        var nextState = pairsLeft[0].state;
        var sampledNextState = transition(prevPair.state);

        factor(nextState == "?" ? 0 :
               (sampledNextState == nextState ? 0 : -Infinity));
        
        var nextWord = pairsLeft[0].word; 
        var sampledNextWord = emit(sampledNextState);

        factor(sampledNextWord == nextWord ? 0 : -Infinity); 
        
        return _observePairs(pairsLeft.slice(1), pairsSoFar.concat({state: sampledNextState,
                                                                    word: sampledNextWord
                                                                   }));
    }

    var observePairs = function(words, states) {
        // zip together states and words into
        // [[state1,word1], [state2, word2], ..., [statek, wordk]]
        // and then convert each array to a {state: ..., word: ...} object
        var zipped = _.zip(words.split(/ +/),
                           states.split(/ +/));

        var objectify = function(x) {
            return {
                word: x[0],
                state: x[1]
            }
        }
        var pairs = map(objectify, zipped);

        return _observePairs(pairs,
                             [{state: "_start", word: ""}]).slice(1);
    }

    repeat(20,
           function() {

               observePairs("the man",
                            "det noun")

               observePairs("the old dog",
                            "det adj noun")

               observePairs("the man  walked a   dog",
                            "det noun verb   det noun")

               observePairs("a   dog  saw  the fort",
                            "det noun verb det noun")

               observePairs("man  the fort",
                            "verb det noun")

               observePairs("man  the boats",
                            "verb det noun")

               observePairs("a   man  walked",
                            "det noun verb")

               observePairs("dog saw the boats",
                            "noun verb det noun") 
               
           })


    var x = observePairs(  "the old  man  the fort",
                           "?   ?    ?    ?   ?");
                         //"det noun verb det noun");
    

    return pluck(x, "state");
    
};

var samps = ParticleFilter(model, 1000);

samps;
~~~
