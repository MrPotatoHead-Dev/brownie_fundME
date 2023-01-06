const trueValue = () => true;
const falseValue = () => false;
const zeroValue = () => 0;
const emptyValue = () => "";
const nullValue = () => null;
const undefinedValue = () => undefined;
const _ = (value, ...funcs) => pipe(...funcs)(value);
const pipe = (...funcs) => value => {
  let done = false;

  return funcs.reduce((result, f, index) => {
    if (done) {
      return result;
    }
    if (f instanceof Function) return f(result);
    if (typeof f === "string")
      return f.indexOf("()") === f.length - 2
        ? result[f.substr(0, f.length - 2)]()
        : result[f];
    if (f instanceof Array) return _(result, ...f);
    if (typeof f === "number") return result[f];
    if (f === pipe.not) return !result;
    if (f && typeof f === "object") {
      // await logic
      if ("await" in f) {
        result = f["await"](result);
        const fail = "fail" in f ? pipe(f.fail) : undefined;
        const promise =
          result && result.then ? result : Promise.resolve(result);
        done = true;

        return promise.then(res => {
          const nextPipe = funcs.slice(index + 1);
          return _(res, ...nextPipe);
        }, fail);
      }

      if ("any" in f || "or" in f) {
        f = (f.any || f.or).reduceRight((obj, condition) => {
          return obj
            ? { if: condition, then: trueValue, else: obj }
            : {
                if: condition,
                then: trueValue,
                else: f.else || falseValue
              };
        }, null);
      }

      if ("all" in f || "and" in f) {
        f = (f.all || f.and).reduceRight((obj, condition) => {
          return obj
            ? { if: condition, then: obj, else: falseValue }
            : {
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
        f = f.when.reduceRight((obj, condition) => {
          const cond =
            condition instanceof Array
              ? { is: condition[0], then: condition[1] }
              : { if: condition.is, then: condition.then };

          return obj
            ? { ...cond, else: obj }
            : { ...cond, else: f.else || falseValue };
        }, null);
      }

      if ("if" in f) {
        const condition = !f.if ? result : _(result, f.if);
        if (condition) {
          return f.then !== null && f.then !== undefined
            ? _(result, f["then"])
            : result;
        }
        return f.else !== null && f.else !== undefined
          ? _(result, f["else"])
          : undefined;
      }

      if ("catch" in f) {
        done = true;
        try {
          const nextPipe = funcs.slice(index + 1);
          return _(value, ...nextPipe);
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

Object.assign(pipe, {
  _,
  invoke: (func, ...args) => {
    const placeholderIndex = args.indexOf(pipe);
    const leftPart =
      placeholderIndex === -1 ? [] : args.slice(0, placeholderIndex);
    const rightPart =
      placeholderIndex === -1 ? args : args.slice(placeholderIndex + 1);
    return value =>
      func instanceof Function
        ? func(...leftPart, value, ...rightPart)
        : value[func](...args);
  },
  not: (condition) => {
    if (!condition) return value => !value;
    return value => !_(value, condition);
  },
  always: value => () => value,
  true: trueValue,
  false: falseValue,
  zero: zeroValue,
  null: nullValue,
  empty: emptyValue,
  undefined: undefinedValue,
  if: (cond, left, right) => pipe({ if: cond, then: left, else: right }),
  when: (conditions, unless) => pipe({ when: conditions, else: unless }),
  is: (op, value) => pipe({ [op]: value }),
  case: (is, then) => ({ is, then }),
  await: (promise, fail) => ({ await: promise, fail }),
  and: (...conditions) => pipe({ and: conditions }),
  every: (...conditions) => pipe({ and: conditions }),
  or: (...conditions) => pipe({ or: conditions }),
  some: (...conditions) => pipe({ or: conditions }),
  catch: errorHandler => ({ catch: errorHandler })
});

export default pipe;
