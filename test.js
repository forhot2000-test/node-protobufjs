var protobuf = require("protobufjs");

var root;

try {
  root = protobuf.loadSync("statement.proto");
} catch (err) {
  console.error(err);
  process.exit(1);
}

var StatementType = root.lookupEnum("foo.StatementType");
var ValueType = root.lookupEnum("foo.ValueType");

var Statement = root.lookupType("foo.Statement");
var AnyValues = root.lookupType("foo.AnyValues");

function ival(v) {
  return { type: ValueType.values.INT, ival: v };
}

function sval(v) {
  return { type: ValueType.values.STRING, text: v };
}

function fval(v) {
  return { type: ValueType.values.FLOAT, fval: v };
}

function bval(v) {
  return { type: ValueType.values.BOOL, bval: v };
}

function bytes(v) {
  if (v instanceof Array) {
    v = Buffer.from(v);
  }
  return { type: ValueType.values.BYTES, bytes: v };
}

function test1() {
  var obj = {
    type: StatementType.values.INSERT,
    table: "test",
    columns: ["f1", "f2", "f3"],
    values: [sval("1"), ival(2), fval(2.1)],
    x: 100
  };
  print(Statement, obj);
}

function test2() {
  var obj = {
    type: StatementType.values.UPDATE,
    table: "test",
    set: [
      { column: "f1", value: sval("1") },
      { column: "f2", value: ival(2) }
    ]
  };
  print(Statement, obj);
}

function test3() {
  var obj = {
    values: [
      ival(2),
      bval(true),
      fval(2.0),
      sval("foo"),
      bytes([1, 2, 3, 4, 5, 6])
    ]
  };
  print(AnyValues, obj);
}

const conversionOptions = {
  enums: String,
  longs: Number
  // bytes: String
};

function print(Type, obj) {
  //console.log("valid:", Type.verify(obj));
  const message = Type.fromObject(obj);
  const buffer = Type.encode(message).finish();
  console.log(buffer);
  const decodedMsg = Type.decode(buffer);
  const decodedObj = Type.toObject(decodedMsg, conversionOptions);
  console.log(decodedObj);
  // console.log(JSON.stringify(decoded, null, 2));
}

function runTest(fn) {
  const name = fn.name;
  console.log(`start test ${name}...`);
  try {
    fn();
  } catch (err) {
    console.error(`test ${name} failed.`);
    console.error(err);
  }
  console.log();
}

function prefTest(fn, n = 10000) {
  var name = fn.name;
  console.time(name);
  for (let i = 0; i < n; i++) {
    fn();
  }
  console.timeEnd(name);
}

function main() {
  [test1, test2, test3].forEach(runTest);
  //prefTest(test3);
}

main();
