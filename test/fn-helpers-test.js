var testCase = require("buster").testCase;
var assert = buster.assert;
var refute = buster.refute;

var fh = require("../lib/fn-helpers");
var partialApply = fh.partialApply;

testCase("fn-helpers", {

    "partialApply": {

        "throws TypeError when called with no arg": function() {
            var f = function() {}; // just some function
            assert.exception(function() { partialApply();            }, "TypeError", "when called with no arg");
        },

        "throws TypeError if first arg is not a function": function() {
            var f = function() {}; // just some function
            assert.exception(function() { partialApply(null);        }, "TypeError", "when called with null");
            assert.exception(function() { partialApply({});          }, "TypeError", "when called with an object");
            assert.exception(function() { partialApply([]);          }, "TypeError", "when called with an empty array");
            assert.exception(function() { partialApply([f]);         }, "TypeError", "when called with an array containing a function");
            assert.exception(function() { partialApply("foo");       }, "TypeError", "when called with a string");
            assert.exception(function() { partialApply(32, f, 47);   }, "TypeError", "when called with a number, a function and a string");
            assert.exception(function() { partialApply(32, f, "47"); }, "TypeError", "when called with a number, a function and a string");
            assert.exception(function() { partialApply(null, 47);    }, "TypeError", "when called with null and a number");
            assert.exception(function() { partialApply(null, f);     }, "TypeError", "when called with null and a function");
            assert.exception(function() { partialApply(32, 47);      }, "TypeError", "when called with two numbers");
            assert.exception(function() { partialApply(32, f);       }, "TypeError", "when called with a number and a function");
            assert.exception(function() { partialApply(32, "47");    }, "TypeError", "when called with a number and a string");
            assert.exception(function() { partialApply("foo", 32);   }, "TypeError", "when called with a string and a number");
            assert.exception(function() { partialApply("foo", f);    }, "TypeError", "when called with a string and a function");
        },

        "returns a function when called with proper args": function() {
            var f = function() {}; // just some function
            assert.isFunction(partialApply(f),              "when called with a function and no further args");
            assert.same(f, partialApply(f),                 "returns same function when called with no further args");
            assert.isFunction(partialApply(f, []),          "when called with a function and an empty array");
            assert.isFunction(partialApply(f, [null]),      "when called with a function and an array containing null");
            assert.isFunction(partialApply(f, [undefined]), "when called with a function and an array containing undefined");
            assert.isFunction(partialApply(f, [1]),         "when called with a function and an array containing one integer");
            assert.isFunction(partialApply(f, ["one"]),     "when called with a function and an array containing one string");
            assert.isFunction(partialApply(f, [f]),         "when called with a function and an array containing one function");
            assert.isFunction(partialApply(f, [[]]),        "when called with a function and an array containing one empty array");
        },

        "partially applied function gets additonal args from actual call *at end* of arg list": function() { // TODO: this test is way to clever!
            var f = this.spy();
            var pa = this.spy(partialApply);
            [    [null], // these are the arguments that are partially applied beforehand
                ,[], // yes, we do allow empty args array - just returns the function as is
                ,[undefined]
                ,[1]
                ,["one"]
                ,[f]
                ,[[]]
                ,["foo", "bar"]
                ,[72, null, ["qumbl"]]
            ].forEach(function(as) {
                as.unshift(f); // put function in front
                var partiallyApplied = pa.apply(null, as);
                [    [null] // these are the additional arguments that are passed in the actual call of the partially applied fn
                    ,[]
                    ,[[]]
                    ,[undefined]
                    ,[1]
                    ,["one"]
                    ,[f]
                    ,[[]]
                    ,["foo", "bar"]
                    ,[72, null, ["qumbl"]]
                ].forEach(function(additionalArgs) {
                    partiallyApplied.apply(null, additionalArgs); // now call result to see if args are passed properly
                    assert.equals(f.lastCall.args, pa.lastCall.args.slice(1).concat(additionalArgs));
                })
            });

        },

        "leaves `this` dynamically scoped": function() {
            var f = this.spy();
            var g = partialApply(f, "foo", 7);
            var o1 = { g: g };
            var o2 = { g: g };

            o1.g();
            assert.same(f.lastCall.thisValue, o1, "`this` = o1");

            o2.g();
            assert.same(f.lastCall.thisValue, o2, "`this` = o2");

            g();
            assert.same(f.lastCall.thisValue, global, "`this` implicit [replaced by global object]");

            g.call(undefined);
            assert.same(f.lastCall.thisValue, global, "`this` = undefined [replaced by global object]");

            g.call(null);
            assert.same(f.lastCall.thisValue, global, "`this` = null [replaced by global object]");

            g.call(this);
            assert.same(f.lastCall.thisValue, this, "`this` = this [this in test context]");
        }

    }

});
