"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var trueValue = function trueValue() {
  return true;
};
var falseValue = function falseValue() {
  return false;
};
var zeroValue = function zeroValue() {
  return 0;
};
var emptyValue = function emptyValue() {
  return "";
};
var nullValue = function nullValue() {
  return null;
};
var undefinedValue = function undefinedValue() {
  return undefined;
};
var _ = function _(value) {
  for (var _len = arguments.length, funcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    funcs[_key - 1] = arguments[_key];
  }

  return pipe.apply(undefined, funcs)(value);
};
var pipe = function pipe() {
  for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    funcs[_key2] = arguments[_key2];
  }

  return function (value) {
    var done = false;

    return funcs.reduce(function (result, f, index) {
      if (done) {
        return result;
      }
      if (f instanceof Function) return f(result);
      if (typeof f === "string") return f.indexOf("()") === f.length - 2 ? result[f.substr(0, f.length - 2)]() : result[f];
      if (f instanceof Array) return _.apply(undefined, [result].concat(_toConsumableArray(f)));
      if (typeof f === "number") return result[f];
      if (f === pipe.not) return !result;
      if (f && (typeof f === "undefined" ? "undefined" : _typeof(f)) === "object") {
        // await logic
        if ("await" in f) {
          result = f["await"](result);
          var fail = "fail" in f ? pipe(f.fail) : undefined;
          var promise = result && result.then ? result : Promise.resolve(result);
          done = true;

          return promise.then(function (res) {
            var nextPipe = funcs.slice(index + 1);
            return _.apply(undefined, [res].concat(_toConsumableArray(nextPipe)));
          }, fail);
        }

        if ("any" in f || "or" in f) {
          f = (f.any || f.or).reduceRight(function (obj, condition) {
            return obj ? { if: condition, then: trueValue, else: obj } : {
              if: condition,
              then: trueValue,
              else: f.else || falseValue
            };
          }, null);
        }

        if ("all" in f || "and" in f) {
          f = (f.all || f.and).reduceRight(function (obj, condition) {
            return obj ? { if: condition, then: obj, else: falseValue } : {
              if: condition,
              then: trueValue,
              else: f.else || falseValue
            };
          }, null);
        }

        if ("check" in f) {
          f = {
            if: f.check[0],
            then: f.check[1],
            else: f.check[2]
          };

          if (!f.else) {
            delete f.else;
          }
        }

        if ("when" in f) {
          f = f.when.reduceRight(function (obj, condition) {
            var cond = condition instanceof Array ? { is: condition[0], then: condition[1] } : { if: condition.is, then: condition.then };

            return obj ? _extends({}, cond, { else: obj }) : _extends({}, cond, { else: f.else || falseValue });
          }, null);
        }

        if ("if" in f) {
          var condition = !f.if ? result : _(result, f.if);
          if (condition) {
            return f.then !== null && f.then !== undefined ? _(result, f["then"]) : result;
          }
          return f.else !== null && f.else !== undefined ? _(result, f["else"]) : undefined;
        }

        if ("catch" in f) {
          done = true;
          try {
            var nextPipe = funcs.slice(index + 1);
            return _.apply(undefined, [value].concat(_toConsumableArray(nextPipe)));
          } catch (ex) {
            return _(ex, f.catch);
          }
        }

        if ("value" in f) {
          return f.value;
        }

        if ("equalTo" in f) {
          return result === f.equalTo;
        }

        if ("=" in f) {
          return result === f["="];
        }

        if ("null" in f) {
          return result === null;
        }

        if ("undefined" in f) {
          return result === undefined;
        }

        if ("empty" in f) {
          return result === "";
        }

        if ("nil" in f) {
          return result === null || result === undefined;
        }

        if ("notEqualTo" in f) {
          return result !== f.notEqualTo;
        }

        if ("!=" in f) {
          return result !== f["!="];
        }

        if ("greaterThan" in f) {
          return result > f.greaterThan;
        }

        if (">" in f) {
          return result > f[">"];
        }

        if ("lessThan" in f) {
          return result < f.lessThan;
        }

        if ("<" in f) {
          return result < f["<"];
        }

        if ("greaterOrEqualTo" in f) {
          return result >= f.lessThan;
        }

        if (">=" in f) {
          return result >= f[">="];
        }

        if ("lessOrEqualTo" in f) {
          return result <= f.lessThan;
        }

        if ("<=" in f) {
          return result <= f["<="];
        }
      }
      return result;
    }, value);
  };
};

Object.assign(pipe, {
  _: _,
  invoke: function invoke(func) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    var placeholderIndex = args.indexOf(pipe);
    var leftPart = placeholderIndex === -1 ? [] : args.slice(0, placeholderIndex);
    var rightPart = placeholderIndex === -1 ? args : args.slice(placeholderIndex + 1);
    return function (value) {
      return func instanceof Function ? func.apply(undefined, _toConsumableArray(leftPart).concat([value], _toConsumableArray(rightPart))) : value[func].apply(value, args);
    };
  },
  not: function not(condition) {
    if (!condition) return function (value) {
      return !value;
    };
    return function (value) {
      return !_(value, condition);
    };
  },
  always: function always(value) {
    return function () {
      return value;
    };
  },
  true: trueValue,
  false: falseValue,
  zero: zeroValue,
  null: nullValue,
  empty: emptyValue,
  undefined: undefinedValue,
  if: function _if(cond, left, right) {
    return pipe({ if: cond, then: left, else: right });
  },
  when: function when(conditions, unless) {
    return pipe({ when: conditions, else: unless });
  },
  is: function is(op, value) {
    return pipe(_defineProperty({}, op, value));
  },
  case: function _case(is, then) {
    return { is: is, then: then };
  },
  await: function _await(promise, fail) {
    return { await: promise, fail: fail };
  },
  and: function and() {
    for (var _len4 = arguments.length, conditions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      conditions[_key4] = arguments[_key4];
    }

    return pipe({ and: conditions });
  },
  every: function every() {
    for (var _len5 = arguments.length, conditions = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      conditions[_key5] = arguments[_key5];
    }

    return pipe({ and: conditions });
  },
  or: function or() {
    for (var _len6 = arguments.length, conditions = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      conditions[_key6] = arguments[_key6];
    }

    return pipe({ or: conditions });
  },
  some: function some() {
    for (var _len7 = arguments.length, conditions = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      conditions[_key7] = arguments[_key7];
    }

    return pipe({ or: conditions });
  },
  catch: function _catch(errorHandler) {
    return { catch: errorHandler };
  }
});

exports.default = pipe;
//# sourceMappingURL=index.js.map