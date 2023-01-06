# Pipe (Functional Programming)

## P(propertyName)
Get object property
```js
const obj = { name: "Peter", address: { street: "123" } };

const getName = P("name");
const getStreet = P("address", "street");

console.log(getName(obj)); // => Peter
console.log(getStreet(obj)); // => 123
```

## P.invoke(methodNameOrFunction, ...args)

### Invoke object method without parameters

```js
const obj = { getName: () => "Peter" };

const getName = P("getName()");

console.log(getName(obj)); // => Peter
```

### Invoke object method with specified parameters

```js
const obj = { getPhone: type => (type === "home" ? "1234" : "4321") };

const getHomePhone = P.invoke("getPhone", "home");
const getWorkingPhone = P.invoke("getPhone", "working");

console.log(getHomePhone(obj)); // => 1234
console.log(getWorkingPhone(obj)); // => 4321
```

### Invoke object method with specified parameters and placeholder

```js
const wrapMe = P.invoke(console.log, "Before", P, "After");

console.log(wrapMe("Hello World")); // => Before Hello World After
```

## P.if(condition, thenHandler, elseHandler)

Single Conditional

```js
import P from "pipx";

const isOdd = x => x % 2;

const left = x => `${x} is odd`;
const right = x => `${x} is even`;

const fn = P.if(isOdd, left, right);

console.log(fn(2)); // returns 2 is even
console.log(fn(1)); // returns 1 is odd
```

## P.when(conditions[], unlessHandler)

Multiple Conditionals

```js
const waterWithTemperature = P.when(
  [
    [P.is("equalTo", 0), P.always("water freezes at 0°C")],
    [P.is("equalTo", 100), P.always("water boils at 100°C")]
    /*
    // other method
    [
        P.case(P.is('equalTo', 0), P.always('water freezes at 0°C')),
        P.case(P.is('equalTo', 100), P.always('water boils at 100°C'))
    ],
     */
  ],
  temperature => `nothing special happens at ${temperature}°C`
);

print(waterWithTemperature(0));
print(waterWithTemperature(50));
print(waterWithTemperature(100));
```

## P.always(value)

Returns a function that always returns the given value

```js
const t = R.always("Tee");
t(); //=> 'Tee'

// There are some shorthands:
P.true; // => true
P.null; // => null
P.undefined; // => undefined
P.empty; // => ''
P.zero; // => 0
```

## P.is(operator, value)
Compare value

```js
const equalToZero = P.is("equalTo", 0); // or P.is('=', 0)
console.log(equalToZero(0)); // => true
console.log(equalToZero(1)); // => false
```

### There are some various comparisons:

#### P.is('notEqualTo', value)

#### P.is('!=', value)

#### P.is('greaterThan', value)

#### P.is('>', value)

#### P.is('lessThan', value)

#### P.is('<', value)

#### P.is('greaterOrEqualTo', value)

#### P.is('>=', value)

#### P.is('lessOrEqualTo', value)

#### P.is('<=', value)

#### P.is('null')

#### P.is('undefined')

#### P.is('nil') null or undefined

#### P.is('empty')

#### P.is('zero')

## P.await(funcReturnsPromise, failHandler)

```js
const login = P(
  P.await(
    submitCredential,
    // handle promise fail
    P.invoke(
      console.error,
      "User name or pass does not match. The exception is: ",
      P
    )
  ),
  action1,
  action2
);

login({ user: "admin", pass: "admin" });
```

## P.and(...conditions)

Returns true if all results are true.

```js
const userNameMustHaveAtLeastSixCharacters = username =>
  username && username.length >= 6;
const usernameMustNotContainSpecialCharacters = username =>
  /^\w+$/.test(username);
const registerUser = P(
  P.and(
    userNameMustHaveAtLeastSixCharacters,
    usernameMustNotContainSpecialCharacters
  ),
  P.if(
    null,
    () => console.log("User registered"),
    () => console.log("Username is not valid")
  )
);

/* method 2
  const registerUser = P.if(
     P.and(
       userNameMustHaveAtLeastSixCharacters,
       usernameMustNotContainSpecialCharacters
     ),
     () => console.log('User registered'),
     () => console.log('Username is not valid')
   );
*/

registerUser("test");
registerUser("validuser");
registerUser("invalid$%");
```
There are some various of logical functions
### P.every(...conditions) ~ P.and
### p.some(...conditions) ~ P.or
### P.not or P.not(condition)

## P.catch(handler)
```js
const doSomethingWrongIf = flag => {
  if (!flag) {
    throw new Error('Invalid operation');
  }
  return flag;
};

const doSomething = P(P.catch(console.error), doSomethingWrongIf, value =>
  console.log(`Result is ${value}`)
);

doSomething(true); // => Result is true
doSomething(false); // Invalid operation exception thrown
```