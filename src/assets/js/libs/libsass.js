// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;
function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}
function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}
function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 41560;
var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin;
var _stdin=_stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });
var ___fsmu8;
var ___dso_handle;
var ___dso_handle=___dso_handle=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,216,123,0,0,40,1,0,0,216,0,0,0,48,0,0,0,128,1,0,0,6,0,0,0,4,0,0,0,22,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv119__pointer_type_infoE;
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,232,123,0,0,40,1,0,0,180,0,0,0,48,0,0,0,128,1,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,8,124,0,0,40,1,0,0,146,0,0,0,48,0,0,0,128,1,0,0,6,0,0,0,14,0,0,0,6,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTIc;
__ZTIc=allocate([40,87,0,0,128,87,0,0], "i8", ALLOC_STATIC);
var __ZN4Sass7ContextC1ENS0_4DataE;
var __ZN4Sass7ContextD1Ev;
var __ZN4Sass13ContextualizeC1ERNS_7ContextEPNS_4EvalEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceEPNS_8SelectorESD_;
var __ZN4Sass13ContextualizeD1Ev;
var __ZN4Sass5ErrorC1ENS0_4TypeENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS_8PositionES8_;
var __ZN4Sass4EvalC1ERNS_7ContextEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceE;
var __ZN4Sass4EvalD1Ev;
var __ZN4Sass6ExpandC1ERNS_7ContextEPNS_4EvalEPNS_13ContextualizeEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceE;
var __ZN4Sass6ExtendC1ERNS_7ContextERNSt3__18multimapINS_17Compound_SelectorEPNS_16Complex_SelectorENS3_4lessIS5_EENS3_9allocatorINS3_4pairIKS5_S7_EEEEEERNS_10Subset_MapINS3_12basic_stringIcNS3_11char_traitsIcEENSA_IcEEEENSB_IS7_PS5_EEEEPNS_9BacktraceE;
var __ZN4Sass7InspectC1EPNS_7ContextE;
var __ZN4Sass7InspectD1Ev;
var __ZN4Sass17Output_CompressedC1EPNS_7ContextE;
var __ZN4Sass17Output_CompressedD1Ev;
var __ZN4Sass13Output_NestedC1EbPNS_7ContextE;
var __ZN4Sass13Output_NestedD1Ev;
var __ZN4Sass9SourceMapC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE;
var __ZN4Sass9To_StringC1EPNS_7ContextE;
var __ZN4Sass9To_StringD1Ev;
var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt12out_of_rangeD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,36,118,97,108,117,101,115,0,74,117,108,0,0,0,0,0,109,111,99,99,97,115,105,110,0,0,0,0,0,0,0,0,99,111,109,112,97,99,116,40,36,118,97,108,117,101,115,46,46,46,41,0,0,0,0,0,74,117,110,0,0,0,0,0,109,105,115,116,121,114,111,115,101,0,0,0,0,0,0,0,36,108,105,115,116,115,0,0,65,112,114,0,0,0,0,0,109,105,110,116,99,114,101,97,109,0,0,0,0,0,0,0,102,105,108,101,32,116,111,32,105,109,112,111,114,116,32,110,111,116,32,102,111,117,110,100,32,111,114,32,117,110,114,101,97,100,97,98,108,101,58,32,0,0,0,0,0,0,0,0,122,105,112,40,36,108,105,115,116,115,46,46,46,41,0,0,77,97,114,0,0,0,0,0,109,105,100,110,105,103,104,116,98,108,117,101,0,0,0,0,32,33,100,101,102,97,117,108,116,0,0,0,0,0,0,0,105,110,0,0,0,0,0,0,70,101,98,0,0,0,0,0,109,101,100,105,117,109,118,105,111,108,101,116,114,101,100,0,97,112,112,101,110,100,40,36,108,105,115,116,44,32,36,118,97,108,44,32,36,115,101,112,97,114,97,116,111,114,58,32,97,117,116,111,41,0,0,0,74,97,110,0,0,0,0,0,109,101,100,105,117,109,116,117,114,113,117,111,105,115,101,0,98,108,117,101,0,0,0,0,96,32,109,117,115,116,32,98,101,32,96,115,112,97,99,101,96,44,32,96,99,111,109,109,97,96,44,32,111,114,32,96,97,117,116,111,96,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,109,101,100,105,117,109,115,112,114,105,110,103,103,114,101,101,110,0,0,0,0,0,0,0,36,98,108,117,101,0,0,0,97,114,103,117,109,101,110,116,32,96,36,115,101,112,97,114,97,116,111,114,96,32,111,102,32,96,0,0,0,0,0,0,91,109,93,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,98,101,32,117,115,101,100,32,97,115,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,0,0,109,101,100,105,117,109,115,108,97,116,101,98,108,117,101,0,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,118,97,108,117,101,0,97,117,116,111,0,0,0,0,79,99,116,111,98,101,114,0,109,101,100,105,117,109,115,101,97,103,114,101,101,110,0,0,99,111,109,109,97,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,109,101,100,105,117,109,112,117,114,112,108,101,0,0,0,0,58,102,105,114,115,116,45,108,101,116,116,101,114,0,0,0,115,112,97,99,101,0,0,0,65,117,103,117,115,116,0,0,109,101,100,105,117,109,111,114,99,104,105,100,0,0,0,0,36,115,101,112,97,114,97,116,111,114,0,0,0,0,0,0,74,117,108,121,0,0,0,0,109,101,100,105,117,109,98,108,117,101,0,0,0,0,0,0,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,32,109,97,121,32,110,111,116,32,104,97,118,101,32,97,32,100,101,102,97,117,108,116,32,118,97,108,117,101,0,0,36,108,105,115,116,50,0,0,74,117,110,101,0,0,0,0,109,101,100,105,117,109,97,113,117,97,109,97,114,105,110,101,0,0,0,0,0,0,0,0,117,114,108,0,0,0,0,0,36,108,105,115,116,49,0,0,44,0,0,0,0,0,0,0,77,97,121,0,0,0,0,0,109,97,114,111,111,110,0,0,32,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,106,111,105,110,40,36,108,105,115,116,49,44,32,36,108,105,115,116,50,44,32,36,115,101,112,97,114,97,116,111,114,58,32,97,117,116,111,41,0,0,65,112,114,105,108,0,0,0,109,97,103,101,110,116,97,0,105,110,100,101,120,40,36,108,105,115,116,44,32,36,118,97,108,117,101,41,0,0,0,0,77,97,114,99,104,0,0,0,108,105,110,101,110,0,0,0,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,96,0,0,0,0,0,0,0,98,108,97,110,99,104,101,100,97,108,109,111,110,100,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,108,105,109,101,103,114,101,101,110,0,0,0,0,0,0,0,36,103,114,101,101,110,0,0,96,32,109,117,115,116,32,110,111,116,32,98,101,32,101,109,112,116,121,0,0,0,0,0,110,101,115,116,101,100,32,115,101,108,101,99,116,111,114,115,32,109,97,121,32,110,111,116,32,98,101,32,101,120,116,101,110,100,101,100,0,0,0,0,74,97,110,117,97,114,121,0,108,105,109,101,0,0,0,0,32,111,102,32,0,0,0,0,96,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,96,36,108,105,115,116,96,32,111,102,32,96,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,108,105,103,104,116,121,101,108,108,111,119,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,0,0,58,58,102,105,114,115,116,45,108,105,110,101,0,0,0,0,111,110,108,121,32,85,84,70,45,56,32,100,111,99,117,109,101,110,116,115,32,97,114,101,32,99,117,114,114,101,110,116,108,121,32,115,117,112,112,111,114,116,101,100,59,32,121,111,117,114,32,100,111,99,117,109,101,110,116,32,97,112,112,101,97,114,115,32,116,111,32,98,101,32,0,0,0,0,0,0,110,116,104,40,36,108,105,115,116,44,32,36,110,41,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,108,105,103,104,116,115,108,97,116,101,103,114,101,121,0,0,71,66,45,49,56,48,51,48,0,0,0,0,0,0,0,0,36,108,105,115,116,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,108,105,103,104,116,115,108,97,116,101,103,114,97,121,0,0,66,79,67,85,45,49,0,0,108,101,110,103,116,104,40,36,108,105,115,116,41,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,108,105,103,104,116,115,107,121,98,108,117,101,0,0,0,0,83,67,83,85,0,0,0,0,64,109,101,100,105,97,32,0,109,97,120,40,36,120,50,44,32,36,120,50,46,46,46,41,0,0,0,0,0,0,0,0,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,108,105,103,104,116,115,101,97,103,114,101,101,110,0,0,0,85,84,70,45,69,66,67,68,73,67,0,0,0,0,0,0,96,32,111,110,108,121,32,116,97,107,101,115,32,110,117,109,101,114,105,99,32,97,114,103,117,109,101,110,116,115,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,108,105,103,104,116,115,97,108,109,111,110,0,0,0,0,0,85,84,70,45,49,0,0,0,96,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,108,105,103,104,116,112,105,110,107,0,0,0,0,0,0,0,85,84,70,45,55,0,0,0,36,120,50,0,0,0,0,0,98,108,97,99,107,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,108,105,103,104,116,103,114,101,101,110,0,0,0,0,0,0,85,84,70,45,51,50,32,40,98,105,103,32,101,110,100,105,97,110,41,0,0,0,0,0,36,120,49,0,0,0,0,0,115,101,108,101,99,116,111,114,32,103,114,111,117,112,115,32,109,97,121,32,110,111,116,32,98,101,32,101,120,116,101,110,100,101,100,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,108,105,103,104,116,103,114,101,121,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,0,0,0,0,0,0,0,44,32,105,110,32,102,117,110,99,116,105,111,110,32,96,0,85,84,70,45,51,50,32,40,108,105,116,116,108,101,32,101,110,100,105,97,110,41,0,0,109,105,110,40,36,120,49,44,32,36,120,50,46,46,46,41,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,108,105,103,104,116,103,114,97,121,0,0,0,0,0,0,0,85,84,70,45,49,54,32,40,108,105,116,116,108,101,32,101,110,100,105,97,110,41,0,0,97,98,115,40,36,118,97,108,117,101,41,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,121,101,108,108,111,119,0,0,0,0,58,102,105,114,115,116,45,108,105,110,101,0,0,0,0,0,85,84,70,45,49,54,32,40,98,105,103,32,101,110,100,105,97,110,41,0,0,0,0,0,102,108,111,111,114,40,36,118,97,108,117,101,41,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,108,105,103,104,116,99,121,97,110,0,0,0,0,0,0,0,85,84,70,45,56,0,0,0,99,101,105,108,40,36,118,97,108,117,101,41,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,108,105,103,104,116,99,111,114,97,108,0,0,0,0,0,0,117,110,99,108,111,115,101,100,32,112,97,114,101,110,116,104,101,115,105,115,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,0,0,114,111,117,110,100,40,36,118,97,108,117,101,41,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,108,105,103,104,116,98,108,117,101,0,0,0,0,0,0,0,109,101,100,105,97,32,102,101,97,116,117,114,101,32,114,101,113,117,105,114,101,100,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,0,0,0,0,46,99,115,115,0,0,0,0,32,125,10,0,0,0,0,0,96,32,109,117,115,116,32,98,101,32,117,110,105,116,108,101,115,115,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,108,101,109,111,110,99,104,105,102,102,111,110,0,0,0,0,32,0,0,0,0,0,0,0,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,39,40,39,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,36,118,97,108,117,101,32,111,102,32,96,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,108,97,119,110,103,114,101,101,110,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,0,0,0,0,0,36,118,97,108,117,101,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,108,97,118,101,110,100,101,114,98,108,117,115,104,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,117,112,112,101,114,32,98,111,117,110,100,32,105,110,32,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,0,0,0,112,101,114,99,101,110,116,97,103,101,40,36,118,97,108,117,101,41,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,98,105,115,113,117,101,0,0,108,97,118,101,110,100,101,114,0,0,0,0,0,0,0,0,114,103,98,40,36,114,101,100,44,32,36,103,114,101,101,110,44,32,36,98,108,117,101,41,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,105,110,39,32,107,101,121,119,111,114,100,32,105,110,32,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,0,0,113,117,111,116,101,40,36,115,116,114,105,110,103,41,0,0,64,114,101,116,117,114,110,32,109,97,121,32,111,110,108,121,32,98,101,32,117,115,101,100,32,119,105,116,104,105,110,32,97,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,107,104,97,107,105,0,0,0,102,117,110,99,116,105,111,110,32,0,0,0,0,0,0,0,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,110,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,0,0,32,104,97,115,32,110,111,32,112,97,114,97,109,101,116,101,114,32,110,97,109,101,100,32,0,0,0,0,0,0,0,0,36,115,116,114,105,110,103,0,105,118,111,114,121,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,117,112,112,101,114,32,98,111,117,110,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,117,110,113,117,111,116,101,40,36,115,116,114,105,110,103,41,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,105,110,100,105,103,111,0,0,58,58,97,102,116,101,114,0,101,120,112,101,99,116,101,100,32,39,116,104,114,111,117,103,104,39,32,111,114,32,39,116,111,39,32,107,101,121,119,111,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,112,120,0,0,0,0,0,0,105,101,45,104,101,120,45,115,116,114,40,36,99,111,108,111,114,41,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,105,110,100,105,97,110,114,101,100,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,102,114,111,109,39,32,107,101,121,119,111,114,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,99,104,97,110,103,101,45,99,111,108,111,114,96,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,104,111,116,112,105,110,107,0,64,102,111,114,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,110,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,0,0,0,58,110,111,116,40,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,99,104,97,110,103,101,45,99,111,108,111,114,96,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,104,111,110,101,121,100,101,119,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,64,101,108,115,101,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,116,111,112,45,108,101,118,101,108,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,32,123,10,0,0,0,0,0,99,104,97,110,103,101,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,103,114,101,101,110,121,101,108,108,111,119,0,0,0,0,0,64,109,101,100,105,97,32,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,112,114,101,100,105,99,97,116,101,32,102,111,114,32,64,105,102,0,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,115,99,97,108,101,45,99,111,108,111,114,96,0,0,80,77,0,0,0,0,0,0,103,114,101,101,110,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,105,110,116,101,114,112,111,108,97,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,115,99,97,108,101,45,99,111,108,111,114,96,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,103,114,101,121,0,0,0,0,101,114,114,111,114,32,112,97,114,115,105,110,103,32,105,110,116,101,114,112,111,108,97,116,101,100,32,117,114,108,0,0,46,46,46,0,0,0,0,0,115,99,97,108,101,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,0,98,101,105,103,101,0,0,0,103,114,97,121,0,0,0,0,32,97,110,100,32,0,0,0,101,114,114,111,114,32,112,97,114,115,105,110,103,32,105,110,116,101,114,112,111,108,97,116,101,100,32,118,97,108,117,101,0,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,97,100,106,117,115,116,45,99,111,108,111,114,96,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,103,111,108,100,101,110,114,111,100,0,0,0,0,0,0,0,91,102,93,0,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,73,69,32,102,117,110,99,116,105,111,110,32,0,0,0,0,58,0,0,0,0,0,0,0,32,112,114,111,118,105,100,101,100,32,109,111,114,101,32,116,104,97,110,32,111,110,99,101,32,105,110,32,99,97,108,108,32,116,111,32,0,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,97,100,106,117,115,116,45,99,111,108,111,114,96,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,103,111,108,100,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,115,116,114,105,110,103,32,99,111,110,115,116,97,110,116,32,0,0,0,0,0,0,0,0,97,100,106,117,115,116,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,103,104,111,115,116,119,104,105,116,101,0,0,0,0,0,0,58,97,102,116,101,114,0,0,101,114,114,111,114,32,114,101,97,100,105,110,103,32,118,97,108,117,101,115,32,97,102,116,101,114,32,0,0,0,0,0,111,110,108,121,32,0,0,0,112,116,0,0,0,0,0,0,102,97,100,101,45,111,117,116,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,103,97,105,110,115,98,111,114,111,0,0,0,0,0,0,0,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,116,114,97,110,115,112,97,114,101,110,116,105,122,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,102,117,99,104,115,105,97,0,117,110,97,98,108,101,32,116,111,32,112,97,114,115,101,32,85,82,76,0,0,0,0,0,102,97,100,101,45,105,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,102,111,114,101,115,116,103,114,101,101,110,0,0,0,0,0,85,82,73,32,105,115,32,109,105,115,115,105,110,103,32,39,41,39,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,111,112,45,108,101,118,101,108,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,32,42,47,0,0,0,0,0,111,112,97,99,105,102,121,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,102,108,111,114,97,108,119,104,105,116,101,0,0,0,0,0,117,110,99,108,111,115,101,100,32,112,97,114,101,110,116,104,101,115,105,115,0,0,0,0,116,114,117,101,0,0,0,0,41,0,0,0,0,0,0,0,102,105,114,101,98,114,105,99,107,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,114,103,98,97,40,0,0,0,97,108,112,104,97,40,0,0,100,111,100,103,101,114,98,108,117,101,0,0,0,0,0,0,42,0,0,0,0,0,0,0,32,105,115,32,110,111,116,32,97,32,118,97,108,105,100,32,67,83,83,32,118,97,108,117,101,0,0,0,0,0,0,0,111,112,97,99,105,116,121,40,36,99,111,108,111,114,41,0,97,122,117,114,101,0,0,0,100,105,109,103,114,101,121,0,96,32,109,117,115,116,32,98,101,32,98,101,116,119,101,101,110,32,0,0,0,0,0,0,43,0,0,0,0,0,0,0,97,108,112,104,97,40,36,99,111,108,111,114,41,0,0,0,117,112,112,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,100,105,109,103,114,97,121,0,99,97,108,99,0,0,0,0,115,116,121,108,101,32,100,101,99,108,97,114,97,116,105,111,110,32,109,117,115,116,32,99,111,110,116,97,105,110,32,97,32,118,97,108,117,101,0,0,32,0,0,0,0,0,0,0,112,97,114,97,109,101,116,101,114,32,0,0,0,0,0,0,105,110,118,101,114,116,40,36,99,111,108,111,114,41,0,0,100,101,101,112,115,107,121,98,108,117,101,0,0,0,0,0,34,32,109,117,115,116,32,98,101,32,102,111,108,108,111,119,101,100,32,98,121,32,97,32,39,58,39,0,0,0,0,0,32,37,32,0,0,0,0,0,99,111,109,112,108,101,109,101,110,116,40,36,99,111,108,111,114,41,0,0,0,0,0,0,100,101,101,112,112,105,110,107,0,0,0,0,0,0,0,0,58,58,98,101,102,111,114,101,0,0,0,0,0,0,0,0,112,114,111,112,101,114,116,121,32,34,0,0,0,0,0,0,109,109,0,0,0,0,0,0,103,114,97,121,115,99,97,108,101,40,36,99,111,108,111,114,41,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,115,116,114,105,110,103,0,0,58,32,101,114,114,111,114,58,32,0,0,0,0,0,0,0,100,97,114,107,118,105,111,108,101,116,0,0,0,0,0,0,105,110,118,97,108,105,100,32,112,114,111,112,101,114,116,121,32,110,97,109,101,0,0,0,32,42,32,0,0,0,0,0,100,101,115,97,116,117,114,97,116,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,100,97,114,107,116,117,114,113,117,111,105,115,101,0,0,0,105,110,118,97,108,105,100,32,115,101,108,101,99,116,111,114,32,102,111,114,32,64,101,120,116,101,110,100,0,0,0,0,32,45,32,0,0,0,0,0,115,97,116,117,114,97,116,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,100,97,114,107,115,108,97,116,101,103,114,101,121,0,0,0,64,99,111,110,116,101,110,116,32,109,97,121,32,111,110,108,121,32,98,101,32,117,115,101,100,32,119,105,116,104,105,110,32,97,32,109,105,120,105,110,0,0,0,0,0,0,0,0,32,43,32,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,119,97,114,110,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,0,0,44,32,0,0,0,0,0,0,100,97,114,107,101,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,64,109,101,100,105,97,32,0,111,114,100,105,110,97,108,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,100,97,114,107,115,108,97,116,101,103,114,97,121,0,0,0,111,110,108,121,32,118,97,114,105,97,98,108,101,32,100,101,99,108,97,114,97,116,105,111,110,115,32,97,110,100,32,99,111,110,116,114,111,108,32,100,105,114,101,99,116,105,118,101,115,32,97,114,101,32,97,108,108,111,119,101,100,32,105,110,115,105,100,101,32,102,117,110,99,116,105,111,110,115,0,0,36,97,109,111,117,110,116,0,111,114,100,105,110,97,108,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,115,108,97,116,101,98,108,117,101,0,0,0,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,115,32,97,114,101,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,115,105,100,101,32,109,105,120,105,110,115,32,97,110,100,32,102,117,110,99,116,105,111,110,115,0,0,32,60,32,0,0,0,0,0,108,105,103,104,116,101,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,109,97,121,32,110,111,116,32,98,101,32,99,97,108,108,101,100,32,119,105,116,104,32,98,111,116,104,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,32,97,110,100,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,115,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,100,97,114,107,115,101,97,103,114,101,101,110,0,0,0,0,110,111,110,45,116,101,114,109,105,110,97,108,32,115,116,97,116,101,109,101,110,116,32,111,114,32,100,101,99,108,97,114,97,116,105,111,110,32,109,117,115,116,32,101,110,100,32,119,105,116,104,32,39,59,39,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,109,97,121,32,111,110,108,121,32,98,101,32,99,97,108,108,101,100,32,119,105,116,104,32,111,110,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,115,97,108,109,111,110,0,0,0,0,0,0,97,113,117,97,109,97,114,105,110,101,0,0,0,0,0,0,96,32,111,102,32,96,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,32,62,32,0,0,0,0,0,46,115,99,115,115,0,0,0,97,100,106,117,115,116,45,104,117,101,40,36,99,111,108,111,114,44,32,36,100,101,103,114,101,101,115,41,0,0,0,0,108,111,119,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,100,97,114,107,114,101,100,0,87,65,82,78,73,78,71,58,32,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,115,116,114,105,110,103,32,99,111,110,115,116,97,110,116,32,111,114,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,0,9,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,108,105,103,104,116,110,101,115,115,40,36,99,111,108,111,114,41,0,0,0,0,0,0,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,111,112,116,105,111,110,97,108,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,110,117,109,98,101,114,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,111,114,99,104,105,100,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,116,111,114,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,100,97,114,107,111,114,97,110,103,101,0,0,0,0,0,0,58,98,101,102,111,114,101,0,105,110,118,97,108,105,100,32,97,116,116,114,105,98,117,116,101,32,110,97,109,101,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,0,0,0,0,112,99,0,0,0,0,0,0,115,97,116,117,114,97,116,105,111,110,40,36,99,111,108,111,114,41,0,0,0,0,0,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,99,97,110,110,111,116,32,104,97,118,101,32,109,111,114,101,32,116,104,97,110,32,111,110,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,0,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,112,115,101,117,100,111,45,99,108,97,115,115,32,111,114,32,112,115,101,117,100,111,45,101,108,101,109,101,110,116,0,0,0,0,0,32,97,110,100,32,0,0,0,100,101,103,0,0,0,0,0,111,112,116,105,111,110,97,108,32,112,97,114,97,109,101,116,101,114,115,32,109,97,121,32,110,111,116,32,98,101,32,99,111,109,98,105,110,101,100,32,119,105,116,104,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,115,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,100,97,114,107,109,97,103,101,110,116,97,0,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,97,114,103,117,109,101,110,116,32,116,111,32,0,0,0,0,0,0,0,44,32,0,0,0,0,0,0,37,112,0,0,0,0,0,0,104,117,101,40,36,99,111,108,111,114,41,0,0,0,0,0,102,97,108,115,101,0,0,0,101,114,114,111,114,32,105,110,32,67,32,102,117,110,99,116,105,111,110,58,32,0,0,0,91,98,117,105,108,116,45,105,110,32,102,117,110,99,116,105,111,110,93,0,0,0,0,0,100,97,114,107,107,104,97,107,105,0,0,0,0,0,0,0,46,46,46,41,0,0,0,0,64,99,111,110,116,101,110,116,59,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,105,110,99,108,117,100,101,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,100,97,114,107,103,114,101,101,110,0,0,0,0,0,0,0,47,42,32,108,105,110,101,32,0,0,0,0,0,0,0,0,104,115,108,97,40,36,104,117,101,44,32,36,115,97,116,117,114,97,116,105,111,110,44,32,36,108,105,103,104,116,110,101,115,115,44,32,36,97,108,112,104,97,41,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,110,100,115,32,102,111,114,32,109,111,100,117,108,111,0,0,0,0,0,97,108,105,99,101,98,108,117,101,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,32,116,111,32,0,0,0,0,64,105,110,99,108,117,100,101,32,0,0,0,0,0,0,0,36,108,105,103,104,116,110,101,115,115,0,0,0,0,0,0,116,114,117,101,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,110,100,115,32,102,111,114,32,109,117,108,116,105,112,108,105,99,97,116,105,111,110,0,0,0,0,0,100,97,114,107,103,114,101,121,0,0,0,0,0,0,0,0,110,101,103,97,116,101,100,32,115,101,108,101,99,116,111,114,32,105,115,32,109,105,115,115,105,110,103,32,39,41,39,0,64,102,117,110,99,116,105,111,110,32,0,0,0,0,0,0,36,115,97,116,117,114,97,116,105,111,110,0,0,0,0,0,97,108,112,104,97,32,99,104,97,110,110,101,108,115,32,109,117,115,116,32,98,101,32,101,113,117,97,108,32,119,104,101,110,32,99,111,109,98,105,110,105,110,103,32,99,111,108,111,114,115,0,0,0,0,0,0,58,32,0,0,0,0,0,0,100,97,114,107,103,114,97,121,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,115,101,108,101,99,116,111,114,32,97,102,116,101,114,32,0,64,109,105,120,105,110,32,0,99,97,110,110,111,116,32,100,105,118,105,100,101,32,97,32,110,117,109,98,101,114,32,98,121,32,97,32,99,111,108,111,114,0,0,0,0,0,0,0,100,97,114,107,103,111,108,100,101,110,114,111,100,0,0,0,97,113,117,97,0,0,0,0,97,114,103,117,109,101,110,116,32,96,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,115,101,108,101,99,116,111,114,0,0,0,0,0,0,0,100,97,114,107,99,121,97,110,0,0,0,0,0,0,0,0,104,115,108,40,36,104,117,101,44,32,36,115,97,116,117,114,97,116,105,111,110,44,32,36,108,105,103,104,116,110,101,115,115,41,0,0,0,0,0,0,99,111,110,116,101,110,116,115,32,111,102,32,110,97,109,101,115,112,97,99,101,100,32,112,114,111,112,101,114,116,105,101,115,32,109,117,115,116,32,114,101,115,117,108,116,32,105,110,32,115,116,121,108,101,32,100,101,99,108,97,114,97,116,105,111,110,115,32,111,110,108,121,0,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,39,123,39,32,97,102,116,101,114,32,110,97,109,101,115,112,97,99,101,100,32,112,114,111,112,101,114,116,121,0,0,0,0,0,0,0,0,66,97,99,107,116,114,97,99,101,58,0,0,0,0,0,0,103,105,118,101,110,32,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,36,119,101,105,103,104,116,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,117,98,115,101,116,32,109,97,112,32,107,101,121,115,32,109,97,121,32,110,111,116,32,98,101,32,101,109,112,116,121,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,100,97,114,107,98,108,117,101,0,0,0,0,0,0,0,0,32,105,110,32,97,115,115,105,103,110,109,101,110,116,32,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,0,0,64,119,104,105,108,101,32,0,99,97,110,110,111,116,32,97,100,100,32,111,114,32,115,117,98,116,114,97,99,116,32,110,117,109,98,101,114,115,32,119,105,116,104,32,105,110,99,111,109,112,97,116,105,98,108,101,32,117,110,105,116,115,0,0,99,121,97,110,0,0,0,0,101,120,112,101,99,116,101,100,32,39,58,39,32,97,102,116,101,114,32,0,0,0,0,0,99,109,0,0,0,0,0,0,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,58,32,0,0,0,0,0,99,114,105,109,115,111,110,0,105,110,118,97,108,105,100,32,110,97,109,101,32,105,110,32,64,105,110,99,108,117,100,101,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,64,101,97,99,104,32,0,0,109,105,120,40,36,99,111,108,111,114,45,49,44,32,36,99,111,108,111,114,45,50,44,32,36,119,101,105,103,104,116,58,32,53,48,37,41,0,0,0,96,69,120,112,97,110,100,96,32,100,111,101,115,110,39,116,32,104,97,110,100,108,101,32,0,0,0,0,0,0,0,0,73,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,99,111,114,110,115,105,108,107,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,118,97,114,105,97,98,108,101,32,110,97,109,101,32,40,101,46,103,46,32,36,120,41,32,111,114,32,39,41,39,32,102,111,114,32,116,104,101,32,112,97,114,97,109,101,116,101,114,32,108,105,115,116,32,102,111,114,32,0,0,0,32,116,111,32,0,0,0,0,99,111,114,110,102,108,111,119,101,114,98,108,117,101,0,0,98,108,117,101,40,36,99,111,108,111,114,41,0,0,0,0,67,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,59,32,112,108,101,97,115,101,32,99,111,110,116,97,99,116,32,116,104,101,32,76,105,98,83,97,115,115,32,109,97,105,110,116,97,105,110,101,114,115,0,0,99,97,110,110,111,116,32,99,111,109,112,97,114,101,32,110,117,109,98,101,114,115,32,119,105,116,104,32,105,110,99,111,109,112,97,116,105,98,108,101,32,117,110,105,116,115,0,0,108,105,115,116,0,0,0,0,108,111,119,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,97,32,39,123,39,0,0,32,116,104,114,111,117,103,104,32,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,118,97,114,105,97,98,108,101,32,98,105,110,100,105,110,103,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,0,99,111,114,97,108,0,0,0,103,114,101,101,110,40,36,99,111,108,111,114,41,0,0,0,118,101,99,116,111,114,0,0,109,105,120,105,110,32,0,0,109,97,121,32,111,110,108,121,32,99,111,109,112,97,114,101,32,110,117,109,98,101,114,115,0,0,0,0,0,0,0,0,97,114,103,108,105,115,116,0,32,123,10,0,0,0,0,0,99,111,108,111,114,0,0,0,32,0,0,0,0,0,0,0,32,102,114,111,109,32,0,0,99,104,111,99,111,108,97,116,101,0,0,0,0,0,0,0,91,98,117,105,108,116,45,105,110,32,102,117,110,99,116,105,111,110,93,0,0,0,0,0,91,102,93,0,0,0,0,0,114,101,100,40,36,99,111,108,111,114,41,0,0,0,0,0,37,46,48,76,102,0,0,0,64,99,111,110,116,101,110,116,91,109,93,0,0,0,0,0,115,111,117,114,99,101,32,115,116,114,105,110,103,0,0,0,32,42,47,0,0,0,0,0,47,42,35,32,115,111,117,114,99,101,77,97,112,112,105,110,103,85,82,76,61,0,0,0,118,97,114,105,97,98,108,101].concat([45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,32,109,97,121,32,110,111,116,32,98,101,32,112,97,115,115,101,100,32,98,121,32,110,97,109,101,0,0,0,0,0,0,91,67,79,76,79,82,32,84,65,66,76,69,93,0,0,0,98,111,100,121,32,102,111,114,32,0,0,0,0,0,0,0,64,102,111,114,32,0,0,0,121,101,108,108,111,119,103,114,101,101,110,0,0,0,0,0,121,101,108,108,111,119,0,0,99,104,97,114,116,114,101,117,115,101,0,0,0,0,0,0,119,104,105,116,101,115,109,111,107,101,0,0,0,0,0,0,119,104,105,116,101,0,0,0,36,99,111,108,111,114,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,119,104,101,97,116,0,0,0,117,110,98,111,117,110,100,32,118,97,114,105,97,98,108,101,32,0,0,0,0,0,0,0,118,105,111,108,101,116,0,0,116,117,114,113,117,111,105,115,101,0,0,0,0,0,0,0,116,111,109,97,116,111,0,0,116,104,105,115,116,108,101,0,116,101,97,108,0,0,0,0,32,100,101,102,105,110,105,116,105,111,110,0,0,0,0,0,116,97,110,0,0,0,0,0,115,116,101,101,108,98,108,117,101,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,115,112,114,105,110,103,103,114,101,101,110,0,0,0,0,0,99,97,100,101,116,98,108,117,101,0,0,0,0,0,0,0,70,114,105,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,115,110,111,119,0,0,0,0,114,103,98,97,40,36,99,111,108,111,114,44,32,36,97,108,112,104,97,41,0,0,0,0,37,76,102,0,0,0,0,0,96,0,0,0,0,0,0,0,84,104,117,0,0,0,0,0,115,108,97,116,101,103,114,101,121,0,0,0,0,0,0,0,96,32,103,105,118,101,110,32,119,114,111,110,103,32,110,117,109,98,101,114,32,111,102,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,115,108,97,116,101,103,114,97,121,0,0,0,0,0,0,0,84,117,101,0,0,0,0,0,115,108,97,116,101,98,108,117,101,0,0,0,0,0,0,0,77,111,110,0,0,0,0,0,115,107,121,98,108,117,101,0,83,117,110,0,0,0,0,0,115,105,108,118,101,114,0,0,115,105,101,110,110,97,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,97,110,116,105,113,117,101,119,104,105,116,101,0,0,0,0,105,110,118,97,108,105,100,32,110,97,109,101,32,105,110,32,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,115,101,97,115,104,101,108,108,0,0,0,0,0,0,0,0,46,46,47,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,115,101,97,103,114,101,101,110,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,115,97,110,100,121,98,114,111,119,110,0,0,0,0,0,0,98,117,114,108,121,119,111,111,100,0,0,0,0,0,0,0,110,117,109,98,101,114,0,0,84,117,101,115,100,97,121,0,115,97,108,109,111,110,0,0,36,97,108,112,104,97,0,0,114,98,0,0,0,0,0,0,44,32,105,110,32,109,105,120,105,110,32,96,0,0,0,0,32,105,115,32,109,105,115,115,105,110,103,32,105,110,32,99,97,108,108,32,116,111,32,0,77,111,110,100,97,121,0,0,45,0,0,0,0,0,0,0,115,97,100,100,108,101,98,114,111,119,110,0,0,0,0,0,111,118,101,114,108,111,97,100,101,100,32,102,117,110,99,116,105,111,110,32,96,0,0,0,83,117,110,100,97,121,0,0,114,111,121,97,108,98,108,117,101,0,0,0,0,0,0,0,115,116,114,105,110,103,0,0,114,111,115,121,98,114,111,119,110,0,0,0,0,0,0,0,32,111,110,108,121,32,116,97,107,101,115,32,0,0,0,0,96,32,109,117,115,116,32,98,101,32,97,32,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,114,101,100,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,112,117,114,112,108,101,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,112,111,119,100,101,114,98,108,117,101,0,0,0,0,0,0,117,112,112,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,101,120,112,101,99,116,105,110,103,32,97,110,111,116,104,101,114,32,117,114,108,32,111,114,32,113,117,111,116,101,100,32,112,97,116,104,32,105,110,32,64,105,109,112,111,114,116,32,108,105,115,116,0,0,0,0,47,0,0,0,0,0,0,0,46,46,46,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,112,108,117,109,0,0,0,0,64,119,97,114,110,32,0,0,36,111,110,108,121,45,112,97,116,104,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,112,105,110,107,0,0,0,0,36,112,97,116,104,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,112,101,114,117,0,0,0,0,98,114,111,119,110,0,0,0,105,109,97,103,101,45,117,114,108,40,36,112,97,116,104,44,32,36,111,110,108,121,45,112,97,116,104,58,32,102,97,108,115,101,44,32,36,99,97,99,104,101,45,98,117,115,116,101,114,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,112,101,97,99,104,112,117,102,102,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,32,97,114,103,117,109,101,110,116,115,59,32,0,0,0,0,114,103,98,97,40,36,114,101,100,44,32,36,103,114,101,101,110,44,32,36,98,108,117,101,44,32,36,97,108,112,104,97,41,0,0,0,0,0,0,0,110,111,32,109,105,120,105,110,32,110,97,109,101,100,32,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,32,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,112,97,121,97,119,104,105,112,0,0,0,0,0,0,58,32,0,0,0,0,0,0,36,105,102,45,102,97,108,115,101,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,108,101,118,105,111,108,101,116,114,101,100,0,0,0,36,99,111,110,100,105,116,105,111,110,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,108,101,116,117,114,113,117,111,105,115,101,0,0,0,105,102,40,36,99,111,110,100,105,116,105,111,110,44,32,36,105,102,45,116,114,117,101,44,32,36,105,102,45,102,97,108,115,101,41,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,112,97,108,101,103,114,101,101,110,0,0,0,0,0,0,0,110,111,116,40,36,118,97,108,117,101,41,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,112,97,108,101,103,111,108,100,101,110,114,111,100,0,0,0,36,110,117,109,98,101,114,45,50,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,111,114,99,104,105,100,0,0,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,32,117,114,108,32,111,114,32,113,117,111,116,101,100,32,112,97,116,104,0,36,110,117,109,98,101,114,45,49,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,111,114,97,110,103,101,114,101,100,0,0,0,0,0,0,0,99,111,109,112,97,114,97,98,108,101,40,36,110,117,109,98,101,114,45,49,44,32,36,110,117,109,98,101,114,45,50,41,0,0,0,0,0,0,0,0,111,114,97,110,103,101,0,0,117,110,105,116,108,101,115,115,40,36,110,117,109,98,101,114,41,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,111,108,105,118,101,100,114,97,98,0,0,0,0,0,0,0,98,108,117,101,118,105,111,108,101,116,0,0,0,0,0,0,36,110,117,109,98,101,114,0,78,111,118,0,0,0,0,0,111,108,105,118,101,0,0,0,117,110,105,116,40,36,110,117,109,98,101,114,41,0,0,0,91,102,93,0,0,0,0,0,79,99,116,0,0,0,0,0,112,114,111,118,105,100,101,100,32,109,111,114,101,32,116,104,97,110,32,111,110,99,101,32,105,110,32,99,97,108,108,32,116,111,32,0,0,0,0,0,111,108,100,108,97,99,101,0,101,114,114,111,114,32,105,110,32,67,32,102,117,110,99,116,105,111,110,32,0,0,0,0,99,111,108,111,114,0,0,0,83,101,112,0,0,0,0,0,110,97,118,121,0,0,0,0,116,121,112,101,45,111,102,40,36,118,97,108,117,101,41,0,65,117,103,0,0,0,0,0,110,97,118,97,106,111,119,104,105,116,101,0,0,0,0,0,58,58,102,105,114,115,116,45,108,101,116,116,101,114,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,168,111,0,0,214,1,0,0,106,1,0,0,38,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,111,0,0,158,1,0,0,238,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,111,0,0,56,0,0,0,46,1,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,111,0,0,196,0,0,0,158,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,111,0,0,196,0,0,0,50,1,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,111,0,0,196,0,0,0,208,1,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,112,0,0,118,0,0,0,192,0,0,0,34,0,0,0,4,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,112,0,0,42,1,0,0,154,1,0,0,34,0,0,0,2,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,112,0,0,114,0,0,0,252,0,0,0,34,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,112,0,0,90,2,0,0,226,0,0,0,34,0,0,0,12,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,113,0,0,192,1,0,0,92,1,0,0,34,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,113,0,0,240,0,0,0,76,0,0,0,34,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,113,0,0,64,1,0,0,208,0,0,0,34,0,0,0,84,0,0,0,62,0,0,0,92,0,0,0,42,0,0,0,6,0,0,0,26,0,0,0,4,0,0,0,248,255,255,255,96,113,0,0,226,0,0,0,6,0,0,0,98,0,0,0,10,0,0,0,2,0,0,0,252,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,113,0,0,144,0,0,0,84,2,0,0,34,0,0,0,20,0,0,0,66,0,0,0,96,0,0,0,50,0,0,0,68,0,0,0,2,0,0,0,2,0,0,0,248,255,255,255,136,113,0,0,60,0,0,0,214,0,0,0,46,1,0,0,228,0,0,0,74,0,0,0,254,0,0,0,106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,113,0,0,190,0,0,0,52,2,0,0,34,0,0,0,42,0,0,0,32,0,0,0,244,0,0,0,242,1,0,0,196,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,113,0,0,198,0,0,0,50,0,0,0,34,0,0,0,174,0,0,0,4,0,0,0,254,0,0,0,82,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,113,0,0,190,1,0,0,2,0,0,0,34,0,0,0,58,0,0,0,64,0,0,0,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,113,0,0,70,1,0,0,172,1,0,0,34,0,0,0,18,0,0,0,62,0,0,0,6,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,114,0,0,16,1,0,0,16,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,114,0,0,162,0,0,0,224,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,114,0,0,36,0,0,0,144,1,0,0,34,0,0,0,52,0,0,0,50,0,0,0,84,0,0,0,40,0,0,0,82,0,0,0,8,0,0,0,6,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,114,0,0,28,0,0,0,68,0,0,0,34,0,0,0,42,0,0,0,46,0,0,0,76,0,0,0,44,0,0,0,74,0,0,0,4,0,0,0,2,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,114,0,0,220,1,0,0,54,1,0,0,34,0,0,0,18,0,0,0,16,0,0,0,10,0,0,0,12,0,0,0,90,0,0,0,14,0,0,0,8,0,0,0,24,0,0,0,22,0,0,0,20,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,114,0,0,54,2,0,0,198,1,0,0,34,0,0,0,94,0,0,0,54,0,0,0,30,0,0,0,32,0,0,0,60,0,0,0,34,0,0,0,28,0,0,0,40,0,0,0,38,0,0,0,36,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,114,0,0,58,0,0,0,8,0,0,0,34,0,0,0,24,0,0,0,12,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,114,0,0,22,0,0,0,246,0,0,0,34,0,0,0,4,0,0,0,18,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,114,0,0,176,1,0,0,50,2,0,0,34,0,0,0,12,0,0,0,16,0,0,0,30,0,0,0,50,1,0,0,132,0,0,0,10,0,0,0,220,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,114,0,0,148,1,0,0,220,0,0,0,34,0,0,0,8,0,0,0,4,0,0,0,28,0,0,0,182,0,0,0,236,0,0,0,8,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,115,0,0,148,1,0,0,14,0,0,0,34,0,0,0,10,0,0,0,14,0,0,0,18,0,0,0,130,0,0,0,110,0,0,0,14,0,0,0,58,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,115,0,0,148,1,0,0,12,2,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,115,0,0,148,1,0,0,218,1,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,115,0,0,238,1,0,0,232,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,115,0,0,148,1,0,0,80,1,0,0,34,0,0,0,8,0,0,0,14,0,0,0,8,0,0,0,12,0,0,0,240,1,0,0,36,0,0,0,10,3,0,0,44,0,0,0,180,2,0,0,36,0,0,0,26,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,115,0,0,150,0,0,0,60,1,0,0,34,0,0,0,156,2,0,0,48,0,0,0,244,2,0,0,64,0,0,0,246,0,0,0,42,0,0,0,10,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,115,0,0,186,0,0,0,88,1,0,0,64,0,0,0,92,1,0,0,80,0,0,0,16,0,0,0,218,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,208,115,0,0,166,1,0,0,86,2,0,0,56,0,0,0,248,255,255,255,208,115,0,0,228,1,0,0,44,0,0,0,192,255,255,255,192,255,255,255,208,115,0,0,66,2,0,0,168,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,115,0,0,148,1,0,0,62,0,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,115,0,0,148,1,0,0,88,2,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,230,1,0,0,80,2,0,0,142,0,0,0,90,0,0,0,26,0,0,0,20,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,54,1,0,0,156,0,0,0,134,1,0,0,56,0,0,0,32,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,116,0,0,90,0,0,0,184,1,0,0,10,1,0,0,28,0,0,0,10,0,0,0,14,0,0,0,70,0,0,0,80,0,0,0,88,0,0,0,28,0,0,0,242,0,0,0,250,0,0,0,94,0,0,0,60,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,116,0,0,202,1,0,0,212,0,0,0,142,0,0,0,90,0,0,0,20,0,0,0,26,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,232,0,0,0,156,0,0,0,118,2,0,0,56,0,0,0,28,3,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,72,116,0,0,138,1,0,0,10,1,0,0,148,255,255,255,148,255,255,255,72,116,0,0,94,1,0,0,116,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,120,116,0,0,66,1,0,0,170,1,0,0,252,255,255,255,252,255,255,255,120,116,0,0,106,0,0,0,22,2,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,144,116,0,0,18,1,0,0,186,1,0,0,252,255,255,255,252,255,255,255,144,116,0,0,104,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,168,116,0,0,194,0,0,0,92,2,0,0,248,255,255,255,248,255,255,255,168,116,0,0,46,2,0,0,138,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,192,116,0,0,14,2,0,0,6,1,0,0,248,255,255,255,248,255,255,255,192,116,0,0,28,2,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,116,0,0,76,2,0,0,244,1,0,0,184,2,0,0,76,0,0,0,32,0,0,0,34,0,0,0,0,1,0,0,198,0,0,0,82,0,0,0,202,0,0,0,156,0,0,0,236,2,0,0,56,0,0,0,30,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,116,0,0,2,1,0,0,82,2,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,117,0,0,36,1,0,0,150,1,0,0,10,0,0,0,28,0,0,0,10,0,0,0,14,0,0,0,6,1,0,0,80,0,0,0,88,0,0,0,28,0,0,0,242,0,0,0,250,0,0,0,14,0,0,0,122,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,117,0,0,136,1,0,0,120,0,0,0,94,0,0,0,90,0,0,0,20,0,0,0,26,0,0,0,12,0,0,0,198,0,0,0,82,0,0,0,232,0,0,0,156,0,0,0,118,2,0,0,92,0,0,0,10,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,117,0,0,26,1,0,0,120,1,0,0,34,0,0,0,58,0,0,0,146,0,0,0,114,0,0,0,208,0,0,0,158,1,0,0,38,1,0,0,104,0,0,0,138,2,0,0,168,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,117,0,0,206,0,0,0,38,0,0,0,34,0,0,0,218,0,0,0,144,0,0,0,110,1,0,0,72,2,0,0,136,1,0,0,70,0,0,0,44,1,0,0,14,2,0,0,174,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,117,0,0,0,2,0,0,210,0,0,0,34,0,0,0,16,0,0,0,108,0,0,0,6,2,0,0,254,1,0,0,86,2,0,0,126,0,0,0,72,0,0,0,84,1,0,0,130,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,117,0,0,252,1,0,0,142,1,0,0,34,0,0,0,212,0,0,0,216,0,0,0,216,1,0,0,178,0,0,0,22,1,0,0,134,2,0,0,124,0,0,0,218,2,0,0,118,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,0,0,90,1,0,0,206,1,0,0,22,0,0,0,28,0,0,0,10,0,0,0,14,0,0,0,70,0,0,0,80,0,0,0,88,0,0,0,190,0,0,0,126,0,0,0,196,2,0,0,94,0,0,0,60,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,118,0,0,12,0,0,0,178,1,0,0,12,1,0,0,90,0,0,0,20,0,0,0,26,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,208,0,0,0,22,0,0,0,186,1,0,0,56,0,0,0,28,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,118,0,0,130,0,0,0,188,1,0,0,108,0,0,0,120,1,0,0,52,0,0,0,224,0,0,0,26,0,0,0,178,0,0,0,88,0,0,0,76,0,0,0,100,0,0,0,60,0,0,0,8,1,0,0,82,1,0,0,126,1,0,0,136,0,0,0,206,1,0,0,170,0,0,0,166,0,0,0,116,0,0,0,138,0,0,0,72,1,0,0,10,0,0,0,46,1,0,0,202,0,0,0,74,1,0,0,230,0,0,0,192,1,0,0,208,0,0,0,128,0,0,0,38,1,0,0,132,0,0,0,44,0,0,0,150,0,0,0,246,0,0,0,50,1,0,0,244,0,0,0,100,1,0,0,172,1,0,0,128,1,0,0,12,0,0,0,182,1,0,0,176,1,0,0,122,0,0,0,48,1,0,0,196,0,0,0,24,1,0,0,80,1,0,0,180,1,0,0,204,1,0,0,34,0,0,0,124,1,0,0,30,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,118,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,118,0,0,122,1,0,0,200,0,0,0,148,0,0,0,38,0,0,0,78,2,0,0,58,2,0,0,138,0,0,0,188,1,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,118,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,118,0,0,32,1,0,0,146,1,0,0,154,1,0,0,18,3,0,0,0,2,0,0,238,0,0,0,204,1,0,0,80,0,0,0,106,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,118,0,0,82,0,0,0,228,0,0,0,134,0,0,0,50,2,0,0,158,1,0,0,38,2,0,0,14,3,0,0,2,1,0,0,198,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,164,2,0,0,220,255,255,255,160,118,0,0,106,2,0,0,244,0,0,0,240,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,118,0,0,2,2,0,0,72,0,0,0,142,1,0,0,166,0,0,0,188,2,0,0,4,0,0,0,112,2,0,0,184,0,0,0,20,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,118,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,96,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,118,0,0,56,1,0,0,204,0,0,0,136,0,0,0,6,3,0,0,32,0,0,0,164,2,0,0,192,2,0,0,208,1,0,0,62,1,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,118,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,118,0,0,70,0,0,0,250,1,0,0,234,1,0,0,20,1,0,0,166,1,0,0,86,2,0,0,98,0,0,0,166,1,0,0,42,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,119,0,0,174,1,0,0,26,2,0,0,158,0,0,0,88,2,0,0,242,1,0,0,186,2,0,0,82,1,0,0,138,1,0,0,16,1,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,119,0,0,126,1,0,0,226,1,0,0,234,0,0,0,62,0,0,0,40,0,0,0,94,2,0,0,70,0,0,0,190,0,0,0,212,1,0,0,204,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,119,0,0,100,1,0,0,20,2,0,0,128,0,0,0,34,1,0,0,86,1,0,0,142,0,0,0,158,0,0,0,42,0,0,0,108,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,119,0,0,42,0,0,0,110,1,0,0,162,1,0,0,50,0,0,0,44,0,0,0,214,0,0,0,138,1,0,0,118,2,0,0,100,0,0,0,78,0,0,0,102,1,0,0,54,2,0,0,80,2,0,0,226,2,0,0,54,1,0,0,166,2,0,0,164,0,0,0,94,2,0,0,122,2,0,0,238,1,0,0,212,2,0,0,190,0,0,0,226,0,0,0,190,2,0,0,28,0,0,0,2,1,0,0,4,1,0,0,172,2,0,0,204,0,0,0,228,2,0,0,58,2,0,0,74,0,0,0,210,1,0,0,20,0,0,0,238,2,0,0,170,1,0,0,200,2,0,0,78,1,0,0,126,2,0,0,38,2,0,0,144,0,0,0,248,2,0,0,150,2,0,0,110,0,0,0,50,1,0,0,42,1,0,0,110,2,0,0,192,2,0,0,166,0,0,0,62,0,0,0,104,1,0,0,2,2,0,0,66,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,119,0,0,24,1,0,0,42,0,0,0,158,2,0,0,100,1,0,0,10,2,0,0,120,1,0,0,194,0,0,0,222,0,0,0,126,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,119,0,0,76,1,0,0,236,0,0,0,176,1,0,0,200,0,0,0,38,3,0,0,206,2,0,0,2,1,0,0,176,0,0,0,172,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,119,0,0,62,2,0,0,234,1,0,0,228,1,0,0,202,1,0,0,208,2,0,0,234,2,0,0,168,2,0,0,192,0,0,0,162,0,0,0,112,0,0,0,136,2,0,0,94,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,119,0,0,200,1,0,0,38,1,0,0,178,2,0,0,188,0,0,0,130,0,0,0,74,2,0,0,52,1,0,0,242,0,0,0,198,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,119,0,0,8,0,0,0,8,0,0,0,96,2,0,0,2,3,0,0,210,1,0,0,218,2,0,0,168,1,0,0,4,0,0,0,156,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,119,0,0,68,1,0,0,142,0,0,0,208,2,0,0,158,2,0,0,184,0,0,0,12,0,0,0,116,1,0,0,26,1,0,0,210,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,119,0,0,224,1,0,0,72,2,0,0,86,0,0,0,74,0,0,0,146,0,0,0,102,2,0,0,20,3,0,0,220,1,0,0,48,0,0,0,184,0,0,0,120,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,119,0,0,234,0,0,0,136,0,0,0,16,0,0,0,254,1,0,0,98,1,0,0,226,0,0,0,150,1,0,0,40,1,0,0,240,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,119,0,0,88,2,0,0,148,0,0,0,60,0,0,0,224,1,0,0,234,2,0,0,222,2,0,0,182,2,0,0,36,2,0,0,98,1,0,0,192,1,0,0,166,1,0,0,236,1,0,0,68,0,0,0,230,2,0,0,216,0,0,0,40,0,0,0,242,2,0,0,174,0,0,0,32,0,0,0,124,0,0,0,172,1,0,0,42,2,0,0,132,0,0,0,184,0,0,0,92,2,0,0,82,2,0,0,154,2,0,0,148,1,0,0,152,2,0,0,124,1,0,0,98,0,0,0,222,0,0,0,174,2,0,0,194,1,0,0,112,0,0,0,224,0,0,0,236,2,0,0,242,0,0,0,140,0,0,0,56,1,0,0,246,2,0,0,220,0,0,0,162,0,0,0,228,0,0,0,0,3,0,0,250,2,0,0,160,0,0,0,60,2,0,0,130,1,0,0,104,2,0,0,108,1,0,0,206,0,0,0,76,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,119,0,0,216,0,0,0,180,1,0,0,72,1,0,0,174,0,0,0,244,1,0,0,16,0,0,0,94,0,0,0,248,2,0,0,26,3,0,0,132,1,0,0,114,2,0,0,22,3,0,0,192,0,0,0,36,2,0,0,138,2,0,0,14,0,0,0,106,1,0,0,152,1,0,0,122,1,0,0,176,0,0,0,156,0,0,0,26,2,0,0,178,2,0,0,218,0,0,0,234,0,0,0,82,2,0,0,154,0,0,0,80,2,0,0,134,2,0,0,134,0,0,0,232,1,0,0,104,1,0,0,116,0,0,0,12,1,0,0,48,1,0,0,104,2,0,0,40,1,0,0,118,0,0,0,148,2,0,0,88,0,0,0,44,2,0,0,120,0,0,0,14,1,0,0,46,1,0,0,218,1,0,0,166,2,0,0,64,1,0,0,66,0,0,0,176,1,0,0,204,0,0,0,224,0,0,0,132,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,119,0,0,114,1,0,0,32,2,0,0,28,2,0,0,22,0,0,0,144,1,0,0,128,0,0,0,52,2,0,0,74,0,0,0,52,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,0,0,152,0,0,0,74,0,0,0,40,2,0,0,122,0,0,0,196,1,0,0,112,1,0,0,110,2,0,0,136,1,0,0,140,0,0,0,184,0,0,0,86,1,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,120,0,0,230,0,0,0,74,1,0,0,48,0,0,0,106,2,0,0,68,1,0,0,96,1,0,0,222,2,0,0,232,0,0,0,64,1,0,0,76,0,0,0,20,1,0,0,188,1,0,0,228,255,255,255,16,120,0,0,64,2,0,0,78,0,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,120,0,0,218,0,0,0,176,0,0,0,94,0,0,0,102,1,0,0,112,0,0,0,32,0,0,0,114,1,0,0,178,1,0,0,66,0,0,0,180,0,0,0,162,1,0,0,236,0,0,0,98,1,0,0,196,1,0,0,94,0,0,0,96,1,0,0,84,1,0,0,160,0,0,0,186,1,0,0,154,0,0,0,248,0,0,0,84,0,0,0,206,0,0,0,146,1,0,0,226,0,0,0,72,0,0,0,184,1,0,0,144,0,0,0,190,1,0,0,28,1,0,0,106,1,0,0,228,0,0,0,194,1,0,0,98,0,0,0,124,0,0,0,152,0,0,0,230,1,0,0,168,0,0,0,148,1,0,0,58,0,0,0,158,0,0,0,68,1,0,0,64,0,0,0,96,0,0,0,170,1,0,0,148,0,0,0,18,1,0,0,58,1,0,0,182,0,0,0,220,0,0,0,66,1,0,0,86,1,0,0,154,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,120,0,0,112,1,0,0,30,2,0,0,170,2,0,0,12,3,0,0,42,1,0,0,130,2,0,0,64,2,0,0,250,0,0,0,22,1,0,0,134,0,0,0,108,0,0,0,16,1,0,0,194,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,120,0,0,118,1,0,0,36,2,0,0,54,0,0,0,50,0,0,0,62,2,0,0,156,1,0,0,126,2,0,0,214,1,0,0,76,1,0,0,184,0,0,0,68,2,0,0,238,0,0,0,114,0,0,0,220,255,255,255,80,120,0,0,0,1,0,0,160,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,120,0,0,54,2,0,0,172,0,0,0,82,1,0,0,126,0,0,0,192,1,0,0,16,3,0,0,220,1,0,0,230,1,0,0,8,2,0,0,196,0,0,0,160,1,0,0,60,0,0,0,86,0,0,0,12,2,0,0,174,1,0,0,118,1,0,0,194,2,0,0,222,1,0,0,102,1,0,0,162,1,0,0,22,1,0,0,220,2,0,0,212,0,0,0,20,0,0,0,132,2,0,0,4,1,0,0,62,1,0,0,182,1,0,0,160,2,0,0,190,1,0,0,184,2,0,0,242,2,0,0,96,0,0,0,84,0,0,0,248,0,0,0,100,0,0,0,36,3,0,0,84,1,0,0,4,3,0,0,70,1,0,0,8,3,0,0,214,1,0,0,210,0,0,0,226,2,0,0,24,0,0,0,116,2,0,0,250,1,0,0,92,0,0,0,228,2,0,0,44,1,0,0,110,1,0,0,42,2,0,0,146,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,120,0,0,98,0,0,0,58,1,0,0,196,0,0,0,124,2,0,0,176,2,0,0,0,1,0,0,90,1,0,0,224,1,0,0,222,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,120,0,0,168,0,0,0,12,1,0,0,138,0,0,0,200,1,0,0,126,1,0,0,236,0,0,0,168,0,0,0,134,0,0,0,78,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,120,0,0,112,0,0,0,250,0,0,0,156,1,0,0,148,0,0,0,48,0,0,0,32,3,0,0,148,1,0,0,38,0,0,0,104,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,120,0,0,96,0,0,0,68,2,0,0,78,2,0,0,162,2,0,0,76,2,0,0,6,0,0,0,240,2,0,0,214,0,0,0,212,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,120,0,0,132,1,0,0,64,2,0,0,148,2,0,0,68,2,0,0,84,2,0,0,74,1,0,0,154,1,0,0,104,0,0,0,130,1,0,0,34,1,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,120,0,0,202,0,0,0,66,0,0,0,142,2,0,0,230,0,0,0,124,1,0,0,230,2,0,0,102,0,0,0,188,0,0,0,44,1,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,120,0,0,56,2,0,0,108,1,0,0,28,1,0,0,252,2,0,0,250,2,0,0,224,1,0,0,224,2,0,0,102,0,0,0,12,1,0,0,96,0,0,0,140,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,120,0,0,130,0,0,0,58,2,0,0,172,0,0,0,58,1,0,0,172,2,0,0,98,2,0,0,34,2,0,0,152,1,0,0,108,1,0,0,96,0,0,0,188,0,0,0,40,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,0,0,248,1,0,0,64,0,0,0,74,1,0,0,76,0,0,0,198,1,0,0,18,2,0,0,42,0,0,0,0,1,0,0,234,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,121,0,0,4,2,0,0,254,0,0,0,40,2,0,0,244,1,0,0,248,0,0,0,118,0,0,0,122,1,0,0,132,1,0,0,236,0,0,0,162,1,0,0,186,2,0,0,170,0,0,0,88,0,0,0,128,2,0,0,112,1,0,0,62,1,0,0,140,2,0,0,34,0,0,0,156,2,0,0,134,1,0,0,146,0,0,0,202,0,0,0,122,0,0,0,34,1,0,0,150,1,0,0,20,2,0,0,230,1,0,0,194,2,0,0,96,1,0,0,40,1,0,0,176,0,0,0,80,0,0,0,80,1,0,0,212,1,0,0,180,1,0,0,16,1,0,0,84,2,0,0,52,0,0,0,202,2,0,0,206,1,0,0,114,2,0,0,10,2,0,0,250,0,0,0,116,2,0,0,16,2,0,0,112,2,0,0,238,0,0,0,64,1,0,0,232,2,0,0,36,0,0,0,46,0,0,0,72,1,0,0,190,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,121,0,0,248,0,0,0,116,0,0,0,184,1,0,0,44,0,0,0,26,1,0,0,8,0,0,0,244,0,0,0,8,0,0,0,94,1,0,0,164,0,0,0,240,0,0,0,188,0,0,0,224,255,255,255,32,121,0,0,240,2,0,0,130,1,0,0,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,121,0,0,20,0,0,0,126,0,0,0,52,1,0,0,50,1,0,0,220,0,0,0,240,0,0,0,136,1,0,0,54,0,0,0,110,1,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,121,0,0,80,0,0,0,48,1,0,0,230,0,0,0,28,2,0,0,206,1,0,0,252,0,0,0,32,2,0,0,194,0,0,0,32,1,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,121,0,0,174,0,0,0,22,1,0,0,198,1,0,0,138,1,0,0,214,2,0,0,154,2,0,0,152,2,0,0,56,1,0,0,110,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,121,0,0,8,2,0,0,152,1,0,0,52,2,0,0,40,3,0,0,188,1,0,0,72,2,0,0,204,2,0,0,112,1,0,0,6,0,0,0,34,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,121,0,0,232,1,0,0,46,0,0,0,222,1,0,0,0,3,0,0,56,0,0,0,108,2,0,0,108,0,0,0,36,0,0,0,28,0,0,0,184,0,0,0,30,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,121,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0])
.concat([10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,121,0,0,134,0,0,0,70,2,0,0,208,1,0,0,90,2,0,0,94,1,0,0,254,0,0,0,232,0,0,0,232,1,0,0,200,1,0,0,96,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,121,0,0,110,0,0,0,166,0,0,0,58,0,0,0,202,2,0,0,70,2,0,0,164,1,0,0,114,1,0,0,88,1,0,0,140,1,0,0,96,0,0,0,32,1,0,0,66,0,0,0,40,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,122,0,0,98,1,0,0,210,1,0,0,194,0,0,0,6,2,0,0,152,0,0,0,92,1,0,0,18,0,0,0,234,1,0,0,70,1,0,0,96,0,0,0,26,0,0,0,38,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,122,0,0,38,2,0,0,124,0,0,0,218,0,0,0,216,1,0,0,124,0,0,0,24,3,0,0,130,1,0,0,120,0,0,0,10,1,0,0,184,0,0,0,48,2,0,0,94,0,0,0,114,0,0,0,216,255,255,255,96,122,0,0,0,1,0,0,10,2,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,122,0,0,48,2,0,0,78,1,0,0,30,0,0,0,228,0,0,0,182,2,0,0,38,1,0,0,30,1,0,0,164,1,0,0,60,1,0,0,56,0,0,0,160,0,0,0,8,2,0,0,224,255,255,255,128,122,0,0,64,0,0,0,178,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,122,0,0,66,0,0,0,182,1,0,0,164,1,0,0,2,0,0,0,232,1,0,0,24,0,0,0,58,1,0,0,76,1,0,0,152,1,0,0,82,0,0,0,102,0,0,0,152,0,0,0,18,0,0,0,160,2,0,0,116,0,0,0,204,2,0,0,70,1,0,0,200,0,0,0,160,1,0,0,196,1,0,0,44,1,0,0,164,1,0,0,22,2,0,0,252,1,0,0,74,2,0,0,30,1,0,0,132,2,0,0,44,2,0,0,56,0,0,0,198,2,0,0,150,0,0,0,244,2,0,0,60,0,0,0,50,2,0,0,186,1,0,0,218,1,0,0,250,1,0,0,146,2,0,0,18,2,0,0,216,2,0,0,192,0,0,0,144,1,0,0,88,1,0,0,188,2,0,0,120,0,0,0,210,2,0,0,206,2,0,0,92,1,0,0,200,1,0,0,186,0,0,0,90,0,0,0,46,1,0,0,144,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,122,0,0,164,0,0,0,8,1,0,0,90,2,0,0,190,0,0,0,46,0,0,0,4,2,0,0,34,0,0,0,186,0,0,0,62,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,122,0,0,160,0,0,0,24,0,0,0,122,0,0,0,36,1,0,0,238,2,0,0,80,1,0,0,54,0,0,0,252,1,0,0,92,2,0,0,184,1,0,0,210,2,0,0,180,0,0,0,150,0,0,0,246,2,0,0,100,2,0,0,56,2,0,0,208,1,0,0,16,2,0,0,24,1,0,0,28,0,0,0,18,1,0,0,142,2,0,0,172,1,0,0,112,0,0,0,110,0,0,0,182,0,0,0,82,0,0,0,212,1,0,0,232,2,0,0,76,1,0,0,234,1,0,0,214,0,0,0,194,1,0,0,42,3,0,0,146,1,0,0,226,1,0,0,72,0,0,0,60,1,0,0,8,1,0,0,212,2,0,0,140,0,0,0,128,1,0,0,190,2,0,0,30,0,0,0,254,2,0,0,28,1,0,0,104,0,0,0,170,1,0,0,78,0,0,0,202,0,0,0,128,2,0,0,108,1,0,0,206,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,122,0,0,212,1,0,0,32,0,0,0,38,0,0,0,144,2,0,0,150,2,0,0,96,2,0,0,248,1,0,0,254,0,0,0,40,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,220,255,255,255,208,122,0,0,168,1,0,0,26,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,122,0,0,128,0,0,0,242,1,0,0,108,2,0,0,78,1,0,0,24,2,0,0,66,1,0,0,208,0,0,0,14,1,0,0,114,0,0,0,60,1,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,0,0,124,1,0,0,246,1,0,0,76,0,0,0,170,2,0,0,64,0,0,0,200,2,0,0,238,1,0,0,54,1,0,0,118,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,123,0,0,92,0,0,0,18,2,0,0,210,0,0,0,20,2,0,0,48,2,0,0,180,1,0,0,36,0,0,0,236,1,0,0,16,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,123,0,0,128,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,123,0,0,224,2,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,123,0,0,92,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,123,0,0,168,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,123,0,0,116,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,123,0,0,168,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,123,0,0,0,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,123,0,0,134,1,0,0,30,0,0,0,180,2,0,0,140,2,0,0,46,2,0,0,2,2,0,0,16,1,0,0,228,1,0,0,50,0,0,0,94,1,0,0,228,255,255,255,88,123,0,0,48,1,0,0,60,2,0,0,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,123,0,0,102,0,0,0,74,2,0,0,178,1,0,0,140,1,0,0,216,2,0,0,178,1,0,0,30,2,0,0,90,1,0,0,6,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,123,0,0,8,0,0,0,8,0,0,0,182,1,0,0,14,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,142,1,0,0,86,0,0,0,184,0,0,0,0,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,123,0,0,4,2,0,0,182,0,0,0,8,0,0,0,174,2,0,0,136,0,0,0,58,0,0,0,228,1,0,0,160,1,0,0,18,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,123,0,0,28,1,0,0,194,1,0,0,162,2,0,0,162,0,0,0,136,2,0,0,142,1,0,0,2,0,0,0,34,1,0,0,122,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,123,0,0,40,1,0,0,86,1,0,0,48,0,0,0,128,1,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,123,0,0,40,1,0,0,160,1,0,0,48,0,0,0,128,1,0,0,6,0,0,0,30,0,0,0,30,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,111,117,116,95,111,102,95,114,97,110,103,101,0,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,80,75,99,0,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,56,98,97,115,105,99,95,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,52,83,97,115,115,57,84,111,95,83,116,114,105,110,103,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,83,116,97,116,101,109,101,110,116,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,80,97,114,97,109,101,116,101,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,118,69,69,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,56,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,49,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,49,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,69,69,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,49,48,83,97,115,115,95,86,97,108,117,101,69,69,0,78,52,83,97,115,115,57,72,97,115,95,66,108,111,99,107,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,69,120,116,101,110,115,105,111,110,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,65,114,103,117,109,101,110,116,115,69,0,0,0,0,0,0,0,78,52,83,97,115,115,56,86,97,114,105,97,98,108,101,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,65,114,103,117,109,101,110,116,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,65,83,84,95,78,111,100,101,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,55,87,97,114,110,105,110,103,69,0,78,52,83,97,115,115,55,84,101,120,116,117,97,108,69,0,78,52,83,97,115,115,55,82,117,108,101,115,101,116,69,0,78,52,83,97,115,115,55,80,114,111,112,115,101,116,69,0,78,52,83,97,115,115,55,73,110,115,112,101,99,116,69,0,78,52,83,97,115,115,55,67,111,110,116,101,110,116,69,0,78,52,83,97,115,115,55,67,111,109,109,101,110,116,69,0,78,52,83,97,115,115,55,66,111,111,108,101,97,110,69,0,78,52,83,97,115,115,55,65,116,95,82,117,108,101,69,0,78,52,83,97,115,115,54,83,116,114,105,110,103,69,0,0,78,52,83,97,115,115,54,82,101,116,117,114,110,69,0,0,78,52,83,97,115,115,54,78,117,109,98,101,114,69,0,0,78,52,83,97,115,115,54,73,109,112,111,114,116,69,0,0,78,52,83,97,115,115,54,69,120,116,101,110,100,69,0,0,78,52,83,97,115,115,54,69,120,112,97,110,100,69,0,0,78,52,83,97,115,115,53,87,104,105,108,101,69,0,0,0,78,52,83,97,115,115,53,69,114,114,111,114,69,0,0,0,78,52,83,97,115,115,53,67,111,108,111,114,69,0,0,0,78,52,83,97,115,115,53,66,108,111,99,107,69,0,0,0,78,52,83,97,115,115,52,84,111,95,67,69,0,0,0,0,78,52,83,97,115,115,52,78,117,108,108,69,0,0,0,0,78,52,83,97,115,115,52,76,105,115,116,69,0,0,0,0,78,52,83,97,115,115,52,69,118,97,108,69,0,0,0,0,78,52,83,97,115,115,52,69,97,99,104,69,0,0,0,0,78,52,83,97,115,115,51,70,111,114,69,0,0,0,0,0,78,52,83,97,115,115,50,73,102,69,0,0,0,0,0,0,78,52,83,97,115,115,50,50,77,101,100,105,97,95,81,117,101,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,78,52,83,97,115,115,50,48,83,101,108,101,99,116,111,114,95,80,108,97,99,101,104,111,108,100,101,114,69,0,0,0,78,52,83,97,115,115,50,48,70,117,110,99,116,105,111,110,95,67,97,108,108,95,83,99,104,101,109,97,69,0,0,0,78,52,83,97,115,115,49,56,83,101,108,101,99,116,111,114,95,82,101,102,101,114,101,110,99,101,69,0,0,0,0,0,78,52,83,97,115,115,49,56,83,101,108,101,99,116,111,114,95,81,117,97,108,105,102,105,101,114,69,0,0,0,0,0,78,52,83,97,115,115,49,56,65,116,116,114,105,98,117,116,101,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,78,52,83,97,115,115,49,55,79,117,116,112,117,116,95,67,111,109,112,114,101,115,115,101,100,69,0,0,0,0,0,0,78,52,83,97,115,115,49,55,67,111,109,112,111,117,110,100,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,78,52,83,97,115,115,49,55,66,105,110,97,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,0,78,52,83,97,115,115,49,54,85,110,97,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,54,78,101,103,97,116,101,100,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,54,67,111,109,112,108,101,120,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,116,114,105,110,103,95,67,111,110,115,116,97,110,116,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,105,109,112,108,101,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,101,108,101,99,116,111,114,95,83,99,104,101,109,97,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,80,115,101,117,100,111,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,55,73,110,115,112,101,99,116,69,69,69,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,54,69,120,116,101,110,100,69,69,69,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,49,55,79,117,116,112,117,116,95,67,111,109,112,114,101,115,115,101,100,69,69,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,49,51,79,117,116,112,117,116,95,78,101,115,116,101,100,69,69,69,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,78,83,95,54,69,120,112,97,110,100,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,56,83,101,108,101,99,116,111,114,69,78,83,95,49,51,67,111,110,116,101,120,116,117,97,108,105,122,101,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,78,83,95,52,69,118,97,108,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,49,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,49,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,78,83,95,57,84,111,95,83,116,114,105,110,103,69,69,69,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,49,48,83,97,115,115,95,86,97,108,117,101,78,83,95,52,84,111,95,67,69,69,69,0,0,78,52,83,97,115,115,49,51,84,121,112,101,95,83,101,108,101,99,116,111,114,69,0,0,78,52,83,97,115,115,49,51,83,116,114,105,110,103,95,83,99,104,101,109,97,69,0,0,78,52,83,97,115,115,49,51,83,101,108,101,99,116,111,114,95,76,105,115,116,69,0,0,78,52,83,97,115,115,49,51,79,117,116,112,117,116,95,78,101,115,116,101,100,69,0,0,78,52,83,97,115,115,49,51,70,117,110,99,116,105,111,110,95,67,97,108,108,69,0,0,78,52,83,97,115,115,49,51,67,111,110,116,101,120,116,117,97,108,105,122,101,69,0,0,78,52,83,97,115,115,49,49,77,101,100,105,97,95,81,117,101,114,121,69,0,0,0,0,78,52,83,97,115,115,49,49,77,101,100,105,97,95,66,108,111,99,107,69,0,0,0,0,78,52,83,97,115,115,49,49,73,109,112,111,114,116,95,83,116,117,98,69,0,0,0,0,78,52,83,97,115,115,49,49,68,101,99,108,97,114,97,116,105,111,110,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,57,80,97,114,97,109,101,116,101,114,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,56,65,114,103,117,109,101,110,116,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,50,50,77,101,100,105,97,95,81,117,101,114,121,95,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,54,67,111,109,112,108,101,120,95,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,53,83,105,109,112,108,101,95,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,78,52,83,97,115,115,49,48,80,97,114,97,109,101,116,101,114,115,69,0,0,0,0,0,78,52,83,97,115,115,49,48,77,105,120,105,110,95,67,97,108,108,69,0,0,0,0,0,78,52,83,97,115,115,49,48,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,78,52,83,97,115,115,49,48,68,101,102,105,110,105,116,105,111,110,69,0,0,0,0,0,78,52,83,97,115,115,49,48,65,115,115,105,103,110,109,101,110,116,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,68,110,0,0,0,0,0,0,40,87,0,0,120,87,0,0,0,0,0,0,136,87,0,0,0,0,0,0,152,87,0,0,0,0,0,0,168,87,0,0,160,111,0,0,0,0,0,0,0,0,0,0,184,87,0,0,160,111,0,0,0,0,0,0,0,0,0,0,200,87,0,0,160,111,0,0,0,0,0,0,0,0,0,0,224,87,0,0,248,111,0,0,0,0,0,0,0,0,0,0,248,87,0,0,248,111,0,0,0,0,0,0,0,0,0,0,16,88,0,0,160,111,0,0,0,0,0,0,0,0,0,0,32,88,0,0,1,0,0,0,0,0,0,0,0,0,0,0,40,88,0,0,80,87,0,0,64,88,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,72,117,0,0,0,0,0,0,80,87,0,0,136,88,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,80,117,0,0,0,0,0,0,80,87,0,0,208,88,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,88,117,0,0,0,0,0,0,80,87,0,0,24,89,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,96,117,0,0,0,0,0,0,0,0,0,0,96,89,0,0,16,114,0,0,0,0,0,0,0,0,0,0,144,89,0,0,16,114,0,0,0,0,0,0,80,87,0,0,192,89,0,0,0,0,0,0,1,0,0,0,96,116,0,0,0,0,0,0,80,87,0,0,216,89,0,0,0,0,0,0,1,0,0,0,96,116,0,0,0,0,0,0,80,87,0,0,240,89,0,0,0,0,0,0,1,0,0,0,104,116,0,0,0,0,0,0,80,87,0,0,8,90,0,0,0,0,0,0,1,0,0,0,104,116,0,0,0,0,0,0,80,87,0,0,32,90,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,117,0,0,0,8,0,0,80,87,0,0,104,90,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,117,0,0,0,8,0,0,80,87,0,0,176,90,0,0,0,0,0,0,3,0,0,0,72,115,0,0,2,0,0,0,24,112,0,0,2,0,0,0,176,115,0,0,0,8,0,0,80,87,0,0,248,90,0,0,0,0,0,0,3,0,0,0,72,115,0,0,2,0,0,0,24,112,0,0,2,0,0,0,184,115,0,0,0,8,0,0,0,0,0,0,64,91,0,0,72,115,0,0,0,0,0,0,0,0,0,0,88,91,0,0,72,115,0,0,0,0,0,0,80,87,0,0,112,91,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,112,116,0,0,2,0,0,0,80,87,0,0,136,91,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,112,116,0,0,2,0,0,0,0,0,0,0,160,91,0,0,0,0,0,0,184,91,0,0,232,116,0,0,0,0,0,0,80,87,0,0,216,91,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,192,112,0,0,0,0,0,0,80,87,0,0,32,92,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,216,112,0,0,0,0,0,0,80,87,0,0,104,92,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,240,112,0,0,0,0,0,0,80,87,0,0,176,92,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,8,113,0,0,0,0,0,0,0,0,0,0,248,92,0,0,72,115,0,0,0,0,0,0,0,0,0,0,16,93,0,0,72,115,0,0,0,0,0,0,80,87,0,0,40,93,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,116,0,0,2,0,0,0,80,87,0,0,80,93,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,116,0,0,2,0,0,0,80,87,0,0,120,93,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,116,0,0,2,0,0,0,80,87,0,0,160,93,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,248,116,0,0,2,0,0,0,0,0,0,0,200,93,0,0,88,116,0,0,0,0,0,0,0,0,0,0,224,93,0,0,72,115,0,0,0,0,0,0,80,87,0,0,248,93,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,240,117,0,0,2,0,0,0,80,87,0,0,16,94,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,240,117,0,0,2,0,0,0,0,0,0,0,40,94,0,0,0,0,0,0,80,94,0,0,0,0,0,0,120,94,0,0,0,0,0,0,160,94,0,0,24,117,0,0,0,0,0,0,0,0,0,0,192,94,0,0,40,116,0,0,0,0,0,0,0,0,0,0,8,95,0,0,40,115,0,0,0,0,0,0,0,0,0,0,48,95,0,0,40,115,0,0,0,0,0,0,0,0,0,0,88,95,0,0,24,116,0,0,0,0,0,0,0,0,0,0,160,95,0,0,0,0,0,0,216,95,0,0,0,0,0,0,16,96,0,0,80,87,0,0,48,96,0,0,3,0,0,0,2,0,0,0,192,116,0,0,2,0,0,0,144,116,0,0,2,8,0,0,0,0,0,0,96,96,0,0,192,116,0,0,0,0,0,0,0,0,0,0,144,96,0,0,0,0,0,0,176,96,0,0,0,0,0,0,208,96,0,0,0,0,0,0,240,96,0,0,80,87,0,0,8,97,0,0,0,0,0,0,1,0,0,0,160,112,0,0,3,244,255,255,80,87,0,0,56,97,0,0,0,0,0,0,1,0,0,0,176,112,0,0,3,244,255,255,80,87,0,0,104,97,0,0,0,0,0,0,1,0,0,0,160,112,0,0,3,244,255,255,80,87,0,0,152,97,0,0,0,0,0,0,1,0,0,0,176,112,0,0,3,244,255,255,0,0,0,0,200,97,0,0,24,116,0,0,0,0,0,0,0,0,0,0,248,97,0,0,200,111,0,0,0,0,0,0,0,0,0,0,16,98,0,0,80,87,0,0,40,98,0,0,0,0,0,0,1,0,0,0,168,115,0,0,0,0,0,0,0,0,0,0,104,98,0,0,32,116,0,0,0,0,0,0,0,0,0,0,128,98,0,0,16,116,0,0,0,0,0,0,0,0,0,0,160,98,0,0,24,116,0,0,0,0,0,0,0,0,0,0,192,98,0,0,0,0,0,0,224,98,0,0,0,0,0,0,0,99,0,0,0,0,0,0,32,99,0,0,80,87,0,0,64,99,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,232,117,0,0,2,0,0,0,80,87,0,0,96,99,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,232,117,0,0,2,0,0,0,80,87,0,0,128,99,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,232,117,0,0,2,0,0,0,80,87,0,0,160,99,0,0,0,0,0,0,2,0,0,0,72,115,0,0,2,0,0,0,232,117,0,0,2,0,0,0,0,0,0,0,192,99,0,0,0,0,0,0,216,99,0,0,0,0,0,0,240,99,0,0,0,0,0,0,8,100,0,0,16,116,0,0,0,0,0,0,0,0,0,0,32,100,0,0,24,116,0,0,0,0,0,0,0,0,0,0,56,100,0,0,48,122,0,0,0,0,0,0,0,0,0,0,80,100,0,0,240,118,0,0,0,0,0,0,0,0,0,0,104,100,0,0,240,118,0,0,0,0,0,0,0,0,0,0,128,100,0,0,0,0,0,0,152,100,0,0,0,0,0,0,192,100,0,0,0,0,0,0,232,100,0,0,0,0,0,0,16,101,0,0,0,0,0,0,104,101,0,0,0,0,0,0,136,101,0,0,48,118,0,0,0,0,0,0,0,0,0,0,160,101,0,0,48,118,0,0,0,0,0,0,80,87,0,0,184,101,0,0,0,0,0,0,2,0,0,0,136,123,0,0,2,0,0,0,48,123,0,0,2,36,0,0,0,0,0,0,208,101,0,0,136,123,0,0,0,0,0,0,0,0,0,0,232,101,0,0,240,118,0,0,0,0,0,0,0,0,0,0,0,102,0,0,136,123,0,0,0,0,0,0,0,0,0,0,24,102,0,0,0,0,0,0,48,102,0,0,48,118,0,0,0,0,0,0,0,0,0,0,64,102,0,0,136,123,0,0,0,0,0,0,0,0,0,0,80,102,0,0,128,118,0,0,0,0,0,0,0,0,0,0,96,102,0,0,128,118,0,0,0,0,0,0,0,0,0,0,112,102,0,0,192,121,0,0,0,0,0,0,0,0,0,0,128,102,0,0,48,118,0,0,0,0,0,0,0,0,0,0,144,102,0,0,48,118,0,0,0,0,0,0,0,0,0,0,160,102,0,0,136,123,0,0,0,0,0,0,0,0,0,0,176,102,0,0,128,118,0,0,0,0,0,0,0,0,0,0,192,102,0,0,136,123,0,0,0,0,0,0,0,0,0,0,208,102,0,0,48,118,0,0,0,0,0,0,0,0,0,0,224,102,0,0,136,123,0,0,0,0,0,0,0,0,0,0,240,102,0,0,48,118,0,0,0,0,0,0,0,0,0,0,0,103,0,0,208,121,0,0,0,0,0,0,0,0,0,0,16,103,0,0,0,122,0,0,0,0,0,0,0,0,0,0,32,103,0,0,128,118,0,0,0,0,0,0,0,0,0,0,48,103,0,0,0,0,0,0,64,103,0,0])
.concat([136,123,0,0,0,0,0,0,80,87,0,0,80,103,0,0,0,0,0,0,2,0,0,0,48,118,0,0,2,0,0,0,32,123,0,0,2,28,0,0,0,0,0,0,96,103,0,0,64,122,0,0,0,0,0,0,0,0,0,0,112,103,0,0,136,123,0,0,0,0,0,0,80,87,0,0,128,103,0,0,0,0,0,0,2,0,0,0,136,123,0,0,2,0,0,0,80,123,0,0,2,36,0,0,0,0,0,0,144,103,0,0,32,122,0,0,0,0,0,0,0,0,0,0,160,103,0,0,128,118,0,0,0,0,0,0,0,0,0,0,176,103,0,0,128,118,0,0,0,0,0,0,0,0,0,0,192,103,0,0,48,118,0,0,0,0,0,0,0,0,0,0,208,103,0,0,136,123,0,0,0,0,0,0,0,0,0,0,240,103,0,0,144,121,0,0,0,0,0,0,0,0,0,0,16,104,0,0,136,123,0,0,0,0,0,0,0,0,0,0,48,104,0,0,144,121,0,0,0,0,0,0,0,0,0,0,80,104,0,0,144,121,0,0,0,0,0,0,0,0,0,0,112,104,0,0,144,121,0,0,0,0,0,0,0,0,0,0,144,104,0,0,224,121,0,0,0,0,0,0,80,87,0,0,176,104,0,0,0,0,0,0,2,0,0,0,208,118,0,0,2,0,0,0,72,123,0,0,2,32,0,0,0,0,0,0,208,104,0,0,136,123,0,0,0,0,0,0,0,0,0,0,240,104,0,0,136,123,0,0,0,0,0,0,0,0,0,0,16,105,0,0,144,121,0,0,0,0,0,0,0,0,0,0,48,105,0,0,208,118,0,0,0,0,0,0,0,0,0,0,80,105,0,0,136,119,0,0,0,0,0,0,0,0,0,0,112,105,0,0,208,118,0,0,0,0,0,0,0,0,0,0,144,105,0,0,208,118,0,0,0,0,0,0,0,0,0,0,176,105,0,0,144,121,0,0,0,0,0,0,0,0,0,0,208,105,0,0,80,118,0,0,0,0,0,0,0,0,0,0,248,105,0,0,80,118,0,0,0,0,0,0,0,0,0,0,32,106,0,0,80,118,0,0,0,0,0,0,0,0,0,0,88,106,0,0,80,118,0,0,0,0,0,0,0,0,0,0,136,106,0,0,88,118,0,0,0,0,0,0,0,0,0,0,192,106,0,0,96,118,0,0,0,0,0,0,0,0,0,0,0,107,0,0,104,118,0,0,0,0,0,0,0,0,0,0,56,107,0,0,112,118,0,0,0,0,0,0,0,0,0,0,160,107,0,0,120,118,0,0,0,0,0,0,0,0,0,0,208,107,0,0,144,121,0,0,0,0,0,0,80,87,0,0,232,107,0,0,0,0,0,0,2,0,0,0,136,119,0,0,2,0,0,0,80,123,0,0,2,40,0,0,80,87,0,0,0,108,0,0,0,0,0,0,2,0,0,0,208,118,0,0,2,0,0,0,64,123,0,0,2,32,0,0,0,0,0,0,24,108,0,0,240,121,0,0,0,0,0,0,0,0,0,0,48,108,0,0,136,123,0,0,0,0,0,0,0,0,0,0,72,108,0,0,16,122,0,0,0,0,0,0,80,87,0,0,96,108,0,0,0,0,0,0,2,0,0,0,136,123,0,0,2,0,0,0,56,123,0,0,2,36,0,0,0,0,0,0,120,108,0,0,128,118,0,0,0,0,0,0,0,0,0,0,144,108,0,0,48,118,0,0,0,0,0,0,0,0,0,0,168,108,0,0,48,118,0,0,0,0,0,0,0,0,0,0,192,108,0,0,0,0,0,0,232,108,0,0,0,0,0,0,16,109,0,0,0,0,0,0,56,109,0,0,0,0,0,0,112,109,0,0,0,0,0,0,160,109,0,0,0,0,0,0,208,109,0,0,80,87,0,0,248,109,0,0,0,0,0,0,2,0,0,0,240,118,0,0,2,0,0,0,40,123,0,0,2,28,0,0,0,0,0,0,16,110,0,0,128,118,0,0,0,0,0,0,0,0,0,0,40,110,0,0,240,118,0,0,0,0,0,0,0,0,0,0,64,110,0,0,128,118,0,0,0,0,0,0,0,0,0,0,88,110,0,0,48,118,0,0,0,0,0,0,0,0,0,0,112,110,0,0,24,124,0,0,0,0,0,0,0,0,0,0,152,110,0,0,8,124,0,0,0,0,0,0,0,0,0,0,192,110,0,0,8,124,0,0,0,0,0,0,0,0,0,0,232,110,0,0,248,123,0,0,0,0,0,0,0,0,0,0,16,111,0,0,24,124,0,0,0,0,0,0,0,0,0,0,56,111,0,0,24,124,0,0,0,0,0,0,0,0,0,0,96,111,0,0,152,111,0,0,0,0,0,0,40,87,0,0,136,111,0,0,64,0,0,0,0,0,0,0,192,116,0,0,14,2,0,0,6,1,0,0,192,255,255,255,192,255,255,255,192,116,0,0,28,2,0,0,170,0,0,0,108,0,0,0,0,0,0,0,192,116,0,0,14,2,0,0,6,1,0,0,148,255,255,255,148,255,255,255,192,116,0,0,28,2,0,0,170,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,64,0,0,0,0,0,0,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,96,109,64,0,0,0,0,0,224,106,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,106,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,128,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,128,104,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,96,109,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,97,64,0,0,0,0,0,128,69,64,0,0,0,0,0,64,108,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,69,64,0,0,0,0,0,0,69,64,0,0,0,0,0,192,107,64,0,0,0,0,0,0,103,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,87,64,0,0,0,0,0,192,99,64,0,0,0,0,0,0,100,64,0,0,0,0,0,192,95,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,106,64,0,0,0,0,0,64,90,64,0,0,0,0,0,0,62,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,0,84,64,0,0,0,0,0,0,89,64,0,0,0,0,0,160,98,64,0,0,0,0,0,160,109,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,111,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,78,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,103,64,0,0,0,0,0,192,96,64,0,0,0,0,0,0,38,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,64,0,0,0,0,0,0,0,0,0,0,0,0,0,160,103,64,0,0,0,0,0,224,102,64,0,0,0,0,0,192,90,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,64,85,64,0,0,0,0,0,192,90,64,0,0,0,0,0,128,71,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,32,99,64,0,0,0,0,0,0,73,64,0,0,0,0,0,128,105,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,109,64,0,0,0,0,0,192,98,64,0,0,0,0,0,128,94,64,0,0,0,0,0,224,97,64,0,0,0,0,0,128,103,64,0,0,0,0,0,224,97,64,0,0,0,0,0,0,82,64,0,0,0,0,0,128,78,64,0,0,0,0,0,96,97,64,0,0,0,0,0,128,71,64,0,0,0,0,0,192,83,64,0,0,0,0,0,192,83,64,0,0,0,0,0,128,71,64,0,0,0,0,0,192,83,64,0,0,0,0,0,192,83,64,0,0,0,0,0,0,0,0,0,0,0,0,0,192,105,64,0,0,0,0,0,32,106,64,0,0,0,0,0,128,98,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,106,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,52,64,0,0,0,0,0,96,98,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,103,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,102,64,0,0,0,0,0,0,65,64,0,0,0,0,0,0,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,65,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,0,111,64,0,0,0,0,0,0,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,106,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,107,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,64,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,160,101,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,71,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,90,64,0,0,0,0,0,128,102,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,87,64,0,0,0,0,0,192,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,96,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,128,97,64,0,0,0,0,0,192,108,64,0,0,0,0,0,192,108,64,0,0,0,0,0,64,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,0,95,64,0,0,0,0,0,128,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,160,105,64,0,0,0,0,0,160,101,64,0,0,0,0,0,0,107,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,0,98,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,102,64,0,0,0,0,0,32,104,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,100,64,0,0,0,0,0,128,94,64,0,0,0,0,0,0,64,64,0,0,0,0,0,64,102,64,0,0,0,0,0,64,101,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,105,64,0,0,0,0,0,64,111,64,0,0,0,0,0,192,93,64,0,0,0,0,0,0,97,64,0,0,0,0,0,32,99,64,0,0,0,0,0,192,93,64,0,0,0,0,0,0,97,64,0,0,0,0,0,32,99,64,0,0,0,0,0,0,102,64,0,0,0,0,0,128,104,64,0,0,0,0,0,192,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,108,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,73,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,89,64,0,0,0,0,0,160,105,64,0,0,0,0,0,64,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,105,64,0,0,0,0,0,64,103,64,0,0,0,0,0,64,85,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,98,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,107,64,0,0,0,0,0,0,78,64,0,0,0,0,0,96,102,64,0,0,0,0,0,64,92,64,0,0,0,0,0,192,94,64,0,0,0,0,0,0,90,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,111,64,0,0,0,0,0,64,99,64,0,0,0,0,0,0,82,64,0,0,0,0,0,32,106,64,0,0,0,0,0,128,105,64,0,0,0,0,0,224,104,64,0,0,0,0,0,0,53,64,0,0,0,0,0,160,96,64,0,0,0,0,0,0,57,64,0,0,0,0,0,0,57,64,0,0,0,0,0,0,92,64,0,0,0,0,0,160,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,32,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,160,102,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,107,64,0,0,0,0,0,160,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,160,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,192,90,64,0,0,0,0,0,192,97,64,0,0,0,0,0,128,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,81,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,107,64,0,0,0,0,0,0,92,64,0,0,0,0,0,192,106,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,109,64,0,0,0,0,0,64,101,64,0,0,0,0,0,0,99,64,0,0,0,0,0,96,111,64,0,0,0,0,0,0,99,64,0,0,0,0,0,224,101,64,0,0,0,0,0,192,109,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,107,64,0,0,0,0,0,0,92,64,0,0,0,0,0,96,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,109,64,0,0,0,0,0,160,106,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,107,64,0,0,0,0,0,32,103,64,0,0,0,0,0,160,105,64,0,0,0,0,0,160,96,64,0,0,0,0,0,128,79,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,104,64,0,0,0,0,0,96,105,64,0,0,0,0,0,160,107,64,0,0,0,0,0,0,100,64,0,0,0,0,0,160,107,64,0,0,0,0,0,0,102,64,0,0,0,0,0,0,108,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,103,64,0,0,0,0,0,224,97,64,0,0,0,0,0,224,97,64,0,0,0,0,0,64,80,64,0,0,0,0,0,64,90,64,0,0,0,0,0,32,108,64,0,0,0,0,0,96,97,64,0,0,0,0,0,64,81,64,0,0,0,0,0,0,51,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,96,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,110,64,0,0,0,0,0,128,100,64,0,0,0,0,0,0,88,64,0,0,0,0,0,0,71,64,0,0,0,0,0,96,97,64,0,0,0,0,0,192,85,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,100,64,0,0,0,0,0,128,84,64,0,0,0,0,0,128,70,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,104,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,105,64,0,0,0,0,0,96,109,64,0,0,0,0,0,128,90,64,0,0,0,0,0,128,86,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,128,81,64,0,0,0,0,0,64,96,64,0,0,0,0,0,128,102,64,0,0,0,0,0,64,106,64,0,0,0,0,0,128,102,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,107,64,0,0,0,0,0,224,103,64,0,0,0,0,0,0,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,88,64,0,0,0,0,0,192,81,64,0,0,0,0,0,0,80,64,0,0,0,0,0,0,108,64,0,0,0,0,0,0,106,64,0,0,0,0,0,192,109,64,0,0,0,0,0,64,96,64,0,0,0,0,0,192,109,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,107,64,0,0,0,0,0,96,102,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,99,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,73,64,0,0,0,0,0,254,175,64,80,9,0,0,0,0,0,0,16,12,0,0,0,0,0,0,8,4,0,0,0,0,0,0,16,39,0,0,0,0,0,0,160,8,0,0,0,0,0,0,240,21,0,0,0,0,0,0,128,48,0,0,0,0,0,0,208,3,0,0,0,0,0,0,200,32,0,0,0,0,0,0,216,8,0,0,0,0,0,0,232,37,0,0,0,0,0,0,24,1,0,0,0,0,0,0,192,11,0,0,0,0,0,0,168,39,0,0,0,0,0,0,160,5,0,0,0,0,0,0,16,47,0,0,0,0,0,0,32,37,0,0,0,0,0,0,240,7,0,0,0,0,0,0,80,6,0,0,0,0,0,0,0,32,0,0,0,0,0,0,240,34,0,0,0,0,0,0,64,8,0,0,0,0,0,0,176,46,0,0,0,0,0,0,40,20,0,0,0,0,0,0,80,15,0,0,0,0,0,0,24,19,0,0,0,0,0,0,16,17,0,0,0,0,0,0,160,30,0,0,0,0,0,0,120,11,0,0,0,0,0,0,152,13,0,0,0,0,0,0,144,23,0,0,0,0,0,0,200,22,0,0,0,0,0,0,248,47,0,0,0,0,0,0,48,28,0,0,0,0,0,0,64,29,0,0,0,0,0,0,0,45,0,0,0,0,0,0,24,23,0,0,0,0,0,0,40,48,0,0,0,0,0,0,232,23,0,0,0,0,0,0,232,19,0,0,0,0,0,0,24,13,0,0,0,0,0,0,0,49,0,0,0,0,0,0,176,21,0,0,0,0,0,0,240,20,0,0,0,0,0,0,120,26,0,0,0,0,0,0,104,20,0,0,0,0,0,0,152,0,0,0,0,0,0,0,152,45,0,0,0,0,0,0,136,41,0,0,0,0,0,0,16,6,0,0,0,0,0,0,128,22,0,0,0,0,0,0,192,24,0,0,0,0,0,0,112,1,0,0,0,0,0,0,64,119,104,105,108,101,0,0,239,187,191,0,0,0,0,0,247,100,76,0,0,0,0,0,64,109,105,120,105,110,0,0,64,109,101,100,105,97,0,0,102,97,108,115,101,0,0,0,64,119,97,114,110,0,0,0,116,114,117,101,0,0,0,0,14,254,255,0,0,0,0,0,111,110,108,121,0,0,0,0,110,117,108,108,0,0,0,0,102,114,111,109,0,0,0,0,101,118,101,110,0,0,0,0,64,101,108,115,101,0,0,0,46,46,46,0,0,0,0,0,64,101,97,99,104,0,0,0,117,114,108,40,0,0,0,0,111,100,100,0,0,0,0,0,110,111,116,0,0,0,0,0,64,102,111,114,0,0,0,0,97,110,100,0,0,0,0,0,116,111,0,0,0,0,0,0,125,0,0,0,0,0,0,0,111,114,0,0,0,0,0,0,105,110,0,0,0,0,0,0,64,105,102,0,0,0,0,0,33,61,0,0,0,0,0,0,60,61,0,0,0,0,0,0,62,61,0,0,0,0,0,0,60,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,61,61,0,0,0,0,0,0,105,102,0,0,0,0,0,0,232,3,0,0,0,0,0,0,221,115,102,115,0,0,0,0,58,110,111,116,40,0,0,0,255,254,0,0,0,0,0,0,0,0,254,255,0,0,0,0,255,254,0,0,0,0,0,0,254,255,0,0,0,0,0,0,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,0,132,49,149,51,0,0,0,0,64,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,36,61,0,0,0,0,0,0,43,47,118,56,45,0,0,0,43,47,118,47,0,0,0,0,43,47,118,43,0,0,0,0,43,47,118,57,0,0,0,0,43,47,118,56,0,0,0,0,126,61,0,0,0,0,0,0,116,104,114,111,117,103,104,0,47,47,0,0,0,0,0,0,64,105,110,99,108,117,100,101,0,0,0,0,0,0,0,0,35,123,0,0,0,0,0,0,100,101,102,97,117,108,116,0,64,99,111,110,116,101,110,116,0,0,0,0,0,0,0,0,64,99,104,97,114,115,101,116,0,0,0,0,0,0,0,0,94,61,0,0,0,0,0,0,42,47,0,0,0,0,0,0,42,61,0,0,0,0,0,0,47,42,0,0,0,0,0,0,45,43,0,0,0,0,0,0,64,114,101,116,117,114,110,0,112,114,111,103,105,100,0,0,124,61,0,0,0,0,0,0,64,105,109,112,111,114,116,0,64,101,120,116,101,110,100,0,251,238,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,6,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,82,184,30,133,235,81,4,64,0,0,0,0,0,0,24,64,102,102,102,102,102,102,57,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,88,64,76,38,147,201,100,50,217,63,0,0,0,0,0,0,240,63,185,92,46,151,203,229,2,64,0,0,0,0,0,0,36,64,22,139,197,98,177,88,60,64,185,92,46,151,203,229,66,64,85,85,85,85,85,85,197,63,24,75,126,177,228,23,219,63,0,0,0,0,0,0,240,63,239,238,238,238,238,238,16,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,48,64,10,133,66,161,80,40,164,63,154,153,153,153,153,153,185,63,144,199,227,241,120,60,206,63,0,0,0,0,0,0,240,63,172,213,106,181,90,173,6,64,144,199,227,241,120,60,14,64,28,199,113,28,199,113,140,63,101,135,169,203,237,15,162,63,85,85,85,85,85,85,181,63,62,233,147,62,233,147,214,63,0,0,0,0,0,0,240,63,85,85,85,85,85,85,245,63,85,85,85,85,85,85,133,63,24,75,126,177,228,23,155,63,0,0,0,0,0,0,176,63,239,238,238,238,238,238,208,63,0,0,0,0,0,0,232,63,0,0,0,0,0,0,240,63,48,33,0,0,88,42,0,0,160,34,0,0,224,27,0,0,192,21,0,0,152,17,0,0,168,11,0,0,40,7,0,0,80,4,0,0,176,1,0,0,88,48,0,0,248,44,0,0,224,42,0,0,88,41,0,0,120,40,0,0,120,39,0,0,8,39,0,0,216,37,0,0,120,37,0,0,232,36,0,0,136,36,0,0,24,36,0,0,224,34,0,0,144,34,0,0,56,34,0,0,168,33,0,0,168,32,0,0,72,32,0,0,192,31,0,0,16,31,0,0,80,30,0,0,192,29,0,0,200,28,0,0,208,27,0,0,16,27,0,0,32,26,0,0,32,25,0,0,56,24,0,0,176,23,0,0,96,23,0,0,224,22,0,0,144,22,0,0,48,22,0,0,200,21,0,0,120,21,0,0,80,21,0,0,24,21,0,0,136,20,0,0,72,20,0,0,8,20,0,0,160,19,0,0,216,18,0,0,16,18,0,0,160,17,0,0,224,16,0,0,80,16,0,0,216,15,0,0,248,14,0,0,88,14,0,0,200,13,0,0,72,13,0,0,216,12,0,0,104,12,0,0,176,11,0,0,48,11,0,0,216,10,0,0,24,10,0,0,136,9,0,0,16,9,0,0,192,8,0,0,96,8,0,0,24,8,0,0,168,7,0,0,64,7,0,0,8,7,0,0,216,6,0,0,136,6,0,0,48,6,0,0,248,5,0,0,192,5,0,0,48,5,0,0,16,5,0,0,208,4,0,0,112,4,0,0,40,4,0,0,0,4,0,0,184,3,0,0,128,3,0,0,40,3,0,0,0,3,0,0,208,2,0,0,168,2,0,0,112,2,0,0,240,1,0,0,160,1,0,0,96,1,0,0,48,1,0,0,216,0,0,0,184,0,0,0,136,0,0,0,24,49,0,0,248,48,0,0,200,48,0,0,120,48,0,0,72,48,0,0,32,48,0,0,232,47,0,0,128,47,0,0,64,47,0,0,0,47,0,0,160,46,0,0,88,46,0,0,16,46,0,0,64,45,0,0,240,44,0,0,208,44,0,0,160,44,0,0,8,44,0,0,240,43,0,0,216,43,0,0,152,43,0,0,128,43,0,0,80,43,0,0,0,43,0,0,208,42,0,0,176,42,0,0,136,42,0,0,64,42,0,0,56,42,0,0,40,42,0,0,16,42,0,0,248,41,0,0,184,41,0,0,128,41,0,0,72,41,0,0,32,41,0,0,24,41,0,0,0,41,0,0,248,40,0,0,240,40,0,0,224,40,0,0,216,40,0,0,184,40,0,0,152,40,0,0,136,40,0,0,112,40,0,0,96,40,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function ___cxa_bad_typeid() {
  Module['printErr']('missing function: __cxa_bad_typeid'); abort(-1);
  }
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr;;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  Module["_memcmp"] = _memcmp;
  var _llvm_memcpy_p0i8_p0i8_i64=_memcpy;
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_strlen"] = _strlen;
  var _llvm_memset_p0i8_i64=_memset;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          this.stack = stackTrace();
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureErrnoError();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _getcwd(buf, size) {
      // char *getcwd(char *buf, size_t size);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/getcwd.html
      if (size == 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var cwd = FS.cwd();
      if (size < cwd.length + 1) {
        ___setErrNo(ERRNO_CODES.ERANGE);
        return 0;
      } else {
        writeAsciiToMemory(cwd, buf);
        return buf;
      }
    }
  Module["_strcpy"] = _strcpy;
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _fmod(x, y) {
      return x % y;
    }
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }
  function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode
        HEAP32[(((buf)+(16))>>2)]=stat.nlink
        HEAP32[(((buf)+(20))>>2)]=stat.uid
        HEAP32[(((buf)+(24))>>2)]=stat.gid
        HEAP32[(((buf)+(28))>>2)]=stat.rdev
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size
        HEAP32[(((buf)+(40))>>2)]=4096
        HEAP32[(((buf)+(44))>>2)]=stat.blocks
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(52))>>2)]=0
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(60))>>2)]=0
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(68))>>2)]=0
        HEAP32[(((buf)+(72))>>2)]=stat.ino
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }var _fseeko=_fseek;
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }var _ftello=_ftell;
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  var _floor=Math_floor;
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  var _ceil=Math_ceil;
  var _fabs=Math_abs;
  function _llvm_eh_typeid_for(type) {
      return type;
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function ___errno_location() {
      return ___errno_state;
    }
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _abort() {
      Module['abort']();
    }
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)];;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function ___cxa_guard_abort() {}
  var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            continue;
          }
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function _catopen() { throw 'TODO: ' + aborter }
  function _catgets() { throw 'TODO: ' + aborter }
  function _catclose() { throw 'TODO: ' + aborter }
  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }
  function _freelocale(locale) {
      _free(locale);
    }
  function _isascii(chr) {
      return chr >= 0 && (chr & 0x80) == 0;
    }
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
      var pattern = Pointer_stringify(format);
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear()-1;
          }
      };
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Sunday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          }
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Monday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable.
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          // If tm_isdst is zero, the standard time offset is used.
          // If tm_isdst is greater than zero, the daylight savings time offset is used.
          // If tm_isdst is negative, no characters are returned.
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }var _strftime_l=_strftime;
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  var _llvm_va_start=undefined;
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiddi(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiddi"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiddddi(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiddddi"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iddddiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iddddiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    return Module["dynCall_iiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vidi(index,a1,a2,a3) {
  try {
    Module["dynCall_vidi"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
  try {
    Module["dynCall_viiiiiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ddd(index,a1,a2) {
  try {
    return Module["dynCall_ddd"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_fiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiidi(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiidi"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iid(index,a1,a2) {
  try {
    return Module["dynCall_iid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_diii(index,a1,a2,a3) {
  try {
    return Module["dynCall_diii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_dii(index,a1,a2) {
  try {
    return Module["dynCall_dii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var p=env.___fsmu8|0;var q=env.__ZTIc|0;var r=env._stdout|0;var s=env.__ZTVN10__cxxabiv119__pointer_type_infoE|0;var t=env.___dso_handle|0;var u=env._stdin|0;var v=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var w=env._stderr|0;var x=+env.NaN;var y=+env.Infinity;var z=0;var A=0;var B=0;var C=0;var D=0,E=0,F=0,G=0,H=0.0,I=0,J=0,K=0,L=0.0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=0;var V=0;var W=global.Math.floor;var X=global.Math.abs;var Y=global.Math.sqrt;var Z=global.Math.pow;var _=global.Math.cos;var $=global.Math.sin;var aa=global.Math.tan;var ab=global.Math.acos;var ac=global.Math.asin;var ad=global.Math.atan;var ae=global.Math.atan2;var af=global.Math.exp;var ag=global.Math.log;var ah=global.Math.ceil;var ai=global.Math.imul;var aj=env.abort;var ak=env.assert;var al=env.asmPrintInt;var am=env.asmPrintFloat;var an=env.min;var ao=env.invoke_iiiiiiii;var ap=env.invoke_iiiiiiddi;var aq=env.invoke_viiiii;var ar=env.invoke_vi;var as=env.invoke_vii;var at=env.invoke_iiiiiii;var au=env.invoke_ii;var av=env.invoke_viiiddddi;var aw=env.invoke_iddddiii;var ax=env.invoke_iiiiiiiiiiii;var ay=env.invoke_vidi;var az=env.invoke_iiii;var aA=env.invoke_viiiiiiiiiiiiiii;var aB=env.invoke_viiiiid;var aC=env.invoke_viiiiiiii;var aD=env.invoke_viiiiii;var aE=env.invoke_ddd;var aF=env.invoke_fiii;var aG=env.invoke_viiidi;var aH=env.invoke_iid;var aI=env.invoke_viiiiiii;var aJ=env.invoke_viiiiiid;var aK=env.invoke_viiiiiiiii;var aL=env.invoke_viiiiiiiiii;var aM=env.invoke_iii;var aN=env.invoke_diii;var aO=env.invoke_dii;var aP=env.invoke_i;var aQ=env.invoke_iiiiii;var aR=env.invoke_viii;var aS=env.invoke_v;var aT=env.invoke_iiiiiiiii;var aU=env.invoke_iiiii;var aV=env.invoke_viiii;var aW=env._llvm_lifetime_end;var aX=env._lseek;var aY=env.__scanString;var aZ=env._fclose;var a_=env._pthread_mutex_lock;var a$=env.___cxa_end_catch;var a0=env._strtoull;var a1=env._fflush;var a2=env._strtol;var a3=env.__isLeapYear;var a4=env._fwrite;var a5=env._send;var a6=env._isspace;var a7=env._read;var a8=env._ceil;var a9=env._fsync;var ba=env.___cxa_guard_abort;var bb=env._newlocale;var bc=env.___gxx_personality_v0;var bd=env._pthread_cond_wait;var be=env.___cxa_rethrow;var bf=env._fmod;var bg=env.___resumeException;var bh=env._llvm_va_end;var bi=env._vsscanf;var bj=env._snprintf;var bk=env._fgetc;var bl=env.__getFloat;var bm=env._atexit;var bn=env.___cxa_free_exception;var bo=env._close;var bp=env.___setErrNo;var bq=env._isxdigit;var br=env._ftell;var bs=env._exit;var bt=env._sprintf;var bu=env._asprintf;var bv=env.___ctype_b_loc;var bw=env._freelocale;var bx=env._catgets;var by=env.___cxa_is_number_type;var bz=env._getcwd;var bA=env.___cxa_does_inherit;var bB=env.___cxa_guard_acquire;var bC=env.___cxa_begin_catch;var bD=env._recv;var bE=env.__parseInt64;var bF=env.__ZSt18uncaught_exceptionv;var bG=env.___cxa_call_unexpected;var bH=env.__exit;var bI=env._strftime;var bJ=env.___cxa_throw;var bK=env._llvm_eh_exception;var bL=env._toupper;var bM=env._pread;var bN=env._fopen;var bO=env._open;var bP=env.__arraySum;var bQ=env._isalnum;var bR=env._isalpha;var bS=env.___cxa_find_matching_catch;var bT=env._strdup;var bU=env.__formatString;var bV=env._pthread_cond_broadcast;var bW=env.__ZSt9terminatev;var bX=env._isascii;var bY=env._pthread_mutex_unlock;var bZ=env._sbrk;var b_=env.___errno_location;var b$=env._strerror;var b0=env._catclose;var b1=env._llvm_lifetime_start;var b2=env.__parseInt;var b3=env.___cxa_guard_release;var b4=env._ungetc;var b5=env._uselocale;var b6=env._vsnprintf;var b7=env._sscanf;var b8=env._sysconf;var b9=env._fread;var ca=env._abort;var cb=env._isdigit;var cc=env._strtoll;var cd=env.__addDays;var ce=env._fabs;var cf=env._floor;var cg=env.__reallyNegative;var ch=env._fseek;var ci=env.___cxa_bad_typeid;var cj=env._write;var ck=env.___cxa_allocate_exception;var cl=env._stat;var cm=env.___cxa_pure_virtual;var cn=env._vasprintf;var co=env._catopen;var cp=env.___ctype_toupper_loc;var cq=env.___ctype_tolower_loc;var cr=env._llvm_eh_typeid_for;var cs=env._pwrite;var ct=env._strerror_r;var cu=env._time;var cv=0.0;
// EMSCRIPTEN_START_FUNCS
function Ar(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[d+36>>2]|0;cZ[c[(c[e>>2]|0)+32>>2]&511](a,e|0,b|0);return}function As(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function At(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function Au(a){a=a|0;return}function Av(a){a=a|0;K4(a);return}function Aw(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function Ax(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function Ay(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function Az(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AA(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AB(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AC(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AD(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AE(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AF(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AG(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AH(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AI(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AJ(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AK(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AL(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AM(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AN(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AO(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AP(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AQ(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AR(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AS(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AT(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AU(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AV(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AW(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AX(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AY(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function AZ(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A_(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A$(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A0(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A1(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A2(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A3(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A4(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A5(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A6(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A7(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A8(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function A9(a,b,c){a=a|0;b=b|0;c=c|0;z9(a);return}function Ba(a,b){a=a|0;b=b|0;c[a>>2]=15992;c[a+4>>2]=b;return}function Bb(a){a=a|0;K4(a);return}function Bc(a){a=a|0;return}function Bd(a,b,c){a=a|0;b=b|0;c=c|0;CN(a,b,c);return}function Be(a,b,c){a=a|0;b=b|0;c=c|0;CM(a,b,c);return}function Bf(a,b,c){a=a|0;b=b|0;c=c|0;CL(a,b,c);return}function Bg(a,b,c){a=a|0;b=b|0;c=c|0;CK(a,b,c);return}function Bh(a,b,c){a=a|0;b=b|0;c=c|0;CJ(a,b,c);return}function Bi(a,b,c){a=a|0;b=b|0;c=c|0;CI(a,b,c);return}function Bj(a,b,c){a=a|0;b=b|0;c=c|0;CH(a,b,c);return}function Bk(a,b,c){a=a|0;b=b|0;c=c|0;CG(a,b,c);return}function Bl(a,b,c){a=a|0;b=b|0;c=c|0;CF(a,b,c);return}function Bm(a,b,c){a=a|0;b=b|0;c=c|0;CE(a,b,c);return}function Bn(a,b,c){a=a|0;b=b|0;c=c|0;CD(a,b,c);return}function Bo(a,b,c){a=a|0;b=b|0;c=c|0;CC(a,b,c);return}function Bp(a,b,c){a=a|0;b=b|0;c=c|0;CB(a,b,c);return}function Bq(a,b,c){a=a|0;b=b|0;c=c|0;CA(a,b,c);return}function Br(a,b,c){a=a|0;b=b|0;c=c|0;Cz(a,b,c);return}function Bs(a,b,c){a=a|0;b=b|0;c=c|0;Cy(a,b,c);return}function Bt(a,b,c){a=a|0;b=b|0;c=c|0;Cx(a,b,c);return}function Bu(a,b,c){a=a|0;b=b|0;c=c|0;Cw(a,b,c);return}function Bv(a,b,c){a=a|0;b=b|0;c=c|0;Cv(a,b,c);return}function Bw(a,b,c){a=a|0;b=b|0;c=c|0;Cu(a,b,c);return}function Bx(a,b,c){a=a|0;b=b|0;c=c|0;Ct(a,b,c);return}function By(a,b,c){a=a|0;b=b|0;c=c|0;Cs(a,b,c);return}function Bz(a,b,c){a=a|0;b=b|0;c=c|0;Cr(a,b,c);return}function BA(a,b,c){a=a|0;b=b|0;c=c|0;Cq(a,b,c);return}function BB(a,b,c){a=a|0;b=b|0;c=c|0;Cp(a,b,c);return}function BC(a,b,c){a=a|0;b=b|0;c=c|0;Co(a,b,c);return}function BD(a,b,c){a=a|0;b=b|0;c=c|0;Cn(a,b,c);return}function BE(a,b,c){a=a|0;b=b|0;c=c|0;Cm(a,b,c);return}function BF(a,b,c){a=a|0;b=b|0;c=c|0;Cl(a,b,c);return}function BG(a,b,c){a=a|0;b=b|0;c=c|0;Ck(a,b,c);return}function BH(a,b,c){a=a|0;b=b|0;c=c|0;Cj(a,b,c);return}function BI(a,b,c){a=a|0;b=b|0;c=c|0;Ci(a,b,c);return}function BJ(a,b,c){a=a|0;b=b|0;c=c|0;Ch(a,b,c);return}function BK(a,b,c){a=a|0;b=b|0;c=c|0;Cg(a,b,c);return}function BL(a,b,c){a=a|0;b=b|0;c=c|0;Cf(a,b,c);return}function BM(b,c,d){b=b|0;c=c|0;d=d|0;a[b]=0;a[b+1|0]=0;return}function BN(a,b,c){a=a|0;b=b|0;c=c|0;Ce(a,b,c);return}function BO(a,b,c){a=a|0;b=b|0;c=c|0;Cd(a,b,c);return}function BP(a,b,c){a=a|0;b=b|0;c=c|0;Cc(a,b,c);return}function BQ(a,b,c){a=a|0;b=b|0;c=c|0;Cb(a,b,c);return}function BR(a,b,c){a=a|0;b=b|0;c=c|0;Ca(a,b,c);return}function BS(a,b,c){a=a|0;b=b|0;c=c|0;B9(a,b,c);return}function BT(a,b,c){a=a|0;b=b|0;c=c|0;B8(a,b,c);return}function BU(a,b,c){a=a|0;b=b|0;c=c|0;B7(a,b,c);return}function BV(a,b,c){a=a|0;b=b|0;c=c|0;B6(a,b,c);return}function BW(a,b,c){a=a|0;b=b|0;c=c|0;B5(a,b,c);return}function BX(a,b,c){a=a|0;b=b|0;c=c|0;B4(a,b,c);return}function BY(a,b,c){a=a|0;b=b|0;c=c|0;B3(a,b,c);return}function BZ(a,b,c){a=a|0;b=b|0;c=c|0;B2(a,b,c);return}function B_(a,b,c){a=a|0;b=b|0;c=c|0;B1(a,b,c);return}function B$(a,b,c){a=a|0;b=b|0;c=c|0;B0(a,b,c);return}function B0(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B1(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B5(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B7(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B8(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function B9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ca(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ce(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ch(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ci(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ck(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Co(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cs(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Ct(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cu(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cw(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cx(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function Cz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CC(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CF(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CG(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CM(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CN(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+24|0;g=f|0;qJ(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qL(g);i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;h=b+1|0}else{j=d+16&-16;k=(z=0,au(246,j|0)|0);if(z){z=0;break}c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;h=k}Ld(h|0,e|0,d)|0;a[h+d|0]=0;qL(g);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function CO(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=b;e=a[b]|0;f=e&255;g=(f&1|0)==0;if(g){h=f>>>1}else{h=c[b+4>>2]|0}i=(e&1)==0;if(i){j=d+1|0}else{j=c[b+8>>2]|0}e=h>>>0>2>>>0;do{if((Lf(j|0,336,(e?2:h)|0)|0)==0){if(h>>>0>1>>>0&(e^1)){k=0}else{break}return k|0}}while(0);if(g){l=f>>>1}else{l=c[b+4>>2]|0}if(i){m=d+1|0}else{m=c[b+8>>2]|0}e=l>>>0>2>>>0;do{if((Lf(m|0,9384,(e?2:l)|0)|0)==0){if(l>>>0>1>>>0&(e^1)){k=1}else{break}return k|0}}while(0);if(g){n=f>>>1}else{n=c[b+4>>2]|0}if(i){o=d+1|0}else{o=c[b+8>>2]|0}e=n>>>0>2>>>0;do{if((Lf(o|0,7832,(e?2:n)|0)|0)==0){if(n>>>0>1>>>0&(e^1)){k=2}else{break}return k|0}}while(0);if(g){p=f>>>1}else{p=c[b+4>>2]|0}if(i){q=d+1|0}else{q=c[b+8>>2]|0}e=p>>>0>2>>>0;do{if((Lf(q|0,5904,(e?2:p)|0)|0)==0){if(p>>>0>1>>>0&(e^1)){k=3}else{break}return k|0}}while(0);if(g){r=f>>>1}else{r=c[b+4>>2]|0}if(i){s=d+1|0}else{s=c[b+8>>2]|0}e=r>>>0>2>>>0;do{if((Lf(s|0,5088,(e?2:r)|0)|0)==0){if(r>>>0>1>>>0&(e^1)){k=4}else{break}return k|0}}while(0);if(g){t=f>>>1}else{t=c[b+4>>2]|0}if(i){u=d+1|0}else{u=c[b+8>>2]|0}b=t>>>0>2>>>0;d=Lf(u|0,3472,(b?2:t)|0)|0;if((d|0)==0){v=t>>>0<2>>>0?-1:b&1}else{v=d}k=(v|0)==0?5:6;return k|0}function CP(a,b){a=a|0;b=b|0;var c=0,d=0.0;c=CO(a)|0;a=CO(b)|0;if((c|0)==6|(a|0)==6){d=0.0;return+d}d=+h[36512+(c*48|0)+(a<<3)>>3];return+d}function CQ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;h=c[u>>2]|0;Da(40248,h,40376);c[10310]=15300;c[10312]=15320;c[10311]=0;z=0;as(198,41248,40248);if(z){z=0;j=bS(-1,-1)|0;D5(41248);bg(j|0)}c[10330]=0;c[10331]=-1;j=c[r>>2]|0;c[10038]=15032;Iy(40156);Lg(40160,0,24)|0;c[10038]=15520;c[10046]=j;Iz(g,40156);k=(z=0,aM(198,g|0,40576)|0);if(z){z=0;l=bS(-1,-1)|0;IA(g);c[10038]=15032;IA(40156);bg(l|0)}l=k;IA(g);c[10047]=l;c[10048]=40384;a[40196]=(cC[c[(c[k>>2]|0)+28>>2]&511](l)|0)&1;c[10244]=15204;c[10245]=15224;z=0;as(198,40980,40152);if(z){z=0;l=bS(-1,-1)|0;D5(40980);bg(l|0)}c[10263]=0;c[10264]=-1;l=c[w>>2]|0;c[10050]=15032;Iy(40204);Lg(40208,0,24)|0;c[10050]=15520;c[10058]=l;Iz(f,40204);k=(z=0,aM(198,f|0,40576)|0);if(z){z=0;g=bS(-1,-1)|0;IA(f);c[10050]=15032;IA(40204);bg(g|0)}g=k;IA(f);c[10059]=g;c[10060]=40392;a[40244]=(cC[c[(c[k>>2]|0)+28>>2]&511](g)|0)&1;c[10288]=15204;c[10289]=15224;z=0;as(198,41156,40200);if(z){z=0;g=bS(-1,-1)|0;D5(41156);bg(g|0)}c[10307]=0;c[10308]=-1;g=c[(c[(c[10288]|0)-12>>2]|0)+41176>>2]|0;c[10266]=15204;c[10267]=15224;z=0;as(198,41068,g|0);if(z){z=0;g=bS(-1,-1)|0;D5(41068);bg(g|0)}c[10285]=0;c[10286]=-1;c[(c[(c[10310]|0)-12>>2]|0)+41312>>2]=40976;g=(c[(c[10288]|0)-12>>2]|0)+41156|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[10288]|0)-12>>2]|0)+41224>>2]=40976;CY(40096,h,40400);c[10222]=15252;c[10224]=15272;c[10223]=0;z=0;as(198,40896,40096);if(z){z=0;h=bS(-1,-1)|0;D5(40896);bg(h|0)}c[10242]=0;c[10243]=-1;c[1e4]=14960;Iy(40004);Lg(40008,0,24)|0;c[1e4]=15448;c[10008]=j;Iz(e,40004);j=(z=0,aM(198,e|0,40568)|0);if(z){z=0;h=bS(-1,-1)|0;IA(e);c[1e4]=14960;IA(40004);bg(h|0)}h=j;IA(e);c[10009]=h;c[10010]=40408;a[40044]=(cC[c[(c[j>>2]|0)+28>>2]&511](h)|0)&1;c[10152]=15156;c[10153]=15176;z=0;as(198,40612,4e4);if(z){z=0;h=bS(-1,-1)|0;D5(40612);bg(h|0)}c[10171]=0;c[10172]=-1;c[10012]=14960;Iy(40052);Lg(40056,0,24)|0;c[10012]=15448;c[10020]=l;Iz(d,40052);l=(z=0,aM(198,d|0,40568)|0);if(z){z=0;h=bS(-1,-1)|0;IA(d);c[10012]=14960;IA(40052);bg(h|0)}h=l;IA(d);c[10021]=h;c[10022]=40416;a[40092]=(cC[c[(c[l>>2]|0)+28>>2]&511](h)|0)&1;c[10196]=15156;c[10197]=15176;z=0;as(198,40788,40048);if(z){z=0;h=bS(-1,-1)|0;D5(40788);bg(h|0)}c[10215]=0;c[10216]=-1;h=c[(c[(c[10196]|0)-12>>2]|0)+40808>>2]|0;c[10174]=15156;c[10175]=15176;z=0;as(198,40700,h|0);if(!z){c[10193]=0;c[10194]=-1;c[(c[(c[10222]|0)-12>>2]|0)+40960>>2]=40608;h=(c[(c[10196]|0)-12>>2]|0)+40788|0;c[h>>2]=c[h>>2]|8192;c[(c[(c[10196]|0)-12>>2]|0)+40856>>2]=40608;i=b;return}else{z=0;b=bS(-1,-1)|0;D5(40700);bg(b|0)}}function CR(a){a=a|0;z=0,au(62,40976)|0;do{if(!z){z=0,au(62,41064)|0;if(z){z=0;break}z=0,au(168,40608)|0;if(z){z=0;break}z=0,au(168,40696)|0;if(z){z=0;break}return}else{z=0}}while(0);bS(-1,-1,0)|0;bW()}function CS(a){a=a|0;c[a>>2]=14960;IA(a+4|0);return}function CT(a){a=a|0;c[a>>2]=14960;IA(a+4|0);K4(a);return}function CU(b,d){b=b|0;d=d|0;var e=0;cC[c[(c[b>>2]|0)+24>>2]&511](b)|0;e=IC(d,40568)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cC[c[(c[e>>2]|0)+28>>2]&511](d)|0)&1;return}function CV(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cY[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a4(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=7;break}if((l|0)==2){m=-1;n=6;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((a1(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==6){i=b;return m|0}else if((n|0)==7){i=b;return m|0}return 0}function CW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if((a[b+44|0]&1)!=0){f=a4(d|0,4,e|0,c[b+32>>2]|0)|0;return f|0}g=b;if((e|0)>0){h=d;i=0}else{f=0;return f|0}while(1){if((cU[c[(c[g>>2]|0)+52>>2]&1023](b,c[h>>2]|0)|0)==-1){f=i;j=10;break}d=i+1|0;if((d|0)<(e|0)){h=h+4|0;i=d}else{f=d;j=7;break}}if((j|0)==10){return f|0}else if((j|0)==7){return f|0}return 0}function CX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L1:do{if(!k){c[g>>2]=d;if((a[b+44|0]&1)!=0){if((a4(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=c$[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=14;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(v>>>0>=2>>>0){l=-1;w=15;break}v=(c[h>>2]|0)-r|0;if((a4(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=16;break}if(u){t=u?c[j>>2]|0:t}else{break L1}}if((w|0)==7){if((a4(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==14){i=e;return l|0}else if((w|0)==15){i=e;return l|0}else if((w|0)==16){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function CY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=14960;j=b+4|0;Iy(j);Lg(b+8|0,0,24)|0;c[h>>2]=15848;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Iz(g,j);e=(z=0,aM(198,g|0,40568)|0);if(z){z=0;k=bS(-1,-1)|0;l=M;IA(g);c[h>>2]=14960;IA(j);bg(k|0)}d=e;m=b+36|0;c[m>>2]=d;n=b+44|0;c[n>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[m>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[n>>2]|0)<=8){IA(g);i=f;return}z=0;ar(52,80);if(!z){IA(g);i=f;return}else{z=0;k=bS(-1,-1)|0;l=M;IA(g);c[h>>2]=14960;IA(j);bg(k|0)}}function CZ(a){a=a|0;c[a>>2]=14960;IA(a+4|0);return}function C_(a){a=a|0;c[a>>2]=14960;IA(a+4|0);K4(a);return}function C$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=IC(d,40568)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[f>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[g>>2]|0)<=8){return}HU(80);return}function C0(a){a=a|0;return C3(a,0)|0}function C1(a){a=a|0;return C3(a,1)|0}function C2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L8:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=f|0;q=c$[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+4|0,j,p,f+8|0,g)|0;if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}else if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L8}r=o-1|0;c[g>>2]=r;if((b4(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function C3(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;if((a[k]&1)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;L8:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=bk(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o;l=l+1|0;if((l|0)>=(k|0)){break L8}}i=e;return n|0}}while(0);L15:do{if((a[b+53|0]&1)==0){l=b+40|0;m=b+36|0;o=f|0;p=g+4|0;q=b+32|0;r=k;while(1){s=c[l>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[m>>2]|0;w=f+r|0;x=c$[c[(c[t>>2]|0)+16>>2]&31](t,s,o,w,h,g,p,j)|0;if((x|0)==3){y=14;break}else if((x|0)==2){n=-1;y=26;break}else if((x|0)!=1){z=r;break L15}x=c[l>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){n=-1;y=27;break}v=bk(c[q>>2]|0)|0;if((v|0)==-1){n=-1;y=24;break}a[w]=v;r=r+1|0}if((y|0)==14){c[g>>2]=a[o]|0;z=r;break}else if((y|0)==24){i=e;return n|0}else if((y|0)==26){i=e;return n|0}else if((y|0)==27){i=e;return n|0}}else{c[g>>2]=a[f|0]|0;z=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=z;while(1){if((b|0)<=0){break}z=b-1|0;if((b4(a[f+z|0]|0,c[d>>2]|0)|0)==-1){n=-1;y=29;break}else{b=z}}if((y|0)==29){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function C4(a){a=a|0;c[a>>2]=15032;IA(a+4|0);return}function C5(a){a=a|0;c[a>>2]=15032;IA(a+4|0);K4(a);return}function C6(b,d){b=b|0;d=d|0;var e=0;cC[c[(c[b>>2]|0)+24>>2]&511](b)|0;e=IC(d,40576)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cC[c[(c[e>>2]|0)+28>>2]&511](d)|0)&1;return}function C7(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cY[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a4(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=6;break}if((l|0)==2){m=-1;n=7;break}else if((l|0)!=1){n=4;break}}if((n|0)==7){i=b;return m|0}else if((n|0)==6){i=b;return m|0}else if((n|0)==4){m=((a1(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function C8(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if((a[b+44|0]&1)!=0){g=a4(e|0,1,f|0,c[b+32>>2]|0)|0;return g|0}h=b;if((f|0)>0){i=e;j=0}else{g=0;return g|0}while(1){if((cU[c[(c[h>>2]|0)+52>>2]&1023](b,d[i]|0)|0)==-1){g=j;k=7;break}e=j+1|0;if((e|0)<(f|0)){i=i+1|0;j=e}else{g=e;k=9;break}}if((k|0)==9){return g|0}else if((k|0)==7){return g|0}return 0}function C9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L1:do{if(!k){a[g]=d;if((a[b+44|0]&1)!=0){if((a4(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=c$[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=16;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(v>>>0>=2>>>0){l=-1;w=18;break}v=(c[h>>2]|0)-r|0;if((a4(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=17;break}if(u){t=u?c[j>>2]|0:t}else{break L1}}if((w|0)==18){i=e;return l|0}else if((w|0)==7){if((a4(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==16){i=e;return l|0}else if((w|0)==17){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function Da(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=15032;j=b+4|0;Iy(j);Lg(b+8|0,0,24)|0;c[h>>2]=15920;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Iz(g,j);e=(z=0,aM(198,g|0,40576)|0);if(z){z=0;k=bS(-1,-1)|0;l=M;IA(g);c[h>>2]=15032;IA(j);bg(k|0)}d=e;m=b+36|0;c[m>>2]=d;n=b+44|0;c[n>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[m>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[n>>2]|0)<=8){IA(g);i=f;return}z=0;ar(52,80);if(!z){IA(g);i=f;return}else{z=0;k=bS(-1,-1)|0;l=M;IA(g);c[h>>2]=15032;IA(j);bg(k|0)}}function Db(a){a=a|0;c[a>>2]=15032;IA(a+4|0);return}function Dc(a){a=a|0;c[a>>2]=15032;IA(a+4|0);K4(a);return}function Dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=IC(d,40576)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[f>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[g>>2]|0)<=8){return}HU(80);return}function De(a){a=a|0;return Dh(a,0)|0}function Df(a){a=a|0;return Dh(a,1)|0}function Dg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L8:do{if(l){a[h]=c[n>>2];o=c[b+36>>2]|0;p=f|0;q=c$[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+1|0,j,p,f+8|0,g)|0;if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}else if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L8}r=o-1|0;c[g>>2]=r;if((b4(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Dh(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=b+52|0;if((a[l]&1)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;L8:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=bk(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p;m=m+1|0;if((m|0)>=(l|0)){break L8}}i=f;return o|0}}while(0);L15:do{if((a[b+53|0]&1)==0){m=b+40|0;n=b+36|0;p=g|0;q=h+1|0;r=b+32|0;s=l;while(1){t=c[m>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[n>>2]|0;x=g+s|0;y=c$[c[(c[u>>2]|0)+16>>2]&31](u,t,p,x,j,h,q,k)|0;if((y|0)==3){z=14;break}else if((y|0)==2){o=-1;z=27;break}else if((y|0)!=1){A=s;break L15}y=c[m>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){o=-1;z=31;break}w=bk(c[r>>2]|0)|0;if((w|0)==-1){o=-1;z=29;break}a[x]=w;s=s+1|0}if((z|0)==31){i=f;return o|0}else if((z|0)==14){a[h]=a[p]|0;A=s;break}else if((z|0)==27){i=f;return o|0}else if((z|0)==29){i=f;return o|0}}else{a[h]=a[g|0]|0;A=l}}while(0);do{if(e){l=a[h]|0;c[b+48>>2]=l&255;B=l}else{l=b+32|0;k=A;while(1){if((k|0)<=0){z=21;break}j=k-1|0;if((b4(d[g+j|0]|0|0,c[l>>2]|0)|0)==-1){o=-1;z=24;break}else{k=j}}if((z|0)==24){i=f;return o|0}else if((z|0)==21){B=a[h]|0;break}}}while(0);o=B&255;i=f;return o|0}function Di(){CQ(0);bm(104,41328,t|0)|0;return}function Dj(a){a=a|0;return}function Dk(a){a=a|0;var b=0;b=a+4|0;K=c[b>>2]|0,c[b>>2]=K+1,K;return}function Dl(a){a=a|0;var b=0,d=0;b=a+4|0;if(((K=c[b>>2]|0,c[b>>2]=K+ -1,K)|0)!=0){d=0;return d|0}cz[c[(c[a>>2]|0)+8>>2]&1023](a);d=1;return d|0}function Dm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=13192;d=a+4|0;if((d|0)==0){return}a=Lh(b|0)|0;e=K3(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;f=e+12|0;c[d>>2]=f;c[e+8>>2]=0;Ld(f|0,b|0,a+1|0)|0;return}function Dn(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13192;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K4(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;K4(e);return}K5(d);e=a;K4(e);return}function Do(a){a=a|0;var b=0;c[a>>2]=13192;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((K=c[a>>2]|0,c[a>>2]=K+ -1,K)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}K5(a);return}function Dp(a){a=a|0;return c[a+4>>2]|0}function Dq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;c[b>>2]=13096;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=Lh(f|0)|0;b=K3(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;g=b+12|0;c[e>>2]=g;c[b+8>>2]=0;Ld(g|0,f|0,d+1|0)|0;return}function Dr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=13096;d=a+4|0;if((d|0)==0){return}a=Lh(b|0)|0;e=K3(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;f=e+12|0;c[d>>2]=f;c[e+8>>2]=0;Ld(f|0,b|0,a+1|0)|0;return}function Ds(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13096;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K4(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;K4(e);return}K5(d);e=a;K4(e);return}function Dt(a){a=a|0;var b=0;c[a>>2]=13096;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((K=c[a>>2]|0,c[a>>2]=K+ -1,K)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}K5(a);return}function Du(a){a=a|0;return c[a+4>>2]|0}function Dv(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13192;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K4(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;K4(e);return}K5(d);e=a;K4(e);return}function Dw(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13192;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K4(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;K4(e);return}K5(d);e=a;K4(e);return}function Dx(a){a=a|0;return}function Dy(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function Dz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cZ[c[(c[a>>2]|0)+12>>2]&511](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function DA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function DB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;d=b$(e|0)|0;e=Lh(d|0)|0;if(e>>>0>4294967279>>>0){DH(0)}if(e>>>0<11>>>0){a[b]=e<<1;f=b+1|0;Ld(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=K2(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;Ld(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function DC(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;h=f;j=i;i=i+12|0;i=i+7&-8;k=e|0;l=c[k>>2]|0;do{if((l|0)!=0){m=d[h]|0;if((m&1|0)==0){n=m>>>1}else{n=c[f+4>>2]|0}if((n|0)==0){o=l}else{DU(f,8752,2)|0;o=c[k>>2]|0}m=c[e+4>>2]|0;cZ[c[(c[m>>2]|0)+24>>2]&511](j,m,o);m=j;p=a[m]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}r=p&255;if((r&1|0)==0){s=r>>>1}else{s=c[j+4>>2]|0}z=0,az(84,f|0,q|0,s|0)|0;if(!z){if((a[m]&1)==0){break}K4(c[j+8>>2]|0);break}else{z=0}r=bS(-1,-1)|0;if((a[m]&1)==0){bg(r|0)}K4(c[j+8>>2]|0);bg(r|0)}}while(0);j=b;c[j>>2]=c[h>>2];c[j+4>>2]=c[h+4>>2];c[j+8>>2]=c[h+8>>2];Lg(h|0,0,12)|0;i=g;return}function DD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0;f=i;i=i+32|0;g=d;d=i;i=i+8|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];g=f|0;h=f+16|0;j=Lh(e|0)|0;if(j>>>0>4294967279>>>0){DH(0)}if(j>>>0<11>>>0){a[h]=j<<1;k=h+1|0}else{l=j+16&-16;m=K2(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}Ld(k|0,e|0,j)|0;a[k+j|0]=0;z=0;aR(252,g|0,d|0,h|0);do{if(!z){z=0;as(96,b|0,g|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[g]&1)==0){n=j;o=k;break}K4(c[g+8>>2]|0);n=j;o=k;break}if((a[g]&1)!=0){K4(c[g+8>>2]|0)}if((a[h]&1)==0){p=b|0;c[p>>2]=15416;q=b+8|0;r=d;s=q;t=r|0;u=c[t>>2]|0;v=r+4|0;w=c[v>>2]|0;x=s|0;c[x>>2]=u;y=s+4|0;c[y>>2]=w;i=f;return}K4(c[h+8>>2]|0);p=b|0;c[p>>2]=15416;q=b+8|0;r=d;s=q;t=r|0;u=c[t>>2]|0;v=r+4|0;w=c[v>>2]|0;x=s|0;c[x>>2]=u;y=s+4|0;c[y>>2]=w;i=f;return}else{z=0;k=bS(-1,-1)|0;n=M;o=k}}while(0);if((a[h]&1)==0){A=o;B=0;C=A;D=n;bg(C|0)}K4(c[h+8>>2]|0);A=o;B=0;C=A;D=n;bg(C|0)}function DE(a){a=a|0;Dt(a|0);K4(a);return}function DF(a){a=a|0;Dt(a|0);return}function DG(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e;if((c[a>>2]|0)==1){do{bd(40328,40304)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;z=0,au(268,40304)|0;do{if(!z){z=0;ar(d|0,b|0);if(z){z=0;break}z=0,au(14,40304)|0;if(z){z=0;break}c[a>>2]=-1;z=0,au(268,40304)|0;if(z){z=0;break}z=0,au(116,40328)|0;if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0,au(14,40304)|0;do{if(!z){c[a>>2]=0;z=0,au(268,40304)|0;if(z){z=0;break}z=0,au(116,40328)|0;if(z){z=0;break}z=0;aS(6);if(z){z=0;break}}else{z=0}}while(0);a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function DH(a){a=a|0;var b=0;a=ck(8)|0;z=0;as(614,a|0,1280);if(!z){c[a>>2]=13160;bJ(a|0,28648,472)}else{z=0;b=bS(-1,-1)|0;bn(a|0);bg(b|0)}}function DI(a){a=a|0;var b=0;a=ck(8)|0;z=0;as(614,a|0,1280);if(!z){c[a>>2]=13128;bJ(a|0,28632,10)}else{z=0;b=bS(-1,-1)|0;bn(a|0);bg(b|0)}}function DJ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if(f>>>0>4294967279>>>0){DH(0)}if(f>>>0<11>>>0){a[b]=f<<1;g=b+1|0}else{d=f+16&-16;h=K2(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}Ld(g|0,e|0,f)|0;a[g+f|0]=0;return}function DK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(e>>>0>4294967279>>>0){DH(0)}if(e>>>0<11>>>0){a[b]=e<<1;f=b+1|0;Ld(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=K2(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;Ld(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function DL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(d>>>0>4294967279>>>0){DH(0)}if(d>>>0<11>>>0){a[b]=d<<1;f=b+1|0}else{g=d+16&-16;h=K2(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=d;f=h}Lg(f|0,e|0,d|0)|0;a[f+d|0]=0;return}function DM(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;g=a[d]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[d+4>>2]|0}if(i>>>0<e>>>0){DI(0)}if((g&1)==0){j=d+1|0}else{j=c[d+8>>2]|0}d=j+e|0;j=i-e|0;e=j>>>0<f>>>0?j:f;if(e>>>0>4294967279>>>0){DH(0)}if(e>>>0<11>>>0){a[b]=e<<1;k=b+1|0;Ld(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}else{f=e+16&-16;j=K2(f)|0;c[b+8>>2]=j;c[b>>2]=f|1;c[b+4>>2]=e;k=j;Ld(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}}function DN(b){b=b|0;if((a[b]&1)==0){return}K4(c[b+8>>2]|0);return}function DO(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}DV(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}Le(l|0,f|0,h|0)|0;a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function DP(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=Lh(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}DV(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}Le(l|0,d|0,e|0)|0;a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function DQ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){DR(b,d-i|0,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function DR(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){DW(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}Lg(l+j|0,e|0,d|0)|0;e=j+d|0;if((a[f]&1)==0){a[f]=e<<1}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function DS(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>4294967279>>>0){DH(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11>>>0){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{do{if(g>>>0>h>>>0){p=K2(k)|0}else{d=(z=0,au(246,k|0)|0);if(!z){p=d;break}else{z=0}d=bS(-1,-1,0)|0;bC(d|0)|0;a$();return}}while(0);h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}Ld(l|0,m|0,r+1|0)|0;if(n){K4(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1;return}}function DT(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=10}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){DW(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2;j=b+1|0;k=g+1|0;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}}function DU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){DV(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}Ld(k+j|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function DV(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-18-d|0)>>>0<e>>>0){DH(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11>>>0){o=11;break}o=n+16&-16}else{o=-17}}while(0);e=K2(o)|0;if((g|0)!=0){Ld(e|0,k|0,g)|0}if((i|0)!=0){Ld(e+g|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){Ld(e+(i+g)|0,k+(h+g)|0,j-g|0)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}K4(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function DW(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-17-d|0)>>>0<e>>>0){DH(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11>>>0){n=11;break}n=m+16&-16}else{n=-17}}while(0);e=K2(n)|0;if((g|0)!=0){Ld(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){Ld(e+(i+g)|0,j+(h+g)|0,m-g|0)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}K4(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function DX(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741807>>>0){DH(0)}if(e>>>0<2>>>0){a[b]=e<<1;f=b+4|0;g=Kv(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=K2(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=Kv(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function DY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741807>>>0){DH(0)}if(d>>>0<2>>>0){a[b]=d<<1;f=b+4|0;g=Kx(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=K2(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=Kx(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function DZ(b){b=b|0;if((a[b]&1)==0){return}K4(c[b+8>>2]|0);return}function D_(a,b){a=a|0;b=b|0;return D$(a,b,Ku(b)|0)|0}function D$(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}D2(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}Kw(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function D0(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>1073741807>>>0){DH(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2>>>0){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;do{if(f>>>0>g>>>0){o=K2(d)|0}else{p=(z=0,au(246,d|0)|0);if(!z){o=p;break}else{z=0}p=bS(-1,-1,0)|0;bC(p|0)|0;a$();return}}while(0);d=h&1;if(d<<24>>24==0){q=b+4|0}else{q=c[b+8>>2]|0}k=o;l=q;m=d<<24>>24!=0;n=1}d=k;k=h&255;if((k&1|0)==0){r=k>>>1}else{r=c[b+4>>2]|0}Kv(d,l,r+1|0)|0;if(m){K4(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=d;return}else{a[e]=i<<1;return}}function D1(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=1}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){D3(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2;j=b+4|0;k=g+1|0;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}}function D2(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741806-d|0)>>>0<e>>>0){DH(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2>>>0){o=2;break}o=n+4&-4}else{o=1073741807}}while(0);e=K2(o<<2)|0;if((g|0)!=0){Kv(e,k,g)|0}if((i|0)!=0){Kv(e+(g<<2)|0,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){Kv(e+(i+g<<2)|0,k+(h+g<<2)|0,j-g|0)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}K4(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function D3(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741807-d|0)>>>0<e>>>0){DH(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2>>>0){n=2;break}n=m+4&-4}else{n=1073741807}}while(0);e=K2(n<<2)|0;if((g|0)!=0){Kv(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){Kv(e+(i+g<<2)|0,j+(h+g<<2)|0,m-g|0)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}K4(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function D4(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=ck(16)|0;do{if((a[41448]|0)==0){if((bB(41448)|0)==0){break}c[9864]=14656;bm(186,39456,t|0)|0}}while(0);b=Ll(39456,0,32)|0;c[f>>2]=b&0|1;c[f+4>>2]=M|0;z=0;aR(430,e|0,f|0,9152);if(!z){c[e>>2]=13840;bJ(e|0,29208,162)}else{z=0;f=bS(-1,-1)|0;bn(e|0);bg(f|0)}}function D5(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=13816;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;L1:do{if((b|0)!=0){f=b;while(1){f=f-1|0;z=0;aR(c[(c[d>>2]|0)+(f<<2)>>2]|0,0,a|0,c[(c[e>>2]|0)+(f<<2)>>2]|0);if(z){z=0;break}if((f|0)==0){break L1}}bS(-1,-1,0)|0;bW()}}while(0);IA(a+28|0);KZ(c[d>>2]|0);KZ(c[e>>2]|0);KZ(c[a+48>>2]|0);KZ(c[a+60>>2]|0);return}function D6(a,b){a=a|0;b=b|0;Iz(a,b+28|0);return}function D7(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;Lg(a+32|0,0,40)|0;if((b|0)==0){return}Iy(b);return}function D8(a){a=a|0;c[a>>2]=15032;IA(a+4|0);K4(a);return}function D9(a){a=a|0;c[a>>2]=15032;IA(a+4|0);return}function Ea(a,b){a=a|0;b=b|0;return}function Eb(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Ec(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Ed(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Ee(a){a=a|0;return 0}function Ef(a){a=a|0;return 0}function Eg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cC[c[(c[f>>2]|0)+40>>2]&511](b)|0;if((k|0)==-1){g=d;m=11;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=10;break}}if((m|0)==10){return g|0}else if((m|0)==11){return g|0}return 0}function Eh(a){a=a|0;return-1|0}function Ei(a){a=a|0;var b=0,e=0;if((cC[c[(c[a>>2]|0)+36>>2]&511](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function Ej(a,b){a=a|0;b=b|0;return-1|0}function Ek(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((cU[c[(c[g>>2]|0)+52>>2]&1023](b,d[l]|0)|0)==-1){h=k;n=9;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=8;break}}if((n|0)==8){return h|0}else if((n|0)==9){return h|0}return 0}function El(a,b){a=a|0;b=b|0;return-1|0}function Em(a){a=a|0;c[a>>2]=14960;IA(a+4|0);K4(a);return}function En(a){a=a|0;c[a>>2]=14960;IA(a+4|0);return}function Eo(a,b){a=a|0;b=b|0;return}function Ep(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Eq(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Er(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Es(a){a=a|0;return 0}function Et(a){a=a|0;return 0}function Eu(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cC[c[(c[e>>2]|0)+40>>2]&511](a)|0;if((j|0)==-1){f=b;l=8;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=9;break}}if((l|0)==9){return f|0}else if((l|0)==8){return f|0}return 0}function Ev(a){a=a|0;return-1|0}function Ew(a){a=a|0;var b=0,d=0;if((cC[c[(c[a>>2]|0)+36>>2]&511](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function Ex(a,b){a=a|0;b=b|0;return-1|0}function Ey(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((cU[c[(c[e>>2]|0)+52>>2]&1023](a,c[j>>2]|0)|0)==-1){f=i;l=8;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=9;break}}if((l|0)==9){return f|0}else if((l|0)==8){return f|0}return 0}function Ez(a,b){a=a|0;b=b|0;return-1|0}function EA(a){a=a|0;D5(a+8|0);K4(a);return}function EB(a){a=a|0;D5(a+8|0);return}function EC(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D5(b+(d+8)|0);K4(b+d|0);return}function ED(a){a=a|0;D5(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function EE(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;do{if((k|0)==0){l=5}else{z=0,au(62,k|0)|0;if(!z){l=5;break}else{z=0}m=bS(-1,-1,0)|0;n=m}}while(0);if((l|0)==5){a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;m=(z=0,au(c[(c[k>>2]|0)+24>>2]|0,k|0)|0);if(!z){if((m|0)!=-1){break}m=c[(c[f>>2]|0)-12>>2]|0;z=0;as(362,h+m|0,c[h+(m+16)>>2]|1|0);if(!z){break}else{z=0}}else{z=0}m=bS(-1,-1,0)|0;ES(e);n=m}bC(n|0)|0;m=c[(c[f>>2]|0)-12>>2]|0;k=h+(m+16)|0;c[k>>2]=c[k>>2]|1;if((c[h+(m+20)>>2]&1|0)==0){a$();i=d;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}m=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(m|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);ES(e);i=d;return b|0}function EF(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{be()}}function EG(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=a+4|0;c[e>>2]=0;f=a;g=c[(c[f>>2]|0)-12>>2]|0;h=a;i=c[h+(g+16)>>2]|0;do{if((i|0)==0){j=c[h+(g+72)>>2]|0;if((j|0)==0){k=g}else{z=0,au(62,j|0)|0;if(z){z=0;break}k=c[(c[f>>2]|0)-12>>2]|0}if((c[h+(k+16)>>2]|0)!=0){l=k;m=16;break}j=c[h+(k+24)>>2]|0;n=(z=0,az(c[(c[j>>2]|0)+32>>2]|0,j|0,b|0,d|0)|0);if(z){z=0;break}c[e>>2]=n;if((n|0)==(d|0)){return a|0}n=c[(c[f>>2]|0)-12>>2]|0;z=0;as(362,h+n|0,c[h+(n+16)>>2]|6|0);if(z){z=0;break}return a|0}else{z=0;as(362,h+g|0,i|4|0);if(z){z=0;break}l=c[(c[f>>2]|0)-12>>2]|0;m=16}}while(0);do{if((m|0)==16){z=0;as(362,h+l|0,c[h+(l+16)>>2]|4|0);if(z){z=0;break}return a|0}}while(0);l=bS(-1,-1,0)|0;bC(l|0)|0;l=c[(c[f>>2]|0)-12>>2]|0;f=h+(l+16)|0;c[f>>2]=c[f>>2]|1;if((c[h+(l+20)>>2]&1|0)==0){a$();return a|0}z=0;aS(6);if(!z){return 0}else{z=0}a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}return 0}function EH(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+16|0;e=d|0;f=a;c[f>>2]=0;c[f+4>>2]=0;f=a+8|0;c[f>>2]=-1;c[f+4>>2]=-1;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;b=c[h+(g+16)>>2]|0;do{if((b|0)==0){j=c[h+(g+72)>>2]|0;if((j|0)==0){k=g}else{z=0,au(62,j|0)|0;if(z){z=0;break}k=c[(c[f>>2]|0)-12>>2]|0}if((c[h+(k+16)>>2]|0)!=0){i=d;return}j=c[h+(k+24)>>2]|0;z=0;aD(c[(c[j>>2]|0)+16>>2]|0,e|0,j|0,0,0,1,8);if(z){z=0;break}j=a;l=e;c[j>>2]=c[l>>2];c[j+4>>2]=c[l+4>>2];c[j+8>>2]=c[l+8>>2];c[j+12>>2]=c[l+12>>2];i=d;return}else{z=0;as(362,h+g|0,b|4|0);if(z){z=0;break}i=d;return}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;b=c[(c[f>>2]|0)-12>>2]|0;f=h+(b+16)|0;c[f>>2]=c[f>>2]|1;if((c[h+(b+20)>>2]&1|0)==0){a$();i=d;return}z=0;aS(6);if(z){z=0}d=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(d|0)}else{z=0;bS(-1,-1,0)|0;bW()}}function EI(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+16|0;g=f|0;h=a;j=c[(c[h>>2]|0)-12>>2]|0;k=a;l=c[k+(j+16)>>2]|0;do{if((l|0)==0){m=c[k+(j+72)>>2]|0;if((m|0)==0){n=j}else{z=0,au(62,m|0)|0;if(z){z=0;break}n=c[(c[h>>2]|0)-12>>2]|0}if((c[k+(n+16)>>2]|0)!=0){i=f;return a|0}m=c[k+(n+24)>>2]|0;z=0;aD(c[(c[m>>2]|0)+16>>2]|0,g|0,m|0,b|0,d|0,e|0,8);if(z){z=0;break}m=g+8|0;if(!((c[m>>2]|0)==(-1|0)&(c[m+4>>2]|0)==(-1|0))){i=f;return a|0}m=c[(c[h>>2]|0)-12>>2]|0;z=0;as(362,k+m|0,c[k+(m+16)>>2]|4|0);if(z){z=0;break}i=f;return a|0}else{z=0;as(362,k+j|0,l|4|0);if(z){z=0;break}i=f;return a|0}}while(0);l=bS(-1,-1,0)|0;bC(l|0)|0;l=c[(c[h>>2]|0)-12>>2]|0;h=k+(l+16)|0;c[h>>2]=c[h>>2]|1;if((c[k+(l+20)>>2]&1|0)==0){a$();i=f;return a|0}z=0;aS(6);if(!z){return 0}else{z=0}a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}return 0}function EJ(a){a=a|0;D5(a+8|0);K4(a);return}function EK(a){a=a|0;D5(a+8|0);return}function EL(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D5(b+(d+8)|0);K4(b+d|0);return}function EM(a){a=a|0;D5(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function EN(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;do{if((k|0)==0){l=5}else{z=0,au(168,k|0)|0;if(!z){l=5;break}else{z=0}m=bS(-1,-1,0)|0;n=m}}while(0);if((l|0)==5){a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;m=(z=0,au(c[(c[k>>2]|0)+24>>2]|0,k|0)|0);if(!z){if((m|0)!=-1){break}m=c[(c[f>>2]|0)-12>>2]|0;z=0;as(362,h+m|0,c[h+(m+16)>>2]|1|0);if(!z){break}else{z=0}}else{z=0}m=bS(-1,-1,0)|0;E$(e);n=m}bC(n|0)|0;m=c[(c[f>>2]|0)-12>>2]|0;k=h+(m+16)|0;c[k>>2]=c[k>>2]|1;if((c[h+(m+20)>>2]&1|0)==0){a$();i=d;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}m=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(m|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);E$(e);i=d;return b|0}function EO(a){a=a|0;D5(a+4|0);K4(a);return}function EP(a){a=a|0;D5(a+4|0);return}function EQ(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D5(b+(d+4)|0);K4(b+d|0);return}function ER(a){a=a|0;D5(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function ES(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bF()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;d=(z=0,au(c[(c[e>>2]|0)+24>>2]|0,e|0)|0);do{if(!z){if((d|0)!=-1){return}e=c[b>>2]|0;a=c[(c[e>>2]|0)-12>>2]|0;f=e;z=0;as(362,f+a|0,c[f+(a+16)>>2]|1|0);if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0;aS(2);if(!z){return}else{z=0;bS(-1,-1,0)|0;bW()}}function ET(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iz(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;IA(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L11:do{if((x|0)==-1){Iz(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}IA(g);c[w>>2]=B<<24>>24;C=B;q=10;break L11}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;IA(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+24>>2]|0;c[f>>2]=u;z=0;aD(y|0,k|0,r|0,f|0,v|0,C|0,d|0);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(362,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;IA(j);F=y}ES(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);ES(h);i=e;return b|0}function EU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iz(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;IA(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L10:do{if((x|0)==-1){Iz(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}IA(g);c[w>>2]=B<<24>>24;C=B;q=10;break L10}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;IA(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+24>>2]|0;c[f>>2]=u;z=0;aD(y|0,k|0,r|0,f|0,v|0,C|0,d|0);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(362,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;IA(j);F=y}ES(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);ES(h);i=e;return b|0}function EV(b,d){b=b|0;d=+d;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iz(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;IA(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L11:do{if((x|0)==-1){Iz(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}IA(g);c[w>>2]=B<<24>>24;C=B;q=10;break L11}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;IA(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+32>>2]|0;c[f>>2]=u;z=0;aB(y|0,k|0,r|0,f|0,v|0,C|0,+d);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(362,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;IA(j);F=y}ES(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);ES(h);i=e;return b|0}function EW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+8|0;f=e|0;g=f|0;a[g]=0;c[f+4>>2]=b;h=b;j=c[(c[h>>2]|0)-12>>2]|0;k=b;do{if((c[k+(j+16)>>2]|0)==0){l=c[k+(j+72)>>2]|0;do{if((l|0)==0){m=4}else{z=0,au(62,l|0)|0;if(!z){m=4;break}else{z=0}n=bS(-1,-1,0)|0;o=n}}while(0);if((m|0)==4){a[g]=1;l=c[k+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;n=l;do{if((l|0)==0){p=n;m=9}else{q=l+24|0;r=c[q>>2]|0;if((r|0)==(c[l+28>>2]|0)){s=(z=0,aM(c[(c[l>>2]|0)+52>>2]|0,n|0,d&255|0)|0);if(!z){t=s}else{z=0;break}}else{c[q>>2]=r+1;a[r]=d;t=d&255}p=(t|0)==-1?0:n;m=9}}while(0);if((m|0)==9){if((p|0)!=0){break}n=c[(c[h>>2]|0)-12>>2]|0;z=0;as(362,k+n|0,c[k+(n+16)>>2]|1|0);if(!z){break}else{z=0}}n=bS(-1,-1,0)|0;ES(f);o=n}bC(o|0)|0;n=c[(c[h>>2]|0)-12>>2]|0;l=k+(n+16)|0;c[l>>2]=c[l>>2]|1;if((c[k+(n+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}n=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(n|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);ES(f);i=e;return b|0}function EX(a){a=a|0;D5(a+4|0);K4(a);return}function EY(a){a=a|0;D5(a+4|0);return}function EZ(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D5(b+(d+4)|0);K4(b+d|0);return}function E_(a){a=a|0;D5(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function E$(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bF()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;d=(z=0,au(c[(c[e>>2]|0)+24>>2]|0,e|0)|0);do{if(!z){if((d|0)!=-1){return}e=c[b>>2]|0;a=c[(c[e>>2]|0)-12>>2]|0;f=e;z=0;as(362,f+a|0,c[f+(a+16)>>2]|1|0);if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0;aS(2);if(!z){return}else{z=0;bS(-1,-1,0)|0;bW()}}function E0(a){a=a|0;return 10608}function E1(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){DK(a,11600,35);return}else{DB(a,b|0,c);return}}function E2(a){a=a|0;Dx(a|0);return}function E3(a){a=a|0;DF(a|0);K4(a);return}function E4(a){a=a|0;DF(a|0);return}function E5(a){a=a|0;D5(a);K4(a);return}function E6(a){a=a|0;Dx(a|0);K4(a);return}function E7(a){a=a|0;Dj(a|0);K4(a);return}function E8(a){a=a|0;Dj(a|0);return}function E9(a){a=a|0;Dj(a|0);return}function Fa(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=8;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=10;break}if(l<<24>>24<k<<24>>24){i=1;j=11;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L1}else{b=k;h=l}}if((j|0)==11){return i|0}else if((j|0)==10){return i|0}else if((j|0)==8){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function Fb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;if(g>>>0>4294967279>>>0){DH(b)}if(g>>>0<11>>>0){a[b]=g<<1;h=b+1|0}else{i=g+16&-16;j=K2(i)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=g;h=j}if((e|0)==(f|0)){k=h;a[k]=0;return}j=f+(-d|0)|0;d=h;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=h+j|0;a[k]=0;return}function Fc(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function Fd(a){a=a|0;Dj(a|0);K4(a);return}function Fe(a){a=a|0;Dj(a|0);return}function Ff(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=11;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=9;break}if((l|0)<(k|0)){i=1;j=8;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L1}else{a=k;h=l}}if((j|0)==11){return i|0}else if((j|0)==8){return i|0}else if((j|0)==9){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function Fg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741807>>>0){DH(b)}if(h>>>0<2>>>0){a[b]=g>>>1;i=b+4|0}else{g=h+4&-4;j=K2(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function Fh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function Fi(a){a=a|0;Dj(a|0);K4(a);return}function Fj(a){a=a|0;Dj(a|0);return}function Fk(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cQ[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}D6(r,g);q=r|0;r=c[q>>2]|0;if((c[10220]|0)==-1){x=9}else{c[m>>2]=40880;c[m+4>>2]=460;c[m+8>>2]=0;z=0;aR(2,40880,m|0,518);if(!z){x=9}else{z=0}}do{if((x|0)==9){m=(c[10221]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;Dl(c[q>>2]|0)|0;D6(s,g);n=s|0;p=c[n>>2]|0;if((c[10124]|0)==-1){x=15}else{c[l>>2]=40496;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40496,l|0,518);if(!z){x=15}else{z=0}}do{if((x|0)==15){d=(c[10125]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){y=c[v+(d<<2)>>2]|0;if((y|0)==0){break}A=y;Dl(c[n>>2]|0)|0;B=t|0;C=y;z=0;as(c[(c[C>>2]|0)+24>>2]|0,B|0,A|0);do{if(!z){y=t+12|0;z=0;as(c[(c[C>>2]|0)+28>>2]|0,y|0,A|0);if(z){z=0;D=y;break}c[u>>2]=c[f>>2];y=(z=0,ao(4,e|0,u|0,B|0,t+24|0,o|0,h|0,1)|0);if(!z){a[j]=(y|0)==(B|0)|0;c[b>>2]=c[e>>2];DN(t+12|0);DN(t|0);i=k;return}else{z=0;y=bS(-1,-1)|0;E=M;DN(t+12|0);DN(t|0);F=y;G=E;H=F;I=0;J=H;K=G;bg(J|0)}}else{z=0;D=B}}while(0);A=bS(-1,-1)|0;C=A;A=M;if((B|0)==(D|0)){F=C;G=A;H=F;I=0;J=H;K=G;bg(J|0)}else{L=D}while(1){E=L-12|0;DN(E);if((E|0)==(B|0)){F=C;G=A;break}else{L=E}}H=F;I=0;J=H;K=G;bg(J|0)}}while(0);d=ck(4)|0;Kz(d);z=0;aR(146,d|0,28600,100);if(z){z=0;break}}}while(0);o=bS(-1,-1)|0;p=M;Dl(c[n>>2]|0)|0;F=o;G=p;H=F;I=0;J=H;K=G;bg(J|0)}}while(0);m=ck(4)|0;Kz(m);z=0;aR(146,m|0,28600,100);if(z){z=0;break}}}while(0);L=bS(-1,-1)|0;D=M;Dl(c[q>>2]|0)|0;F=L;G=D;H=F;I=0;J=H;K=G;bg(J|0)}function Fl(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100>>>0){o=KY(m)|0;if((o|0)!=0){p=o;q=o;break}z=0;aS(4);if(!z){p=0;q=0;break}else{z=0}o=bS(-1,-1)|0;r=M;s=o;bg(s|0)}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){t=m;u=0}else{o=m;m=0;v=p;w=f;while(1){x=d[w]|0;if((x&1|0)==0){y=x>>>1}else{y=c[w+4>>2]|0}if((y|0)==0){a[v]=2;A=m+1|0;B=o-1|0}else{a[v]=1;A=m;B=o}x=w+12|0;if((x|0)==(g|0)){t=B;u=A;break}else{o=B;m=A;v=v+1|0;w=x}}}w=b|0;b=e|0;e=h;v=0;A=u;u=t;L19:while(1){t=c[w>>2]|0;do{if((t|0)==0){C=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){C=t;break}m=(z=0,au(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(z){z=0;D=6;break L19}if((m|0)==-1){c[w>>2]=0;C=0;break}else{C=c[w>>2]|0;break}}}while(0);t=(C|0)==0;m=c[b>>2]|0;if((m|0)==0){E=C;F=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){B=(z=0,au(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(z){z=0;D=6;break L19}if((B|0)!=-1){G=m;break}c[b>>2]=0;G=0}else{G=m}}while(0);E=c[w>>2]|0;F=G}H=(F|0)==0;if(!((t^H)&(u|0)!=0)){D=81;break}m=c[E+12>>2]|0;if((m|0)==(c[E+16>>2]|0)){B=(z=0,au(c[(c[E>>2]|0)+36>>2]|0,E|0)|0);if(z){z=0;D=6;break}I=B&255}else{I=a[m]|0}if(k){J=I}else{m=(z=0,aM(c[(c[e>>2]|0)+12>>2]|0,h|0,I|0)|0);if(!z){J=m}else{z=0;D=6;break}}do{if(n){K=A;L=u}else{m=v+1|0;L48:do{if(k){B=u;o=A;y=p;x=0;N=f;while(1){do{if((a[y]|0)==1){O=N;if((a[O]&1)==0){P=N+1|0}else{P=c[N+8>>2]|0}if(J<<24>>24!=(a[P+v|0]|0)){a[y]=0;Q=x;R=o;S=B-1|0;break}T=d[O]|0;if((T&1|0)==0){U=T>>>1}else{U=c[N+4>>2]|0}if((U|0)!=(m|0)){Q=1;R=o;S=B;break}a[y]=2;Q=1;R=o+1|0;S=B-1|0}else{Q=x;R=o;S=B}}while(0);T=N+12|0;if((T|0)==(g|0)){V=S;W=R;X=Q;break L48}B=S;o=R;y=y+1|0;x=Q;N=T}}else{N=u;x=A;y=p;o=0;B=f;while(1){do{if((a[y]|0)==1){T=B;if((a[T]&1)==0){Y=B+1|0}else{Y=c[B+8>>2]|0}O=(z=0,aM(c[(c[e>>2]|0)+12>>2]|0,h|0,a[Y+v|0]|0)|0);if(z){z=0;D=5;break L19}if(J<<24>>24!=O<<24>>24){a[y]=0;Z=o;_=x;$=N-1|0;break}O=d[T]|0;if((O&1|0)==0){aa=O>>>1}else{aa=c[B+4>>2]|0}if((aa|0)!=(m|0)){Z=1;_=x;$=N;break}a[y]=2;Z=1;_=x+1|0;$=N-1|0}else{Z=o;_=x;$=N}}while(0);O=B+12|0;if((O|0)==(g|0)){V=$;W=_;X=Z;break L48}N=$;x=_;y=y+1|0;o=Z;B=O}}}while(0);if(!X){K=W;L=V;break}m=c[w>>2]|0;B=m+12|0;o=c[B>>2]|0;if((o|0)==(c[m+16>>2]|0)){y=c[(c[m>>2]|0)+40>>2]|0;z=0,au(y|0,m|0)|0;if(z){z=0;D=6;break L19}}else{c[B>>2]=o+1}if((W+V|0)>>>0<2>>>0|n){K=W;L=V;break}o=v+1|0;B=W;m=p;y=f;while(1){do{if((a[m]|0)==2){x=d[y]|0;if((x&1|0)==0){ab=x>>>1}else{ab=c[y+4>>2]|0}if((ab|0)==(o|0)){ac=B;break}a[m]=0;ac=B-1|0}else{ac=B}}while(0);x=y+12|0;if((x|0)==(g|0)){K=ac;L=V;break}else{B=ac;m=m+1|0;y=x}}}}while(0);v=v+1|0;A=K;u=L}if((D|0)==5){L=bS(-1,-1)|0;ad=M;ae=L}else if((D|0)==81){do{if((E|0)==0){af=0;D=87}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){af=E;D=87;break}L=(z=0,au(c[(c[E>>2]|0)+36>>2]|0,E|0)|0);if(z){z=0;break}if((L|0)==-1){c[w>>2]=0;af=0;D=87;break}else{af=c[w>>2]|0;D=87;break}}}while(0);L114:do{if((D|0)==87){w=(af|0)==0;do{if(H){D=93}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(w){break}else{D=95;break}}E=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(z){z=0;break L114}if((E|0)==-1){c[b>>2]=0;D=93;break}else{if(w^(F|0)==0){break}else{D=95;break}}}}while(0);if((D|0)==93){if(w){D=95}}if((D|0)==95){c[j>>2]=c[j>>2]|2}L130:do{if(n){D=100}else{E=f;L=p;while(1){if((a[L]|0)==2){ag=E;break L130}u=E+12|0;if((u|0)==(g|0)){D=100;break L130}E=u;L=L+1|0}}}while(0);if((D|0)==100){c[j>>2]=c[j>>2]|4;ag=g}if((q|0)==0){i=l;return ag|0}KZ(q);i=l;return ag|0}}while(0);ag=bS(-1,-1)|0;ad=M;ae=ag}else if((D|0)==6){D=bS(-1,-1)|0;ad=M;ae=D}if((q|0)==0){r=ad;s=ae;bg(s|0)}KZ(q);r=ad;s=ae;bg(s|0);return 0}function Fm(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fn(a,0,j,k,f,g,h);i=b;return}function Fn(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==8){v=16}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FF(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DN(o);DN(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(40,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DN(o);DN(n);bg($|0)}function Fo(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fp(a,0,j,k,f,g,h);i=b;return}function Fp(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==8){v=16}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FF(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DN(o);DN(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(4,O|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HY(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DN(o);DN(n);bg($|0)}function Fq(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fr(a,0,j,k,f,g,h);i=b;return}function Fr(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;f=i;i=i+72|0;m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=c[j+4>>2]&74;if((v|0)==0){w=0}else if((v|0)==64){w=8}else if((v|0)==8){w=16}else{w=10}v=m|0;F3(o,j,v,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L6:do{if(!z){if((a[q]&1)==0){m=j+1|0;x=m;y=m;A=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;A=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;B=g|0;C=h|0;D=p|0;E=p+4|0;F=a[n]|0;G=x;H=c[B>>2]|0;L12:while(1){do{if((H|0)==0){I=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){I=H;break}J=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;K=34;break L12}if((J|0)!=-1){I=H;break}c[B>>2]=0;I=0}}while(0);L=(I|0)==0;J=c[C>>2]|0;do{if((J|0)==0){K=21}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(L){N=J;O=0;break}else{P=G;Q=J;R=0;break L12}}S=(z=0,au(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(z){z=0;K=34;break L12}if((S|0)==-1){c[C>>2]=0;K=21;break}else{S=(J|0)==0;if(L^S){N=J;O=S;break}else{P=G;Q=J;R=S;break L12}}}}while(0);if((K|0)==21){K=0;if(L){P=G;Q=0;R=1;break}else{N=0;O=1}}J=d[q]|0;S=(J&1|0)==0;if(((c[r>>2]|0)-G|0)==((S?J>>>1:c[E>>2]|0)|0)){if(S){T=J>>>1;U=J>>>1}else{J=c[E>>2]|0;T=J;U=J}z=0;aR(82,p|0,T<<1|0,0);if(z){z=0;K=34;break}if((a[q]&1)==0){V=10}else{V=(c[D>>2]&-2)-1|0}z=0;aR(82,p|0,V|0,0);if(z){z=0;K=34;break}if((a[q]&1)==0){W=y}else{W=c[A>>2]|0}c[r>>2]=W+U;X=W}else{X=G}J=I+12|0;S=c[J>>2]|0;Y=I+16|0;if((S|0)==(c[Y>>2]|0)){Z=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;K=34;break}_=Z&255}else{_=a[S]|0}if((FF(_,w,X,r,u,F,o,m,t,v)|0)!=0){P=X;Q=N;R=O;break}S=c[J>>2]|0;if((S|0)==(c[Y>>2]|0)){Y=c[(c[I>>2]|0)+40>>2]|0;z=0,au(Y|0,I|0)|0;if(!z){G=X;H=I;continue}else{z=0;K=34;break}}else{c[J>>2]=S+1;G=X;H=I;continue}}if((K|0)==34){H=bS(-1,-1)|0;$=M;aa=H;DN(p);DN(o);bg(aa|0)}H=d[o]|0;if((H&1|0)==0){ab=H>>>1}else{ab=c[o+4>>2]|0}do{if((ab|0)!=0){H=c[t>>2]|0;if((H-s|0)>=160){break}G=c[u>>2]|0;c[t>>2]=H+4;c[H>>2]=G}}while(0);G=(z=0,aU(6,P|0,c[r>>2]|0,k|0,w|0)|0);if(z){z=0;break}b[l>>1]=G;HY(o,m,c[t>>2]|0,k);do{if(L){ac=0}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){ac=I;break}G=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ac=I;break}c[B>>2]=0;ac=0}}while(0);B=(ac|0)==0;L75:do{if(R){K=62}else{do{if((c[Q+12>>2]|0)==(c[Q+16>>2]|0)){m=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;break L6}if((m|0)!=-1){break}c[C>>2]=0;K=62;break L75}}while(0);if(!(B^(Q|0)==0)){break}ad=e|0;c[ad>>2]=ac;DN(p);DN(o);i=f;return}}while(0);do{if((K|0)==62){if(B){break}ad=e|0;c[ad>>2]=ac;DN(p);DN(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;ad=e|0;c[ad>>2]=ac;DN(p);DN(o);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;$=M;aa=f;DN(p);DN(o);bg(aa|0)}function Fs(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Ft(a,0,j,k,f,g,h);i=b;return}function Ft(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==8){v=16}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FF(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DN(o);DN(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(2,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DN(o);DN(n);bg($|0)}function Fu(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fv(a,0,j,k,f,g,h);i=b;return}function Fv(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F3(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FF(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DN(o);DN(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(28,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DN(o);DN(n);bg($|0)}function Fw(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fx(a,0,j,k,f,g,h);i=b;return}function Fx(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;F3(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FF(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DN(o);DN(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(22,O|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HY(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DN(o);DN(n);bg($|0)}function Fy(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fz(a,0,j,k,f,g,h);i=b;return}function Fz(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=h|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F5(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DN(p);DN(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aF(2,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}g[l>>2]=af;HY(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DN(p);DN(o);bg(ad|0)}function FA(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FB(a,0,j,k,f,g,h);i=b;return}function FB(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F5(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DN(p);DN(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aN(4,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=af;HY(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DN(p);DN(o);bg(ad|0)}function FC(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FD(a,0,j,k,f,g,h);i=b;return}function FD(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F5(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DN(p);DN(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aN(2,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=af;HY(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DN(p);DN(o);bg(ad|0)}function FE(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+48|0;o=i;i=i+4|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;Lg(n|0,0,12)|0;u=p;z=0;as(346,o|0,h|0);if(z){z=0;h=bS(-1,-1)|0;v=M;w=h;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}h=o|0;o=c[h>>2]|0;if((c[10220]|0)==-1){C=4}else{c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){C=4}else{z=0}}L7:do{if((C|0)==4){l=(c[10221]|0)-1|0;D=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=m|0;H=c[(c[E>>2]|0)+32>>2]|0;z=0,aU(H|0,F|0,31872,31898,G|0)|0;if(z){z=0;break L7}Dl(c[h>>2]|0)|0;Lg(u|0,0,12)|0;F=p;z=0;aR(82,p|0,10,0);L13:do{if(!z){if((a[u]&1)==0){H=F+1|0;I=H;J=H;K=p+8|0}else{H=p+8|0;I=c[H>>2]|0;J=F+1|0;K=H}c[q>>2]=I;H=r|0;c[s>>2]=H;c[t>>2]=0;E=f|0;L=g|0;N=p|0;O=p+4|0;P=I;Q=c[E>>2]|0;L19:while(1){do{if((Q|0)==0){R=0}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){R=Q;break}S=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=40;break L19}if((S|0)!=-1){R=Q;break}c[E>>2]=0;R=0}}while(0);S=(R|0)==0;T=c[L>>2]|0;do{if((T|0)==0){C=25}else{if((c[T+12>>2]|0)!=(c[T+16>>2]|0)){if(S){break}else{U=P;break L19}}V=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;C=40;break L19}if((V|0)==-1){c[L>>2]=0;C=25;break}else{if(S^(T|0)==0){break}else{U=P;break L19}}}}while(0);if((C|0)==25){C=0;if(S){U=P;break}}T=d[u]|0;V=(T&1|0)==0;if(((c[q>>2]|0)-P|0)==((V?T>>>1:c[O>>2]|0)|0)){if(V){W=T>>>1;X=T>>>1}else{T=c[O>>2]|0;W=T;X=T}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;C=40;break}if((a[u]&1)==0){Y=10}else{Y=(c[N>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;C=40;break}if((a[u]&1)==0){Z=J}else{Z=c[K>>2]|0}c[q>>2]=Z+X;_=Z}else{_=P}T=R+12|0;V=c[T>>2]|0;$=R+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[R>>2]|0)+36>>2]|0,R|0)|0);if(z){z=0;C=40;break}ab=aa&255}else{ab=a[V]|0}if((FF(ab,16,_,q,t,0,n,H,s,G)|0)!=0){U=_;break}V=c[T>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[R>>2]|0)+40>>2]|0;z=0,au($|0,R|0)|0;if(!z){P=_;Q=R;continue}else{z=0;C=40;break}}else{c[T>>2]=V+1;P=_;Q=R;continue}}if((C|0)==40){Q=bS(-1,-1)|0;ac=M;ad=Q;break}a[U+3|0]=0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}Q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=Q;break}else{z=0;Q=bS(-1,-1)|0;ac=M;ad=Q;break L13}}}while(0);Q=(z=0,aU(18,U|0,c[9862]|0,8184,(P=i,i=i+8|0,c[P>>2]=k,P)|0)|0);i=P;if(z){z=0;C=41;break}if((Q|0)!=1){c[j>>2]=4}Q=c[E>>2]|0;do{if((Q|0)==0){ae=0}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){ae=Q;break}P=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=41;break L13}if((P|0)!=-1){ae=Q;break}c[E>>2]=0;ae=0}}while(0);E=(ae|0)==0;Q=c[L>>2]|0;do{if((Q|0)==0){C=70}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){if(!E){break}af=b|0;c[af>>2]=ae;DN(p);DN(n);i=e;return}P=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=41;break L13}if((P|0)==-1){c[L>>2]=0;C=70;break}if(!(E^(Q|0)==0)){break}af=b|0;c[af>>2]=ae;DN(p);DN(n);i=e;return}}while(0);do{if((C|0)==70){if(E){break}af=b|0;c[af>>2]=ae;DN(p);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;af=b|0;c[af>>2]=ae;DN(p);DN(n);i=e;return}else{z=0;C=41}}while(0);if((C|0)==41){G=bS(-1,-1)|0;ac=M;ad=G}DN(p);v=ac;w=ad;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}}while(0);l=ck(4)|0;Kz(l);z=0;aR(146,l|0,28600,100);if(z){z=0;break}}}while(0);ad=bS(-1,-1)|0;ac=M;Dl(c[h>>2]|0)|0;v=ac;w=ad;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}function FF(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[31872+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);f=a[31872+i|0]|0;c[g>>2]=n+1;a[n]=f;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function FG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b5(b|0)|0;b=bi(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}z=0,au(36,h|0)|0;if(!z){i=f;return b|0}else{z=0;bS(-1,-1,0)|0;bW();return 0}return 0}function FH(a){a=a|0;Dj(a|0);K4(a);return}function FI(a){a=a|0;Dj(a|0);return}function FJ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cQ[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}D6(r,g);q=r|0;r=c[q>>2]|0;if((c[10218]|0)==-1){x=9}else{c[m>>2]=40872;c[m+4>>2]=460;c[m+8>>2]=0;z=0;aR(2,40872,m|0,518);if(!z){x=9}else{z=0}}do{if((x|0)==9){m=(c[10219]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;Dl(c[q>>2]|0)|0;D6(s,g);n=s|0;p=c[n>>2]|0;if((c[10122]|0)==-1){x=15}else{c[l>>2]=40488;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40488,l|0,518);if(!z){x=15}else{z=0}}do{if((x|0)==15){d=(c[10123]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){y=c[v+(d<<2)>>2]|0;if((y|0)==0){break}A=y;Dl(c[n>>2]|0)|0;B=t|0;C=y;z=0;as(c[(c[C>>2]|0)+24>>2]|0,B|0,A|0);do{if(!z){y=t+12|0;z=0;as(c[(c[C>>2]|0)+28>>2]|0,y|0,A|0);if(z){z=0;D=y;break}c[u>>2]=c[f>>2];y=(z=0,ao(2,e|0,u|0,B|0,t+24|0,o|0,h|0,1)|0);if(!z){a[j]=(y|0)==(B|0)|0;c[b>>2]=c[e>>2];DZ(t+12|0);DZ(t|0);i=k;return}else{z=0;y=bS(-1,-1)|0;E=M;DZ(t+12|0);DZ(t|0);F=y;G=E;H=F;I=0;J=H;K=G;bg(J|0)}}else{z=0;D=B}}while(0);A=bS(-1,-1)|0;C=A;A=M;if((B|0)==(D|0)){F=C;G=A;H=F;I=0;J=H;K=G;bg(J|0)}else{L=D}while(1){E=L-12|0;DZ(E);if((E|0)==(B|0)){F=C;G=A;break}else{L=E}}H=F;I=0;J=H;K=G;bg(J|0)}}while(0);d=ck(4)|0;Kz(d);z=0;aR(146,d|0,28600,100);if(z){z=0;break}}}while(0);o=bS(-1,-1)|0;p=M;Dl(c[n>>2]|0)|0;F=o;G=p;H=F;I=0;J=H;K=G;bg(J|0)}}while(0);m=ck(4)|0;Kz(m);z=0;aR(146,m|0,28600,100);if(z){z=0;break}}}while(0);L=bS(-1,-1)|0;D=M;Dl(c[q>>2]|0)|0;F=L;G=D;H=F;I=0;J=H;K=G;bg(J|0)}function FK(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100>>>0){o=KY(m)|0;if((o|0)!=0){p=o;q=o;break}z=0;aS(4);if(!z){p=0;q=0;break}else{z=0}o=bS(-1,-1)|0;r=M;s=o;bg(s|0)}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){t=m;u=0}else{o=m;m=0;v=p;w=f;while(1){x=d[w]|0;if((x&1|0)==0){y=x>>>1}else{y=c[w+4>>2]|0}if((y|0)==0){a[v]=2;A=m+1|0;B=o-1|0}else{a[v]=1;A=m;B=o}x=w+12|0;if((x|0)==(g|0)){t=B;u=A;break}else{o=B;m=A;v=v+1|0;w=x}}}w=b|0;b=e|0;e=h;v=0;A=u;u=t;L19:while(1){t=c[w>>2]|0;do{if((t|0)==0){C=0}else{m=c[t+12>>2]|0;if((m|0)==(c[t+16>>2]|0)){B=(z=0,au(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(!z){D=B}else{z=0;E=6;break L19}}else{D=c[m>>2]|0}if((D|0)==-1){c[w>>2]=0;C=0;break}else{C=c[w>>2]|0;break}}}while(0);t=(C|0)==0;m=c[b>>2]|0;if((m|0)==0){F=C;G=0}else{B=c[m+12>>2]|0;if((B|0)==(c[m+16>>2]|0)){o=(z=0,au(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(!z){H=o}else{z=0;E=6;break}}else{H=c[B>>2]|0}if((H|0)==-1){c[b>>2]=0;I=0}else{I=m}F=c[w>>2]|0;G=I}J=(G|0)==0;if(!((t^J)&(u|0)!=0)){E=82;break}t=c[F+12>>2]|0;if((t|0)==(c[F+16>>2]|0)){m=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(!z){K=m}else{z=0;E=6;break}}else{K=c[t>>2]|0}if(k){L=K}else{t=(z=0,aM(c[(c[e>>2]|0)+28>>2]|0,h|0,K|0)|0);if(!z){L=t}else{z=0;E=6;break}}do{if(n){N=A;O=u}else{t=v+1|0;L51:do{if(k){m=u;B=A;o=p;y=0;x=f;while(1){do{if((a[o]|0)==1){P=x;if((a[P]&1)==0){Q=x+4|0}else{Q=c[x+8>>2]|0}if((L|0)!=(c[Q+(v<<2)>>2]|0)){a[o]=0;R=y;S=B;T=m-1|0;break}U=d[P]|0;if((U&1|0)==0){V=U>>>1}else{V=c[x+4>>2]|0}if((V|0)!=(t|0)){R=1;S=B;T=m;break}a[o]=2;R=1;S=B+1|0;T=m-1|0}else{R=y;S=B;T=m}}while(0);U=x+12|0;if((U|0)==(g|0)){W=T;X=S;Y=R;break L51}m=T;B=S;o=o+1|0;y=R;x=U}}else{x=u;y=A;o=p;B=0;m=f;while(1){do{if((a[o]|0)==1){U=m;if((a[U]&1)==0){Z=m+4|0}else{Z=c[m+8>>2]|0}P=(z=0,aM(c[(c[e>>2]|0)+28>>2]|0,h|0,c[Z+(v<<2)>>2]|0)|0);if(z){z=0;E=5;break L19}if((L|0)!=(P|0)){a[o]=0;_=B;$=y;aa=x-1|0;break}P=d[U]|0;if((P&1|0)==0){ab=P>>>1}else{ab=c[m+4>>2]|0}if((ab|0)!=(t|0)){_=1;$=y;aa=x;break}a[o]=2;_=1;$=y+1|0;aa=x-1|0}else{_=B;$=y;aa=x}}while(0);P=m+12|0;if((P|0)==(g|0)){W=aa;X=$;Y=_;break L51}x=aa;y=$;o=o+1|0;B=_;m=P}}}while(0);if(!Y){N=X;O=W;break}t=c[w>>2]|0;m=t+12|0;B=c[m>>2]|0;if((B|0)==(c[t+16>>2]|0)){o=c[(c[t>>2]|0)+40>>2]|0;z=0,au(o|0,t|0)|0;if(z){z=0;E=6;break L19}}else{c[m>>2]=B+4}if((X+W|0)>>>0<2>>>0|n){N=X;O=W;break}B=v+1|0;m=X;t=p;o=f;while(1){do{if((a[t]|0)==2){y=d[o]|0;if((y&1|0)==0){ac=y>>>1}else{ac=c[o+4>>2]|0}if((ac|0)==(B|0)){ad=m;break}a[t]=0;ad=m-1|0}else{ad=m}}while(0);y=o+12|0;if((y|0)==(g|0)){N=ad;O=W;break}else{m=ad;t=t+1|0;o=y}}}}while(0);v=v+1|0;A=N;u=O}if((E|0)==5){O=bS(-1,-1)|0;ae=M;af=O}else if((E|0)==6){O=bS(-1,-1)|0;ae=M;af=O}else if((E|0)==82){do{if((F|0)==0){ag=1;E=89}else{O=c[F+12>>2]|0;if((O|0)==(c[F+16>>2]|0)){u=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(!z){ah=u}else{z=0;break}}else{ah=c[O>>2]|0}if((ah|0)==-1){c[w>>2]=0;ag=1;E=89;break}else{ag=(c[w>>2]|0)==0;E=89;break}}}while(0);L120:do{if((E|0)==89){do{if(J){E=95}else{w=c[G+12>>2]|0;if((w|0)==(c[G+16>>2]|0)){ah=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){ai=ah}else{z=0;break L120}}else{ai=c[w>>2]|0}if((ai|0)==-1){c[b>>2]=0;E=95;break}else{if(ag^(G|0)==0){break}else{E=97;break}}}}while(0);if((E|0)==95){if(ag){E=97}}if((E|0)==97){c[j>>2]=c[j>>2]|2}L136:do{if(n){E=102}else{w=f;ah=p;while(1){if((a[ah]|0)==2){aj=w;break L136}F=w+12|0;if((F|0)==(g|0)){E=102;break L136}w=F;ah=ah+1|0}}}while(0);if((E|0)==102){c[j>>2]=c[j>>2]|4;aj=g}if((q|0)==0){i=l;return aj|0}KZ(q);i=l;return aj|0}}while(0);aj=bS(-1,-1)|0;ae=M;af=aj}if((q|0)==0){r=ae;s=af;bg(s|0)}KZ(q);r=ae;s=af;bg(s|0);return 0}function FL(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FM(a,0,j,k,f,g,h);i=b;return}function FM(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==8){v=16}else if((u|0)==0){v=0}else{v=10}u=l|0;F6(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F2($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DN(o);DN(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(40,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DN(o);DN(n);bg(ab|0)}function FN(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FO(a,0,j,k,f,g,h);i=b;return}function FO(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F6(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F2($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DN(o);DN(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(4,S|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HY(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{G=c[H+12>>2]|0;if((G|0)==(c[H+16>>2]|0)){F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=F}else{z=0;break L6}}else{ae=c[G>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){G=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=G}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DN(o);DN(n);bg(ab|0)}function FP(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FQ(a,0,j,k,f,g,h);i=b;return}function FQ(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0;f=i;i=i+144|0;m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=f|0;n=f+104|0;o=f+112|0;p=f+128|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=c[j+4>>2]&74;if((v|0)==64){w=8}else if((v|0)==8){w=16}else if((v|0)==0){w=0}else{w=10}v=m|0;F6(o,j,v,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L6:do{if(!z){if((a[q]&1)==0){m=j+1|0;x=m;y=m;A=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;A=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;B=g|0;C=h|0;D=p|0;E=p+4|0;F=c[n>>2]|0;G=x;H=c[B>>2]|0;L12:while(1){do{if((H|0)==0){I=0}else{J=c[H+12>>2]|0;if((J|0)==(c[H+16>>2]|0)){K=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){L=K}else{z=0;N=35;break L12}}else{L=c[J>>2]|0}if((L|0)!=-1){I=H;break}c[B>>2]=0;I=0}}while(0);O=(I|0)==0;J=c[C>>2]|0;do{if((J|0)==0){N=22}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){P=(z=0,au(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(!z){Q=P}else{z=0;N=35;break L12}}else{Q=c[K>>2]|0}if((Q|0)==-1){c[C>>2]=0;N=22;break}else{K=(J|0)==0;if(O^K){R=J;S=K;break}else{T=G;U=J;V=K;break L12}}}}while(0);if((N|0)==22){N=0;if(O){T=G;U=0;V=1;break}else{R=0;S=1}}J=d[q]|0;K=(J&1|0)==0;if(((c[r>>2]|0)-G|0)==((K?J>>>1:c[E>>2]|0)|0)){if(K){W=J>>>1;X=J>>>1}else{J=c[E>>2]|0;W=J;X=J}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;N=35;break}if((a[q]&1)==0){Y=10}else{Y=(c[D>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;N=35;break}if((a[q]&1)==0){Z=y}else{Z=c[A>>2]|0}c[r>>2]=Z+X;_=Z}else{_=G}J=I+12|0;K=c[J>>2]|0;P=I+16|0;if((K|0)==(c[P>>2]|0)){$=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){aa=$}else{z=0;N=35;break}}else{aa=c[K>>2]|0}if((F2(aa,w,_,r,u,F,o,m,t,v)|0)!=0){T=_;U=R;V=S;break}K=c[J>>2]|0;if((K|0)==(c[P>>2]|0)){P=c[(c[I>>2]|0)+40>>2]|0;z=0,au(P|0,I|0)|0;if(!z){G=_;H=I;continue}else{z=0;N=35;break}}else{c[J>>2]=K+4;G=_;H=I;continue}}if((N|0)==35){H=bS(-1,-1)|0;ab=M;ac=H;DN(p);DN(o);bg(ac|0)}H=d[o]|0;if((H&1|0)==0){ad=H>>>1}else{ad=c[o+4>>2]|0}do{if((ad|0)!=0){H=c[t>>2]|0;if((H-s|0)>=160){break}G=c[u>>2]|0;c[t>>2]=H+4;c[H>>2]=G}}while(0);G=(z=0,aU(6,T|0,c[r>>2]|0,k|0,w|0)|0);if(z){z=0;break}b[l>>1]=G;HY(o,m,c[t>>2]|0,k);do{if(O){ae=0}else{G=c[I+12>>2]|0;if((G|0)==(c[I+16>>2]|0)){H=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){af=H}else{z=0;break L6}}else{af=c[G>>2]|0}if((af|0)!=-1){ae=I;break}c[B>>2]=0;ae=0}}while(0);B=(ae|0)==0;do{if(V){N=64}else{m=c[U+12>>2]|0;if((m|0)==(c[U+16>>2]|0)){G=(z=0,au(c[(c[U>>2]|0)+36>>2]|0,U|0)|0);if(!z){ag=G}else{z=0;break L6}}else{ag=c[m>>2]|0}if((ag|0)==-1){c[C>>2]=0;N=64;break}if(!(B^(U|0)==0)){break}ah=e|0;c[ah>>2]=ae;DN(p);DN(o);i=f;return}}while(0);do{if((N|0)==64){if(B){break}ah=e|0;c[ah>>2]=ae;DN(p);DN(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;ah=e|0;c[ah>>2]=ae;DN(p);DN(o);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;ab=M;ac=f;DN(p);DN(o);bg(ac|0)}function FR(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FS(a,0,j,k,f,g,h);i=b;return}function FS(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F6(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F2($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DN(o);DN(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(2,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DN(o);DN(n);bg(ab|0)}function FT(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FU(a,0,j,k,f,g,h);i=b;return}function FU(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==8){v=16}else if((u|0)==0){v=0}else{v=10}u=l|0;F6(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F2($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DN(o);DN(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(28,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HY(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DN(o);DN(n);bg(ab|0)}function FV(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FW(a,0,j,k,f,g,h);i=b;return}function FW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F6(n,h,u,m);Lg(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F2($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DN(o);DN(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(22,S|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HY(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{G=c[H+12>>2]|0;if((G|0)==(c[H+16>>2]|0)){F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=F}else{z=0;break L6}}else{ae=c[G>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){G=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=G}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DN(o);DN(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DN(o);DN(n);bg(ab|0)}function FX(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FY(a,0,j,k,f,g,h);i=b;return}function FY(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F7(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=h|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F8(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DN(p);DN(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aF(2,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}g[l>>2]=ah;HY(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DN(p);DN(o);bg(af|0)}function FZ(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];F_(a,0,j,k,f,g,h);i=b;return}function F_(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F7(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F8(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DN(p);DN(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aN(4,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=ah;HY(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DN(p);DN(o);bg(af|0)}function F$(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];F0(a,0,j,k,f,g,h);i=b;return}function F0(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F7(o,j,x,m,n);Lg(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F8(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DN(p);DN(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aN(2,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=ah;HY(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DN(p);DN(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DN(p);DN(o);bg(af|0)}function F1(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;e=i;i=i+136|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+120|0;o=i;i=i+4|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;Lg(n|0,0,12)|0;u=p;z=0;as(346,o|0,h|0);if(z){z=0;h=bS(-1,-1)|0;v=M;w=h;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}h=o|0;o=c[h>>2]|0;if((c[10218]|0)==-1){C=4}else{c[l>>2]=40872;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40872,l|0,518);if(!z){C=4}else{z=0}}L7:do{if((C|0)==4){l=(c[10219]|0)-1|0;D=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=m|0;H=c[(c[E>>2]|0)+48>>2]|0;z=0,aU(H|0,F|0,31872,31898,G|0)|0;if(z){z=0;break L7}Dl(c[h>>2]|0)|0;Lg(u|0,0,12)|0;F=p;z=0;aR(82,p|0,10,0);L13:do{if(!z){if((a[u]&1)==0){H=F+1|0;I=H;J=H;K=p+8|0}else{H=p+8|0;I=c[H>>2]|0;J=F+1|0;K=H}c[q>>2]=I;H=r|0;c[s>>2]=H;c[t>>2]=0;E=f|0;L=g|0;N=p|0;O=p+4|0;P=I;Q=c[E>>2]|0;L19:while(1){do{if((Q|0)==0){R=0}else{S=c[Q+12>>2]|0;if((S|0)==(c[Q+16>>2]|0)){T=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){U=T}else{z=0;C=41;break L19}}else{U=c[S>>2]|0}if((U|0)!=-1){R=Q;break}c[E>>2]=0;R=0}}while(0);S=(R|0)==0;T=c[L>>2]|0;do{if((T|0)==0){C=26}else{V=c[T+12>>2]|0;if((V|0)==(c[T+16>>2]|0)){W=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){X=W}else{z=0;C=41;break L19}}else{X=c[V>>2]|0}if((X|0)==-1){c[L>>2]=0;C=26;break}else{if(S^(T|0)==0){break}else{Y=P;break L19}}}}while(0);if((C|0)==26){C=0;if(S){Y=P;break}}T=d[u]|0;V=(T&1|0)==0;if(((c[q>>2]|0)-P|0)==((V?T>>>1:c[O>>2]|0)|0)){if(V){Z=T>>>1;_=T>>>1}else{T=c[O>>2]|0;Z=T;_=T}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;C=41;break}if((a[u]&1)==0){$=10}else{$=(c[N>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;C=41;break}if((a[u]&1)==0){aa=J}else{aa=c[K>>2]|0}c[q>>2]=aa+_;ab=aa}else{ab=P}T=R+12|0;V=c[T>>2]|0;W=R+16|0;if((V|0)==(c[W>>2]|0)){ac=(z=0,au(c[(c[R>>2]|0)+36>>2]|0,R|0)|0);if(!z){ad=ac}else{z=0;C=41;break}}else{ad=c[V>>2]|0}if((F2(ad,16,ab,q,t,0,n,H,s,G)|0)!=0){Y=ab;break}V=c[T>>2]|0;if((V|0)==(c[W>>2]|0)){W=c[(c[R>>2]|0)+40>>2]|0;z=0,au(W|0,R|0)|0;if(!z){P=ab;Q=R;continue}else{z=0;C=41;break}}else{c[T>>2]=V+4;P=ab;Q=R;continue}}if((C|0)==41){Q=bS(-1,-1)|0;ae=M;af=Q;break}a[Y+3|0]=0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}Q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=Q;break}else{z=0;Q=bS(-1,-1)|0;ae=M;af=Q;break L13}}}while(0);Q=(z=0,aU(18,Y|0,c[9862]|0,8184,(P=i,i=i+8|0,c[P>>2]=k,P)|0)|0);i=P;if(z){z=0;C=42;break}if((Q|0)!=1){c[j>>2]=4}Q=c[E>>2]|0;do{if((Q|0)==0){ag=0}else{P=c[Q+12>>2]|0;if((P|0)==(c[Q+16>>2]|0)){H=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){ah=H}else{z=0;C=42;break L13}}else{ah=c[P>>2]|0}if((ah|0)!=-1){ag=Q;break}c[E>>2]=0;ag=0}}while(0);E=(ag|0)==0;Q=c[L>>2]|0;do{if((Q|0)==0){C=71}else{P=c[Q+12>>2]|0;if((P|0)==(c[Q+16>>2]|0)){H=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){ai=H}else{z=0;C=42;break L13}}else{ai=c[P>>2]|0}if((ai|0)==-1){c[L>>2]=0;C=71;break}if(!(E^(Q|0)==0)){break}aj=b|0;c[aj>>2]=ag;DN(p);DN(n);i=e;return}}while(0);do{if((C|0)==71){if(E){break}aj=b|0;c[aj>>2]=ag;DN(p);DN(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;aj=b|0;c[aj>>2]=ag;DN(p);DN(n);i=e;return}else{z=0;C=42}}while(0);if((C|0)==42){G=bS(-1,-1)|0;ae=M;af=G}DN(p);v=ae;w=af;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}}while(0);l=ck(4)|0;Kz(l);z=0;aR(146,l|0,28600,100);if(z){z=0;break}}}while(0);af=bS(-1,-1)|0;ae=M;Dl(c[h>>2]|0)|0;v=ae;w=af;DN(n);x=w;y=0;A=x;B=v;bg(A|0)}function F2(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[31872+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);f=a[31872+m|0]|0;c[g>>2]=n+1;a[n]=f;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function F3(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;D6(k,d);d=k|0;k=c[d>>2]|0;if((c[10220]|0)==-1){l=3}else{c[j>>2]=40880;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40880,j|0,518);if(!z){l=3}else{z=0}}L3:do{if((l|0)==3){j=(c[10221]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>j>>>0){n=c[m+(j<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;z=0,aU(p|0,o|0,31872,31898,e|0)|0;if(z){z=0;break L3}o=c[d>>2]|0;if((c[10124]|0)!=-1){c[h>>2]=40496;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40496,h|0,518);if(z){z=0;break L3}}p=(c[10125]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=(z=0,au(c[(c[q>>2]|0)+16>>2]|0,r|0)|0);if(z){z=0;break L3}a[f]=s;z=0;as(c[(c[q>>2]|0)+20>>2]|0,b|0,r|0);if(z){z=0;break L3}Dl(c[d>>2]|0)|0;i=g;return}}while(0);p=ck(4)|0;Kz(p);z=0;aR(146,p|0,28600,100);if(z){z=0;break L3}}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;break}}}while(0);g=bS(-1,-1)|0;Dl(c[d>>2]|0)|0;bg(g|0)}function F4(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;D6(l,d);d=l|0;l=c[d>>2]|0;if((c[10220]|0)==-1){m=3}else{c[k>>2]=40880;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40880,k|0,518);if(!z){m=3}else{z=0}}L3:do{if((m|0)==3){k=(c[10221]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>k>>>0){o=c[n+(k<<2)>>2]|0;if((o|0)==0){break}p=o;q=c[(c[o>>2]|0)+32>>2]|0;z=0,aU(q|0,p|0,31872,31904,e|0)|0;if(z){z=0;break L3}p=c[d>>2]|0;if((c[10124]|0)!=-1){c[j>>2]=40496;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40496,j|0,518);if(z){z=0;break L3}}q=(c[10125]|0)-1|0;o=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-o>>2>>>0>q>>>0){r=c[o+(q<<2)>>2]|0;if((r|0)==0){break}s=r;t=r;u=(z=0,au(c[(c[t>>2]|0)+12>>2]|0,s|0)|0);if(z){z=0;break L3}a[f]=u;u=(z=0,au(c[(c[t>>2]|0)+16>>2]|0,s|0)|0);if(z){z=0;break L3}a[g]=u;z=0;as(c[(c[r>>2]|0)+20>>2]|0,b|0,s|0);if(z){z=0;break L3}Dl(c[d>>2]|0)|0;i=h;return}}while(0);q=ck(4)|0;Kz(q);z=0;aR(146,q|0,28600,100);if(z){z=0;break L3}}}while(0);k=ck(4)|0;Kz(k);z=0;aR(146,k|0,28600,100);if(z){z=0;break}}}while(0);h=bS(-1,-1)|0;Dl(c[d>>2]|0)|0;bg(h|0)}function F5(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+32|0;j=o;while(1){if((j|0)==(r|0)){s=r;break}if((a[j]|0)==b<<24>>24){s=j;break}else{j=j+1|0}}j=s-o|0;if((j|0)>31){p=-1;return p|0}o=a[31872+j|0]|0;if((j|0)==25|(j|0)==24){s=c[h>>2]|0;do{if((s|0)!=(g|0)){if((a[s-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=s+1;a[s]=o;p=0;return p|0}else if((j|0)==22|(j|0)==23){a[f]=80;s=c[h>>2]|0;c[h>>2]=s+1;a[s]=o;p=0;return p|0}else{s=a[f]|0;do{if((o&95|0)==(s<<24>>24|0)){a[f]=s|-128;if((a[e]&1)==0){break}a[e]=0;g=d[k]|0;if((g&1|0)==0){t=g>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}g=c[m>>2]|0;if((g-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=b}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=o;if((j|0)>21){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}return 0}function F6(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;D6(j,b);b=j|0;j=c[b>>2]|0;if((c[10218]|0)==-1){k=3}else{c[h>>2]=40872;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40872,h|0,518);if(!z){k=3}else{z=0}}L3:do{if((k|0)==3){h=(c[10219]|0)-1|0;l=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-l>>2>>>0>h>>>0){m=c[l+(h<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;z=0,aU(o|0,n|0,31872,31898,d|0)|0;if(z){z=0;break L3}n=c[b>>2]|0;if((c[10122]|0)!=-1){c[g>>2]=40488;c[g+4>>2]=460;c[g+8>>2]=0;z=0;aR(2,40488,g|0,518);if(z){z=0;break L3}}o=(c[10123]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=(z=0,au(c[(c[p>>2]|0)+16>>2]|0,q|0)|0);if(z){z=0;break L3}c[e>>2]=r;z=0;as(c[(c[p>>2]|0)+20>>2]|0,a|0,q|0);if(z){z=0;break L3}Dl(c[b>>2]|0)|0;i=f;return}}while(0);o=ck(4)|0;Kz(o);z=0;aR(146,o|0,28600,100);if(z){z=0;break L3}}}while(0);h=ck(4)|0;Kz(h);z=0;aR(146,h|0,28600,100);if(z){z=0;break}}}while(0);f=bS(-1,-1)|0;Dl(c[b>>2]|0)|0;bg(f|0)}function F7(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;D6(k,b);b=k|0;k=c[b>>2]|0;if((c[10218]|0)==-1){l=3}else{c[j>>2]=40872;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40872,j|0,518);if(!z){l=3}else{z=0}}L3:do{if((l|0)==3){j=(c[10219]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>j>>>0){n=c[m+(j<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+48>>2]|0;z=0,aU(p|0,o|0,31872,31904,d|0)|0;if(z){z=0;break L3}o=c[b>>2]|0;if((c[10122]|0)!=-1){c[h>>2]=40488;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40488,h|0,518);if(z){z=0;break L3}}p=(c[10123]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;t=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,r|0)|0);if(z){z=0;break L3}c[e>>2]=t;t=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,r|0)|0);if(z){z=0;break L3}c[f>>2]=t;z=0;as(c[(c[q>>2]|0)+20>>2]|0,a|0,r|0);if(z){z=0;break L3}Dl(c[b>>2]|0)|0;i=g;return}}while(0);p=ck(4)|0;Kz(p);z=0;aR(146,p|0,28600,100);if(z){z=0;break L3}}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;break}}}while(0);g=bS(-1,-1)|0;Dl(c[b>>2]|0)|0;bg(g|0)}function F8(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if((b|0)==(i|0)){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+128|0;j=o;while(1){if((j|0)==(r|0)){s=r;break}if((c[j>>2]|0)==(b|0)){s=j;break}else{j=j+4|0}}j=s-o|0;o=j>>2;if((j|0)>124){p=-1;return p|0}s=a[31872+o|0]|0;do{if((o|0)==22|(o|0)==23){a[f]=80}else if((o|0)==25|(o|0)==24){b=c[h>>2]|0;do{if((b|0)!=(g|0)){if((a[b-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=b+1;a[b]=s;p=0;return p|0}else{r=a[f]|0;if((s&95|0)!=(r<<24>>24|0)){break}a[f]=r|-128;if((a[e]&1)==0){break}a[e]=0;r=d[k]|0;if((r&1|0)==0){t=r>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}r=c[m>>2]|0;if((r-l|0)>=160){break}q=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=q}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=s;if((j|0)>84){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}function F9(a){a=a|0;Dj(a|0);K4(a);return}function Ga(a){a=a|0;Dj(a|0);return}function Gb(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cL[o&127](b,d,l,f,g,h&1);i=j;return}D6(m,f);f=m|0;m=c[f>>2]|0;if((c[10124]|0)==-1){p=5}else{c[k>>2]=40496;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40496,k|0,518);if(!z){p=5}else{z=0}}do{if((p|0)==5){k=(c[10125]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;Dl(c[f>>2]|0)|0;o=c[l>>2]|0;if(h){cA[c[o+24>>2]&1023](n,d)}else{cA[c[o+28>>2]&1023](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){q=d+1|0;r=q;s=q;t=n+8|0}else{q=n+8|0;r=c[q>>2]|0;s=d+1|0;t=q}q=e|0;d=n+4|0;u=r;v=l;L20:while(1){if((v&1)==0){w=s}else{w=c[t>>2]|0}l=v&255;if((u|0)==(w+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){p=28;break}l=a[u]|0;x=c[q>>2]|0;do{if((x|0)!=0){y=x+24|0;A=c[y>>2]|0;if((A|0)!=(c[x+28>>2]|0)){c[y>>2]=A+1;a[A]=l;break}A=(z=0,aM(c[(c[x>>2]|0)+52>>2]|0,x|0,l&255|0)|0);if(z){z=0;p=27;break L20}if((A|0)!=-1){break}c[q>>2]=0}}while(0);u=u+1|0;v=a[o]|0}if((p|0)==27){o=bS(-1,-1)|0;v=M;DN(n);B=v;C=o;D=C;E=0;F=D;G=B;bg(F|0)}else if((p|0)==28){c[b>>2]=c[q>>2];DN(n);i=j;return}}}while(0);k=ck(4)|0;Kz(k);z=0;aR(146,k|0,28600,100);if(z){z=0;break}}}while(0);j=bS(-1,-1)|0;n=M;Dl(c[f>>2]|0)|0;B=n;C=j;D=C;E=0;F=D;G=B;bg(F|0)}function Gc(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[13008]|0;a[q+1|0]=a[13009]|0;a[q+2|0]=a[13010]|0;a[q+3|0]=a[13011]|0;a[q+4|0]=a[13012]|0;a[q+5|0]=a[13013]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,12,c[9862]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else if((h|0)==32){w=q}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D6(o,f);z=0;aI(80,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Dl(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fr(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[o>>2]|0)|0;bg(d|0)}}function Gd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=b5(d|0)|0;d=b6(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}z=0,au(36,j|0)|0;if(!z){i=g;return d|0}else{z=0;bS(-1,-1,0)|0;bW();return 0}return 0}function Ge(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10220]|0)!=-1){c[n>>2]=40880;c[n+4>>2]=460;c[n+8>>2]=0;DG(40880,n,518)}n=(c[10221]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}r=k;s=c[p>>2]|0;if((c[10124]|0)!=-1){c[m>>2]=40496;c[m+4>>2]=460;c[m+8>>2]=0;DG(40496,m,518)}m=(c[10125]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L23:do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(p|0,r|0,b|0,f|0,g|0)|0;if(z){z=0;w=18;break}c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=(z=0,aM(c[(c[k>>2]|0)+28>>2]|0,r|0,p|0)|0);if(z){z=0;w=18;break}p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;x=b+1|0}else{x=b}do{if((f-x|0)>1){if((a[x]|0)!=48){y=x;break}n=x+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){y=x;break}p=k;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,48)|0);if(z){z=0;w=18;break L23}A=c[j>>2]|0;c[j>>2]=A+1;a[A]=q;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[n]|0)|0);if(z){z=0;w=18;break L23}n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;y=x+2|0}else{y=x}}while(0);do{if((y|0)!=(f|0)){q=f-1|0;if(y>>>0<q>>>0){B=y;C=q}else{break}do{q=a[B]|0;a[B]=a[C]|0;a[C]=q;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;w=18;break}L44:do{if(y>>>0<f>>>0){n=u+1|0;p=k;A=o+4|0;D=o+8|0;E=0;F=0;G=y;while(1){H=(a[m]&1)==0;do{if((a[(H?n:c[D>>2]|0)+F|0]|0)==0){I=F;J=E}else{if((E|0)!=(a[(H?n:c[D>>2]|0)+F|0]|0)){I=F;J=E;break}K=c[j>>2]|0;c[j>>2]=K+1;a[K]=q;K=d[m]|0;I=(F>>>0<(((K&1|0)==0?K>>>1:c[A>>2]|0)-1|0)>>>0)+F|0;J=0}}while(0);H=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[G]|0)|0);if(z){z=0;break}K=c[j>>2]|0;c[j>>2]=K+1;a[K]=H;H=G+1|0;if(H>>>0<f>>>0){E=J+1|0;F=I;G=H}else{break L44}}G=bS(-1,-1)|0;L=M;N=G;DN(o);bg(N|0)}}while(0);q=g+(y-b)|0;G=c[j>>2]|0;if((q|0)==(G|0)){break}F=G-1|0;if(q>>>0<F>>>0){O=q;P=F}else{break}do{F=a[O]|0;a[O]=a[P]|0;a[P]=F;O=O+1|0;P=P-1|0;}while(O>>>0<P>>>0)}}while(0);if((w|0)==18){w=bS(-1,-1)|0;L=M;N=w;DN(o);bg(N|0)}if((e|0)==(f|0)){Q=c[j>>2]|0;c[h>>2]=Q;DN(o);i=l;return}else{Q=g+(e-b)|0;c[h>>2]=Q;DN(o);i=l;return}}function Gf(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Gd(u,22,c[9862]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+v|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D6(p,f);z=0;aI(80,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Dl(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fr(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[p>>2]|0)|0;bg(d|0)}}function Gg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[13008]|0;a[q+1|0]=a[13009]|0;a[q+2|0]=a[13010]|0;a[q+3|0]=a[13011]|0;a[q+4|0]=a[13012]|0;a[q+5|0]=a[13013]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,12,c[9862]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D6(o,f);z=0;aI(80,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Dl(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fr(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[o>>2]|0)|0;bg(d|0)}}function Gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,23,c[9862]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D6(p,f);z=0;aI(80,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Dl(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fr(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[p>>2]|0)|0;bg(d|0)}}function Gi(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9862]|0;if(y){w=Gd(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Gd(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==32){Q=B}else if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KY(G<<1)|0;if((D|0)!=0){R=D;S=D;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=0;S=0;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(346,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(86,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Dl(c[q>>2]|0)|0;V=m;W=I;X=S;break}Dl(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(56,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KZ(S)}if((H|0)==0){i=d;return}KZ(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KZ(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KZ(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b5(b|0)|0;b=(z=0,az(30,a|0,d|0,g|0)|0);if(!z){if((h|0)==0){i=f;return b|0}z=0,au(36,h|0)|0;if(!z){i=f;return b|0}else{z=0;bS(-1,-1,0)|0;bW();return 0}}else{z=0;b=bS(-1,-1)|0;if((h|0)==0){bg(b|0)}z=0,au(36,h|0)|0;if(!z){bg(b|0)}else{z=0;bS(-1,-1,0)|0;bW();return 0}}return 0}function Gk(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10220]|0)!=-1){c[n>>2]=40880;c[n+4>>2]=460;c[n+8>>2]=0;DG(40880,n,518)}n=(c[10221]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}r=k;s=c[p>>2]|0;if((c[10124]|0)!=-1){c[m>>2]=40496;c[m+4>>2]=460;c[m+8>>2]=0;DG(40496,m,518)}m=(c[10125]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);c[j>>2]=g;u=a[b]|0;do{if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=(z=0,aM(c[(c[k>>2]|0)+28>>2]|0,r|0,u|0)|0);if(z){z=0;break}p=c[j>>2]|0;c[j>>2]=p+1;a[p]=m;v=b+1|0;w=20}else{v=b;w=20}}while(0);L22:do{if((w|0)==20){u=f;L24:do{if((u-v|0)>1){if((a[v]|0)!=48){x=v;w=34;break}m=v+1|0;p=a[m]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=v;w=34;break}p=k;n=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,48)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[m]|0)|0);if(z){z=0;break L22}m=c[j>>2]|0;c[j>>2]=m+1;a[m]=q;q=n;L30:while(1){if(q>>>0>=f>>>0){y=q;A=n;break L24}m=a[q]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}p=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=31;break L30}c[9862]=p}}while(0);p=(z=0,aM(164,m<<24>>24|0,c[9862]|0)|0);if(z){z=0;w=17;break}if((p|0)==0){y=q;A=n;break L24}else{q=q+1|0}}if((w|0)==31){q=bS(-1,-1)|0;B=M;C=q;DN(o);bg(C|0)}else if((w|0)==17){q=bS(-1,-1)|0;B=M;C=q;DN(o);bg(C|0)}}else{x=v;w=34}}while(0);L44:do{if((w|0)==34){L45:while(1){w=0;if(x>>>0>=f>>>0){y=x;A=v;break L44}q=a[x]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}n=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=39;break L45}c[9862]=n}}while(0);m=(z=0,aM(68,q<<24>>24|0,c[9862]|0)|0);if(z){z=0;w=16;break}if((m|0)==0){y=x;A=v;break L44}else{x=x+1|0;w=34}}if((w|0)==39){m=bS(-1,-1)|0;B=M;C=m;DN(o);bg(C|0)}else if((w|0)==16){m=bS(-1,-1)|0;B=M;C=m;DN(o);bg(C|0)}}}while(0);m=o;n=o;p=d[n]|0;if((p&1|0)==0){D=p>>>1}else{D=c[o+4>>2]|0}do{if((D|0)==0){p=c[j>>2]|0;E=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(E|0,r|0,A|0,y|0,p|0)|0;if(z){z=0;break L22}c[j>>2]=(c[j>>2]|0)+(y-A)}else{do{if((A|0)!=(y|0)){p=y-1|0;if(A>>>0<p>>>0){F=A;G=p}else{break}do{p=a[F]|0;a[F]=a[G]|0;a[G]=p;F=F+1|0;G=G-1|0;}while(F>>>0<G>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;break L22}L74:do{if(A>>>0<y>>>0){p=m+1|0;E=o+4|0;H=o+8|0;I=k;J=0;K=0;L=A;while(1){N=(a[n]&1)==0;do{if((a[(N?p:c[H>>2]|0)+K|0]|0)>0){if((J|0)!=(a[(N?p:c[H>>2]|0)+K|0]|0)){O=K;P=J;break}Q=c[j>>2]|0;c[j>>2]=Q+1;a[Q]=q;Q=d[n]|0;O=(K>>>0<(((Q&1|0)==0?Q>>>1:c[E>>2]|0)-1|0)>>>0)+K|0;P=0}else{O=K;P=J}}while(0);N=(z=0,aM(c[(c[I>>2]|0)+28>>2]|0,r|0,a[L]|0)|0);if(z){z=0;break}Q=c[j>>2]|0;c[j>>2]=Q+1;a[Q]=N;N=L+1|0;if(N>>>0<y>>>0){J=P+1|0;K=O;L=N}else{break L74}}L=bS(-1,-1)|0;B=M;C=L;DN(o);bg(C|0)}}while(0);q=g+(A-b)|0;L=c[j>>2]|0;if((q|0)==(L|0)){break}K=L-1|0;if(q>>>0<K>>>0){R=q;S=K}else{break}do{K=a[R]|0;a[R]=a[S]|0;a[S]=K;R=R+1|0;S=S-1|0;}while(R>>>0<S>>>0)}}while(0);L90:do{if(y>>>0<f>>>0){n=k;m=y;while(1){K=a[m]|0;if(K<<24>>24==46){w=65;break}q=(z=0,aM(c[(c[n>>2]|0)+28>>2]|0,r|0,K|0)|0);if(z){z=0;w=14;break}K=c[j>>2]|0;c[j>>2]=K+1;a[K]=q;q=m+1|0;if(q>>>0<f>>>0){m=q}else{T=q;break L90}}if((w|0)==14){n=bS(-1,-1)|0;B=M;C=n;DN(o);bg(C|0)}else if((w|0)==65){n=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,t|0)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;T=m+1|0;break}}else{T=y}}while(0);n=c[j>>2]|0;q=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(q|0,r|0,T|0,f|0,n|0)|0;if(z){z=0;break}n=(c[j>>2]|0)+(u-T)|0;c[j>>2]=n;if((e|0)==(f|0)){U=n;c[h>>2]=U;DN(o);i=l;return}U=g+(e-b)|0;c[h>>2]=U;DN(o);i=l;return}}while(0);l=bS(-1,-1)|0;B=M;C=l;DN(o);bg(C|0)}function Gl(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9862]|0;if(y){w=Gd(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Gd(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KY(G<<1)|0;if((D|0)!=0){R=D;S=D;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=0;S=0;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(346,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(86,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Dl(c[q>>2]|0)|0;V=m;W=I;X=S;break}Dl(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(56,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KZ(S)}if((H|0)==0){i=d;return}KZ(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KZ(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KZ(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[13016]|0;a[o+1|0]=a[13017]|0;a[o+2|0]=a[13018]|0;a[o+3|0]=a[13019]|0;a[o+4|0]=a[13020]|0;a[o+5|0]=a[13021]|0;p=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=q;break}else{z=0;q=bS(-1,-1)|0;bg(q|0)}}}while(0);q=Gd(p,20,c[9862]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==32){r=o}else if((h|0)==16){s=a[p]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&s<<24>>24==48)){t=12;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){t=12;break}r=k+2|0}else{t=12}}while(0);if((t|0)==12){r=p}D6(m,f);t=m|0;m=c[t>>2]|0;do{if((c[10220]|0)!=-1){c[j>>2]=40880;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40880,j|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}while(0);j=(c[10221]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){s=c[h+(j<<2)>>2]|0;if((s|0)==0){break}Dl(c[t>>2]|0)|0;A=l|0;c0[c[(c[s>>2]|0)+32>>2]&63](s,p,o,A)|0;s=l+q|0;if((r|0)==(o|0)){B=s;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;fr(b,n,A,B,s,f,g);i=d;return}B=l+(r-k)|0;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;fr(b,n,A,B,s,f,g);i=d;return}}while(0);d=ck(4)|0;Kz(d);z=0;aR(146,d|0,28600,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}function Gn(a){a=a|0;Dj(a|0);K4(a);return}function Go(a){a=a|0;Dj(a|0);return}function Gp(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cL[o&127](b,d,l,f,g,h&1);i=j;return}D6(m,f);f=m|0;m=c[f>>2]|0;if((c[10122]|0)==-1){p=5}else{c[k>>2]=40488;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40488,k|0,518);if(!z){p=5}else{z=0}}do{if((p|0)==5){k=(c[10123]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;Dl(c[f>>2]|0)|0;o=c[l>>2]|0;if(h){cA[c[o+24>>2]&1023](n,d)}else{cA[c[o+28>>2]&1023](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;q=l;r=l;s=n+8|0}else{l=n+8|0;q=c[l>>2]|0;r=n+4|0;s=l}l=e|0;t=q;u=o;L20:while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}o=u&255;if((o&1|0)==0){w=o>>>1}else{w=c[r>>2]|0}if((t|0)==(v+(w<<2)|0)){p=31;break}o=c[t>>2]|0;x=c[l>>2]|0;do{if((x|0)!=0){y=x+24|0;A=c[y>>2]|0;if((A|0)==(c[x+28>>2]|0)){B=(z=0,aM(c[(c[x>>2]|0)+52>>2]|0,x|0,o|0)|0);if(!z){C=B}else{z=0;p=30;break L20}}else{c[y>>2]=A+4;c[A>>2]=o;C=o}if((C|0)!=-1){break}c[l>>2]=0}}while(0);t=t+4|0;u=a[d]|0}if((p|0)==30){d=bS(-1,-1)|0;u=M;DZ(n);D=u;E=d;F=E;G=0;H=F;I=D;bg(H|0)}else if((p|0)==31){c[b>>2]=c[l>>2];DZ(n);i=j;return}}}while(0);k=ck(4)|0;Kz(k);z=0;aR(146,k|0,28600,100);if(z){z=0;break}}}while(0);j=bS(-1,-1)|0;n=M;Dl(c[f>>2]|0)|0;D=n;E=j;F=E;G=0;H=F;I=D;bg(H|0)}function Gq(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[13008]|0;a[q+1|0]=a[13009]|0;a[q+2|0]=a[13010]|0;a[q+3|0]=a[13011]|0;a[q+4|0]=a[13012]|0;a[q+5|0]=a[13013]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,12,c[9862]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D6(o,f);z=0;aI(48,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Dl(c[o>>2]|0)|0;c[p>>2]=c[e>>2];Gs(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[o>>2]|0)|0;bg(d|0)}}function Gr(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10218]|0)!=-1){c[n>>2]=40872;c[n+4>>2]=460;c[n+8>>2]=0;DG(40872,n,518)}n=(c[10219]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}r=k;s=c[p>>2]|0;if((c[10122]|0)!=-1){c[m>>2]=40488;c[m+4>>2]=460;c[m+8>>2]=0;DG(40488,m,518)}m=(c[10123]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L23:do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(p|0,r|0,b|0,f|0,g|0)|0;if(z){z=0;w=18;break}c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=(z=0,aM(c[(c[k>>2]|0)+44>>2]|0,r|0,p|0)|0);if(z){z=0;w=18;break}p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;x=b+1|0}else{x=b}do{if((f-x|0)>1){if((a[x]|0)!=48){y=x;break}n=x+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){y=x;break}p=k;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,48)|0);if(z){z=0;w=18;break L23}A=c[j>>2]|0;c[j>>2]=A+4;c[A>>2]=q;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[n]|0)|0);if(z){z=0;w=18;break L23}n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;y=x+2|0}else{y=x}}while(0);do{if((y|0)!=(f|0)){q=f-1|0;if(y>>>0<q>>>0){B=y;C=q}else{break}do{q=a[B]|0;a[B]=a[C]|0;a[C]=q;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;w=18;break}L44:do{if(y>>>0<f>>>0){n=u+1|0;p=k;A=o+4|0;D=o+8|0;E=0;F=0;G=y;while(1){H=(a[m]&1)==0;do{if((a[(H?n:c[D>>2]|0)+F|0]|0)==0){I=F;J=E}else{if((E|0)!=(a[(H?n:c[D>>2]|0)+F|0]|0)){I=F;J=E;break}K=c[j>>2]|0;c[j>>2]=K+4;c[K>>2]=q;K=d[m]|0;I=(F>>>0<(((K&1|0)==0?K>>>1:c[A>>2]|0)-1|0)>>>0)+F|0;J=0}}while(0);H=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[G]|0)|0);if(z){z=0;break}K=c[j>>2]|0;c[j>>2]=K+4;c[K>>2]=H;H=G+1|0;if(H>>>0<f>>>0){E=J+1|0;F=I;G=H}else{break L44}}G=bS(-1,-1)|0;L=M;N=G;DN(o);bg(N|0)}}while(0);q=g+(y-b<<2)|0;G=c[j>>2]|0;if((q|0)==(G|0)){break}F=G-4|0;if(q>>>0<F>>>0){O=q;P=F}else{break}do{F=c[O>>2]|0;c[O>>2]=c[P>>2];c[P>>2]=F;O=O+4|0;P=P-4|0;}while(O>>>0<P>>>0)}}while(0);if((w|0)==18){w=bS(-1,-1)|0;L=M;N=w;DN(o);bg(N|0)}if((e|0)==(f|0)){Q=c[j>>2]|0;c[h>>2]=Q;DN(o);i=l;return}else{Q=g+(e-b<<2)|0;c[h>>2]=Q;DN(o);i=l;return}}function Gs(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cH[c[(c[d>>2]|0)+48>>2]&127](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){DY(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}g=(z=0,az(c[(c[d>>2]|0)+48>>2]|0,d|0,r|0,q|0)|0);if(z){z=0;e=bS(-1,-1)|0;DZ(l);bg(e|0)}if((g|0)==(q|0)){DZ(l);break}c[m>>2]=0;c[b>>2]=0;DZ(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cH[c[(c[d>>2]|0)+48>>2]&127](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function Gt(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,22,c[9862]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else if((j|0)==32){w=r}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D6(p,f);z=0;aI(48,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Dl(c[p>>2]|0)|0;c[q>>2]=c[e>>2];Gs(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[p>>2]|0)|0;bg(d|0)}}function Gu(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[13008]|0;a[q+1|0]=a[13009]|0;a[q+2|0]=a[13010]|0;a[q+3|0]=a[13011]|0;a[q+4|0]=a[13012]|0;a[q+5|0]=a[13013]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,12,c[9862]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else if((h|0)==32){w=q}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D6(o,f);z=0;aI(48,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Dl(c[o>>2]|0)|0;c[p>>2]=c[e>>2];Gs(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[o>>2]|0)|0;bg(d|0)}}function Gv(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Gd(u,23,c[9862]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else if((j|0)==32){w=r}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D6(p,f);z=0;aI(48,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Dl(c[p>>2]|0)|0;c[q>>2]=c[e>>2];Gs(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Dl(c[p>>2]|0)|0;bg(d|0)}}function Gw(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9862]|0;if(y){w=Gd(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Gd(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KY(G<<3)|0;u=D;if((D|0)!=0){R=u;S=u;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=u;S=u;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(346,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(70,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Dl(c[q>>2]|0)|0;V=m;W=I;X=S;break}Dl(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(52,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KZ(S)}if((H|0)==0){i=d;return}KZ(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KZ(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KZ(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gx(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10218]|0)!=-1){c[n>>2]=40872;c[n+4>>2]=460;c[n+8>>2]=0;DG(40872,n,518)}n=(c[10219]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kz(s);bJ(r|0,28600,100)}r=k;s=c[p>>2]|0;if((c[10122]|0)!=-1){c[m>>2]=40488;c[m+4>>2]=460;c[m+8>>2]=0;DG(40488,m,518)}m=(c[10123]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kz(u);bJ(t|0,28600,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);c[j>>2]=g;u=a[b]|0;do{if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=(z=0,aM(c[(c[k>>2]|0)+44>>2]|0,r|0,u|0)|0);if(z){z=0;break}p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=m;v=b+1|0;w=20}else{v=b;w=20}}while(0);L22:do{if((w|0)==20){u=f;L24:do{if((u-v|0)>1){if((a[v]|0)!=48){x=v;w=34;break}m=v+1|0;p=a[m]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=v;w=34;break}p=k;n=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,48)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[m]|0)|0);if(z){z=0;break L22}m=c[j>>2]|0;c[j>>2]=m+4;c[m>>2]=q;q=n;L30:while(1){if(q>>>0>=f>>>0){y=q;A=n;break L24}m=a[q]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}p=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=31;break L30}c[9862]=p}}while(0);p=(z=0,aM(164,m<<24>>24|0,c[9862]|0)|0);if(z){z=0;w=17;break}if((p|0)==0){y=q;A=n;break L24}else{q=q+1|0}}if((w|0)==17){q=bS(-1,-1)|0;B=M;C=q;DN(o);bg(C|0)}else if((w|0)==31){q=bS(-1,-1)|0;B=M;C=q;DN(o);bg(C|0)}}else{x=v;w=34}}while(0);L44:do{if((w|0)==34){L45:while(1){w=0;if(x>>>0>=f>>>0){y=x;A=v;break L44}q=a[x]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}n=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=39;break L45}c[9862]=n}}while(0);m=(z=0,aM(68,q<<24>>24|0,c[9862]|0)|0);if(z){z=0;w=16;break}if((m|0)==0){y=x;A=v;break L44}else{x=x+1|0;w=34}}if((w|0)==16){m=bS(-1,-1)|0;B=M;C=m;DN(o);bg(C|0)}else if((w|0)==39){m=bS(-1,-1)|0;B=M;C=m;DN(o);bg(C|0)}}}while(0);m=o;n=o;p=d[n]|0;if((p&1|0)==0){D=p>>>1}else{D=c[o+4>>2]|0}do{if((D|0)==0){p=c[j>>2]|0;E=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(E|0,r|0,A|0,y|0,p|0)|0;if(z){z=0;break L22}c[j>>2]=(c[j>>2]|0)+(y-A<<2)}else{do{if((A|0)!=(y|0)){p=y-1|0;if(A>>>0<p>>>0){F=A;G=p}else{break}do{p=a[F]|0;a[F]=a[G]|0;a[G]=p;F=F+1|0;G=G-1|0;}while(F>>>0<G>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;break L22}L72:do{if(A>>>0<y>>>0){p=m+1|0;E=o+4|0;H=o+8|0;I=k;J=0;K=0;L=A;while(1){N=(a[n]&1)==0;do{if((a[(N?p:c[H>>2]|0)+K|0]|0)>0){if((J|0)!=(a[(N?p:c[H>>2]|0)+K|0]|0)){O=K;P=J;break}Q=c[j>>2]|0;c[j>>2]=Q+4;c[Q>>2]=q;Q=d[n]|0;O=(K>>>0<(((Q&1|0)==0?Q>>>1:c[E>>2]|0)-1|0)>>>0)+K|0;P=0}else{O=K;P=J}}while(0);N=(z=0,aM(c[(c[I>>2]|0)+44>>2]|0,r|0,a[L]|0)|0);if(z){z=0;break}Q=c[j>>2]|0;c[j>>2]=Q+4;c[Q>>2]=N;N=L+1|0;if(N>>>0<y>>>0){J=P+1|0;K=O;L=N}else{break L72}}L=bS(-1,-1)|0;B=M;C=L;DN(o);bg(C|0)}}while(0);q=g+(A-b<<2)|0;L=c[j>>2]|0;if((q|0)==(L|0)){break}K=L-4|0;if(q>>>0<K>>>0){R=q;S=K}else{break}do{K=c[R>>2]|0;c[R>>2]=c[S>>2];c[S>>2]=K;R=R+4|0;S=S-4|0;}while(R>>>0<S>>>0)}}while(0);L90:do{if(y>>>0<f>>>0){n=k;m=y;while(1){K=a[m]|0;if(K<<24>>24==46){w=65;break}q=(z=0,aM(c[(c[n>>2]|0)+44>>2]|0,r|0,K|0)|0);if(z){z=0;w=14;break}K=c[j>>2]|0;c[j>>2]=K+4;c[K>>2]=q;q=m+1|0;if(q>>>0<f>>>0){m=q}else{T=q;break L90}}if((w|0)==65){n=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,t|0)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;T=m+1|0;break}else if((w|0)==14){n=bS(-1,-1)|0;B=M;C=n;DN(o);bg(C|0)}}else{T=y}}while(0);n=c[j>>2]|0;q=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(q|0,r|0,T|0,f|0,n|0)|0;if(z){z=0;break}n=(c[j>>2]|0)+(u-T<<2)|0;c[j>>2]=n;if((e|0)==(f|0)){U=n;c[h>>2]=U;DN(o);i=l;return}U=g+(e-b<<2)|0;c[h>>2]=U;DN(o);i=l;return}}while(0);l=bS(-1,-1)|0;B=M;C=l;DN(o);bg(C|0)}function Gy(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9862]|0;if(y){w=Gd(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Gd(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9862]|0,t|0,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KY(G<<3)|0;u=D;if((D|0)!=0){R=u;S=u;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=u;S=u;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(346,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(70,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Dl(c[q>>2]|0)|0;V=m;W=I;X=S;break}Dl(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(52,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KZ(S)}if((H|0)==0){i=d;return}KZ(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KZ(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KZ(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gz(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[13016]|0;a[o+1|0]=a[13017]|0;a[o+2|0]=a[13018]|0;a[o+3|0]=a[13019]|0;a[o+4|0]=a[13020]|0;a[o+5|0]=a[13021]|0;p=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=q;break}else{z=0;q=bS(-1,-1)|0;bg(q|0)}}}while(0);q=Gd(p,20,c[9862]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==32){r=o}else if((h|0)==16){s=a[p]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&s<<24>>24==48)){t=12;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){t=12;break}r=k+2|0}else{t=12}}while(0);if((t|0)==12){r=p}D6(m,f);t=m|0;m=c[t>>2]|0;do{if((c[10218]|0)!=-1){c[j>>2]=40872;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40872,j|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}while(0);j=(c[10219]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){s=c[h+(j<<2)>>2]|0;if((s|0)==0){break}Dl(c[t>>2]|0)|0;A=l|0;c0[c[(c[s>>2]|0)+48>>2]&63](s,p,o,A)|0;s=l+(q<<2)|0;if((r|0)==(o|0)){B=s;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;Gs(b,n,A,B,s,f,g);i=d;return}B=l+(r-k<<2)|0;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;Gs(b,n,A,B,s,f,g);i=d;return}}while(0);d=ck(4)|0;Kz(d);z=0;aR(146,d|0,28600,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}function GA(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;D6(p,h);t=p|0;p=c[t>>2]|0;do{if((c[10220]|0)!=-1){c[o>>2]=40880;c[o+4>>2]=460;c[o+8>>2]=0;z=0;aR(2,40880,o|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}while(0);o=(c[10221]|0)-1|0;A=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-A>>2>>>0>o>>>0){B=c[A+(o<<2)>>2]|0;if((B|0)==0){break}C=B;Dl(c[t>>2]|0)|0;c[j>>2]=0;D=f|0;L8:do{if((l|0)==(m|0)){E=67}else{F=g|0;G=B;H=B;I=B+8|0;J=e;K=r|0;L=s|0;N=q|0;O=l;P=0;L10:while(1){Q=P;while(1){if((Q|0)!=0){E=67;break L8}R=c[D>>2]|0;do{if((R|0)==0){S=0}else{if((c[R+12>>2]|0)!=(c[R+16>>2]|0)){S=R;break}if((cC[c[(c[R>>2]|0)+36>>2]&511](R)|0)!=-1){S=R;break}c[D>>2]=0;S=0}}while(0);R=(S|0)==0;T=c[F>>2]|0;L20:do{if((T|0)==0){E=20}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){if((cC[c[(c[T>>2]|0)+36>>2]&511](T)|0)!=-1){break}c[F>>2]=0;E=20;break L20}}while(0);if(R){U=T}else{E=21;break L10}}}while(0);if((E|0)==20){E=0;if(R){E=21;break L10}else{U=0}}if((cH[c[(c[G>>2]|0)+36>>2]&127](C,a[O]|0,0)|0)<<24>>24==37){E=24;break}T=a[O]|0;if(T<<24>>24>=0){V=c[I>>2]|0;if((b[V+(T<<24>>24<<1)>>1]&8192)!=0){W=O;E=35;break}}X=S+12|0;T=c[X>>2]|0;Y=S+16|0;if((T|0)==(c[Y>>2]|0)){Z=(cC[c[(c[S>>2]|0)+36>>2]&511](S)|0)&255}else{Z=a[T]|0}T=cU[c[(c[H>>2]|0)+12>>2]&1023](C,Z)|0;if(T<<24>>24==(cU[c[(c[H>>2]|0)+12>>2]&1023](C,a[O]|0)|0)<<24>>24){E=62;break}c[j>>2]=4;Q=4}L38:do{if((E|0)==24){E=0;Q=O+1|0;if((Q|0)==(m|0)){E=25;break L10}T=cH[c[(c[G>>2]|0)+36>>2]&127](C,a[Q]|0,0)|0;if((T<<24>>24|0)==69|(T<<24>>24|0)==48){_=O+2|0;if((_|0)==(m|0)){E=28;break L10}$=T;aa=cH[c[(c[G>>2]|0)+36>>2]&127](C,a[_]|0,0)|0;ab=_}else{$=0;aa=T;ab=Q}Q=c[(c[J>>2]|0)+36>>2]|0;c[K>>2]=S;c[L>>2]=U;cS[Q&7](q,e,r,s,h,j,k,aa,$);c[D>>2]=c[N>>2];ac=ab+1|0}else if((E|0)==35){while(1){E=0;Q=W+1|0;if((Q|0)==(m|0)){ad=m;break}T=a[Q]|0;if(T<<24>>24<0){ad=Q;break}if((b[V+(T<<24>>24<<1)>>1]&8192)==0){ad=Q;break}else{W=Q;E=35}}R=S;Q=U;while(1){do{if((R|0)==0){ae=0}else{if((c[R+12>>2]|0)!=(c[R+16>>2]|0)){ae=R;break}if((cC[c[(c[R>>2]|0)+36>>2]&511](R)|0)!=-1){ae=R;break}c[D>>2]=0;ae=0}}while(0);T=(ae|0)==0;do{if((Q|0)==0){E=48}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){if(T){af=Q;break}else{ac=ad;break L38}}if((cC[c[(c[Q>>2]|0)+36>>2]&511](Q)|0)==-1){c[F>>2]=0;E=48;break}else{if(T^(Q|0)==0){af=Q;break}else{ac=ad;break L38}}}}while(0);if((E|0)==48){E=0;if(T){ac=ad;break L38}else{af=0}}_=ae+12|0;ag=c[_>>2]|0;ah=ae+16|0;if((ag|0)==(c[ah>>2]|0)){ai=(cC[c[(c[ae>>2]|0)+36>>2]&511](ae)|0)&255}else{ai=a[ag]|0}if(ai<<24>>24<0){ac=ad;break L38}if((b[(c[I>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){ac=ad;break L38}ag=c[_>>2]|0;if((ag|0)==(c[ah>>2]|0)){cC[c[(c[ae>>2]|0)+40>>2]&511](ae)|0;R=ae;Q=af;continue}else{c[_>>2]=ag+1;R=ae;Q=af;continue}}}else if((E|0)==62){E=0;Q=c[X>>2]|0;if((Q|0)==(c[Y>>2]|0)){cC[c[(c[S>>2]|0)+40>>2]&511](S)|0}else{c[X>>2]=Q+1}ac=O+1|0}}while(0);if((ac|0)==(m|0)){E=67;break L8}O=ac;P=c[j>>2]|0}if((E|0)==25){c[j>>2]=4;aj=S;break}else if((E|0)==28){c[j>>2]=4;aj=S;break}else if((E|0)==21){c[j>>2]=4;aj=S;break}}}while(0);if((E|0)==67){aj=c[D>>2]|0}C=f|0;do{if((aj|0)!=0){if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){break}if((cC[c[(c[aj>>2]|0)+36>>2]&511](aj)|0)!=-1){break}c[C>>2]=0}}while(0);D=c[C>>2]|0;B=(D|0)==0;P=g|0;O=c[P>>2]|0;L96:do{if((O|0)==0){E=77}else{do{if((c[O+12>>2]|0)==(c[O+16>>2]|0)){if((cC[c[(c[O>>2]|0)+36>>2]&511](O)|0)!=-1){break}c[P>>2]=0;E=77;break L96}}while(0);if(!B){break}ak=d|0;c[ak>>2]=D;i=n;return}}while(0);do{if((E|0)==77){if(B){break}ak=d|0;c[ak>>2]=D;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ak=d|0;c[ak>>2]=D;i=n;return}}while(0);n=ck(4)|0;Kz(n);z=0;aR(146,n|0,28600,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Dl(x)|0;bg(u|0)}}function GB(a){a=a|0;Dj(a|0);K4(a);return}function GC(a){a=a|0;Dj(a|0);return}function GD(a){a=a|0;return 2}function GE(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];GA(a,b,k,l,f,g,h,13e3,13008);i=j;return}function GF(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cC[c[(c[n>>2]|0)+20>>2]&511](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}GA(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function GG(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D6(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}while(0);l=(c[10221]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Dl(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[c[v>>2]>>2]&511](v)|0;c[k>>2]=u;u=(Fl(d,k,w,w+168|0,t,g,0)|0)-w|0;if((u|0)>=168){x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}c[h+24>>2]=((u|0)/12|0|0)%7|0;x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}function GH(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D6(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}while(0);l=(c[10221]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Dl(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[(c[v>>2]|0)+4>>2]&511](v)|0;c[k>>2]=u;u=(Fl(d,k,w,w+288|0,t,g,0)|0)-w|0;if((u|0)>=288){x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}c[h+16>>2]=((u|0)/12|0|0)%12|0;x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}function GI(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;D6(l,f);f=l|0;l=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[k>>2]=40880;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40880,k|0,518);if(!z){break}else{z=0}m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Dl(p)|0;bg(m|0)}}while(0);k=(c[10221]|0)-1|0;r=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-r>>2>>>0>k>>>0){s=c[r+(k<<2)>>2]|0;if((s|0)==0){break}Dl(c[f>>2]|0)|0;c[j>>2]=c[e>>2];t=GN(d,j,g,s,4)|0;if((c[g>>2]&4|0)!=0){u=d|0;v=c[u>>2]|0;w=a|0;c[w>>2]=v;i=b;return}if((t|0)<69){x=t+2e3|0}else{x=(t-69|0)>>>0<31>>>0?t+1900|0:t}c[h+20>>2]=x-1900;u=d|0;v=c[u>>2]|0;w=a|0;c[w>>2]=v;i=b;return}}while(0);b=ck(4)|0;Kz(b);z=0;aR(146,b|0,28600,100);if(z){z=0;m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Dl(p)|0;bg(m|0)}}function GJ(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;N=l+208|0;O=l+216|0;P=l+224|0;Q=l+232|0;R=l+240|0;S=l+248|0;T=l+256|0;U=l+264|0;V=l+272|0;W=l+280|0;X=l+288|0;Y=l+296|0;Z=l+304|0;_=l+312|0;$=l+320|0;c[h>>2]=0;D6(A,g);aa=A|0;A=c[aa>>2]|0;do{if((c[10220]|0)!=-1){c[y>>2]=40880;c[y+4>>2]=460;c[y+8>>2]=0;z=0;aR(2,40880,y|0,518);if(!z){break}else{z=0}ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Dl(ae)|0;bg(ab|0)}}while(0);y=(c[10221]|0)-1|0;ag=c[A+8>>2]|0;do{if((c[A+12>>2]|0)-ag>>2>>>0>y>>>0){ah=c[ag+(y<<2)>>2]|0;if((ah|0)==0){break}ai=ah;Dl(c[aa>>2]|0)|0;L8:do{switch(k<<24>>24|0){case 112:{c[L>>2]=c[f>>2];GL(d,j+8|0,e,L,h,ai);break};case 114:{ah=e|0;c[O>>2]=c[ah>>2];c[P>>2]=c[f>>2];GA(N,d,O,P,g,h,j,12968,12979);c[ah>>2]=c[N>>2];break};case 82:{ah=e|0;c[R>>2]=c[ah>>2];c[S>>2]=c[f>>2];GA(Q,d,R,S,g,h,j,12960,12965);c[ah>>2]=c[Q>>2];break};case 83:{c[p>>2]=c[f>>2];ah=GN(e,p,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<61){c[j>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 97:case 65:{aj=c[f>>2]|0;ah=d+8|0;ak=cC[c[c[ah>>2]>>2]&511](ah)|0;c[x>>2]=aj;aj=(Fl(e,x,ak,ak+168|0,ai,h,0)|0)-ak|0;if((aj|0)>=168){break L8}c[j+24>>2]=((aj|0)/12|0|0)%7|0;break};case 100:case 101:{aj=j+12|0;c[v>>2]=c[f>>2];ak=GN(e,v,h,ai,2)|0;ah=c[h>>2]|0;do{if((ah&4|0)==0){if((ak-1|0)>>>0>=31>>>0){break}c[aj>>2]=ak;break L8}}while(0);c[h>>2]=ah|4;break};case 121:{c[n>>2]=c[f>>2];ak=GN(e,n,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}if((ak|0)<69){al=ak+2e3|0}else{al=(ak-69|0)>>>0<31>>>0?ak+1900|0:ak}c[j+20>>2]=al-1900;break};case 89:{c[m>>2]=c[f>>2];ak=GN(e,m,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}c[j+20>>2]=ak-1900;break};case 68:{ak=e|0;c[F>>2]=c[ak>>2];c[G>>2]=c[f>>2];GA(E,d,F,G,g,h,j,12992,13e3);c[ak>>2]=c[E>>2];break};case 70:{ak=e|0;c[I>>2]=c[ak>>2];c[J>>2]=c[f>>2];GA(H,d,I,J,g,h,j,12984,12992);c[ak>>2]=c[H>>2];break};case 72:{c[u>>2]=c[f>>2];ak=GN(e,u,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ak|0)<24){c[j+8>>2]=ak;break L8}else{c[h>>2]=aj|4;break L8}break};case 77:{c[q>>2]=c[f>>2];aj=GN(e,q,h,ai,2)|0;ak=c[h>>2]|0;if((ak&4|0)==0&(aj|0)<60){c[j+4>>2]=aj;break L8}else{c[h>>2]=ak|4;break L8}break};case 110:case 116:{c[K>>2]=c[f>>2];GK(0,e,K,h,ai);break};case 73:{ak=j+8|0;c[t>>2]=c[f>>2];aj=GN(e,t,h,ai,2)|0;am=c[h>>2]|0;do{if((am&4|0)==0){if((aj-1|0)>>>0>=12>>>0){break}c[ak>>2]=aj;break L8}}while(0);c[h>>2]=am|4;break};case 98:case 66:case 104:{aj=c[f>>2]|0;ak=d+8|0;ah=cC[c[(c[ak>>2]|0)+4>>2]&511](ak)|0;c[w>>2]=aj;aj=(Fl(e,w,ah,ah+288|0,ai,h,0)|0)-ah|0;if((aj|0)>=288){break L8}c[j+16>>2]=((aj|0)/12|0|0)%12|0;break};case 37:{c[$>>2]=c[f>>2];GM(0,e,$,h,ai);break};case 84:{aj=e|0;c[U>>2]=c[aj>>2];c[V>>2]=c[f>>2];GA(T,d,U,V,g,h,j,12952,12960);c[aj>>2]=c[T>>2];break};case 119:{c[o>>2]=c[f>>2];aj=GN(e,o,h,ai,1)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<7){c[j+24>>2]=aj;break L8}else{c[h>>2]=ah|4;break L8}break};case 120:{ah=c[(c[d>>2]|0)+20>>2]|0;c[W>>2]=c[e>>2];c[X>>2]=c[f>>2];cQ[ah&127](b,d,W,X,g,h,j);i=l;return};case 88:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+24>>2]&511](ah)|0;ah=e|0;c[Z>>2]=c[ah>>2];c[_>>2]=c[f>>2];ak=aj;an=a[aj]|0;if((an&1)==0){ao=ak+1|0;ap=ak+1|0}else{ak=c[aj+8>>2]|0;ao=ak;ap=ak}ak=an&255;if((ak&1|0)==0){aq=ak>>>1}else{aq=c[aj+4>>2]|0}GA(Y,d,Z,_,g,h,j,ap,ao+aq|0);c[ah>>2]=c[Y>>2];break};case 106:{c[s>>2]=c[f>>2];ah=GN(e,s,h,ai,3)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<366){c[j+28>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 109:{c[r>>2]=c[f>>2];aj=(GN(e,r,h,ai,2)|0)-1|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<12){c[j+16>>2]=aj;break L8}else{c[h>>2]=ah|4;break L8}break};case 99:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+12>>2]&511](ah)|0;ah=e|0;c[C>>2]=c[ah>>2];c[D>>2]=c[f>>2];ak=aj;an=a[aj]|0;if((an&1)==0){ar=ak+1|0;as=ak+1|0}else{ak=c[aj+8>>2]|0;ar=ak;as=ak}ak=an&255;if((ak&1|0)==0){at=ak>>>1}else{at=c[aj+4>>2]|0}GA(B,d,C,D,g,h,j,as,ar+at|0);c[ah>>2]=c[B>>2];break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=ck(4)|0;Kz(l);z=0;aR(146,l|0,28600,100);if(z){z=0;ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Dl(ae)|0;bg(ab|0)}}function GK(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;j=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L1:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cC[c[(c[h>>2]|0)+36>>2]&511](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L10:do{if((l|0)==0){m=12}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)!=-1){break}c[e>>2]=0;m=12;break L10}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L1}}}while(0);if((m|0)==12){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<0){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){u=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){u=o;break}if((cC[c[(c[o>>2]|0)+36>>2]&511](o)|0)==-1){c[j>>2]=0;u=0;break}else{u=c[j>>2]|0;break}}}while(0);j=(u|0)==0;do{if(q){m=31}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cC[c[(c[p>>2]|0)+36>>2]&511](p)|0)==-1){c[e>>2]=0;m=31;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==31){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function GL(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cC[c[(c[l>>2]|0)+8>>2]&511](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=Fl(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function GM(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L8:do{if((e|0)==0){k=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)!=-1){break}c[j>>2]=0;k=11;break L8}}while(0);if(d){l=e;m=0}else{k=12}}}while(0);if((k|0)==11){if(d){k=12}else{l=0;m=1}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)&255}else{n=a[e]|0}if((cH[c[(c[g>>2]|0)+36>>2]&127](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){cC[c[(c[n>>2]|0)+40>>2]&511](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=31}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)==-1){c[j>>2]=0;k=31;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==31){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function GN(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;j=i;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L8:do{if((e|0)==0){m=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)!=-1){break}c[l>>2]=0;m=11;break L8}}while(0);if(d){n=e}else{m=12}}}while(0);if((m|0)==11){if(d){m=12}else{n=0}}if((m|0)==12){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>=0){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cH[c[(c[d>>2]|0)+36>>2]&127](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;u=q;v=h;w=n}else{c[s>>2]=t+1;u=q;v=h;w=n}while(1){x=u-48|0;q=v-1|0;t=c[k>>2]|0;do{if((t|0)==0){y=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){y=t;break}if((cC[c[(c[t>>2]|0)+36>>2]&511](t)|0)==-1){c[k>>2]=0;y=0;break}else{y=c[k>>2]|0;break}}}while(0);t=(y|0)==0;if((w|0)==0){z=y;A=0}else{do{if((c[w+12>>2]|0)==(c[w+16>>2]|0)){if((cC[c[(c[w>>2]|0)+36>>2]&511](w)|0)!=-1){B=w;break}c[l>>2]=0;B=0}else{B=w}}while(0);z=c[k>>2]|0;A=B}C=(A|0)==0;if(!((t^C)&(q|0)>0)){m=41;break}s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){D=(cC[c[(c[z>>2]|0)+36>>2]&511](z)|0)&255}else{D=a[s]|0}if(D<<24>>24<0){o=x;m=57;break}if((b[(c[e>>2]|0)+(D<<24>>24<<1)>>1]&2048)==0){o=x;m=58;break}s=((cH[c[(c[d>>2]|0)+36>>2]&127](g,D,0)|0)<<24>>24)+(x*10|0)|0;r=c[k>>2]|0;E=r+12|0;F=c[E>>2]|0;if((F|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;u=s;v=q;w=A;continue}else{c[E>>2]=F+1;u=s;v=q;w=A;continue}}if((m|0)==57){i=j;return o|0}else if((m|0)==58){i=j;return o|0}else if((m|0)==41){do{if((z|0)==0){G=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){G=z;break}if((cC[c[(c[z>>2]|0)+36>>2]&511](z)|0)==-1){c[k>>2]=0;G=0;break}else{G=c[k>>2]|0;break}}}while(0);d=(G|0)==0;L67:do{if(C){m=51}else{do{if((c[A+12>>2]|0)==(c[A+16>>2]|0)){if((cC[c[(c[A>>2]|0)+36>>2]&511](A)|0)!=-1){break}c[l>>2]=0;m=51;break L67}}while(0);if(d){o=x}else{break}i=j;return o|0}}while(0);do{if((m|0)==51){if(d){break}else{o=x}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=x;i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function GO(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;D6(n,f);r=n|0;n=c[r>>2]|0;do{if((c[10218]|0)!=-1){c[m>>2]=40872;c[m+4>>2]=460;c[m+8>>2]=0;z=0;aR(2,40872,m|0,518);if(!z){break}else{z=0}s=bS(-1,-1)|0;t=M;u=c[r>>2]|0;v=u|0;w=Dl(v)|0;bg(s|0)}}while(0);m=(c[10219]|0)-1|0;x=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-x>>2>>>0>m>>>0){y=c[x+(m<<2)>>2]|0;if((y|0)==0){break}A=y;Dl(c[r>>2]|0)|0;c[g>>2]=0;B=d|0;L8:do{if((j|0)==(k|0)){C=71}else{D=e|0;E=y;F=y;G=y;H=b;I=p|0;J=q|0;K=o|0;L=j;N=0;L10:while(1){O=N;while(1){if((O|0)!=0){C=71;break L8}P=c[B>>2]|0;do{if((P|0)==0){Q=0}else{R=c[P+12>>2]|0;if((R|0)==(c[P+16>>2]|0)){S=cC[c[(c[P>>2]|0)+36>>2]&511](P)|0}else{S=c[R>>2]|0}if((S|0)!=-1){Q=P;break}c[B>>2]=0;Q=0}}while(0);P=(Q|0)==0;R=c[D>>2]|0;do{if((R|0)==0){C=23}else{T=c[R+12>>2]|0;if((T|0)==(c[R+16>>2]|0)){U=cC[c[(c[R>>2]|0)+36>>2]&511](R)|0}else{U=c[T>>2]|0}if((U|0)==-1){c[D>>2]=0;C=23;break}else{if(P^(R|0)==0){V=R;break}else{C=25;break L10}}}}while(0);if((C|0)==23){C=0;if(P){C=25;break L10}else{V=0}}if((cH[c[(c[E>>2]|0)+52>>2]&127](A,c[L>>2]|0,0)|0)<<24>>24==37){C=28;break}if(cH[c[(c[F>>2]|0)+12>>2]&127](A,8192,c[L>>2]|0)|0){W=L;C=38;break}X=Q+12|0;R=c[X>>2]|0;Y=Q+16|0;if((R|0)==(c[Y>>2]|0)){Z=cC[c[(c[Q>>2]|0)+36>>2]&511](Q)|0}else{Z=c[R>>2]|0}R=cU[c[(c[G>>2]|0)+28>>2]&1023](A,Z)|0;if((R|0)==(cU[c[(c[G>>2]|0)+28>>2]&1023](A,c[L>>2]|0)|0)){C=66;break}c[g>>2]=4;O=4}L42:do{if((C|0)==38){while(1){C=0;O=W+4|0;if((O|0)==(k|0)){_=k;break}if(cH[c[(c[F>>2]|0)+12>>2]&127](A,8192,c[O>>2]|0)|0){W=O;C=38}else{_=O;break}}P=Q;O=V;while(1){do{if((P|0)==0){$=0}else{R=c[P+12>>2]|0;if((R|0)==(c[P+16>>2]|0)){aa=cC[c[(c[P>>2]|0)+36>>2]&511](P)|0}else{aa=c[R>>2]|0}if((aa|0)!=-1){$=P;break}c[B>>2]=0;$=0}}while(0);R=($|0)==0;do{if((O|0)==0){C=53}else{T=c[O+12>>2]|0;if((T|0)==(c[O+16>>2]|0)){ab=cC[c[(c[O>>2]|0)+36>>2]&511](O)|0}else{ab=c[T>>2]|0}if((ab|0)==-1){c[D>>2]=0;C=53;break}else{if(R^(O|0)==0){ac=O;break}else{ad=_;break L42}}}}while(0);if((C|0)==53){C=0;if(R){ad=_;break L42}else{ac=0}}T=$+12|0;ae=c[T>>2]|0;af=$+16|0;if((ae|0)==(c[af>>2]|0)){ag=cC[c[(c[$>>2]|0)+36>>2]&511]($)|0}else{ag=c[ae>>2]|0}if(!(cH[c[(c[F>>2]|0)+12>>2]&127](A,8192,ag)|0)){ad=_;break L42}ae=c[T>>2]|0;if((ae|0)==(c[af>>2]|0)){cC[c[(c[$>>2]|0)+40>>2]&511]($)|0;P=$;O=ac;continue}else{c[T>>2]=ae+4;P=$;O=ac;continue}}}else if((C|0)==28){C=0;O=L+4|0;if((O|0)==(k|0)){C=29;break L10}P=cH[c[(c[E>>2]|0)+52>>2]&127](A,c[O>>2]|0,0)|0;if((P<<24>>24|0)==69|(P<<24>>24|0)==48){ae=L+8|0;if((ae|0)==(k|0)){C=32;break L10}ah=P;ai=cH[c[(c[E>>2]|0)+52>>2]&127](A,c[ae>>2]|0,0)|0;aj=ae}else{ah=0;ai=P;aj=O}O=c[(c[H>>2]|0)+36>>2]|0;c[I>>2]=Q;c[J>>2]=V;cS[O&7](o,b,p,q,f,g,h,ai,ah);c[B>>2]=c[K>>2];ad=aj+4|0}else if((C|0)==66){C=0;O=c[X>>2]|0;if((O|0)==(c[Y>>2]|0)){cC[c[(c[Q>>2]|0)+40>>2]&511](Q)|0}else{c[X>>2]=O+4}ad=L+4|0}}while(0);if((ad|0)==(k|0)){C=71;break L8}L=ad;N=c[g>>2]|0}if((C|0)==32){c[g>>2]=4;ak=Q;break}else if((C|0)==29){c[g>>2]=4;ak=Q;break}else if((C|0)==25){c[g>>2]=4;ak=Q;break}}}while(0);if((C|0)==71){ak=c[B>>2]|0}A=d|0;do{if((ak|0)!=0){y=c[ak+12>>2]|0;if((y|0)==(c[ak+16>>2]|0)){al=cC[c[(c[ak>>2]|0)+36>>2]&511](ak)|0}else{al=c[y>>2]|0}if((al|0)!=-1){break}c[A>>2]=0}}while(0);B=c[A>>2]|0;y=(B|0)==0;N=e|0;L=c[N>>2]|0;do{if((L|0)==0){C=84}else{K=c[L+12>>2]|0;if((K|0)==(c[L+16>>2]|0)){am=cC[c[(c[L>>2]|0)+36>>2]&511](L)|0}else{am=c[K>>2]|0}if((am|0)==-1){c[N>>2]=0;C=84;break}if(!(y^(L|0)==0)){break}an=a|0;c[an>>2]=B;i=l;return}}while(0);do{if((C|0)==84){if(y){break}an=a|0;c[an>>2]=B;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;an=a|0;c[an>>2]=B;i=l;return}}while(0);l=ck(4)|0;Kz(l);z=0;aR(146,l|0,28600,100);if(z){z=0;s=bS(-1,-1)|0;t=M;u=c[r>>2]|0;v=u|0;w=Dl(v)|0;bg(s|0)}}function GP(a){a=a|0;Dj(a|0);K4(a);return}function GQ(a){a=a|0;Dj(a|0);return}function GR(a){a=a|0;return 2}function GS(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];GO(a,b,k,l,f,g,h,12920,12952);i=j;return}function GT(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cC[c[(c[n>>2]|0)+20>>2]&511](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}GO(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function GU(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D6(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10218]|0)!=-1){c[l>>2]=40872;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40872,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}while(0);l=(c[10219]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Dl(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[c[v>>2]>>2]&511](v)|0;c[k>>2]=u;u=(FK(d,k,w,w+168|0,t,g,0)|0)-w|0;if((u|0)>=168){x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}c[h+24>>2]=((u|0)/12|0|0)%7|0;x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}function GV(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D6(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10218]|0)!=-1){c[l>>2]=40872;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40872,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}while(0);l=(c[10219]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Dl(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[(c[v>>2]|0)+4>>2]&511](v)|0;c[k>>2]=u;u=(FK(d,k,w,w+288|0,t,g,0)|0)-w|0;if((u|0)>=288){x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}c[h+16>>2]=((u|0)/12|0|0)%12|0;x=d|0;y=c[x>>2]|0;A=a|0;c[A>>2]=y;i=j;return}}while(0);j=ck(4)|0;Kz(j);z=0;aR(146,j|0,28600,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Dl(q)|0;bg(n|0)}}function GW(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;D6(l,f);f=l|0;l=c[f>>2]|0;do{if((c[10218]|0)!=-1){c[k>>2]=40872;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40872,k|0,518);if(!z){break}else{z=0}m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Dl(p)|0;bg(m|0)}}while(0);k=(c[10219]|0)-1|0;r=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-r>>2>>>0>k>>>0){s=c[r+(k<<2)>>2]|0;if((s|0)==0){break}Dl(c[f>>2]|0)|0;c[j>>2]=c[e>>2];t=G$(d,j,g,s,4)|0;if((c[g>>2]&4|0)!=0){u=d|0;v=c[u>>2]|0;w=a|0;c[w>>2]=v;i=b;return}if((t|0)<69){x=t+2e3|0}else{x=(t-69|0)>>>0<31>>>0?t+1900|0:t}c[h+20>>2]=x-1900;u=d|0;v=c[u>>2]|0;w=a|0;c[w>>2]=v;i=b;return}}while(0);b=ck(4)|0;Kz(b);z=0;aR(146,b|0,28600,100);if(z){z=0;m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Dl(p)|0;bg(m|0)}}function GX(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;N=l+208|0;O=l+216|0;P=l+224|0;Q=l+232|0;R=l+240|0;S=l+248|0;T=l+256|0;U=l+264|0;V=l+272|0;W=l+280|0;X=l+288|0;Y=l+296|0;Z=l+304|0;_=l+312|0;$=l+320|0;c[h>>2]=0;D6(A,g);aa=A|0;A=c[aa>>2]|0;do{if((c[10218]|0)!=-1){c[y>>2]=40872;c[y+4>>2]=460;c[y+8>>2]=0;z=0;aR(2,40872,y|0,518);if(!z){break}else{z=0}ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Dl(ae)|0;bg(ab|0)}}while(0);y=(c[10219]|0)-1|0;ag=c[A+8>>2]|0;do{if((c[A+12>>2]|0)-ag>>2>>>0>y>>>0){ah=c[ag+(y<<2)>>2]|0;if((ah|0)==0){break}ai=ah;Dl(c[aa>>2]|0)|0;L8:do{switch(k<<24>>24|0){case 68:{ah=e|0;c[F>>2]=c[ah>>2];c[G>>2]=c[f>>2];GO(E,d,F,G,g,h,j,12888,12920);c[ah>>2]=c[E>>2];break};case 70:{ah=e|0;c[I>>2]=c[ah>>2];c[J>>2]=c[f>>2];GO(H,d,I,J,g,h,j,12752,12784);c[ah>>2]=c[H>>2];break};case 72:{c[u>>2]=c[f>>2];ah=G$(e,u,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<24){c[j+8>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 84:{aj=e|0;c[U>>2]=c[aj>>2];c[V>>2]=c[f>>2];GO(T,d,U,V,g,h,j,12784,12816);c[aj>>2]=c[T>>2];break};case 119:{c[o>>2]=c[f>>2];aj=G$(e,o,h,ai,1)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<7){c[j+24>>2]=aj;break L8}else{c[h>>2]=ah|4;break L8}break};case 120:{ah=c[(c[d>>2]|0)+20>>2]|0;c[W>>2]=c[e>>2];c[X>>2]=c[f>>2];cQ[ah&127](b,d,W,X,g,h,j);i=l;return};case 88:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+24>>2]&511](ah)|0;ah=e|0;c[Z>>2]=c[ah>>2];c[_>>2]=c[f>>2];ak=a[aj]|0;if((ak&1)==0){al=aj+4|0;am=aj+4|0}else{an=c[aj+8>>2]|0;al=an;am=an}an=ak&255;if((an&1|0)==0){ao=an>>>1}else{ao=c[aj+4>>2]|0}GO(Y,d,Z,_,g,h,j,am,al+(ao<<2)|0);c[ah>>2]=c[Y>>2];break};case 99:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+12>>2]&511](ah)|0;ah=e|0;c[C>>2]=c[ah>>2];c[D>>2]=c[f>>2];an=a[aj]|0;if((an&1)==0){ap=aj+4|0;aq=aj+4|0}else{ak=c[aj+8>>2]|0;ap=ak;aq=ak}ak=an&255;if((ak&1|0)==0){ar=ak>>>1}else{ar=c[aj+4>>2]|0}GO(B,d,C,D,g,h,j,aq,ap+(ar<<2)|0);c[ah>>2]=c[B>>2];break};case 110:case 116:{c[K>>2]=c[f>>2];GY(0,e,K,h,ai);break};case 112:{c[L>>2]=c[f>>2];GZ(d,j+8|0,e,L,h,ai);break};case 114:{ah=e|0;c[O>>2]=c[ah>>2];c[P>>2]=c[f>>2];GO(N,d,O,P,g,h,j,12840,12884);c[ah>>2]=c[N>>2];break};case 82:{ah=e|0;c[R>>2]=c[ah>>2];c[S>>2]=c[f>>2];GO(Q,d,R,S,g,h,j,12816,12836);c[ah>>2]=c[Q>>2];break};case 83:{c[p>>2]=c[f>>2];ah=G$(e,p,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<61){c[j>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 77:{c[q>>2]=c[f>>2];aj=G$(e,q,h,ai,2)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<60){c[j+4>>2]=aj;break L8}else{c[h>>2]=ah|4;break L8}break};case 98:case 66:case 104:{ah=c[f>>2]|0;aj=d+8|0;ak=cC[c[(c[aj>>2]|0)+4>>2]&511](aj)|0;c[w>>2]=ah;ah=(FK(e,w,ak,ak+288|0,ai,h,0)|0)-ak|0;if((ah|0)>=288){break L8}c[j+16>>2]=((ah|0)/12|0|0)%12|0;break};case 73:{ah=j+8|0;c[t>>2]=c[f>>2];ak=G$(e,t,h,ai,2)|0;aj=c[h>>2]|0;do{if((aj&4|0)==0){if((ak-1|0)>>>0>=12>>>0){break}c[ah>>2]=ak;break L8}}while(0);c[h>>2]=aj|4;break};case 100:case 101:{ak=j+12|0;c[v>>2]=c[f>>2];ah=G$(e,v,h,ai,2)|0;an=c[h>>2]|0;do{if((an&4|0)==0){if((ah-1|0)>>>0>=31>>>0){break}c[ak>>2]=ah;break L8}}while(0);c[h>>2]=an|4;break};case 109:{c[r>>2]=c[f>>2];ah=(G$(e,r,h,ai,2)|0)-1|0;ak=c[h>>2]|0;if((ak&4|0)==0&(ah|0)<12){c[j+16>>2]=ah;break L8}else{c[h>>2]=ak|4;break L8}break};case 89:{c[m>>2]=c[f>>2];ak=G$(e,m,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}c[j+20>>2]=ak-1900;break};case 37:{c[$>>2]=c[f>>2];G_(0,e,$,h,ai);break};case 121:{c[n>>2]=c[f>>2];ak=G$(e,n,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}if((ak|0)<69){as=ak+2e3|0}else{as=(ak-69|0)>>>0<31>>>0?ak+1900|0:ak}c[j+20>>2]=as-1900;break};case 97:case 65:{ak=c[f>>2]|0;ah=d+8|0;aj=cC[c[c[ah>>2]>>2]&511](ah)|0;c[x>>2]=ak;ak=(FK(e,x,aj,aj+168|0,ai,h,0)|0)-aj|0;if((ak|0)>=168){break L8}c[j+24>>2]=((ak|0)/12|0|0)%7|0;break};case 106:{c[s>>2]=c[f>>2];ak=G$(e,s,h,ai,3)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ak|0)<366){c[j+28>>2]=ak;break L8}else{c[h>>2]=aj|4;break L8}break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=ck(4)|0;Kz(l);z=0;aR(146,l|0,28600,100);if(z){z=0;ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Dl(ae)|0;bg(ab|0)}}function GY(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;a=i;g=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L1:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=cC[c[(c[h>>2]|0)+36>>2]&511](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=15}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=cC[c[(c[h>>2]|0)+36>>2]&511](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=15;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L1}}}}while(0);if((m|0)==15){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=cC[c[(c[h>>2]|0)+36>>2]&511](h)|0}else{s=c[k>>2]|0}if(!(cH[c[(c[d>>2]|0)+12>>2]&127](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){cC[c[(c[k>>2]|0)+40>>2]&511](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){u=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){v=cC[c[(c[p>>2]|0)+36>>2]&511](p)|0}else{v=c[o>>2]|0}if((v|0)==-1){c[g>>2]=0;u=1;break}else{u=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=37}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){w=cC[c[(c[q>>2]|0)+36>>2]&511](q)|0}else{w=c[g>>2]|0}if((w|0)==-1){c[b>>2]=0;m=37;break}if(!(u^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==37){if(u){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function GZ(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cC[c[(c[l>>2]|0)+8>>2]&511](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=FK(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function G_(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=cC[c[(c[b>>2]|0)+36>>2]&511](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=14}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=cC[c[(c[d>>2]|0)+36>>2]&511](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=14;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=16;break}}}}while(0);if((l|0)==14){if(h){l=16}else{n=0;o=1}}if((l|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=cC[c[(c[h>>2]|0)+36>>2]&511](h)|0}else{p=c[d>>2]|0}if((cH[c[(c[f>>2]|0)+52>>2]&127](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){cC[c[(c[p>>2]|0)+40>>2]&511](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=cC[c[(c[d>>2]|0)+36>>2]&511](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=38}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=cC[c[(c[n>>2]|0)+36>>2]&511](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=38;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==38){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function G$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;g=i;h=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=cC[c[(c[a>>2]|0)+36>>2]&511](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=14}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=cC[c[(c[b>>2]|0)+36>>2]&511](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=14;break}else{if(j^(b|0)==0){o=b;break}else{m=16;break}}}}while(0);if((m|0)==14){if(j){m=16}else{o=0}}if((m|0)==16){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=cC[c[(c[j>>2]|0)+36>>2]&511](j)|0}else{q=c[b>>2]|0}b=e;if(!(cH[c[(c[b>>2]|0)+12>>2]&127](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(cH[c[(c[j>>2]|0)+52>>2]&127](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){cC[c[(c[q>>2]|0)+40>>2]&511](q)|0;r=n;s=f;t=o}else{c[a>>2]=k+4;r=n;s=f;t=o}while(1){u=r-48|0;o=s-1|0;f=c[h>>2]|0;do{if((f|0)==0){v=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){w=cC[c[(c[f>>2]|0)+36>>2]&511](f)|0}else{w=c[n>>2]|0}if((w|0)==-1){c[h>>2]=0;v=0;break}else{v=c[h>>2]|0;break}}}while(0);f=(v|0)==0;if((t|0)==0){x=v;y=0}else{n=c[t+12>>2]|0;if((n|0)==(c[t+16>>2]|0)){z=cC[c[(c[t>>2]|0)+36>>2]&511](t)|0}else{z=c[n>>2]|0}if((z|0)==-1){c[l>>2]=0;A=0}else{A=t}x=c[h>>2]|0;y=A}B=(y|0)==0;if(!((f^B)&(o|0)>0)){break}f=c[x+12>>2]|0;if((f|0)==(c[x+16>>2]|0)){C=cC[c[(c[x>>2]|0)+36>>2]&511](x)|0}else{C=c[f>>2]|0}if(!(cH[c[(c[b>>2]|0)+12>>2]&127](e,2048,C)|0)){p=u;m=68;break}f=((cH[c[(c[j>>2]|0)+52>>2]&127](e,C,0)|0)<<24>>24)+(u*10|0)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){cC[c[(c[n>>2]|0)+40>>2]&511](n)|0;r=f;s=o;t=y;continue}else{c[k>>2]=a+4;r=f;s=o;t=y;continue}}if((m|0)==68){i=g;return p|0}do{if((x|0)==0){D=1}else{t=c[x+12>>2]|0;if((t|0)==(c[x+16>>2]|0)){E=cC[c[(c[x>>2]|0)+36>>2]&511](x)|0}else{E=c[t>>2]|0}if((E|0)==-1){c[h>>2]=0;D=1;break}else{D=(c[h>>2]|0)==0;break}}}while(0);do{if(B){m=60}else{h=c[y+12>>2]|0;if((h|0)==(c[y+16>>2]|0)){F=cC[c[(c[y>>2]|0)+36>>2]&511](y)|0}else{F=c[h>>2]|0}if((F|0)==-1){c[l>>2]=0;m=60;break}if(D^(y|0)==0){p=u}else{break}i=g;return p|0}}while(0);do{if((m|0)==60){if(D){break}else{p=u}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=u;i=g;return p|0}function G0(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b;e=b+8|0;f=c[e>>2]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}g=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=g;break}else{z=0}bS(-1,-1,0)|0;bW()}}while(0);if((f|0)==(c[9862]|0)){h=b|0;Dj(h);K4(d);return}z=0;ar(590,c[e>>2]|0);if(!z){h=b|0;Dj(h);K4(d);return}else{z=0}bS(-1,-1,0)|0;bW()}function G1(b){b=b|0;var d=0,e=0,f=0,g=0;d=b+8|0;e=c[d>>2]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}f=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9862]=f;break}else{z=0}bS(-1,-1,0)|0;bW()}}while(0);if((e|0)==(c[9862]|0)){g=b|0;Dj(g);return}z=0;ar(590,c[d>>2]|0);if(!z){g=b|0;Dj(g);return}else{z=0}bS(-1,-1,0)|0;bW()}
function uv(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;d=i;i=i+96|0;e=d|0;f=d+8|0;g=d+16|0;h=d+32|0;j=d+40|0;k=d+56|0;l=d+64|0;m=d+80|0;n=b+20|0;o=yN(c[n>>2]|0)|0;do{if((o+1|0)==0|(a[o]|0)!=59){p=yN(c[n>>2]|0)|0;if(!((p+1|0)==0|(a[p]|0)!=125)){break}p=yN(c[n>>2]|0)|0;if(!((p+1|0)==0|(a[p]|0)!=123)){break}p=yN(c[n>>2]|0)|0;if(!((p+1|0)==0|(a[p]|0)!=41)){break}p=yN(c[n>>2]|0)|0;q=a[35984]|0;L6:do{if(q<<24>>24==0){r=p;s=8}else{t=p;u=35984;v=q;while(1){if((a[t]|0)!=v<<24>>24){break L6}w=t+1|0;x=u+1|0;y=a[x]|0;if(y<<24>>24==0){r=w;s=8;break}else{t=w;u=x;v=y}}}}while(0);if((s|0)==8){if((r|0)!=0){break}}q=tT(b)|0;p=yN(c[n>>2]|0)|0;if((p+1|0)==0|(a[p]|0)!=44){A=q;i=d;return A|0}p=c[b>>2]|0;v=K2(60)|0;c[h>>2]=v;u=p+4|0;t=c[u>>2]|0;if((t|0)==(c[p+8>>2]|0)){e3(p|0,h);B=c[h>>2]|0}else{if((t|0)==0){C=0}else{c[t>>2]=v;C=c[u>>2]|0}c[u>>2]=C+4;B=v}v=B;t=b+28|0;L23:do{if((a[t]&1)==0){y=m;c[y>>2]=c[t>>2];c[y+4>>2]=c[t+4>>2];c[y+8>>2]=c[t+8>>2];s=52}else{y=c[b+36>>2]|0;x=c[b+32>>2]|0;do{if(x>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(x>>>0<11>>>0){a[m]=x<<1;D=m+1|0}else{w=x+16&-16;E=(z=0,au(246,w|0)|0);if(z){z=0;break}c[m+8>>2]=E;c[m>>2]=w|1;c[m+4>>2]=x;D=E}Ld(D|0,y|0,x)|0;a[D+x|0]=0;s=52;break L23}}while(0);x=bS(-1,-1)|0;F=x;G=M}}while(0);do{if((s|0)==52){t=b+44|0;x=g;c[x>>2]=c[t>>2];c[x+4>>2]=c[t+4>>2];c[x+8>>2]=c[t+8>>2];z=0;aD(34,B|0,m|0,g|0,2,1,0);if(z){z=0;t=bS(-1,-1)|0;x=t;t=M;if((a[m]&1)==0){F=x;G=t;break}K4(c[m+8>>2]|0);F=x;G=t;break}if((a[m]&1)!=0){K4(c[m+8>>2]|0)}t=B+36|0;x=t;c[f>>2]=q;y=t+8|0;E=y;w=c[E>>2]|0;H=t+12|0;if((w|0)==(c[H>>2]|0)){fo(t+4|0,f);I=c[f>>2]|0}else{if((w|0)==0){J=0}else{c[w>>2]=q;J=c[E>>2]|0}c[y>>2]=J+4;I=q}w=t;cA[c[c[w>>2]>>2]&1023](x,I);K=yN(c[n>>2]|0)|0;L=(a[K]|0)==44?K+1|0:0;L52:do{if((L|0)!=0){N=b+48|0;O=b+40|0;P=b+52|0;Q=b+56|0;R=t+4|0;S=K;T=L;do{U=c[N>>2]|0;V=c[n>>2]|0;L56:do{if(V>>>0<T>>>0){W=V;X=0;while(1){Y=a[W]|0;if((Y<<24>>24|0)==10){Z=X+1|0}else if((Y<<24>>24|0)==0){_=X;break L56}else{Z=X}Y=W+1|0;if(Y>>>0<T>>>0){W=Y;X=Z}else{_=Z;break}}}else{_=0}}while(0);c[N>>2]=_+U;X=S;W=0;while(1){Y=X-1|0;if(Y>>>0<V>>>0){break}if((a[Y]|0)==10){break}else{X=Y;W=W+1|0}}if((_|0)!=0){c[O>>2]=1}X=c[O>>2]|0;c[P>>2]=X+W;V=T;U=S;c[O>>2]=V-U+W+X;c[Q>>2]=U;c[Q+4>>2]=V;c[n>>2]=T;if((T|0)==0){break L52}V=tT(b)|0;c[e>>2]=V;U=c[E>>2]|0;if((U|0)==(c[H>>2]|0)){fo(R,e);$=c[e>>2]|0}else{if((U|0)==0){aa=0}else{c[U>>2]=V;aa=c[E>>2]|0}c[y>>2]=aa+4;$=V}cA[c[c[w>>2]>>2]&1023](x,$);S=yN(c[n>>2]|0)|0;T=(a[S]|0)==44?S+1|0:0;}while((T|0)!=0)}}while(0);A=B;i=d;return A|0}}while(0);q=c[p>>2]|0;x=c[u>>2]|0;w=q;while(1){if((w|0)==(x|0)){ab=x;break}if((c[w>>2]|0)==(B|0)){ab=w;break}else{w=w+4|0}}w=ab-q>>2;p=q+(w+1<<2)|0;y=x-p|0;Le(q+(w<<2)|0,p|0,y|0)|0;p=q+((y>>2)+w<<2)|0;w=c[u>>2]|0;if((p|0)!=(w|0)){c[u>>2]=w+(~((w-4+(-p|0)|0)>>>2)<<2)}K4(v);ac=F;ad=G;ae=ac;af=0;ag=ae;ah=ad;bg(ag|0)}}while(0);G=c[b>>2]|0;F=K2(60)|0;c[k>>2]=F;ab=G+4|0;B=c[ab>>2]|0;if((B|0)==(c[G+8>>2]|0)){e3(G|0,k);ai=c[k>>2]|0}else{if((B|0)==0){aj=0}else{c[B>>2]=F;aj=c[ab>>2]|0}c[ab>>2]=aj+4;ai=F}F=ai;aj=b+28|0;L97:do{if((a[aj]&1)==0){B=l;c[B>>2]=c[aj>>2];c[B+4>>2]=c[aj+4>>2];c[B+8>>2]=c[aj+8>>2];s=24}else{B=c[b+36>>2]|0;k=c[b+32>>2]|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(k>>>0<11>>>0){a[l]=k<<1;ak=l+1|0}else{n=k+16&-16;$=(z=0,au(246,n|0)|0);if(z){z=0;break}c[l+8>>2]=$;c[l>>2]=n|1;c[l+4>>2]=k;ak=$}Ld(ak|0,B|0,k)|0;a[ak+k|0]=0;s=24;break L97}}while(0);k=bS(-1,-1)|0;al=k;am=M}}while(0);do{if((s|0)==24){ak=b+44|0;aj=j;c[aj>>2]=c[ak>>2];c[aj+4>>2]=c[ak+4>>2];c[aj+8>>2]=c[ak+8>>2];z=0;aD(34,ai|0,l|0,j|0,0,0,0);if(z){z=0;ak=bS(-1,-1)|0;aj=ak;ak=M;if((a[l]&1)==0){al=aj;am=ak;break}K4(c[l+8>>2]|0);al=aj;am=ak;break}ak=ai;if((a[l]&1)==0){A=ak;i=d;return A|0}K4(c[l+8>>2]|0);A=ak;i=d;return A|0}}while(0);A=c[G>>2]|0;G=c[ab>>2]|0;d=A;while(1){if((d|0)==(G|0)){an=G;break}if((c[d>>2]|0)==(ai|0)){an=d;break}else{d=d+4|0}}d=an-A>>2;an=A+(d+1<<2)|0;ai=G-an|0;Le(A+(d<<2)|0,an|0,ai|0)|0;an=A+((ai>>2)+d<<2)|0;d=c[ab>>2]|0;if((an|0)!=(d|0)){c[ab>>2]=d+(~((d-4+(-an|0)|0)>>>2)<<2)}K4(F);ac=al;ad=am;ae=ac;af=0;ag=ae;ah=ad;bg(ag|0);return 0}function uw(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+16|0;d=b|0;e=ux(a)|0;f=zJ(yN(c[a+20>>2]|0)|0)|0;if((f|0)==0){g=e;i=b;return g|0}if((yO(f)|0)!=0){g=e;i=b;return g|0}f=d|0;c[f>>2]=0;h=d+4|0;c[h>>2]=0;j=d+8|0;c[j>>2]=0;k=0;while(1){l=(z=0,au(162,a|0)|0);if(z){z=0;m=22;break}if((l|0)==0){m=28;break}l=(z=0,au(90,a|0)|0);if(z){z=0;m=22;break}if((k|0)!=(c[j>>2]|0)){if((k|0)==0){n=0}else{c[k>>2]=l;n=c[h>>2]|0}o=n+4|0;c[h>>2]=o;k=o;continue}o=c[f>>2]|0;p=k-o|0;q=p>>2;r=q+1|0;if(r>>>0>1073741823>>>0){m=12;break}if(q>>>0>536870910>>>0){s=1073741823;m=16}else{t=p>>1;u=t>>>0<r>>>0?r:t;if((u|0)==0){v=0;w=0}else{s=u;m=16}}if((m|0)==16){m=0;u=(z=0,au(246,s<<2|0)|0);if(z){z=0;m=22;break}v=u;w=s}u=v+(q<<2)|0;if((u|0)!=0){c[u>>2]=l}l=v+(r<<2)|0;r=o;Ld(v|0,r|0,p)|0;c[f>>2]=v;c[h>>2]=l;c[j>>2]=v+(w<<2);if((o|0)==0){k=l;continue}K4(r);k=l}do{if((m|0)==12){z=0;ar(154,0);if(z){z=0;m=23;break}return 0}else if((m|0)==22){k=bS(-1,-1)|0;x=M;y=k}else if((m|0)==28){k=(z=0,aU(30,a|0,e|0,d|0,1)|0);if(z){z=0;m=23;break}w=c[f>>2]|0;if((w|0)==0){g=k;i=b;return g|0}v=c[h>>2]|0;if((w|0)!=(v|0)){c[h>>2]=v+(~((v-4+(-w|0)|0)>>>2)<<2)}K4(w);g=k;i=b;return g|0}}while(0);if((m|0)==23){m=bS(-1,-1)|0;x=M;y=m}m=c[f>>2]|0;if((m|0)==0){bg(y|0)}f=c[h>>2]|0;if((m|0)!=(f|0)){c[h>>2]=f+(~((f-4+(-m|0)|0)>>>2)<<2)}K4(m);bg(y|0);return 0}function ux(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+16|0;d=b|0;e=uA(a)|0;f=zI(yN(c[a+20>>2]|0)|0)|0;if((f|0)==0){g=e;i=b;return g|0}if((yO(f)|0)!=0){g=e;i=b;return g|0}f=d|0;c[f>>2]=0;h=d+4|0;c[h>>2]=0;j=d+8|0;c[j>>2]=0;k=0;while(1){l=(z=0,au(176,a|0)|0);if(z){z=0;m=22;break}if((l|0)==0){m=28;break}l=(z=0,au(68,a|0)|0);if(z){z=0;m=22;break}if((k|0)!=(c[j>>2]|0)){if((k|0)==0){n=0}else{c[k>>2]=l;n=c[h>>2]|0}o=n+4|0;c[h>>2]=o;k=o;continue}o=c[f>>2]|0;p=k-o|0;q=p>>2;r=q+1|0;if(r>>>0>1073741823>>>0){m=12;break}if(q>>>0>536870910>>>0){s=1073741823;m=16}else{t=p>>1;u=t>>>0<r>>>0?r:t;if((u|0)==0){v=0;w=0}else{s=u;m=16}}if((m|0)==16){m=0;u=(z=0,au(246,s<<2|0)|0);if(z){z=0;m=22;break}v=u;w=s}u=v+(q<<2)|0;if((u|0)!=0){c[u>>2]=l}l=v+(r<<2)|0;r=o;Ld(v|0,r|0,p)|0;c[f>>2]=v;c[h>>2]=l;c[j>>2]=v+(w<<2);if((o|0)==0){k=l;continue}K4(r);k=l}do{if((m|0)==28){k=(z=0,aU(30,a|0,e|0,d|0,0)|0);if(z){z=0;m=23;break}w=c[f>>2]|0;if((w|0)==0){g=k;i=b;return g|0}v=c[h>>2]|0;if((w|0)!=(v|0)){c[h>>2]=v+(~((v-4+(-w|0)|0)>>>2)<<2)}K4(w);g=k;i=b;return g|0}else if((m|0)==22){k=bS(-1,-1)|0;x=M;y=k}else if((m|0)==12){z=0;ar(154,0);if(z){z=0;m=23;break}return 0}}while(0);if((m|0)==23){m=bS(-1,-1)|0;x=M;y=m}m=c[f>>2]|0;if((m|0)==0){bg(y|0)}f=c[h>>2]|0;if((m|0)!=(f|0)){c[h>>2]=f+(~((f-4+(-m|0)|0)>>>2)<<2)}K4(m);bg(y|0);return 0}function uy(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zJ(e)|0;if((f|0)==0){g=0;return g|0}h=(yO(f)|0)!=0;i=h?0:f;if((i|0)==0){g=0;return g|0}f=b+48|0;h=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L7}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[f>>2]=h+n;h=e;f=0;while(1){o=h-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{h=o;f=f+1|0}}h=b+40|0;if((n|0)!=0){c[h>>2]=1}n=c[h>>2]|0;c[b+52>>2]=n+f;j=i;o=e;c[h>>2]=j-o+f+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=i;g=i;return g|0}function uz(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;g=i;i=i+40|0;h=g|0;j=g+8|0;k=g+24|0;l=e|0;m=(c[e+4>>2]|0)-(c[l>>2]|0)>>2;if((m|0)==0){n=d;i=g;return n|0}e=b|0;o=b+28|0;p=j;q=k;r=b+44|0;s=(f|0)==11;t=j+8|0;u=b+36|0;v=b+32|0;b=j+1|0;w=j|0;x=j+4|0;y=0;A=d;while(1){B=c[e>>2]|0;d=K2(48)|0;c[h>>2]=d;C=B+4|0;D=c[C>>2]|0;if((D|0)==(c[B+8>>2]|0)){e3(B|0,h);E=c[h>>2]|0}else{if((D|0)==0){F=0}else{c[D>>2]=d;F=c[C>>2]|0}c[C>>2]=F+4;E=d}G=E;if((a[o]&1)==0){c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2]}else{d=c[u>>2]|0;D=c[v>>2]|0;if(D>>>0>4294967279>>>0){H=11;break}if(D>>>0<11>>>0){a[p]=D<<1;I=b}else{J=D+16&-16;K=(z=0,au(246,J|0)|0);if(z){z=0;H=25;break}c[t>>2]=K;c[w>>2]=J|1;c[x>>2]=D;I=K}Ld(I|0,d|0,D)|0;a[I+D|0]=0}c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];z=0;aD(12,E|0,j|0,k|0,f|0,A|0,c[(c[l>>2]|0)+(y<<2)>>2]|0);if(z){z=0;H=28;break}D=E;if((a[p]&1)!=0){K4(c[t>>2]|0)}d=c[E+40>>2]|0;do{if(s){if((a[d+28|0]&1)==0){H=35;break}if((a[(c[E+44>>2]|0)+28|0]&1)==0){H=35;break}a[E+28|0]=1}else{H=35}}while(0);if((H|0)==35){H=0;a[d+28|0]=0;a[(c[E+44>>2]|0)+28|0]=0}K=y+1|0;if(K>>>0<m>>>0){y=K;A=D}else{n=D;H=39;break}}do{if((H|0)==39){i=g;return n|0}else if((H|0)==11){z=0;ar(88,0);if(!z){return 0}else{z=0;A=bS(-1,-1)|0;L=M;N=A;H=27;break}}else if((H|0)==28){A=bS(-1,-1)|0;y=A;A=M;if((a[p]&1)==0){O=A;P=y;break}K4(c[t>>2]|0);O=A;P=y}else if((H|0)==25){y=bS(-1,-1)|0;L=M;N=y;H=27}}while(0);if((H|0)==27){O=L;P=N}N=c[B>>2]|0;B=c[C>>2]|0;L=N;while(1){if((L|0)==(B|0)){Q=B;break}if((c[L>>2]|0)==(E|0)){Q=L;break}else{L=L+4|0}}L=Q-N>>2;Q=N+(L+1<<2)|0;E=B-Q|0;Le(N+(L<<2)|0,Q|0,E|0)|0;Q=N+((E>>2)+L<<2)|0;L=c[C>>2]|0;if((Q|0)==(L|0)){K4(G);R=P;S=0;T=R;U=O;bg(T|0)}c[C>>2]=L+(~((L-4+(-Q|0)|0)>>>2)<<2);K4(G);R=P;S=0;T=R;U=O;bg(T|0);return 0}function uA(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0;d=i;i=i+40|0;e=d|0;f=d+8|0;g=d+24|0;h=uC(b)|0;j=b+20|0;do{if((zK(yN(c[j>>2]|0)|0)|0)==0){if((zL(yN(c[j>>2]|0)|0)|0)!=0){break}if((zN(yN(c[j>>2]|0)|0)|0)!=0){break}if((zM(yN(c[j>>2]|0)|0)|0)!=0){break}if((zP(yN(c[j>>2]|0)|0)|0)!=0){break}if((zO(yN(c[j>>2]|0)|0)|0)==0){k=h}else{break}i=d;return k|0}}while(0);do{if((uD(b)|0)==0){if((uE(b)|0)!=0){l=3;break}if((uF(b)|0)!=0){l=5;break}if((uG(b)|0)!=0){l=7;break}if((uH(b)|0)!=0){l=4;break}uI(b)|0;l=6}else{l=2}}while(0);j=uC(b)|0;m=c[b>>2]|0;n=K2(48)|0;c[e>>2]=n;o=m+4|0;p=c[o>>2]|0;if((p|0)==(c[m+8>>2]|0)){e3(m|0,e);q=c[e>>2]|0}else{if((p|0)==0){r=0}else{c[p>>2]=n;r=c[o>>2]|0}c[o>>2]=r+4;q=n}n=q;r=b+28|0;L23:do{if((a[r]&1)==0){p=f;c[p>>2]=c[r>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];s=28}else{p=c[b+36>>2]|0;e=c[b+32>>2]|0;do{if(e>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(e>>>0<11>>>0){a[f]=e<<1;t=f+1|0}else{u=e+16&-16;v=(z=0,au(246,u|0)|0);if(z){z=0;break}c[f+8>>2]=v;c[f>>2]=u|1;c[f+4>>2]=e;t=v}Ld(t|0,p|0,e)|0;a[t+e|0]=0;s=28;break L23}}while(0);e=bS(-1,-1)|0;w=M;x=e}}while(0);do{if((s|0)==28){t=g;b=h+16|0;c[t>>2]=c[b>>2];c[t+4>>2]=c[b+4>>2];c[t+8>>2]=c[b+8>>2];z=0;aD(12,q|0,f|0,g|0,l|0,h|0,j|0);if(z){z=0;b=bS(-1,-1)|0;t=b;b=M;if((a[f]&1)==0){w=b;x=t;break}K4(c[f+8>>2]|0);w=b;x=t;break}t=q;if((a[f]&1)==0){k=t;i=d;return k|0}K4(c[f+8>>2]|0);k=t;i=d;return k|0}}while(0);k=c[m>>2]|0;m=c[o>>2]|0;d=k;while(1){if((d|0)==(m|0)){y=m;break}if((c[d>>2]|0)==(q|0)){y=d;break}else{d=d+4|0}}d=y-k>>2;y=k+(d+1<<2)|0;q=m-y|0;Le(k+(d<<2)|0,y|0,q|0)|0;y=k+((q>>2)+d<<2)|0;d=c[o>>2]|0;if((y|0)==(d|0)){K4(n);A=x;B=0;C=A;D=w;bg(C|0)}c[o>>2]=d+(~((d-4+(-y|0)|0)>>>2)<<2);K4(n);A=x;B=0;C=A;D=w;bg(C|0);return 0}function uB(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zI(e)|0;if((f|0)==0){g=0;return g|0}h=(yO(f)|0)!=0;i=h?0:f;if((i|0)==0){g=0;return g|0}f=b+48|0;h=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L7}else{n=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[f>>2]=h+o;h=e;f=0;while(1){n=h-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{h=n;f=f+1|0}}h=b+40|0;if((o|0)!=0){c[h>>2]=1}o=c[h>>2]|0;c[b+52>>2]=o+f;j=i;n=e;c[h>>2]=j-n+f+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=i;g=i;return g|0}function uC(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+40|0;e=d|0;f=d+16|0;g=d+32|0;h=uK(b)|0;j=b+20|0;k=yN(c[j>>2]|0)|0;do{if((k+1|0)==0|(a[k]|0)!=43){l=yN(c[j>>2]|0)|0;m=(zg(l)|0)!=0;n=m?0:l;if((n|0)==0){o=h;i=d;return o|0}if((n+1|0)==0|(a[n]|0)!=45){o=h}else{break}i=d;return o|0}}while(0);k=e|0;c[k>>2]=0;n=e+4|0;c[n>>2]=0;l=e+8|0;c[l>>2]=0;m=f|0;c[m>>2]=0;p=f+4|0;c[p>>2]=0;q=f+8|0;c[q>>2]=0;r=g|0;s=g+4|0;t=b+56|0;u=b+48|0;v=b+40|0;w=b+52|0;x=t;y=0;L8:while(1){A=(z=0,au(66,c[j>>2]|0)|0);if(z){z=0;B=51;break}C=(a[A]|0)==43?A+1|0:0;if((C|0)==0){D=(z=0,au(154,b|0)|0);if(z){z=0;B=51;break}if((D|0)==0){B=57;break}}else{D=c[u>>2]|0;E=c[j>>2]|0;L15:do{if(E>>>0<C>>>0){F=E;G=0;while(1){H=a[F]|0;if((H<<24>>24|0)==10){I=G+1|0}else if((H<<24>>24|0)==0){J=G;break L15}else{I=G}H=F+1|0;if(H>>>0<C>>>0){F=H;G=I}else{J=I;break}}}else{J=0}}while(0);c[u>>2]=J+D;G=A;F=0;while(1){H=G-1|0;if(H>>>0<E>>>0){break}if((a[H]|0)==10){break}else{G=H;F=F+1|0}}if((J|0)!=0){c[v>>2]=1}G=c[v>>2]|0;c[w>>2]=G+F;E=C;D=A;c[v>>2]=E-D+F+G;c[x>>2]=D;c[x+4>>2]=E;c[j>>2]=C}c[r>>2]=5608;c[s>>2]=5609;E=(z=0,aM(492,t|0,g|0)|0);if(z){z=0;B=51;break}D=E?8:9;do{if((y|0)==(c[q>>2]|0)){E=c[m>>2]|0;G=y-E|0;H=G>>2;K=H+1|0;if(K>>>0>1073741823>>>0){B=25;break L8}if(H>>>0>536870910>>>0){L=1073741823;B=29}else{N=G>>1;O=N>>>0<K>>>0?K:N;if((O|0)==0){P=0;Q=0}else{L=O;B=29}}if((B|0)==29){B=0;O=(z=0,au(246,L<<2|0)|0);if(z){z=0;B=51;break L8}P=O;Q=L}O=P+(H<<2)|0;if((O|0)!=0){c[O>>2]=D}O=P+(K<<2)|0;K=E;Ld(P|0,K|0,G)|0;c[m>>2]=P;c[p>>2]=O;c[q>>2]=P+(Q<<2);if((E|0)==0){R=O;break}K4(K);R=O}else{if((y|0)==0){S=0}else{c[y>>2]=D;S=c[p>>2]|0}O=S+4|0;c[p>>2]=O;R=O}}while(0);D=(z=0,au(308,b|0)|0);if(z){z=0;B=51;break}C=c[n>>2]|0;if((C|0)!=(c[l>>2]|0)){if((C|0)!=0){c[C>>2]=D}c[n>>2]=C+4;y=R;continue}F=c[k>>2]|0;A=C-F|0;C=A>>2;O=C+1|0;if(O>>>0>1073741823>>>0){B=41;break}if(C>>>0>536870910>>>0){T=1073741823;B=45}else{K=A>>1;E=K>>>0<O>>>0?O:K;if((E|0)==0){U=0;V=0}else{T=E;B=45}}if((B|0)==45){B=0;E=(z=0,au(246,T<<2|0)|0);if(z){z=0;B=51;break}U=E;V=T}E=U+(C<<2)|0;if((E|0)!=0){c[E>>2]=D}D=F;Ld(U|0,D|0,A)|0;c[k>>2]=U;c[n>>2]=U+(O<<2);c[l>>2]=U+(V<<2);if((F|0)==0){y=R;continue}K4(D);y=R}do{if((B|0)==57){R=(z=0,aU(46,b|0,h|0,e|0,f|0)|0);if(z){z=0;B=52;break}y=c[m>>2]|0;V=y;if((y|0)!=0){U=c[p>>2]|0;if((y|0)!=(U|0)){c[p>>2]=U+(~((U-4+(-V|0)|0)>>>2)<<2)}K4(y)}y=c[k>>2]|0;if((y|0)==0){o=R;i=d;return o|0}V=c[n>>2]|0;if((y|0)!=(V|0)){c[n>>2]=V+(~((V-4+(-y|0)|0)>>>2)<<2)}K4(y);o=R;i=d;return o|0}else if((B|0)==51){R=bS(-1,-1)|0;W=M;X=R}else if((B|0)==41){z=0;ar(154,0);if(z){z=0;B=52;break}return 0}else if((B|0)==25){z=0;ar(154,0);if(z){z=0;B=52;break}return 0}}while(0);if((B|0)==52){B=bS(-1,-1)|0;W=M;X=B}B=c[m>>2]|0;m=B;if((B|0)!=0){W=c[p>>2]|0;if((B|0)!=(W|0)){c[p>>2]=W+(~((W-4+(-m|0)|0)>>>2)<<2)}K4(B)}B=c[k>>2]|0;if((B|0)==0){bg(X|0)}k=c[n>>2]|0;if((B|0)!=(k|0)){c[n>>2]=k+(~((k-4+(-B|0)|0)>>>2)<<2)}K4(B);bg(X|0);return 0}function uD(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zK(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uE(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zL(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uF(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zN(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uG(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zP(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uH(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zM(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uI(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zO(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uJ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=i;i=i+48|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=j+32|0;Ld(m|0,e|0,12)|0;e=k;n=l;o=b|0;p=d;if((a[p]&1)==0){c[e>>2]=c[p>>2];c[e+4>>2]=c[p+4>>2];c[e+8>>2]=c[p+8>>2]}else{p=c[d+8>>2]|0;q=c[d+4>>2]|0;if(q>>>0>4294967279>>>0){DH(0)}if(q>>>0<11>>>0){a[e]=q<<1;r=k+1|0}else{d=q+16&-16;s=K2(d)|0;c[k+8>>2]=s;c[k>>2]=d|1;c[k+4>>2]=q;r=s}Ld(r|0,p|0,q)|0;a[r+q|0]=0}c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2];z=0;aD(6,o|0,k|0,l|0,0,0,0);if(!z){if((a[e]&1)==0){t=b|0;c[t>>2]=20120;u=b+36|0;c[u>>2]=f;v=b+40|0;c[v>>2]=g;w=b+44|0;c[w>>2]=h;i=j;return}K4(c[k+8>>2]|0);t=b|0;c[t>>2]=20120;u=b+36|0;c[u>>2]=f;v=b+40|0;c[v>>2]=g;w=b+44|0;c[w>>2]=h;i=j;return}else{z=0;j=bS(-1,-1)|0;if((a[e]&1)==0){bg(j|0)}K4(c[k+8>>2]|0);bg(j|0)}}function uK(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0;d=i;i=i+48|0;e=d|0;f=d+16|0;g=d+32|0;h=d+40|0;j=uO(b)|0;k=b+20|0;l=yN(c[k>>2]|0)|0;do{if((l+1|0)==0|(a[l]|0)!=42){m=yN(c[k>>2]|0)|0;if(!((m+1|0)==0|(a[m]|0)!=47)){break}m=yN(c[k>>2]|0)|0;if((m+1|0)==0|(a[m]|0)!=37){n=j}else{break}i=d;return n|0}}while(0);l=e|0;c[l>>2]=0;m=e+4|0;c[m>>2]=0;o=e+8|0;c[o>>2]=0;p=f|0;c[p>>2]=0;q=f+4|0;c[q>>2]=0;r=f+8|0;c[r>>2]=0;s=b+48|0;t=b+40|0;u=b+52|0;v=b+56|0;w=v;x=g|0;y=g+4|0;A=h|0;B=h+4|0;C=0;L6:while(1){D=(z=0,au(66,c[k>>2]|0)|0);if(z){z=0;E=58;break}F=(a[D]|0)==42?D+1|0:0;do{if((F|0)==0){G=(z=0,au(66,c[k>>2]|0)|0);if(z){z=0;E=58;break L6}H=(a[G]|0)==47?G+1|0:0;if((H|0)!=0){I=c[s>>2]|0;J=c[k>>2]|0;L29:do{if(J>>>0<H>>>0){K=J;L=0;while(1){N=a[K]|0;if((N<<24>>24|0)==0){O=L;break L29}else if((N<<24>>24|0)==10){P=L+1|0}else{P=L}N=K+1|0;if(N>>>0<H>>>0){K=N;L=P}else{O=P;break}}}else{O=0}}while(0);c[s>>2]=O+I;L=G;K=0;while(1){N=L-1|0;if(N>>>0<J>>>0){break}if((a[N]|0)==10){break}else{L=N;K=K+1|0}}if((O|0)!=0){c[t>>2]=1}L=c[t>>2]|0;c[u>>2]=L+K;J=H;I=G;c[t>>2]=J-I+K+L;c[w>>2]=I;c[w+4>>2]=J;c[k>>2]=H;break}J=(z=0,au(66,c[k>>2]|0)|0);if(z){z=0;E=58;break L6}I=(a[J]|0)==37?J+1|0:0;if((I|0)==0){E=112;break L6}L=c[s>>2]|0;N=c[k>>2]|0;L46:do{if(N>>>0<I>>>0){Q=N;R=0;while(1){S=a[Q]|0;if((S<<24>>24|0)==10){T=R+1|0}else if((S<<24>>24|0)==0){U=R;break L46}else{T=R}S=Q+1|0;if(S>>>0<I>>>0){Q=S;R=T}else{U=T;break}}}else{U=0}}while(0);c[s>>2]=U+L;H=J;K=0;while(1){G=H-1|0;if(G>>>0<N>>>0){break}if((a[G]|0)==10){break}else{H=G;K=K+1|0}}if((U|0)!=0){c[t>>2]=1}H=c[t>>2]|0;c[u>>2]=H+K;N=I;L=J;c[t>>2]=N-L+K+H;c[w>>2]=L;c[w+4>>2]=N;c[k>>2]=I}else{N=c[s>>2]|0;L=c[k>>2]|0;L11:do{if(L>>>0<F>>>0){H=L;G=0;while(1){R=a[H]|0;if((R<<24>>24|0)==10){V=G+1|0}else if((R<<24>>24|0)==0){W=G;break L11}else{V=G}R=H+1|0;if(R>>>0<F>>>0){H=R;G=V}else{W=V;break}}}else{W=0}}while(0);c[s>>2]=W+N;I=D;K=0;while(1){J=I-1|0;if(J>>>0<L>>>0){break}if((a[J]|0)==10){break}else{I=J;K=K+1|0}}if((W|0)!=0){c[t>>2]=1}I=c[t>>2]|0;c[u>>2]=I+K;L=F;N=D;c[t>>2]=L-N+K+I;c[w>>2]=N;c[w+4>>2]=L;c[k>>2]=F}}while(0);c[x>>2]=5512;c[y>>2]=5513;F=(z=0,aM(492,v|0,g|0)|0);if(z){z=0;E=58;break}do{if(F){if((C|0)!=(c[r>>2]|0)){if((C|0)==0){X=0}else{c[C>>2]=10;X=c[q>>2]|0}D=X+4|0;c[q>>2]=D;Y=D;break}D=c[p>>2]|0;L=C-D|0;N=L>>2;I=N+1|0;if(I>>>0>1073741823>>>0){E=48;break L6}if(N>>>0>536870910>>>0){Z=1073741823;E=52}else{J=L>>1;G=J>>>0<I>>>0?I:J;if((G|0)==0){_=0;$=0}else{Z=G;E=52}}if((E|0)==52){E=0;G=(z=0,au(246,Z<<2|0)|0);if(z){z=0;E=58;break L6}_=G;$=Z}G=_+(N<<2)|0;if((G|0)!=0){c[G>>2]=10}G=_+(I<<2)|0;I=D;Ld(_|0,I|0,L)|0;c[p>>2]=_;c[q>>2]=G;c[r>>2]=_+($<<2);if((D|0)==0){Y=G;break}K4(I);Y=G}else{c[A>>2]=5472;c[B>>2]=5473;G=(z=0,aM(492,v|0,h|0)|0);if(z){z=0;E=58;break L6}I=(C|0)==(c[r>>2]|0);if(G){if(!I){if((C|0)==0){aa=0}else{c[C>>2]=11;aa=c[q>>2]|0}G=aa+4|0;c[q>>2]=G;Y=G;break}G=c[p>>2]|0;D=C-G|0;L=D>>2;N=L+1|0;if(N>>>0>1073741823>>>0){E=71;break L6}if(L>>>0>536870910>>>0){ab=1073741823;E=75}else{J=D>>1;H=J>>>0<N>>>0?N:J;if((H|0)==0){ac=0;ad=0}else{ab=H;E=75}}if((E|0)==75){E=0;H=(z=0,au(246,ab<<2|0)|0);if(z){z=0;E=58;break L6}ac=H;ad=ab}H=ac+(L<<2)|0;if((H|0)!=0){c[H>>2]=11}H=ac+(N<<2)|0;N=G;Ld(ac|0,N|0,D)|0;c[p>>2]=ac;c[q>>2]=H;c[r>>2]=ac+(ad<<2);if((G|0)==0){Y=H;break}K4(N);Y=H;break}else{if(!I){if((C|0)==0){ae=0}else{c[C>>2]=12;ae=c[q>>2]|0}I=ae+4|0;c[q>>2]=I;Y=I;break}I=c[p>>2]|0;H=C-I|0;N=H>>2;G=N+1|0;if(G>>>0>1073741823>>>0){E=86;break L6}if(N>>>0>536870910>>>0){af=1073741823;E=90}else{D=H>>1;L=D>>>0<G>>>0?G:D;if((L|0)==0){ag=0;ah=0}else{af=L;E=90}}if((E|0)==90){E=0;L=(z=0,au(246,af<<2|0)|0);if(z){z=0;E=58;break L6}ag=L;ah=af}L=ag+(N<<2)|0;if((L|0)!=0){c[L>>2]=12}L=ag+(G<<2)|0;G=I;Ld(ag|0,G|0,H)|0;c[p>>2]=ag;c[q>>2]=L;c[r>>2]=ag+(ah<<2);if((I|0)==0){Y=L;break}K4(G);Y=L;break}}}while(0);F=(z=0,au(264,b|0)|0);if(z){z=0;E=58;break}L=c[m>>2]|0;if((L|0)!=(c[o>>2]|0)){if((L|0)!=0){c[L>>2]=F}c[m>>2]=L+4;C=Y;continue}G=c[l>>2]|0;I=L-G|0;L=I>>2;H=L+1|0;if(H>>>0>1073741823>>>0){E=102;break}if(L>>>0>536870910>>>0){ai=1073741823;E=106}else{N=I>>1;D=N>>>0<H>>>0?H:N;if((D|0)==0){aj=0;ak=0}else{ai=D;E=106}}if((E|0)==106){E=0;D=(z=0,au(246,ai<<2|0)|0);if(z){z=0;E=58;break}aj=D;ak=ai}D=aj+(L<<2)|0;if((D|0)!=0){c[D>>2]=F}F=G;Ld(aj|0,F|0,I)|0;c[l>>2]=aj;c[m>>2]=aj+(H<<2);c[o>>2]=aj+(ak<<2);if((G|0)==0){C=Y;continue}K4(F);C=Y}do{if((E|0)==86){z=0;ar(154,0);if(z){z=0;E=59;break}return 0}else if((E|0)==48){z=0;ar(154,0);if(z){z=0;E=59;break}return 0}else if((E|0)==58){Y=bS(-1,-1)|0;al=M;am=Y}else if((E|0)==102){z=0;ar(154,0);if(z){z=0;E=59;break}return 0}else if((E|0)==112){Y=(z=0,aU(46,b|0,j|0,e|0,f|0)|0);if(z){z=0;E=59;break}C=c[p>>2]|0;ak=C;if((C|0)!=0){aj=c[q>>2]|0;if((C|0)!=(aj|0)){c[q>>2]=aj+(~((aj-4+(-ak|0)|0)>>>2)<<2)}K4(C)}C=c[l>>2]|0;if((C|0)==0){n=Y;i=d;return n|0}ak=c[m>>2]|0;if((C|0)!=(ak|0)){c[m>>2]=ak+(~((ak-4+(-C|0)|0)>>>2)<<2)}K4(C);n=Y;i=d;return n|0}else if((E|0)==71){z=0;ar(154,0);if(z){z=0;E=59;break}return 0}}while(0);if((E|0)==59){E=bS(-1,-1)|0;al=M;am=E}E=c[p>>2]|0;p=E;if((E|0)!=0){al=c[q>>2]|0;if((E|0)!=(al|0)){c[q>>2]=al+(~((al-4+(-p|0)|0)>>>2)<<2)}K4(E)}E=c[l>>2]|0;if((E|0)==0){bg(am|0)}l=c[m>>2]|0;if((E|0)!=(l|0)){c[m>>2]=l+(~((l-4+(-E|0)|0)>>>2)<<2)}K4(E);bg(am|0);return 0}function uL(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=(zg(e)|0)!=0;g=f?0:e;if((g|0)==0){h=0;return h|0}f=(a[g]|0)==45?g+1|0:0;if((f|0)==0){h=0;return h|0}g=b+48|0;i=c[g>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L7}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[g>>2]=i+n;i=e;g=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;g=g+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+g;j=f;o=e;c[i>>2]=j-o+g+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;h=f;return h|0}function uM(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+32|0;f=d;d=i;i=i+8|0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;h=c[b>>2]|0;j=(c[b+4>>2]|0)-h|0;if(j>>>0>4294967279>>>0){DH(0);return 0}if(j>>>0<11>>>0){b=j<<1&255;a[f]=b;k=f+1|0;l=b}else{b=j+16&-16;m=K2(b)|0;c[f+8>>2]=m;n=b|1;c[f>>2]=n;c[f+4>>2]=j;k=m;l=n&255}Ld(k|0,h|0,j)|0;a[k+j|0]=0;j=c[d>>2]|0;k=(c[d+4>>2]|0)-j|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(k>>>0<11>>>0){d=k<<1&255;a[g]=d;o=g+1|0;p=d}else{d=k+16&-16;h=(z=0,au(246,d|0)|0);if(z){z=0;break}c[g+8>>2]=h;n=d|1;c[g>>2]=n;c[g+4>>2]=k;o=h;p=n&255}Ld(o|0,j|0,k)|0;a[o+k|0]=0;n=f;h=l&255;if((h&1|0)==0){q=h>>>1}else{q=c[f+4>>2]|0}h=g;d=p&255;if((d&1|0)==0){r=d>>>1}else{r=c[g+4>>2]|0}L23:do{if((q|0)==(r|0)){if((l&1)==0){s=n+1|0}else{s=c[f+8>>2]|0}if((p&1)==0){t=h+1|0}else{t=c[g+8>>2]|0}if((l&1)!=0){u=(Lf(s|0,t|0,q|0)|0)==0;break}if((q|0)==0){u=1;break}else{v=t;w=s;x=q}while(1){if((a[w]|0)!=(a[v]|0)){u=0;break L23}d=x-1|0;if((d|0)==0){u=1;break}else{v=v+1|0;w=w+1|0;x=d}}}else{u=0}}while(0);if((p&1)!=0){K4(c[g+8>>2]|0)}if((l&1)==0){i=e;return u|0}K4(c[f+8>>2]|0);i=e;return u|0}}while(0);u=bS(-1,-1)|0;if((l&1)==0){bg(u|0)}K4(c[f+8>>2]|0);bg(u|0);return 0}function uN(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0;g=i;i=i+40|0;h=g|0;j=g+8|0;k=g+24|0;l=e|0;m=(c[e+4>>2]|0)-(c[l>>2]|0)>>2;if((m|0)==0){n=d;i=g;return n|0}e=b|0;o=b+28|0;p=j;q=k;r=f|0;f=j+8|0;s=b+36|0;t=b+32|0;b=j+1|0;u=j|0;v=j+4|0;w=0;x=d;while(1){y=c[e>>2]|0;d=K2(48)|0;c[h>>2]=d;A=y+4|0;B=c[A>>2]|0;if((B|0)==(c[y+8>>2]|0)){e3(y|0,h);C=c[h>>2]|0}else{if((B|0)==0){D=0}else{c[B>>2]=d;D=c[A>>2]|0}c[A>>2]=D+4;C=d}E=C;if((a[o]&1)==0){c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2]}else{d=c[s>>2]|0;B=c[t>>2]|0;if(B>>>0>4294967279>>>0){F=11;break}if(B>>>0<11>>>0){a[p]=B<<1;G=b}else{H=B+16&-16;I=(z=0,au(246,H|0)|0);if(z){z=0;F=25;break}c[f>>2]=I;c[u>>2]=H|1;c[v>>2]=B;G=I}Ld(G|0,d|0,B)|0;a[G+B|0]=0}B=x+16|0;c[q>>2]=c[B>>2];c[q+4>>2]=c[B+4>>2];c[q+8>>2]=c[B+8>>2];z=0;aD(12,C|0,j|0,k|0,c[(c[r>>2]|0)+(w<<2)>>2]|0,x|0,c[(c[l>>2]|0)+(w<<2)>>2]|0);if(z){z=0;F=28;break}B=C;if((a[p]&1)!=0){K4(c[f>>2]|0)}d=c[C+40>>2]|0;do{if((c[(c[r>>2]|0)+(w<<2)>>2]|0)==11){if((a[d+28|0]&1)==0){F=35;break}if((a[(c[C+44>>2]|0)+28|0]&1)==0){F=35;break}a[C+28|0]=1}else{F=35}}while(0);if((F|0)==35){F=0;a[d+28|0]=0;a[(c[C+44>>2]|0)+28|0]=0}I=w+1|0;if(I>>>0<m>>>0){w=I;x=B}else{n=B;F=41;break}}do{if((F|0)==41){i=g;return n|0}else if((F|0)==11){z=0;ar(88,0);if(!z){return 0}else{z=0;x=bS(-1,-1)|0;J=M;K=x;F=27;break}}else if((F|0)==25){x=bS(-1,-1)|0;J=M;K=x;F=27}else if((F|0)==28){x=bS(-1,-1)|0;w=x;x=M;if((a[p]&1)==0){L=x;N=w;break}K4(c[f>>2]|0);L=x;N=w}}while(0);if((F|0)==27){L=J;N=K}K=c[y>>2]|0;y=c[A>>2]|0;J=K;while(1){if((J|0)==(y|0)){O=y;break}if((c[J>>2]|0)==(C|0)){O=J;break}else{J=J+4|0}}J=O-K>>2;O=K+(J+1<<2)|0;C=y-O|0;Le(K+(J<<2)|0,O|0,C|0)|0;O=K+((C>>2)+J<<2)|0;J=c[A>>2]|0;if((O|0)==(J|0)){K4(E);P=N;Q=0;R=P;S=L;bg(R|0)}c[A>>2]=J+(~((J-4+(-O|0)|0)>>>2)<<2);K4(E);P=N;Q=0;R=P;S=L;bg(R|0);return 0}function uO(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0;d=i;i=i+456|0;e=d|0;f=d+8|0;g=d+16|0;h=d+24|0;j=d+40|0;k=d+48|0;l=d+56|0;m=d+72|0;n=d+80|0;o=d+88|0;p=d+104|0;q=d+112|0;r=d+120|0;s=d+136|0;t=d+144|0;u=d+152|0;v=d+168|0;w=d+176|0;x=d+192|0;y=d+200|0;A=d+216|0;B=d+232|0;C=d+248|0;D=d+264|0;E=d+280|0;F=d+296|0;G=d+312|0;H=d+328|0;I=d+344|0;J=d+360|0;K=d+376|0;L=d+392|0;N=d+408|0;O=d+424|0;P=d+440|0;Q=b+20|0;R=yN(c[Q>>2]|0)|0;S=(a[R]|0)==40?R+1|0:0;if((S|0)!=0){T=b+48|0;U=c[T>>2]|0;V=c[Q>>2]|0;L3:do{if(V>>>0<S>>>0){W=V;X=0;while(1){Y=a[W]|0;if((Y<<24>>24|0)==10){Z=X+1|0}else if((Y<<24>>24|0)==0){_=X;break L3}else{Z=X}Y=W+1|0;if(Y>>>0<S>>>0){W=Y;X=Z}else{_=Z;break}}}else{_=0}}while(0);c[T>>2]=_+U;U=R;Z=0;while(1){X=U-1|0;if(X>>>0<V>>>0){break}if((a[X]|0)==10){break}else{U=X;Z=Z+1|0}}U=b+40|0;if((_|0)!=0){c[U>>2]=1}_=c[U>>2]|0;V=b+52|0;c[V>>2]=_+Z;X=S;W=R;c[U>>2]=X-W+Z+_;_=b+56|0;c[_>>2]=W;c[_+4>>2]=X;c[Q>>2]=S;S=uv(b)|0;X=yN(c[Q>>2]|0)|0;W=(a[X]|0)==41?X+1|0:0;do{if((W|0)==0){Z=K2(32)|0;R=y+8|0;c[R>>2]=Z;c[y>>2]=33;c[y+4>>2]=20;Ld(Z|0,5416,20)|0;a[Z+20|0]=0;c[A>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;z=0;aR(482,b|0,y|0,A|0);if(!z){if((a[y]&1)==0){break}K4(c[R>>2]|0);break}else{z=0}Z=bS(-1,-1)|0;Y=Z;Z=M;if((a[y]&1)==0){$=Y;aa=Z;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}K4(c[R>>2]|0);$=Y;aa=Z;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{Z=c[T>>2]|0;Y=c[Q>>2]|0;L19:do{if(Y>>>0<W>>>0){R=Y;af=0;while(1){ag=a[R]|0;if((ag<<24>>24|0)==0){ah=af;break L19}else if((ag<<24>>24|0)==10){ai=af+1|0}else{ai=af}ag=R+1|0;if(ag>>>0<W>>>0){R=ag;af=ai}else{ah=ai;break}}}else{ah=0}}while(0);c[T>>2]=ah+Z;af=X;R=0;while(1){ag=af-1|0;if(ag>>>0<Y>>>0){break}if((a[ag]|0)==10){break}else{af=ag;R=R+1|0}}if((ah|0)!=0){c[U>>2]=1}af=c[U>>2]|0;c[V>>2]=af+R;Y=W;Z=X;c[U>>2]=Y-Z+R+af;c[_>>2]=Z;c[_+4>>2]=Y;c[Q>>2]=W}}while(0);a[S+28|0]=0;if((c[S+32>>2]|0)==5){W=c[S+40>>2]|0;if((W|0)==(c[S+44>>2]|0)){aj=S;i=d;return aj|0}a[(c[W>>2]|0)+28|0]=0;aj=S;i=d;return aj|0}if((S|0)==0){ci();return 0}if((c[(c[(c[S>>2]|0)-4>>2]|0)+4>>2]|0)!=26832){aj=S;i=d;return aj|0}W=c[S+40>>2]|0;if((W|0)==0){aj=S;i=d;return aj|0}if((c[W+36>>2]|0)!=11){aj=S;i=d;return aj|0}a[W+28|0]=0;aj=S;i=d;return aj|0}if((zQ(yN(c[Q>>2]|0)|0)|0)!=0){aj=uP(b)|0;i=d;return aj|0}if((zS(yN(c[Q>>2]|0)|0)|0)==0){if((zu(yN(c[Q>>2]|0)|0)|0)!=0){aj=uS(b)|0;i=d;return aj|0}if((yP(yN(c[Q>>2]|0)|0)|0)!=0){aj=tZ(b)|0;i=d;return aj|0}do{if((zv(yN(c[Q>>2]|0)|0)|0)!=0){if((zo(yN(c[Q>>2]|0)|0)|0)!=0){break}aj=uT(b)|0;i=d;return aj|0}}while(0);if((uU(b)|0)!=0){S=c[b>>2]|0;W=K2(44)|0;c[f>>2]=W;_=S+4|0;U=c[_>>2]|0;if((U|0)==(c[S+8>>2]|0)){e3(S|0,f);ak=c[f>>2]|0}else{if((U|0)==0){al=0}else{c[U>>2]=W;al=c[_>>2]|0}c[_>>2]=al+4;ak=W}W=ak;al=ak;U=b+28|0;L92:do{if((a[U]&1)==0){f=L;c[f>>2]=c[U>>2];c[f+4>>2]=c[U+4>>2];c[f+8>>2]=c[U+8>>2];am=302}else{f=c[b+36>>2]|0;X=c[b+32>>2]|0;do{if(X>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(X>>>0<11>>>0){a[L]=X<<1;an=L+1|0}else{V=X+16&-16;ah=(z=0,au(246,V|0)|0);if(z){z=0;break}c[L+8>>2]=ah;c[L>>2]=V|1;c[L+4>>2]=X;an=ah}Ld(an|0,f|0,X)|0;a[an+X|0]=0;am=302;break L92}}while(0);X=bS(-1,-1)|0;ao=X;ap=M}}while(0);do{if((am|0)==302){an=N;U=b+44|0;c[an>>2]=c[U>>2];c[an+4>>2]=c[U+4>>2];c[an+8>>2]=c[U+8>>2];U=(z=0,au(264,b|0)|0);do{if(!z){z=0;aq(38,al|0,L|0,N|0,0,U|0);if(z){z=0;break}an=ak;if((a[L]&1)==0){aj=an;i=d;return aj|0}K4(c[L+8>>2]|0);aj=an;i=d;return aj|0}else{z=0}}while(0);U=bS(-1,-1)|0;an=U;U=M;if((a[L]&1)==0){ao=an;ap=U;break}K4(c[L+8>>2]|0);ao=an;ap=U}}while(0);L=c[S>>2]|0;S=c[_>>2]|0;N=L;while(1){if((N|0)==(S|0)){at=S;break}if((c[N>>2]|0)==(ak|0)){at=N;break}else{N=N+4|0}}N=at-L>>2;at=L+(N+1<<2)|0;ak=S-at|0;Le(L+(N<<2)|0,at|0,ak|0)|0;at=L+((ak>>2)+N<<2)|0;N=c[_>>2]|0;if((at|0)!=(N|0)){c[_>>2]=N+(~((N-4+(-at|0)|0)>>>2)<<2)}K4(W);$=ao;aa=ap;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}if((uW(b)|0)==0){aj=tL(b)|0;i=d;return aj|0}ap=c[b>>2]|0;ao=K2(44)|0;c[e>>2]=ao;W=ap+4|0;at=c[W>>2]|0;if((at|0)==(c[ap+8>>2]|0)){e3(ap|0,e);av=c[e>>2]|0}else{if((at|0)==0){aw=0}else{c[at>>2]=ao;aw=c[W>>2]|0}c[W>>2]=aw+4;av=ao}ao=av;aw=av;at=b+28|0;L137:do{if((a[at]&1)==0){e=O;c[e>>2]=c[at>>2];c[e+4>>2]=c[at+4>>2];c[e+8>>2]=c[at+8>>2];am=331}else{e=c[b+36>>2]|0;N=c[b+32>>2]|0;do{if(N>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(N>>>0<11>>>0){a[O]=N<<1;ax=O+1|0}else{_=N+16&-16;ak=(z=0,au(246,_|0)|0);if(z){z=0;break}c[O+8>>2]=ak;c[O>>2]=_|1;c[O+4>>2]=N;ax=ak}Ld(ax|0,e|0,N)|0;a[ax+N|0]=0;am=331;break L137}}while(0);N=bS(-1,-1)|0;ay=N;az=M}}while(0);do{if((am|0)==331){ax=P;at=b+44|0;c[ax>>2]=c[at>>2];c[ax+4>>2]=c[at+4>>2];c[ax+8>>2]=c[at+8>>2];at=(z=0,au(264,b|0)|0);do{if(!z){z=0;aq(38,aw|0,O|0,P|0,1,at|0);if(z){z=0;break}ax=av;if((a[O]&1)==0){aj=ax;i=d;return aj|0}K4(c[O+8>>2]|0);aj=ax;i=d;return aj|0}else{z=0}}while(0);at=bS(-1,-1)|0;ax=at;at=M;if((a[O]&1)==0){ay=ax;az=at;break}K4(c[O+8>>2]|0);ay=ax;az=at}}while(0);O=c[ap>>2]|0;ap=c[W>>2]|0;P=O;while(1){if((P|0)==(ap|0)){aA=ap;break}if((c[P>>2]|0)==(av|0)){aA=P;break}else{P=P+4|0}}P=aA-O>>2;aA=O+(P+1<<2)|0;av=ap-aA|0;Le(O+(P<<2)|0,aA|0,av|0)|0;aA=O+((av>>2)+P<<2)|0;P=c[W>>2]|0;if((aA|0)!=(P|0)){c[W>>2]=P+(~((P-4+(-aA|0)|0)>>>2)<<2)}K4(ao);$=ay;aa=az;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}az=b|0;ay=c[az>>2]|0;ao=K2(60)|0;c[x>>2]=ao;aA=ay+4|0;P=c[aA>>2]|0;if((P|0)==(c[ay+8>>2]|0)){e3(ay|0,x);aB=c[x>>2]|0}else{if((P|0)==0){aC=0}else{c[P>>2]=ao;aC=c[aA>>2]|0}c[aA>>2]=aC+4;aB=ao}ao=aB;aC=b+28|0;L178:do{if((a[aC]&1)==0){P=B;c[P>>2]=c[aC>>2];c[P+4>>2]=c[aC+4>>2];c[P+8>>2]=c[aC+8>>2];am=54}else{P=c[b+36>>2]|0;x=c[b+32>>2]|0;do{if(x>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(x>>>0<11>>>0){a[B]=x<<1;aE=B+1|0}else{W=x+16&-16;av=(z=0,au(246,W|0)|0);if(z){z=0;break}c[B+8>>2]=av;c[B>>2]=W|1;c[B+4>>2]=x;aE=av}Ld(aE|0,P|0,x)|0;a[aE+x|0]=0;am=54;break L178}}while(0);x=bS(-1,-1)|0;aF=x;aG=M}}while(0);do{if((am|0)==54){aE=b+44|0;x=w;c[x>>2]=c[aE>>2];c[x+4>>2]=c[aE+4>>2];c[x+8>>2]=c[aE+8>>2];z=0;aD(2,aB|0,B|0,w|0,3,0,0);if(z){z=0;x=bS(-1,-1)|0;P=x;x=M;if((a[B]&1)==0){aF=P;aG=x;break}K4(c[B+8>>2]|0);aF=P;aG=x;break}if((a[B]&1)!=0){K4(c[B+8>>2]|0)}L200:do{if((tS(b)|0)==0){uQ(b)|0;x=aB+40|0;P=x;av=c[az>>2]|0;W=K2(52)|0;c[s>>2]=W;O=av+4|0;ap=c[O>>2]|0;if((ap|0)==(c[av+8>>2]|0)){e3(av|0,s);aH=c[s>>2]|0}else{if((ap|0)==0){aI=0}else{c[ap>>2]=W;aI=c[O>>2]|0}c[O>>2]=aI+4;aH=W}W=aH;L275:do{if((a[aC]&1)==0){ap=F;c[ap>>2]=c[aC>>2];c[ap+4>>2]=c[aC+4>>2];c[ap+8>>2]=c[aC+8>>2];am=129}else{ap=c[b+36>>2]|0;aw=c[b+32>>2]|0;do{if(aw>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(aw>>>0<11>>>0){a[F]=aw<<1;aJ=F+1|0}else{at=aw+16&-16;ax=(z=0,au(246,at|0)|0);if(z){z=0;break}c[F+8>>2]=ax;c[F>>2]=at|1;c[F+4>>2]=aw;aJ=ax}Ld(aJ|0,ap|0,aw)|0;a[aJ+aw|0]=0;am=129;break L275}}while(0);aw=bS(-1,-1)|0;aK=M;aL=aw}}while(0);do{if((am|0)==129){aw=r;c[aw>>2]=c[aE>>2];c[aw+4>>2]=c[aE+4>>2];c[aw+8>>2]=c[aE+8>>2];z=0;aq(14,aH|0,F|0,r|0,b+56|0,0);do{if(!z){aw=aH;c[q>>2]=aw;ap=x+8|0;ax=c[ap>>2]|0;at=ax;if((ax|0)==(c[x+12>>2]|0)){z=0;as(370,x+4|0,q|0);if(z){z=0;aM=0;break}aN=c[q>>2]|0}else{if((ax|0)==0){aO=0}else{c[at>>2]=aw;aO=c[ap>>2]|0}c[ap>>2]=aO+4;aN=aw}z=0;as(c[c[x>>2]>>2]|0,P|0,aN|0);if(z){z=0;aM=0;break}if((a[F]&1)==0){break L200}K4(c[F+8>>2]|0);break L200}else{z=0;aM=1}}while(0);aw=bS(-1,-1)|0;ap=aw;aw=M;if((a[F]&1)==0){if(aM){aK=aw;aL=ap;break}else{$=ap;aa=aw}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{K4(c[F+8>>2]|0);if(aM){aK=aw;aL=ap;break}else{$=ap;aa=aw}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}}while(0);P=c[av>>2]|0;x=c[O>>2]|0;aw=P;while(1){if((aw|0)==(x|0)){aP=x;break}if((c[aw>>2]|0)==(aH|0)){aP=aw;break}else{aw=aw+4|0}}aw=aP-P>>2;av=P+(aw+1<<2)|0;ap=x-av|0;Le(P+(aw<<2)|0,av|0,ap|0)|0;av=P+((ap>>2)+aw<<2)|0;aw=c[O>>2]|0;if((av|0)!=(aw|0)){c[O>>2]=aw+(~((aw-4+(-av|0)|0)>>>2)<<2)}K4(W);$=aL;aa=aK;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{av=aB+40|0;aw=av;ap=c[az>>2]|0;at=K2(48)|0;c[v>>2]=at;ax=ap+4|0;N=c[ax>>2]|0;if((N|0)==(c[ap+8>>2]|0)){e3(ap|0,v);aQ=c[v>>2]|0}else{if((N|0)==0){aS=0}else{c[N>>2]=at;aS=c[ax>>2]|0}c[ax>>2]=aS+4;aQ=at}at=aQ;N=aQ;L209:do{if((a[aC]&1)==0){e=C;c[e>>2]=c[aC>>2];c[e+4>>2]=c[aC+4>>2];c[e+8>>2]=c[aC+8>>2];am=73}else{e=c[b+36>>2]|0;ak=c[b+32>>2]|0;do{if(ak>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(ak>>>0<11>>>0){a[C]=ak<<1;aT=C+1|0}else{_=ak+16&-16;L=(z=0,au(246,_|0)|0);if(z){z=0;break}c[C+8>>2]=L;c[C>>2]=_|1;c[C+4>>2]=ak;aT=L}Ld(aT|0,e|0,ak)|0;a[aT+ak|0]=0;am=73;break L209}}while(0);ak=bS(-1,-1)|0;aU=M;aW=ak}}while(0);do{if((am|0)==73){W=D;c[W>>2]=c[aE>>2];c[W+4>>2]=c[aE+4>>2];c[W+8>>2]=c[aE+8>>2];O=c[b+56>>2]|0;P=(c[b+60>>2]|0)-O|0;do{if(P>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;am=102;break}return 0}else{if(P>>>0<11>>>0){a[E]=P<<1;aX=E+1|0}else{x=P+16&-16;ak=(z=0,au(246,x|0)|0);if(z){z=0;am=102;break}c[E+8>>2]=ak;c[E>>2]=x|1;c[E+4>>2]=P;aX=ak}Ld(aX|0,O|0,P)|0;a[aX+P|0]=0;ak=u;c[ak>>2]=c[W>>2];c[ak+4>>2]=c[W+4>>2];c[ak+8>>2]=c[W+8>>2];z=0;aV(2,N|0,C|0,u|0,E|0);do{if(!z){ak=aQ;c[t>>2]=ak;x=av+8|0;e=c[x>>2]|0;L=e;if((e|0)==(c[av+12>>2]|0)){z=0;as(370,av+4|0,t|0);if(z){z=0;aY=0;break}aZ=c[t>>2]|0}else{if((e|0)==0){a_=0}else{c[L>>2]=ak;a_=c[x>>2]|0}c[x>>2]=a_+4;aZ=ak}z=0;as(c[c[av>>2]>>2]|0,aw|0,aZ|0);if(z){z=0;aY=0;break}if((a[E]&1)!=0){K4(c[E+8>>2]|0)}if((a[C]&1)==0){break L200}K4(c[C+8>>2]|0);break L200}else{z=0;aY=1}}while(0);ak=bS(-1,-1)|0;x=ak;ak=M;if((a[E]&1)==0){a$=aY;a0=x;a1=ak;break}K4(c[E+8>>2]|0);a$=aY;a0=x;a1=ak}}while(0);if((am|0)==102){W=bS(-1,-1)|0;a$=1;a0=W;a1=M}if((a[C]&1)==0){if(a$){aU=a1;aW=a0;break}else{$=a0;aa=a1}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{K4(c[C+8>>2]|0);if(a$){aU=a1;aW=a0;break}else{$=a0;aa=a1}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}}while(0);aw=c[ap>>2]|0;av=c[ax>>2]|0;N=aw;while(1){if((N|0)==(av|0)){a2=av;break}if((c[N>>2]|0)==(aQ|0)){a2=N;break}else{N=N+4|0}}N=a2-aw>>2;ap=aw+(N+1<<2)|0;W=av-ap|0;Le(aw+(N<<2)|0,ap|0,W|0)|0;ap=aw+((W>>2)+N<<2)|0;N=c[ax>>2]|0;if((ap|0)!=(N|0)){c[ax>>2]=N+(~((N-4+(-ap|0)|0)>>>2)<<2)}K4(at);$=aW;aa=aU;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}while(0);ap=yN(c[Q>>2]|0)|0;N=(a[ap]|0)==61?ap+1|0:0;if((N|0)!=0){W=b+48|0;P=c[W>>2]|0;O=c[Q>>2]|0;L320:do{if(O>>>0<N>>>0){ak=O;x=0;while(1){L=a[ak]|0;if((L<<24>>24|0)==10){a3=x+1|0}else if((L<<24>>24|0)==0){a4=x;break L320}else{a3=x}L=ak+1|0;if(L>>>0<N>>>0){ak=L;x=a3}else{a4=a3;break}}}else{a4=0}}while(0);c[W>>2]=a4+P;x=ap;ak=0;while(1){at=x-1|0;if(at>>>0<O>>>0){break}if((a[at]|0)==10){break}else{x=at;ak=ak+1|0}}x=b+40|0;if((a4|0)!=0){c[x>>2]=1}O=c[x>>2]|0;c[b+52>>2]=O+ak;P=N;W=ap;c[x>>2]=P-W+ak+O;O=b+56|0;c[O>>2]=W;c[O+4>>2]=P;c[Q>>2]=N}P=aB+40|0;O=P;W=c[az>>2]|0;x=K2(52)|0;c[p>>2]=x;at=W+4|0;ax=c[at>>2]|0;if((ax|0)==(c[W+8>>2]|0)){e3(W|0,p);a5=c[p>>2]|0}else{if((ax|0)==0){a6=0}else{c[ax>>2]=x;a6=c[at>>2]|0}c[at>>2]=a6+4;a5=x}x=a5;L342:do{if((a[aC]&1)==0){ax=G;c[ax>>2]=c[aC>>2];c[ax+4>>2]=c[aC+4>>2];c[ax+8>>2]=c[aC+8>>2];am=175}else{ax=c[b+36>>2]|0;aw=c[b+32>>2]|0;do{if(aw>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(aw>>>0<11>>>0){a[G]=aw<<1;a7=G+1|0}else{av=aw+16&-16;L=(z=0,au(246,av|0)|0);if(z){z=0;break}c[G+8>>2]=L;c[G>>2]=av|1;c[G+4>>2]=aw;a7=L}Ld(a7|0,ax|0,aw)|0;a[a7+aw|0]=0;am=175;break L342}}while(0);aw=bS(-1,-1)|0;a8=M;a9=aw}}while(0);do{if((am|0)==175){N=o;c[N>>2]=c[aE>>2];c[N+4>>2]=c[aE+4>>2];c[N+8>>2]=c[aE+8>>2];N=b+56|0;z=0;aq(14,a5|0,G|0,o|0,N|0,0);do{if(!z){ak=a5;c[n>>2]=ak;ap=P+8|0;aw=c[ap>>2]|0;ax=aw;L=P+12|0;if((aw|0)==(c[L>>2]|0)){z=0;as(370,P+4|0,n|0);if(z){z=0;ba=0;break}bb=c[n>>2]|0}else{if((aw|0)==0){bc=0}else{c[ax>>2]=ak;bc=c[ap>>2]|0}c[ap>>2]=bc+4;bb=ak}z=0;as(c[c[P>>2]>>2]|0,O|0,bb|0);if(z){z=0;ba=0;break}if((a[G]&1)!=0){K4(c[G+8>>2]|0)}L371:do{if((tS(b)|0)==0){uR(b)|0;ak=c[az>>2]|0;ax=K2(52)|0;c[j>>2]=ax;aw=ak+4|0;av=c[aw>>2]|0;if((av|0)==(c[ak+8>>2]|0)){e3(ak|0,j);bd=c[j>>2]|0}else{if((av|0)==0){be=0}else{c[av>>2]=ax;be=c[aw>>2]|0}c[aw>>2]=be+4;bd=ax}ax=bd;L380:do{if((a[aC]&1)==0){av=K;c[av>>2]=c[aC>>2];c[av+4>>2]=c[aC+4>>2];c[av+8>>2]=c[aC+8>>2];am=258}else{av=c[b+36>>2]|0;e=c[b+32>>2]|0;do{if(e>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(e>>>0<11>>>0){a[K]=e<<1;bf=K+1|0}else{_=e+16&-16;S=(z=0,au(246,_|0)|0);if(z){z=0;break}c[K+8>>2]=S;c[K>>2]=_|1;c[K+4>>2]=e;bf=S}Ld(bf|0,av|0,e)|0;a[bf+e|0]=0;am=258;break L380}}while(0);e=bS(-1,-1)|0;bh=M;bi=e}}while(0);do{if((am|0)==258){e=h;c[e>>2]=c[aE>>2];c[e+4>>2]=c[aE+4>>2];c[e+8>>2]=c[aE+8>>2];z=0;aq(14,bd|0,K|0,h|0,N|0,0);do{if(!z){e=bd;c[g>>2]=e;av=c[ap>>2]|0;S=av;if((av|0)==(c[L>>2]|0)){z=0;as(370,P+4|0,g|0);if(z){z=0;bj=0;break}bk=c[g>>2]|0}else{if((av|0)==0){bl=0}else{c[S>>2]=e;bl=c[ap>>2]|0}c[ap>>2]=bl+4;bk=e}z=0;as(c[c[P>>2]>>2]|0,O|0,bk|0);if(z){z=0;bj=0;break}if((a[K]&1)==0){break L371}K4(c[K+8>>2]|0);break L371}else{z=0;bj=1}}while(0);e=bS(-1,-1)|0;S=e;e=M;if((a[K]&1)==0){if(bj){bh=e;bi=S;break}else{$=S;aa=e}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{K4(c[K+8>>2]|0);if(bj){bh=e;bi=S;break}else{$=S;aa=e}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}}while(0);e=c[ak>>2]|0;S=c[aw>>2]|0;av=e;while(1){if((av|0)==(S|0)){bm=S;break}if((c[av>>2]|0)==(bd|0)){bm=av;break}else{av=av+4|0}}av=bm-e>>2;ak=e+(av+1<<2)|0;_=S-ak|0;Le(e+(av<<2)|0,ak|0,_|0)|0;ak=e+((_>>2)+av<<2)|0;av=c[aw>>2]|0;if((ak|0)!=(av|0)){c[aw>>2]=av+(~((av-4+(-ak|0)|0)>>>2)<<2)}K4(ax);$=bi;aa=bh;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{ak=c[az>>2]|0;av=K2(48)|0;c[m>>2]=av;_=ak+4|0;al=c[_>>2]|0;if((al|0)==(c[ak+8>>2]|0)){e3(ak|0,m);bn=c[m>>2]|0}else{if((al|0)==0){bo=0}else{c[al>>2]=av;bo=c[_>>2]|0}c[_>>2]=bo+4;bn=av}av=bn;al=bn;L430:do{if((a[aC]&1)==0){U=H;c[U>>2]=c[aC>>2];c[U+4>>2]=c[aC+4>>2];c[U+8>>2]=c[aC+8>>2];am=201}else{U=c[b+36>>2]|0;an=c[b+32>>2]|0;do{if(an>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(an>>>0<11>>>0){a[H]=an<<1;bp=H+1|0}else{X=an+16&-16;f=(z=0,au(246,X|0)|0);if(z){z=0;break}c[H+8>>2]=f;c[H>>2]=X|1;c[H+4>>2]=an;bp=f}Ld(bp|0,U|0,an)|0;a[bp+an|0]=0;am=201;break L430}}while(0);an=bS(-1,-1)|0;bq=M;br=an}}while(0);do{if((am|0)==201){ax=I;c[ax>>2]=c[aE>>2];c[ax+4>>2]=c[aE+4>>2];c[ax+8>>2]=c[aE+8>>2];aw=c[N>>2]|0;e=(c[b+60>>2]|0)-aw|0;do{if(e>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;am=231;break}return 0}else{if(e>>>0<11>>>0){a[J]=e<<1;bs=J+1|0}else{S=e+16&-16;an=(z=0,au(246,S|0)|0);if(z){z=0;am=231;break}c[J+8>>2]=an;c[J>>2]=S|1;c[J+4>>2]=e;bs=an}Ld(bs|0,aw|0,e)|0;a[bs+e|0]=0;an=l;c[an>>2]=c[ax>>2];c[an+4>>2]=c[ax+4>>2];c[an+8>>2]=c[ax+8>>2];z=0;aV(2,al|0,H|0,l|0,J|0);do{if(!z){an=bn;c[k>>2]=an;S=c[ap>>2]|0;U=S;if((S|0)==(c[L>>2]|0)){z=0;as(370,P+4|0,k|0);if(z){z=0;bt=0;break}bu=c[k>>2]|0}else{if((S|0)==0){bv=0}else{c[U>>2]=an;bv=c[ap>>2]|0}c[ap>>2]=bv+4;bu=an}z=0;as(c[c[P>>2]>>2]|0,O|0,bu|0);if(z){z=0;bt=0;break}if((a[J]&1)!=0){K4(c[J+8>>2]|0)}if((a[H]&1)==0){break L371}K4(c[H+8>>2]|0);break L371}else{z=0;bt=1}}while(0);an=bS(-1,-1)|0;U=an;an=M;if((a[J]&1)==0){bw=bt;bx=U;by=an;break}K4(c[J+8>>2]|0);bw=bt;bx=U;by=an}}while(0);if((am|0)==231){ax=bS(-1,-1)|0;bw=1;bx=ax;by=M}if((a[H]&1)==0){if(bw){bq=by;br=bx;break}else{$=bx;aa=by}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{K4(c[H+8>>2]|0);if(bw){bq=by;br=bx;break}else{$=bx;aa=by}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}}while(0);al=c[ak>>2]|0;ax=c[_>>2]|0;e=al;while(1){if((e|0)==(ax|0)){bz=ax;break}if((c[e>>2]|0)==(bn|0)){bz=e;break}else{e=e+4|0}}e=bz-al>>2;ak=al+(e+1<<2)|0;aw=ax-ak|0;Le(al+(e<<2)|0,ak|0,aw|0)|0;ak=al+((aw>>2)+e<<2)|0;e=c[_>>2]|0;if((ak|0)!=(e|0)){c[_>>2]=e+(~((e-4+(-ak|0)|0)>>>2)<<2)}K4(av);$=br;aa=bq;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}while(0);aj=aB;i=d;return aj|0}else{z=0;ba=1}}while(0);N=bS(-1,-1)|0;ap=N;N=M;if((a[G]&1)==0){if(ba){a8=N;a9=ap;break}else{$=ap;aa=N}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}else{K4(c[G+8>>2]|0);if(ba){a8=N;a9=ap;break}else{$=ap;aa=N}ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}}while(0);O=c[W>>2]|0;P=c[at>>2]|0;aE=O;while(1){if((aE|0)==(P|0)){bA=P;break}if((c[aE>>2]|0)==(a5|0)){bA=aE;break}else{aE=aE+4|0}}aE=bA-O>>2;W=O+(aE+1<<2)|0;N=P-W|0;Le(O+(aE<<2)|0,W|0,N|0)|0;W=O+((N>>2)+aE<<2)|0;aE=c[at>>2]|0;if((W|0)!=(aE|0)){c[at>>2]=aE+(~((aE-4+(-W|0)|0)>>>2)<<2)}K4(x);$=a9;aa=a8;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0)}}while(0);a8=c[ay>>2]|0;ay=c[aA>>2]|0;a9=a8;while(1){if((a9|0)==(ay|0)){bB=ay;break}if((c[a9>>2]|0)==(aB|0)){bB=a9;break}else{a9=a9+4|0}}a9=bB-a8>>2;bB=a8+(a9+1<<2)|0;aB=ay-bB|0;Le(a8+(a9<<2)|0,bB|0,aB|0)|0;bB=a8+((aB>>2)+a9<<2)|0;a9=c[aA>>2]|0;if((bB|0)!=(a9|0)){c[aA>>2]=a9+(~((a9-4+(-bB|0)|0)>>>2)<<2)}K4(ao);$=aF;aa=aG;ab=$;ac=0;ad=ab;ae=aa;bg(ad|0);return 0}function uP(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0;d=i;i=i+128|0;e=d|0;f=d+8|0;g=d+24|0;h=d+32|0;j=d+40|0;k=d+48|0;l=d+64|0;m=d+72|0;n=d+88|0;o=d+96|0;p=d+112|0;q=d+120|0;r=q;s=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;u=i;i=i+12|0;i=i+7&-8;v=i;i=i+8|0;w=i;i=i+64|0;x=i;i=i+8|0;y=i;i=i+12|0;i=i+7&-8;A=i;i=i+12|0;i=i+7&-8;B=i;i=i+12|0;i=i+7&-8;C=i;i=i+12|0;i=i+7&-8;D=i;i=i+12|0;i=i+7&-8;E=i;i=i+12|0;i=i+7&-8;F=i;i=i+8|0;u9(b)|0;G=b+56|0;H=c[G>>2]|0;I=c[G+4>>2]|0;c[q>>2]=H;c[q+4>>2]=I;q=I-1|0;c[r+4>>2]=q;I=b+20|0;c[I>>2]=(c[I>>2]|0)-1;I=H;H=I;L1:do{if(H>>>0<q>>>0){G=a[36320]|0;J=G<<24>>24==0;L3:do{if(J){K=H;while(1){L=a[K]|0;if(L<<24>>24==0){N=12;break L1}O=K+1|0;if(!(L<<24>>24==92&(O|0)!=0|(K|0)==0)){P=K;break L3}if(O>>>0<q>>>0){K=O}else{N=12;break L1}}}else{K=H;while(1){O=a[K]|0;if(O<<24>>24==0){N=12;break L1}L=K+1|0;Q=O<<24>>24==92&(L|0)!=0?0:K;if((Q|0)!=0){O=Q;Q=36320;R=G;while(1){if((a[O]|0)!=R<<24>>24){S=O;T=R;break}U=O+1|0;V=Q+1|0;W=a[V]|0;if(W<<24>>24==0){S=U;T=0;break}else{O=U;Q=V;R=W}}if(!(T<<24>>24!=0|(S|0)==0)){P=K;break L3}}if(L>>>0<q>>>0){K=L}else{N=12;break L1}}}}while(0);K=b|0;R=c[K>>2]|0;if((P|0)==0){X=R;break}Q=K2(60)|0;c[n>>2]=Q;O=R+4|0;W=c[O>>2]|0;if((W|0)==(c[R+8>>2]|0)){e3(R|0,n);Y=c[n>>2]|0}else{if((W|0)==0){Z=0}else{c[W>>2]=Q;Z=c[O>>2]|0}c[O>>2]=Z+4;Y=Q}Q=Y;W=b+28|0;L26:do{if((a[W]&1)==0){V=t;c[V>>2]=c[W>>2];c[V+4>>2]=c[W+4>>2];c[V+8>>2]=c[W+8>>2];N=57}else{V=c[b+36>>2]|0;U=c[b+32>>2]|0;do{if(U>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(U>>>0<11>>>0){a[t]=U<<1;_=t+1|0}else{$=U+16&-16;aa=(z=0,au(246,$|0)|0);if(z){z=0;break}c[t+8>>2]=aa;c[t>>2]=$|1;c[t+4>>2]=U;_=aa}Ld(_|0,V|0,U)|0;a[_+U|0]=0;N=57;break L26}}while(0);U=bS(-1,-1)|0;ab=M;ac=U}}while(0);do{if((N|0)==57){U=b+44|0;V=m;c[V>>2]=c[U>>2];c[V+4>>2]=c[U+4>>2];c[V+8>>2]=c[U+8>>2];z=0;aD(2,Y|0,t|0,m|0,0,0,0);if(z){z=0;V=bS(-1,-1)|0;aa=V;V=M;if((a[t]&1)==0){ab=V;ac=aa;break}K4(c[t+8>>2]|0);ab=V;ac=aa;break}if((a[t]&1)!=0){K4(c[t+8>>2]|0)}aa=Y+40|0;V=aa;$=u;ad=v|0;ae=v+4|0;af=aa+8|0;ag=aa+12|0;ah=aa+4|0;ai=u+8|0;aj=b+36|0;ak=b+32|0;al=u+1|0;am=u|0;an=u+4|0;ao=a[36048]|0;ap=ao<<24>>24==0;at=C;av=C+1|0;aw=B;ax=B+1|0;ay=D|0;aA=D+4|0;aB=D+8|0;aC=C+8|0;aE=B+8|0;aF=B|0;aG=B+4|0;aH=C+4|0;aI=C|0;aJ=x|0;aK=x+4|0;aL=y;aM=A;aN=w+28|0;aO=w+4|0;aP=y+8|0;aQ=w+8|0;aS=w+36|0;aT=y+1|0;aU=y|0;aV=y+4|0;aW=H;L48:while(1){L50:while(1){L52:do{if(J){aX=aW;while(1){aY=a[aX]|0;if(aY<<24>>24==0){N=192;break L48}aZ=aX+1|0;if(!(aY<<24>>24==92&(aZ|0)!=0|(aX|0)==0)){a_=aX;break L52}if(aZ>>>0<q>>>0){aX=aZ}else{N=192;break L48}}}else{aX=aW;while(1){aZ=a[aX]|0;if(aZ<<24>>24==0){N=192;break L48}aY=aX+1|0;a$=aZ<<24>>24==92&(aY|0)!=0?0:aX;if((a$|0)!=0){aZ=a$;a$=36320;a0=G;while(1){if((a[aZ]|0)!=a0<<24>>24){a1=aZ;a2=a0;break}a3=aZ+1|0;a4=a$+1|0;a5=a[a4]|0;if(a5<<24>>24==0){a1=a3;a2=0;break}else{aZ=a3;a$=a4;a0=a5}}if(!(a2<<24>>24!=0|(a1|0)==0)){a_=aX;break L52}}if(aY>>>0<q>>>0){aX=aY}else{N=192;break L48}}}}while(0);if((a_|0)==0){N=192;break L48}do{if(aW>>>0<a_>>>0){a6=c[K>>2]|0;aX=K2(52)|0;c[l>>2]=aX;a7=a6+4|0;a0=c[a7>>2]|0;if((a0|0)==(c[a6+8>>2]|0)){e3(a6|0,l);a8=c[l>>2]|0}else{if((a0|0)==0){a9=0}else{c[a0>>2]=aX;a9=c[a7>>2]|0}c[a7>>2]=a9+4;a8=aX}ba=a8;aX=a8;if((a[W]&1)==0){c[$>>2]=c[W>>2];c[$+4>>2]=c[W+4>>2];c[$+8>>2]=c[W+8>>2]}else{a0=c[aj>>2]|0;a$=c[ak>>2]|0;if(a$>>>0>4294967279>>>0){N=82;break L48}if(a$>>>0<11>>>0){a[$]=a$<<1;bb=al}else{aZ=a$+16&-16;a5=(z=0,au(246,aZ|0)|0);if(z){z=0;N=108;break L48}c[ai>>2]=a5;c[am>>2]=aZ|1;c[an>>2]=a$;bb=a5}Ld(bb|0,a0|0,a$)|0;a[bb+a$|0]=0}a$=k;c[a$>>2]=c[U>>2];c[a$+4>>2]=c[U+4>>2];c[a$+8>>2]=c[U+8>>2];c[ad>>2]=aW;c[ae>>2]=a_;z=0;aq(14,aX|0,u|0,k|0,v|0,0);if(z){z=0;bc=1;N=111;break L48}aX=a8;c[j>>2]=aX;a$=c[af>>2]|0;a0=a$;if((a$|0)==(c[ag>>2]|0)){z=0;as(370,ah|0,j|0);if(z){z=0;bc=0;N=111;break L48}bd=c[j>>2]|0}else{if((a$|0)==0){be=0}else{c[a0>>2]=aX;be=c[af>>2]|0}c[af>>2]=be+4;bd=aX}z=0;as(c[c[aa>>2]>>2]|0,V|0,bd|0);if(z){z=0;bc=0;N=111;break L48}if((a[$]&1)==0){break}K4(c[ai>>2]|0)}}while(0);L99:do{if(ap){aX=a_;while(1){if(aX>>>0>=q>>>0){break L99}if((a[aX]|0)==0){break L99}if((aX|0)==0){aX=aX+1|0}else{bf=aX;break L50}}}else{aX=a_;while(1){if(aX>>>0>=q>>>0){break L99}a0=a[aX]|0;if(a0<<24>>24==0){break L99}L104:do{if(a0<<24>>24==ao<<24>>24){a$=36048;a5=aX;while(1){aZ=a5+1|0;a4=a$+1|0;a3=a[a4]|0;if(a3<<24>>24==0){bh=aZ;bi=0;break L104}if((a[aZ]|0)==a3<<24>>24){a$=a4;a5=aZ}else{bh=aZ;bi=a3;break}}}else{bh=aX;bi=ao}}while(0);if(bi<<24>>24!=0|(bh|0)==0){aX=aX+1|0}else{break}}if((aX|0)!=0){bf=aX;break L50}}}while(0);a0=q-I|0;if(a0>>>0>4294967279>>>0){N=165;break L48}if(a0>>>0<11>>>0){aY=a0<<1&255;a[at]=aY;bj=av;bk=aY}else{aY=a0+16&-16;a5=K2(aY)|0;c[aC>>2]=a5;a$=aY|1;c[aI>>2]=a$;c[aH>>2]=a0;bj=a5;bk=a$&255}Ld(bj|0,H|0,a0)|0;a[bj+a0|0]=0;Lg(aw|0,0,12)|0;a0=bk&255;a$=(a0&1|0)==0?a0>>>1:c[aH>>2]|0;a0=a$+44|0;if(a0>>>0>4294967279>>>0){N=170;break L48}if(a0>>>0<11>>>0){a[aw]=88;bl=ax}else{a0=a$+60&-16;a5=(z=0,au(246,a0|0)|0);if(z){z=0;N=177;break L48}c[aE>>2]=a5;c[aF>>2]=a0|1;c[aG>>2]=44;bl=a5}Ld(bl|0,4648,44)|0;a[bl+44|0]=0;z=0,az(84,B|0,((bk&1)==0?av:c[aC>>2]|0)|0,a$|0)|0;if(z){z=0;N=177;break L48}c[ay>>2]=0;c[aA>>2]=0;c[aB>>2]=0;z=0;aR(482,b|0,B|0,D|0);if(z){z=0;N=188;break L48}if((a[aw]&1)!=0){K4(c[aE>>2]|0)}if((a[at]&1)!=0){K4(c[aC>>2]|0)}if(aW>>>0>=q>>>0){bm=Q;N=232;break L48}}c[aJ>>2]=a_+2;c[aK>>2]=bf;L=c[K>>2]|0;if((a[W]&1)==0){c[aL>>2]=c[W>>2];c[aL+4>>2]=c[W+4>>2];c[aL+8>>2]=c[W+8>>2]}else{a$=c[aj>>2]|0;a5=c[ak>>2]|0;if(a5>>>0>4294967279>>>0){N=134;break}if(a5>>>0<11>>>0){a[aL]=a5<<1;bn=aT}else{a0=a5+16&-16;aY=K2(a0)|0;c[aP>>2]=aY;c[aU>>2]=a0|1;c[aV>>2]=a5;bn=aY}Ld(bn|0,a$|0,a5)|0;a[bn+a5|0]=0}c[aM>>2]=c[U>>2];c[aM+4>>2]=c[U+4>>2];c[aM+8>>2]=c[U+8>>2];z=0;aq(16,w|0,x|0,L|0,y|0,A|0);if(z){z=0;N=155;break}L=(z=0,au(170,w|0)|0);if(z){z=0;N=156;break}if((a[aN]&1)!=0){K4(c[aS>>2]|0)}a5=c[aO>>2]|0;a$=a5;if((a5|0)!=0){aY=c[aQ>>2]|0;if((a5|0)!=(aY|0)){c[aQ>>2]=aY+(~((aY-4+(-a$|0)|0)>>>2)<<2)}K4(a5)}if((a[aL]&1)!=0){K4(c[aP>>2]|0)}a[L+29|0]=1;c[h>>2]=L;a5=c[af>>2]|0;a$=a5;if((a5|0)==(c[ag>>2]|0)){fo(ah,h);bo=c[h>>2]|0}else{if((a5|0)==0){bp=0}else{c[a$>>2]=L;bp=c[af>>2]|0}c[af>>2]=bp+4;bo=L}cA[c[c[aa>>2]>>2]&1023](V,bo);L=bf+1|0;if(L>>>0<q>>>0){aW=L}else{bm=Q;N=235;break}}do{if((N|0)==108){aM=bS(-1,-1)|0;bq=M;br=aM;N=110}else if((N|0)==232){bs=bm;i=d;return bs|0}else if((N|0)==235){bs=bm;i=d;return bs|0}else if((N|0)==111){aM=bS(-1,-1)|0;aV=aM;aM=M;if((a[$]&1)==0){if(bc){bt=aV;bu=aM;break}else{bv=aM;bw=aV}bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}else{K4(c[ai>>2]|0);if(bc){bt=aV;bu=aM;break}else{bv=aM;bw=aV}bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}}else if((N|0)==188){aV=bS(-1,-1)|0;aM=aV;aV=M;if((a[aw]&1)==0){bB=aV;bC=aM;N=190;break}K4(c[aE>>2]|0);bB=aV;bC=aM;N=190}else if((N|0)==192){if(aW>>>0>=q>>>0){bm=Q;bs=bm;i=d;return bs|0}aM=c[K>>2]|0;aV=K2(52)|0;c[g>>2]=aV;aU=aM+4|0;aT=c[aU>>2]|0;if((aT|0)==(c[aM+8>>2]|0)){e3(aM|0,g);bD=c[g>>2]|0}else{if((aT|0)==0){bE=0}else{c[aT>>2]=aV;bE=c[aU>>2]|0}c[aU>>2]=bE+4;bD=aV}aV=bD;aT=bD;L188:do{if((a[W]&1)==0){aK=E;c[aK>>2]=c[W>>2];c[aK+4>>2]=c[W+4>>2];c[aK+8>>2]=c[W+8>>2];N=208}else{aK=c[aj>>2]|0;aJ=c[ak>>2]|0;do{if(aJ>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(aJ>>>0<11>>>0){a[E]=aJ<<1;bF=E+1|0}else{aB=aJ+16&-16;aA=(z=0,au(246,aB|0)|0);if(z){z=0;break}c[E+8>>2]=aA;c[E>>2]=aB|1;c[E+4>>2]=aJ;bF=aA}Ld(bF|0,aK|0,aJ)|0;a[bF+aJ|0]=0;N=208;break L188}}while(0);aJ=bS(-1,-1)|0;bG=aJ;bH=M}}while(0);do{if((N|0)==208){aJ=f;c[aJ>>2]=c[U>>2];c[aJ+4>>2]=c[U+4>>2];c[aJ+8>>2]=c[U+8>>2];c[F>>2]=aW;c[F+4>>2]=q;z=0;aq(14,aT|0,E|0,f|0,F|0,0);do{if(!z){aJ=bD;c[e>>2]=aJ;aK=c[af>>2]|0;aA=aK;if((aK|0)==(c[ag>>2]|0)){z=0;as(370,ah|0,e|0);if(z){z=0;bI=0;break}bJ=c[e>>2]|0}else{if((aK|0)==0){bK=0}else{c[aA>>2]=aJ;bK=c[af>>2]|0}c[af>>2]=bK+4;bJ=aJ}z=0;as(c[c[aa>>2]>>2]|0,V|0,bJ|0);if(z){z=0;bI=0;break}if((a[E]&1)==0){bm=Q;bs=bm;i=d;return bs|0}K4(c[E+8>>2]|0);bm=Q;bs=bm;i=d;return bs|0}else{z=0;bI=1}}while(0);aJ=bS(-1,-1)|0;aA=aJ;aJ=M;if((a[E]&1)==0){if(bI){bG=aA;bH=aJ;break}else{bv=aJ;bw=aA}bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}else{K4(c[E+8>>2]|0);if(bI){bG=aA;bH=aJ;break}else{bv=aJ;bw=aA}bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}}}while(0);aT=c[aM>>2]|0;aA=c[aU>>2]|0;aJ=aT;while(1){if((aJ|0)==(aA|0)){bL=aA;break}if((c[aJ>>2]|0)==(bD|0)){bL=aJ;break}else{aJ=aJ+4|0}}aJ=bL-aT>>2;aM=aT+(aJ+1<<2)|0;aK=aA-aM|0;Le(aT+(aJ<<2)|0,aM|0,aK|0)|0;aM=aT+((aK>>2)+aJ<<2)|0;aJ=c[aU>>2]|0;if((aM|0)!=(aJ|0)){c[aU>>2]=aJ+(~((aJ-4+(-aM|0)|0)>>>2)<<2)}K4(aV);bv=bH;bw=bG;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}else if((N|0)==170){z=0;ar(88,0);if(!z){return 0}else{z=0;aM=bS(-1,-1)|0;bM=M;bN=aM;N=179;break}}else if((N|0)==134){DH(0);return 0}else if((N|0)==155){aM=bS(-1,-1)|0;bO=M;bP=aM;N=162}else if((N|0)==156){aM=bS(-1,-1)|0;aJ=aM;aM=M;if((a[aN]&1)!=0){K4(c[aS>>2]|0)}aK=c[aO>>2]|0;if((aK|0)==0){bO=aM;bP=aJ;N=162;break}aB=c[aQ>>2]|0;if((aK|0)!=(aB|0)){c[aQ>>2]=aB+(~((aB-4+(-aK|0)|0)>>>2)<<2)}K4(aK);bO=aM;bP=aJ;N=162}else if((N|0)==165){DH(0);return 0}else if((N|0)==177){aJ=bS(-1,-1)|0;bM=M;bN=aJ;N=179}else if((N|0)==82){z=0;ar(88,0);if(!z){return 0}else{z=0;aJ=bS(-1,-1)|0;bq=M;br=aJ;N=110;break}}}while(0);if((N|0)==179){if((a[aw]&1)!=0){K4(c[aE>>2]|0)}bB=bM;bC=bN;N=190}else if((N|0)==110){bt=br;bu=bq}else if((N|0)==162){if((a[aL]&1)==0){bv=bO;bw=bP;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}K4(c[aP>>2]|0);bv=bO;bw=bP;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}if((N|0)==190){if((a[at]&1)==0){bv=bB;bw=bC;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}K4(c[aC>>2]|0);bv=bB;bw=bC;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}aQ=c[a6>>2]|0;aO=c[a7>>2]|0;aS=aQ;while(1){if((aS|0)==(aO|0)){bQ=aO;break}if((c[aS>>2]|0)==(a8|0)){bQ=aS;break}else{aS=aS+4|0}}aS=bQ-aQ>>2;aC=aQ+(aS+1<<2)|0;at=aO-aC|0;Le(aQ+(aS<<2)|0,aC|0,at|0)|0;aC=aQ+((at>>2)+aS<<2)|0;aS=c[a7>>2]|0;if((aC|0)!=(aS|0)){c[a7>>2]=aS+(~((aS-4+(-aC|0)|0)>>>2)<<2)}K4(ba);bv=bu;bw=bt;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}}while(0);W=c[R>>2]|0;K=c[O>>2]|0;G=W;while(1){if((G|0)==(K|0)){bR=K;break}if((c[G>>2]|0)==(Y|0)){bR=G;break}else{G=G+4|0}}G=bR-W>>2;R=W+(G+1<<2)|0;J=K-R|0;Le(W+(G<<2)|0,R|0,J|0)|0;R=W+((J>>2)+G<<2)|0;G=c[O>>2]|0;if((R|0)!=(G|0)){c[O>>2]=G+(~((G-4+(-R|0)|0)>>>2)<<2)}K4(Q);bv=ab;bw=ac;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0)}else{N=12}}while(0);if((N|0)==12){X=c[b>>2]|0}ac=K2(52)|0;c[p>>2]=ac;ab=X+4|0;bR=c[ab>>2]|0;if((bR|0)==(c[X+8>>2]|0)){e3(X|0,p);bT=c[p>>2]|0}else{if((bR|0)==0){bU=0}else{c[bR>>2]=ac;bU=c[ab>>2]|0}c[ab>>2]=bU+4;bT=ac}ac=bT;bU=b+28|0;L298:do{if((a[bU]&1)==0){bR=s;c[bR>>2]=c[bU>>2];c[bR+4>>2]=c[bU+4>>2];c[bR+8>>2]=c[bU+8>>2];N=29}else{bR=c[b+36>>2]|0;p=c[b+32>>2]|0;do{if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(p>>>0<11>>>0){a[s]=p<<1;bV=s+1|0}else{Y=p+16&-16;bt=(z=0,au(246,Y|0)|0);if(z){z=0;break}c[s+8>>2]=bt;c[s>>2]=Y|1;c[s+4>>2]=p;bV=bt}Ld(bV|0,bR|0,p)|0;a[bV+p|0]=0;N=29;break L298}}while(0);p=bS(-1,-1)|0;bW=M;bX=p}}while(0);do{if((N|0)==29){bV=b+44|0;bU=o;c[bU>>2]=c[bV>>2];c[bU+4>>2]=c[bV+4>>2];c[bU+8>>2]=c[bV+8>>2];z=0;aq(14,bT|0,s|0,o|0,r|0,0);if(z){z=0;bV=bS(-1,-1)|0;bU=bV;bV=M;if((a[s]&1)==0){bW=bV;bX=bU;break}K4(c[s+8>>2]|0);bW=bV;bX=bU;break}if((a[s]&1)!=0){K4(c[s+8>>2]|0)}a[bT+28|0]=1;bm=ac;bs=bm;i=d;return bs|0}}while(0);bs=c[X>>2]|0;X=c[ab>>2]|0;d=bs;while(1){if((d|0)==(X|0)){bY=X;break}if((c[d>>2]|0)==(bT|0)){bY=d;break}else{d=d+4|0}}d=bY-bs>>2;bY=bs+(d+1<<2)|0;bT=X-bY|0;Le(bs+(d<<2)|0,bY|0,bT|0)|0;bY=bs+((bT>>2)+d<<2)|0;d=c[ab>>2]|0;if((bY|0)!=(d|0)){c[ab>>2]=d+(~((d-4+(-bY|0)|0)>>>2)<<2)}K4(ac);bv=bW;bw=bX;bx=bw;by=0;bz=bx;bA=bv;bg(bz|0);return 0}function uQ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yP(e)|0;do{if((f|0)==0){g=yO(e)|0;if((g|0)==0){h=0}else{i=g;break}return h|0}else{i=f}}while(0);f=b+48|0;g=c[f>>2]|0;j=c[d>>2]|0;L5:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L5}else{n=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[f>>2]=g+o;g=e;f=0;while(1){n=g-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{g=n;f=f+1|0}}g=b+40|0;if((o|0)!=0){c[g>>2]=1}o=c[g>>2]|0;c[b+52>>2]=o+f;j=i;n=e;c[g>>2]=j-n+f+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=i;h=i;return h|0}function uR(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yP(e)|0;do{if((f|0)==0){g=yO(e)|0;if((g|0)!=0){h=g;break}g=zg(e)|0;if((g|0)==0){i=0}else{h=g;break}return i|0}else{h=f}}while(0);f=b+48|0;g=c[f>>2]|0;j=c[d>>2]|0;L6:do{if(j>>>0<h>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L6}else{n=l}m=k+1|0;if(m>>>0<h>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[f>>2]=g+o;g=e;f=0;while(1){n=g-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{g=n;f=f+1|0}}g=b+40|0;if((o|0)!=0){c[g>>2]=1}o=c[g>>2]|0;c[b+52>>2]=o+f;j=h;n=e;c[g>>2]=j-n+f+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=h;i=h;return i|0}function uS(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;d=i;i=i+104|0;e=d|0;f=d+16|0;g=d+32|0;h=d+48|0;j=d+72|0;k=d+88|0;l=tZ(b)|0;m=d+56|0;n=b+44|0;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];n=c[b>>2]|0;o=K2(44)|0;c[h>>2]=o;p=n+4|0;q=c[p>>2]|0;if((q|0)==(c[n+8>>2]|0)){e3(n|0,h);r=c[h>>2]|0}else{if((q|0)==0){s=0}else{c[q>>2]=o;s=c[p>>2]|0}c[p>>2]=s+4;r=o}o=r;s=r;q=b+28|0;L8:do{if((a[q]&1)==0){h=j;c[h>>2]=c[q>>2];c[h+4>>2]=c[q+4>>2];c[h+8>>2]=c[q+8>>2];t=16}else{h=c[b+36>>2]|0;u=c[b+32>>2]|0;do{if(u>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(u>>>0<11>>>0){a[j]=u<<1;v=j+1|0}else{w=u+16&-16;x=(z=0,au(246,w|0)|0);if(z){z=0;break}c[j+8>>2]=x;c[j>>2]=w|1;c[j+4>>2]=u;v=x}Ld(v|0,h|0,u)|0;a[v+u|0]=0;t=16;break L8}}while(0);u=bS(-1,-1)|0;y=M;A=u}}while(0);do{if((t|0)==16){v=k;c[v>>2]=c[m>>2];c[v+4>>2]=c[m+4>>2];c[v+8>>2]=c[m+8>>2];q=(z=0,au(92,b|0)|0);do{if(!z){u=g;c[u>>2]=c[v>>2];c[u+4>>2]=c[v+4>>2];c[u+8>>2]=c[v+8>>2];h=e;x=f;w=r;B=j;C=a[B]|0;D=(C&1)==0;if(D){c[h>>2]=c[B>>2];c[h+4>>2]=c[B+4>>2];c[h+8>>2]=c[B+8>>2]}else{B=c[j+8>>2]|0;E=c[j+4>>2]|0;if(E>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;t=36;break}return 0}if(E>>>0<11>>>0){a[h]=E<<1;F=e+1|0}else{G=E+16&-16;H=(z=0,au(246,G|0)|0);if(z){z=0;t=36;break}c[e+8>>2]=H;c[e>>2]=G|1;c[e+4>>2]=E;F=H}Ld(F|0,B|0,E)|0;a[F+E|0]=0}c[x>>2]=c[u>>2];c[x+4>>2]=c[u+4>>2];c[x+8>>2]=c[u+8>>2];z=0;aD(6,w|0,e|0,f|0,0,0,0);if(z){z=0;w=bS(-1,-1)|0;u=M;if((a[h]&1)==0){I=u;J=w;K=C;break}K4(c[e+8>>2]|0);I=u;J=w;K=C;break}if((a[h]&1)!=0){K4(c[e+8>>2]|0)}c[r>>2]=19512;c[r+36>>2]=l;c[r+40>>2]=q;c[r+32>>2]=4;if(D){i=d;return s|0}K4(c[j+8>>2]|0);i=d;return s|0}else{z=0;t=36}}while(0);if((t|0)==36){q=bS(-1,-1)|0;I=M;J=q;K=a[j]|0}q=J;v=I;if((K&1)==0){y=v;A=q;break}K4(c[j+8>>2]|0);y=v;A=q}}while(0);j=c[n>>2]|0;n=c[p>>2]|0;K=j;while(1){if((K|0)==(n|0)){L=n;break}if((c[K>>2]|0)==(r|0)){L=K;break}else{K=K+4|0}}K=L-j>>2;L=j+(K+1<<2)|0;r=n-L|0;Le(j+(K<<2)|0,L|0,r|0)|0;L=j+((r>>2)+K<<2)|0;K=c[p>>2]|0;if((L|0)==(K|0)){K4(o);N=A;O=0;P=N;Q=y;bg(P|0)}c[p>>2]=K+(~((K-4+(-L|0)|0)>>>2)<<2);K4(o);N=A;O=0;P=N;Q=y;bg(P|0);return 0}function uT(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0;d=i;i=i+104|0;e=d|0;f=d+16|0;g=d+24|0;h=d+56|0;j=d+72|0;k=d+88|0;tO(b)|0;l=c[b+56>>2]|0;m=(c[b+60>>2]|0)-l|0;if(m>>>0>4294967279>>>0){DH(0);return 0}if(m>>>0<11>>>0){n=m<<1&255;a[g]=n;o=g+1|0;p=n}else{n=m+16&-16;q=K2(n)|0;c[g+8>>2]=q;r=n|1;c[g>>2]=r;c[g+4>>2]=m;o=q;p=r&255}Ld(o|0,l|0,m)|0;a[o+m|0]=0;m=d+40|0;o=b+44|0;c[m>>2]=c[o>>2];c[m+4>>2]=c[o+4>>2];c[m+8>>2]=c[o+8>>2];o=c[b>>2]|0;l=(z=0,au(246,52)|0);do{if(!z){r=l;c[f>>2]=r;q=o+4|0;n=c[q>>2]|0;if((n|0)==(c[o+8>>2]|0)){z=0;as(376,o|0,f|0);if(z){z=0;s=42;break}t=c[f>>2]|0}else{if((n|0)==0){u=0}else{c[n>>2]=r;u=c[q>>2]|0}c[q>>2]=u+4;t=r}r=t;n=t;v=b+28|0;L18:do{if((a[v]&1)==0){w=h;c[w>>2]=c[v>>2];c[w+4>>2]=c[v+4>>2];c[w+8>>2]=c[v+8>>2];s=23}else{w=c[b+36>>2]|0;x=c[b+32>>2]|0;do{if(x>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(x>>>0<11>>>0){a[h]=x<<1;y=h+1|0}else{A=x+16&-16;B=(z=0,au(246,A|0)|0);if(z){z=0;break}c[h+8>>2]=B;c[h>>2]=A|1;c[h+4>>2]=x;y=B}Ld(y|0,w|0,x)|0;a[y+x|0]=0;s=23;break L18}}while(0);x=bS(-1,-1)|0;C=x;D=M}}while(0);do{if((s|0)==23){v=j;c[v>>2]=c[m>>2];c[v+4>>2]=c[m+4>>2];c[v+8>>2]=c[m+8>>2];L33:do{if((p&1)==0){x=g;w=k;c[w>>2]=c[x>>2];c[w+4>>2]=c[x+4>>2];c[w+8>>2]=c[x+8>>2];s=33}else{x=c[g+8>>2]|0;w=c[g+4>>2]|0;do{if(w>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(w>>>0<11>>>0){a[k]=w<<1;E=k+1|0}else{B=w+16&-16;A=(z=0,au(246,B|0)|0);if(z){z=0;break}c[k+8>>2]=A;c[k>>2]=B|1;c[k+4>>2]=w;E=A}Ld(E|0,x|0,w)|0;a[E+w|0]=0;s=33;break L33}}while(0);w=bS(-1,-1)|0;F=w;G=M}}while(0);do{if((s|0)==33){w=(z=0,au(92,b|0)|0);do{if(!z){x=e;c[x>>2]=c[v>>2];c[x+4>>2]=c[v+4>>2];c[x+8>>2]=c[v+8>>2];z=0;aq(10,n|0,h|0,e|0,k|0,w|0);if(z){z=0;break}if((a[k]&1)!=0){K4(c[k+8>>2]|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}if((p&1)==0){i=d;return n|0}K4(c[g+8>>2]|0);i=d;return n|0}else{z=0}}while(0);w=bS(-1,-1)|0;x=w;w=M;if((a[k]&1)==0){F=x;G=w;break}K4(c[k+8>>2]|0);F=x;G=w}}while(0);if((a[h]&1)==0){C=F;D=G;break}K4(c[h+8>>2]|0);C=F;D=G}}while(0);n=c[o>>2]|0;v=c[q>>2]|0;w=n;while(1){if((w|0)==(v|0)){H=v;break}if((c[w>>2]|0)==(t|0)){H=w;break}else{w=w+4|0}}w=H-n>>2;x=n+(w+1<<2)|0;A=v-x|0;Le(n+(w<<2)|0,x|0,A|0)|0;x=n+((A>>2)+w<<2)|0;w=c[q>>2]|0;if((x|0)!=(w|0)){c[q>>2]=w+(~((w-4+(-x|0)|0)>>>2)<<2)}K4(r);I=C;J=D}else{z=0;s=42}}while(0);if((s|0)==42){s=bS(-1,-1)|0;I=s;J=M}if((p&1)==0){K=I;L=0;N=K;O=J;bg(N|0)}K4(c[g+8>>2]|0);K=I;L=0;N=K;O=J;bg(N|0);return 0}function uU(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=(a[e]|0)==43?e+1|0:0;if((f|0)==0){g=0;return g|0}h=yN(f)|0;if((h|0)==0){g=0;return g|0}f=(zg(h)|0)!=0;i=f?0:h;if((i|0)==0){g=0;return g|0}h=b+48|0;f=c[h>>2]|0;j=c[d>>2]|0;L10:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L10}else{n=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=f+o;f=e;h=0;while(1){n=f-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{f=n;h=h+1|0}}f=b+40|0;if((o|0)!=0){c[f>>2]=1}o=c[f>>2]|0;c[b+52>>2]=o+h;j=i;n=e;c[f>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=i;g=i;return g|0}function uV(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+48|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=h+32|0;Ld(l|0,e|0,12)|0;e=j;m=k;n=b|0;o=d;if((a[o]&1)==0){c[e>>2]=c[o>>2];c[e+4>>2]=c[o+4>>2];c[e+8>>2]=c[o+8>>2]}else{o=c[d+8>>2]|0;p=c[d+4>>2]|0;if(p>>>0>4294967279>>>0){DH(0)}if(p>>>0<11>>>0){a[e]=p<<1;q=j+1|0}else{d=p+16&-16;r=K2(d)|0;c[j+8>>2]=r;c[j>>2]=d|1;c[j+4>>2]=p;q=r}Ld(q|0,o|0,p)|0;a[q+p|0]=0}c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];z=0;aD(6,n|0,j|0,k|0,0,0,0);if(!z){if((a[e]&1)==0){s=b|0;c[s>>2]=20192;t=b+36|0;c[t>>2]=f;u=b+40|0;c[u>>2]=g;i=h;return}K4(c[j+8>>2]|0);s=b|0;c[s>>2]=20192;t=b+36|0;c[t>>2]=f;u=b+40|0;c[u>>2]=g;i=h;return}else{z=0;h=bS(-1,-1)|0;if((a[e]&1)==0){bg(h|0)}K4(c[j+8>>2]|0);bg(h|0)}}function uW(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=(a[e]|0)==45?e+1|0:0;if((f|0)==0){g=0;return g|0}h=yN(f)|0;if((h|0)==0){g=0;return g|0}f=(zg(h)|0)!=0;i=f?0:h;if((i|0)==0){g=0;return g|0}h=b+48|0;f=c[h>>2]|0;j=c[d>>2]|0;L10:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L10}else{n=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=f+o;f=e;h=0;while(1){n=f-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{f=n;h=h+1|0}}f=b+40|0;if((o|0)!=0){c[f>>2]=1}o=c[f>>2]|0;c[b+52>>2]=o+h;j=i;n=e;c[f>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=i;g=i;return g|0}function uX(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zo(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function uY(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0;d=i;i=i+128|0;e=d|0;f=d+8|0;g=d+24|0;h=d+32|0;j=d+40|0;k=d+48|0;l=d+64|0;m=d+72|0;n=d+88|0;o=d+96|0;p=d+112|0;q=d+120|0;r=q;s=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;u=i;i=i+12|0;i=i+7&-8;v=i;i=i+8|0;w=i;i=i+64|0;x=i;i=i+8|0;y=i;i=i+12|0;i=i+7&-8;A=i;i=i+12|0;i=i+7&-8;B=i;i=i+12|0;i=i+7&-8;C=i;i=i+12|0;i=i+7&-8;D=i;i=i+12|0;i=i+7&-8;E=i;i=i+12|0;i=i+7&-8;F=i;i=i+8|0;tF(b)|0;G=b+56|0;H=c[G>>2]|0;I=c[G+4>>2]|0;c[q>>2]=H;c[q+4>>2]=I;q=H;H=q;G=I;I=G;L1:do{if(H>>>0<I>>>0){J=a[36320]|0;K=J<<24>>24==0;L3:do{if(K){L=H;while(1){N=a[L]|0;if(N<<24>>24==0){O=12;break L1}P=L+1|0;if(!(N<<24>>24==92&(P|0)!=0|(L|0)==0)){Q=L;break L3}if(P>>>0<I>>>0){L=P}else{O=12;break L1}}}else{L=H;while(1){P=a[L]|0;if(P<<24>>24==0){O=12;break L1}N=L+1|0;R=P<<24>>24==92&(N|0)!=0?0:L;if((R|0)!=0){P=R;R=36320;S=J;while(1){if((a[P]|0)!=S<<24>>24){T=P;U=S;break}V=P+1|0;W=R+1|0;X=a[W]|0;if(X<<24>>24==0){T=V;U=0;break}else{P=V;R=W;S=X}}if(!(U<<24>>24!=0|(T|0)==0)){Q=L;break L3}}if(N>>>0<I>>>0){L=N}else{O=12;break L1}}}}while(0);L=b|0;S=c[L>>2]|0;if((Q|0)==0){Y=S;break}R=K2(60)|0;c[n>>2]=R;P=S+4|0;X=c[P>>2]|0;if((X|0)==(c[S+8>>2]|0)){e3(S|0,n);Z=c[n>>2]|0}else{if((X|0)==0){_=0}else{c[X>>2]=R;_=c[P>>2]|0}c[P>>2]=_+4;Z=R}R=Z;X=Z;W=b+28|0;L26:do{if((a[W]&1)==0){V=t;c[V>>2]=c[W>>2];c[V+4>>2]=c[W+4>>2];c[V+8>>2]=c[W+8>>2];O=57}else{V=c[b+36>>2]|0;$=c[b+32>>2]|0;do{if($>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if($>>>0<11>>>0){a[t]=$<<1;aa=t+1|0}else{ab=$+16&-16;ac=(z=0,au(246,ab|0)|0);if(z){z=0;break}c[t+8>>2]=ac;c[t>>2]=ab|1;c[t+4>>2]=$;aa=ac}Ld(aa|0,V|0,$)|0;a[aa+$|0]=0;O=57;break L26}}while(0);$=bS(-1,-1)|0;ad=M;ae=$}}while(0);do{if((O|0)==57){$=b+44|0;V=m;c[V>>2]=c[$>>2];c[V+4>>2]=c[$+4>>2];c[V+8>>2]=c[$+8>>2];z=0;aD(2,X|0,t|0,m|0,0,0,0);if(z){z=0;V=bS(-1,-1)|0;ac=V;V=M;if((a[t]&1)==0){ad=V;ae=ac;break}K4(c[t+8>>2]|0);ad=V;ae=ac;break}if((a[t]&1)!=0){K4(c[t+8>>2]|0)}a[Z+56|0]=a[H]|0;ac=Z+40|0;V=ac;ab=u;af=v|0;ag=v+4|0;ah=ac+8|0;ai=ac+12|0;aj=ac+4|0;ak=u+8|0;al=b+36|0;am=b+32|0;an=u+1|0;ao=u|0;ap=u+4|0;at=a[36048]|0;av=at<<24>>24==0;aw=C;ax=C+1|0;ay=B;aA=B+1|0;aB=D|0;aC=D+4|0;aE=D+8|0;aF=C+8|0;aG=B+8|0;aH=B|0;aI=B+4|0;aJ=C+4|0;aK=C|0;aL=x|0;aM=x+4|0;aN=y;aO=A;aP=w+28|0;aQ=w+4|0;aS=y+8|0;aT=w+8|0;aU=w+36|0;aV=y+1|0;aW=y|0;aX=y+4|0;aY=H;L48:while(1){L50:while(1){L52:do{if(K){aZ=aY;while(1){a_=a[aZ]|0;if(a_<<24>>24==0){O=192;break L48}a$=aZ+1|0;if(!(a_<<24>>24==92&(a$|0)!=0|(aZ|0)==0)){a0=aZ;break L52}if(a$>>>0<I>>>0){aZ=a$}else{O=192;break L48}}}else{aZ=aY;while(1){a$=a[aZ]|0;if(a$<<24>>24==0){O=192;break L48}a_=aZ+1|0;a1=a$<<24>>24==92&(a_|0)!=0?0:aZ;if((a1|0)!=0){a$=a1;a1=36320;a2=J;while(1){if((a[a$]|0)!=a2<<24>>24){a3=a$;a4=a2;break}a5=a$+1|0;a6=a1+1|0;a7=a[a6]|0;if(a7<<24>>24==0){a3=a5;a4=0;break}else{a$=a5;a1=a6;a2=a7}}if(!(a4<<24>>24!=0|(a3|0)==0)){a0=aZ;break L52}}if(a_>>>0<I>>>0){aZ=a_}else{O=192;break L48}}}}while(0);if((a0|0)==0){O=192;break L48}do{if(aY>>>0<a0>>>0){a8=c[L>>2]|0;aZ=K2(52)|0;c[l>>2]=aZ;a9=a8+4|0;a2=c[a9>>2]|0;if((a2|0)==(c[a8+8>>2]|0)){e3(a8|0,l);ba=c[l>>2]|0}else{if((a2|0)==0){bb=0}else{c[a2>>2]=aZ;bb=c[a9>>2]|0}c[a9>>2]=bb+4;ba=aZ}bc=ba;aZ=ba;if((a[W]&1)==0){c[ab>>2]=c[W>>2];c[ab+4>>2]=c[W+4>>2];c[ab+8>>2]=c[W+8>>2]}else{a2=c[al>>2]|0;a1=c[am>>2]|0;if(a1>>>0>4294967279>>>0){O=82;break L48}if(a1>>>0<11>>>0){a[ab]=a1<<1;bd=an}else{a$=a1+16&-16;a7=(z=0,au(246,a$|0)|0);if(z){z=0;O=108;break L48}c[ak>>2]=a7;c[ao>>2]=a$|1;c[ap>>2]=a1;bd=a7}Ld(bd|0,a2|0,a1)|0;a[bd+a1|0]=0}a1=k;c[a1>>2]=c[$>>2];c[a1+4>>2]=c[$+4>>2];c[a1+8>>2]=c[$+8>>2];c[af>>2]=aY;c[ag>>2]=a0;z=0;aq(14,aZ|0,u|0,k|0,v|0,0);if(z){z=0;be=1;O=111;break L48}aZ=ba;c[j>>2]=aZ;a1=c[ah>>2]|0;a2=a1;if((a1|0)==(c[ai>>2]|0)){z=0;as(370,aj|0,j|0);if(z){z=0;be=0;O=111;break L48}bf=c[j>>2]|0}else{if((a1|0)==0){bh=0}else{c[a2>>2]=aZ;bh=c[ah>>2]|0}c[ah>>2]=bh+4;bf=aZ}z=0;as(c[c[ac>>2]>>2]|0,V|0,bf|0);if(z){z=0;be=0;O=111;break L48}if((a[ab]&1)==0){break}K4(c[ak>>2]|0)}}while(0);L99:do{if(av){aZ=a0;while(1){if(aZ>>>0>=I>>>0){break L99}if((a[aZ]|0)==0){break L99}if((aZ|0)==0){aZ=aZ+1|0}else{bi=aZ;break L50}}}else{aZ=a0;while(1){if(aZ>>>0>=I>>>0){break L99}a2=a[aZ]|0;if(a2<<24>>24==0){break L99}L108:do{if(a2<<24>>24==at<<24>>24){a1=36048;a7=aZ;while(1){a$=a7+1|0;a6=a1+1|0;a5=a[a6]|0;if(a5<<24>>24==0){bj=a$;bk=0;break L108}if((a[a$]|0)==a5<<24>>24){a1=a6;a7=a$}else{bj=a$;bk=a5;break}}}else{bj=aZ;bk=at}}while(0);if(bk<<24>>24!=0|(bj|0)==0){aZ=aZ+1|0}else{break}}if((aZ|0)!=0){bi=aZ;break L50}}}while(0);a2=G-q|0;if(a2>>>0>4294967279>>>0){O=165;break L48}if(a2>>>0<11>>>0){a_=a2<<1&255;a[aw]=a_;bl=ax;bm=a_}else{a_=a2+16&-16;a7=K2(a_)|0;c[aF>>2]=a7;a1=a_|1;c[aK>>2]=a1;c[aJ>>2]=a2;bl=a7;bm=a1&255}Ld(bl|0,H|0,a2)|0;a[bl+a2|0]=0;Lg(ay|0,0,12)|0;a2=bm&255;a1=(a2&1|0)==0?a2>>>1:c[aJ>>2]|0;a2=a1+48|0;if(a2>>>0>4294967279>>>0){O=170;break L48}if(a2>>>0<11>>>0){a[ay]=96;bn=aA}else{a2=a1+64&-16;a7=(z=0,au(246,a2|0)|0);if(z){z=0;O=177;break L48}c[aG>>2]=a7;c[aH>>2]=a2|1;c[aI>>2]=48;bn=a7}Ld(bn|0,4832,48)|0;a[bn+48|0]=0;z=0,az(84,B|0,((bm&1)==0?ax:c[aF>>2]|0)|0,a1|0)|0;if(z){z=0;O=177;break L48}c[aB>>2]=0;c[aC>>2]=0;c[aE>>2]=0;z=0;aR(482,b|0,B|0,D|0);if(z){z=0;O=188;break L48}if((a[ay]&1)!=0){K4(c[aG>>2]|0)}if((a[aw]&1)!=0){K4(c[aF>>2]|0)}if(aY>>>0>=I>>>0){bo=R;O=233;break L48}}c[aL>>2]=a0+2;c[aM>>2]=bi;N=c[L>>2]|0;if((a[W]&1)==0){c[aN>>2]=c[W>>2];c[aN+4>>2]=c[W+4>>2];c[aN+8>>2]=c[W+8>>2]}else{a1=c[al>>2]|0;a7=c[am>>2]|0;if(a7>>>0>4294967279>>>0){O=134;break}if(a7>>>0<11>>>0){a[aN]=a7<<1;bp=aV}else{a2=a7+16&-16;a_=K2(a2)|0;c[aS>>2]=a_;c[aW>>2]=a2|1;c[aX>>2]=a7;bp=a_}Ld(bp|0,a1|0,a7)|0;a[bp+a7|0]=0}c[aO>>2]=c[$>>2];c[aO+4>>2]=c[$+4>>2];c[aO+8>>2]=c[$+8>>2];z=0;aq(16,w|0,x|0,N|0,y|0,A|0);if(z){z=0;O=155;break}N=(z=0,au(170,w|0)|0);if(z){z=0;O=156;break}if((a[aP]&1)!=0){K4(c[aU>>2]|0)}a7=c[aQ>>2]|0;a1=a7;if((a7|0)!=0){a_=c[aT>>2]|0;if((a7|0)!=(a_|0)){c[aT>>2]=a_+(~((a_-4+(-a1|0)|0)>>>2)<<2)}K4(a7)}if((a[aN]&1)!=0){K4(c[aS>>2]|0)}a[N+29|0]=1;c[h>>2]=N;a7=c[ah>>2]|0;a1=a7;if((a7|0)==(c[ai>>2]|0)){fo(aj,h);bq=c[h>>2]|0}else{if((a7|0)==0){br=0}else{c[a1>>2]=N;br=c[ah>>2]|0}c[ah>>2]=br+4;bq=N}cA[c[c[ac>>2]>>2]&1023](V,bq);N=bi+1|0;if(N>>>0<I>>>0){aY=N}else{bo=R;O=232;break}}do{if((O|0)==232){bs=bo;i=d;return bs|0}else if((O|0)==233){bs=bo;i=d;return bs|0}else if((O|0)==192){if(aY>>>0>=I>>>0){bo=R;bs=bo;i=d;return bs|0}aO=c[L>>2]|0;aX=K2(52)|0;c[g>>2]=aX;aW=aO+4|0;aV=c[aW>>2]|0;if((aV|0)==(c[aO+8>>2]|0)){e3(aO|0,g);bt=c[g>>2]|0}else{if((aV|0)==0){bu=0}else{c[aV>>2]=aX;bu=c[aW>>2]|0}c[aW>>2]=bu+4;bt=aX}aX=bt;aV=bt;L179:do{if((a[W]&1)==0){aM=E;c[aM>>2]=c[W>>2];c[aM+4>>2]=c[W+4>>2];c[aM+8>>2]=c[W+8>>2];O=208}else{aM=c[al>>2]|0;aL=c[am>>2]|0;do{if(aL>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(aL>>>0<11>>>0){a[E]=aL<<1;bv=E+1|0}else{aE=aL+16&-16;aC=(z=0,au(246,aE|0)|0);if(z){z=0;break}c[E+8>>2]=aC;c[E>>2]=aE|1;c[E+4>>2]=aL;bv=aC}Ld(bv|0,aM|0,aL)|0;a[bv+aL|0]=0;O=208;break L179}}while(0);aL=bS(-1,-1)|0;bw=aL;bx=M}}while(0);do{if((O|0)==208){aL=f;c[aL>>2]=c[$>>2];c[aL+4>>2]=c[$+4>>2];c[aL+8>>2]=c[$+8>>2];c[F>>2]=aY;c[F+4>>2]=I;z=0;aq(14,aV|0,E|0,f|0,F|0,0);do{if(!z){aL=bt;c[e>>2]=aL;aM=c[ah>>2]|0;aC=aM;if((aM|0)==(c[ai>>2]|0)){z=0;as(370,aj|0,e|0);if(z){z=0;by=0;break}bz=c[e>>2]|0}else{if((aM|0)==0){bA=0}else{c[aC>>2]=aL;bA=c[ah>>2]|0}c[ah>>2]=bA+4;bz=aL}z=0;as(c[c[ac>>2]>>2]|0,V|0,bz|0);if(z){z=0;by=0;break}if((a[E]&1)==0){bo=R;bs=bo;i=d;return bs|0}K4(c[E+8>>2]|0);bo=R;bs=bo;i=d;return bs|0}else{z=0;by=1}}while(0);aL=bS(-1,-1)|0;aC=aL;aL=M;if((a[E]&1)==0){if(by){bw=aC;bx=aL;break}else{bB=aL;bC=aC}bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}else{K4(c[E+8>>2]|0);if(by){bw=aC;bx=aL;break}else{bB=aL;bC=aC}bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}}}while(0);aV=c[aO>>2]|0;aC=c[aW>>2]|0;aL=aV;while(1){if((aL|0)==(aC|0)){bH=aC;break}if((c[aL>>2]|0)==(bt|0)){bH=aL;break}else{aL=aL+4|0}}aL=bH-aV>>2;aO=aV+(aL+1<<2)|0;aM=aC-aO|0;Le(aV+(aL<<2)|0,aO|0,aM|0)|0;aO=aV+((aM>>2)+aL<<2)|0;aL=c[aW>>2]|0;if((aO|0)!=(aL|0)){c[aW>>2]=aL+(~((aL-4+(-aO|0)|0)>>>2)<<2)}K4(aX);bB=bx;bC=bw;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}else if((O|0)==155){aO=bS(-1,-1)|0;bI=M;bJ=aO;O=162}else if((O|0)==156){aO=bS(-1,-1)|0;aL=aO;aO=M;if((a[aP]&1)!=0){K4(c[aU>>2]|0)}aM=c[aQ>>2]|0;if((aM|0)==0){bI=aO;bJ=aL;O=162;break}aE=c[aT>>2]|0;if((aM|0)!=(aE|0)){c[aT>>2]=aE+(~((aE-4+(-aM|0)|0)>>>2)<<2)}K4(aM);bI=aO;bJ=aL;O=162}else if((O|0)==111){aL=bS(-1,-1)|0;aO=aL;aL=M;if((a[ab]&1)==0){if(be){bK=aO;bL=aL;break}else{bB=aL;bC=aO}bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}else{K4(c[ak>>2]|0);if(be){bK=aO;bL=aL;break}else{bB=aL;bC=aO}bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}}else if((O|0)==170){z=0;ar(88,0);if(!z){return 0}else{z=0;aO=bS(-1,-1)|0;bM=M;bN=aO;O=179;break}}else if((O|0)==108){aO=bS(-1,-1)|0;bO=M;bP=aO;O=110}else if((O|0)==165){DH(0);return 0}else if((O|0)==134){DH(0);return 0}else if((O|0)==82){z=0;ar(88,0);if(!z){return 0}else{z=0;aO=bS(-1,-1)|0;bO=M;bP=aO;O=110;break}}else if((O|0)==177){aO=bS(-1,-1)|0;bM=M;bN=aO;O=179}else if((O|0)==188){aO=bS(-1,-1)|0;aL=aO;aO=M;if((a[ay]&1)==0){bQ=aO;bR=aL;O=190;break}K4(c[aG>>2]|0);bQ=aO;bR=aL;O=190}}while(0);if((O|0)==110){bK=bP;bL=bO}else if((O|0)==162){if((a[aN]&1)==0){bB=bI;bC=bJ;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}K4(c[aS>>2]|0);bB=bI;bC=bJ;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}else if((O|0)==179){if((a[ay]&1)!=0){K4(c[aG>>2]|0)}bQ=bM;bR=bN;O=190}if((O|0)==190){if((a[aw]&1)==0){bB=bQ;bC=bR;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}K4(c[aF>>2]|0);bB=bQ;bC=bR;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}ak=c[a8>>2]|0;ab=c[a9>>2]|0;aT=ak;while(1){if((aT|0)==(ab|0)){bT=ab;break}if((c[aT>>2]|0)==(ba|0)){bT=aT;break}else{aT=aT+4|0}}aT=bT-ak>>2;aF=ak+(aT+1<<2)|0;aw=ab-aF|0;Le(ak+(aT<<2)|0,aF|0,aw|0)|0;aF=ak+((aw>>2)+aT<<2)|0;aT=c[a9>>2]|0;if((aF|0)!=(aT|0)){c[a9>>2]=aT+(~((aT-4+(-aF|0)|0)>>>2)<<2)}K4(bc);bB=bL;bC=bK;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}}while(0);W=c[S>>2]|0;L=c[P>>2]|0;J=W;while(1){if((J|0)==(L|0)){bU=L;break}if((c[J>>2]|0)==(Z|0)){bU=J;break}else{J=J+4|0}}J=bU-W>>2;S=W+(J+1<<2)|0;K=L-S|0;Le(W+(J<<2)|0,S|0,K|0)|0;S=W+((K>>2)+J<<2)|0;J=c[P>>2]|0;if((S|0)!=(J|0)){c[P>>2]=J+(~((J-4+(-S|0)|0)>>>2)<<2)}K4(R);bB=ad;bC=ae;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0)}else{O=12}}while(0);if((O|0)==12){Y=c[b>>2]|0}ae=K2(52)|0;c[p>>2]=ae;ad=Y+4|0;bU=c[ad>>2]|0;if((bU|0)==(c[Y+8>>2]|0)){e3(Y|0,p);bV=c[p>>2]|0}else{if((bU|0)==0){bW=0}else{c[bU>>2]=ae;bW=c[ad>>2]|0}c[ad>>2]=bW+4;bV=ae}ae=bV;bW=b+28|0;L298:do{if((a[bW]&1)==0){bU=s;c[bU>>2]=c[bW>>2];c[bU+4>>2]=c[bW+4>>2];c[bU+8>>2]=c[bW+8>>2];O=29}else{bU=c[b+36>>2]|0;p=c[b+32>>2]|0;do{if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(p>>>0<11>>>0){a[s]=p<<1;bX=s+1|0}else{Z=p+16&-16;bK=(z=0,au(246,Z|0)|0);if(z){z=0;break}c[s+8>>2]=bK;c[s>>2]=Z|1;c[s+4>>2]=p;bX=bK}Ld(bX|0,bU|0,p)|0;a[bX+p|0]=0;O=29;break L298}}while(0);p=bS(-1,-1)|0;bY=M;bZ=p}}while(0);do{if((O|0)==29){bX=b+44|0;bW=o;c[bW>>2]=c[bX>>2];c[bW+4>>2]=c[bX+4>>2];c[bW+8>>2]=c[bX+8>>2];z=0;aq(14,bV|0,s|0,o|0,r|0,0);if(z){z=0;bX=bS(-1,-1)|0;bW=bX;bX=M;if((a[s]&1)==0){bY=bX;bZ=bW;break}K4(c[s+8>>2]|0);bY=bX;bZ=bW;break}if((a[s]&1)!=0){K4(c[s+8>>2]|0)}a[bV+28|0]=1;bo=ae;bs=bo;i=d;return bs|0}}while(0);bs=c[Y>>2]|0;Y=c[ad>>2]|0;d=bs;while(1){if((d|0)==(Y|0)){b_=Y;break}if((c[d>>2]|0)==(bV|0)){b_=d;break}else{d=d+4|0}}d=b_-bs>>2;b_=bs+(d+1<<2)|0;bV=Y-b_|0;Le(bs+(d<<2)|0,b_|0,bV|0)|0;b_=bs+((bV>>2)+d<<2)|0;d=c[ad>>2]|0;if((b_|0)!=(d|0)){c[ad>>2]=d+(~((d-4+(-b_|0)|0)>>>2)<<2)}K4(ae);bB=bY;bC=bZ;bD=bC;bE=0;bF=bD;bG=bB;bg(bF|0);return 0}function uZ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zq(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u_(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0;d=i;i=i+232|0;e=d|0;f=d+8|0;g=d+24|0;h=d+32|0;j=d+40|0;k=d+56|0;l=d+64|0;m=d+72|0;n=d+80|0;o=d+96|0;p=d+104|0;q=d+120|0;r=d+128|0;s=d+144|0;t=d+160|0;u=d+224|0;v=u;w=i;i=i+12|0;i=i+7&-8;x=i;i=i+12|0;i=i+7&-8;y=i;i=i+12|0;i=i+7&-8;A=i;i=i+12|0;i=i+7&-8;B=i;i=i+12|0;i=i+7&-8;C=i;i=i+12|0;i=i+7&-8;D=b|0;E=c[D>>2]|0;F=K2(60)|0;c[q>>2]=F;G=E+4|0;H=c[G>>2]|0;if((H|0)==(c[E+8>>2]|0)){e3(E|0,q);I=c[q>>2]|0}else{if((H|0)==0){J=0}else{c[H>>2]=F;J=c[G>>2]|0}c[G>>2]=J+4;I=F}F=I;J=I;H=b+28|0;L8:do{if((a[H]&1)==0){q=r;c[q>>2]=c[H>>2];c[q+4>>2]=c[H+4>>2];c[q+8>>2]=c[H+8>>2];K=16}else{q=c[b+36>>2]|0;L=c[b+32>>2]|0;do{if(L>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(L>>>0<11>>>0){a[r]=L<<1;N=r+1|0}else{O=L+16&-16;P=(z=0,au(246,O|0)|0);if(z){z=0;break}c[r+8>>2]=P;c[r>>2]=O|1;c[r+4>>2]=L;N=P}Ld(N|0,q|0,L)|0;a[N+L|0]=0;K=16;break L8}}while(0);L=bS(-1,-1)|0;Q=L;R=M}}while(0);do{if((K|0)==16){N=b+44|0;L=p;c[L>>2]=c[N>>2];c[L+4>>2]=c[N+4>>2];c[L+8>>2]=c[N+8>>2];z=0;aD(2,J|0,r|0,p|0,0,0,0);if(z){z=0;L=bS(-1,-1)|0;q=L;L=M;if((a[r]&1)==0){Q=q;R=L;break}K4(c[r+8>>2]|0);Q=q;R=L;break}if((a[r]&1)!=0){K4(c[r+8>>2]|0)}L=b+20|0;q=c[L>>2]|0;P=b+24|0;if(q>>>0>=(c[P>>2]|0)>>>0){i=d;return J|0}O=b+56|0;S=O;T=I+40|0;U=T;V=s;W=T+8|0;X=T+12|0;Y=T+4|0;Z=s+8|0;_=b+36|0;$=b+32|0;aa=s+1|0;ab=s|0;ac=s+4|0;ad=B+8|0;ae=B|0;af=B+4|0;ag=C|0;ah=C+4|0;ai=C+8|0;aj=B;ak=A;al=A+8|0;am=A+1|0;an=A|0;ao=A+4|0;ap=y;at=y+8|0;av=y+1|0;aw=y|0;ax=y+4|0;ay=b+56|0;az=b+60|0;aA=w;aB=x;aC=t+28|0;aE=t+4|0;aF=w+8|0;aG=t+8|0;aH=t+36|0;aI=w+1|0;aJ=w|0;aK=w+4|0;aL=q;L33:while(1){do{if((a[aL]|0)==47){c[S>>2]=aL;c[S+4>>2]=aL+1;aM=c[D>>2]|0;q=K2(52)|0;c[o>>2]=q;aN=aM+4|0;aO=c[aN>>2]|0;if((aO|0)==(c[aM+8>>2]|0)){e3(aM|0,o);aP=c[o>>2]|0}else{if((aO|0)==0){aQ=0}else{c[aO>>2]=q;aQ=c[aN>>2]|0}c[aN>>2]=aQ+4;aP=q}aS=aP;if((a[H]&1)==0){c[V>>2]=c[H>>2];c[V+4>>2]=c[H+4>>2];c[V+8>>2]=c[H+8>>2]}else{q=c[_>>2]|0;aO=c[$>>2]|0;if(aO>>>0>4294967279>>>0){K=30;break L33}if(aO>>>0<11>>>0){a[V]=aO<<1;aT=aa}else{aU=aO+16&-16;aV=(z=0,au(246,aU|0)|0);if(z){z=0;K=57;break L33}c[Z>>2]=aV;c[ab>>2]=aU|1;c[ac>>2]=aO;aT=aV}Ld(aT|0,q|0,aO)|0;a[aT+aO|0]=0}aO=n;c[aO>>2]=c[N>>2];c[aO+4>>2]=c[N+4>>2];c[aO+8>>2]=c[N+8>>2];z=0;aq(14,aP|0,s|0,n|0,O|0,0);if(z){z=0;aW=1;K=60;break L33}aO=aP;c[m>>2]=aO;q=c[W>>2]|0;aV=q;if((q|0)==(c[X>>2]|0)){z=0;as(370,Y|0,m|0);if(z){z=0;aW=0;K=60;break L33}aX=c[m>>2]|0}else{if((q|0)==0){aY=0}else{c[aV>>2]=aO;aY=c[W>>2]|0}c[W>>2]=aY+4;aX=aO}z=0;as(c[c[T>>2]>>2]|0,U|0,aX|0);if(z){z=0;aW=0;K=60;break L33}if((a[V]&1)!=0){K4(c[Z>>2]|0)}c[L>>2]=(c[L>>2]|0)+1}else{if((va(b)|0)!=0){aO=(c[az>>2]|0)-1|0;c[u>>2]=(c[ay>>2]|0)+2;c[u+4>>2]=aO;aO=c[D>>2]|0;if((a[H]&1)==0){c[aA>>2]=c[H>>2];c[aA+4>>2]=c[H+4>>2];c[aA+8>>2]=c[H+8>>2]}else{aV=c[_>>2]|0;q=c[$>>2]|0;if(q>>>0>4294967279>>>0){K=73;break L33}if(q>>>0<11>>>0){a[aA]=q<<1;aZ=aI}else{aU=q+16&-16;a_=K2(aU)|0;c[aF>>2]=a_;c[aJ>>2]=aU|1;c[aK>>2]=q;aZ=a_}Ld(aZ|0,aV|0,q)|0;a[aZ+q|0]=0}c[aB>>2]=c[N>>2];c[aB+4>>2]=c[N+4>>2];c[aB+8>>2]=c[N+8>>2];z=0;aq(16,t|0,v|0,aO|0,w|0,x|0);if(z){z=0;K=95;break L33}aO=(z=0,au(170,t|0)|0);if(z){z=0;K=96;break L33}if((a[aC]&1)!=0){K4(c[aH>>2]|0)}q=c[aE>>2]|0;aV=q;if((q|0)!=0){a_=c[aG>>2]|0;if((q|0)!=(a_|0)){c[aG>>2]=a_+(~((a_-4+(-aV|0)|0)>>>2)<<2)}K4(q)}if((a[aA]&1)!=0){K4(c[aF>>2]|0)}a[aO+29|0]=1;c[l>>2]=aO;q=c[W>>2]|0;aV=q;if((q|0)==(c[X>>2]|0)){fo(Y,l);a$=c[l>>2]|0}else{if((q|0)==0){a0=0}else{c[aV>>2]=aO;a0=c[W>>2]|0}c[W>>2]=a0+4;a$=aO}cA[c[c[T>>2]>>2]&1023](U,a$);break}if((vb(b)|0)!=0){a1=c[D>>2]|0;aO=K2(52)|0;c[k>>2]=aO;a2=a1+4|0;aV=c[a2>>2]|0;if((aV|0)==(c[a1+8>>2]|0)){e3(a1|0,k);a3=c[k>>2]|0}else{if((aV|0)==0){a4=0}else{c[aV>>2]=aO;a4=c[a2>>2]|0}c[a2>>2]=a4+4;a3=aO}a5=a3;if((a[H]&1)==0){c[ap>>2]=c[H>>2];c[ap+4>>2]=c[H+4>>2];c[ap+8>>2]=c[H+8>>2]}else{aO=c[_>>2]|0;aV=c[$>>2]|0;if(aV>>>0>4294967279>>>0){K=113;break L33}if(aV>>>0<11>>>0){a[ap]=aV<<1;a6=av}else{q=aV+16&-16;a_=(z=0,au(246,q|0)|0);if(z){z=0;K=130;break L33}c[at>>2]=a_;c[aw>>2]=q|1;c[ax>>2]=aV;a6=a_}Ld(a6|0,aO|0,aV)|0;a[a6+aV|0]=0}aV=j;c[aV>>2]=c[N>>2];c[aV+4>>2]=c[N+4>>2];c[aV+8>>2]=c[N+8>>2];z=0;aq(14,a3|0,y|0,j|0,O|0,0);if(z){z=0;a7=1;K=133;break L33}aV=a3;c[h>>2]=aV;aO=c[W>>2]|0;a_=aO;if((aO|0)==(c[X>>2]|0)){z=0;as(370,Y|0,h|0);if(z){z=0;a7=0;K=133;break L33}a8=c[h>>2]|0}else{if((aO|0)==0){a9=0}else{c[a_>>2]=aV;a9=c[W>>2]|0}c[W>>2]=a9+4;a8=aV}z=0;as(c[c[T>>2]>>2]|0,U|0,a8|0);if(z){z=0;a7=0;K=133;break L33}if((a[ap]&1)==0){break}K4(c[at>>2]|0);break}if((vc(b)|0)==0){aV=K2(32)|0;c[ad>>2]=aV;c[ae>>2]=33;c[af>>2]=30;Ld(aV|0,4328,30)|0;a[aV+30|0]=0;c[ag>>2]=0;c[ah>>2]=0;c[ai>>2]=0;z=0;aR(482,b|0,B|0,C|0);if(z){z=0;K=183;break L33}if((a[aj]&1)==0){break}K4(c[ad>>2]|0);break}ba=c[D>>2]|0;aV=K2(52)|0;c[g>>2]=aV;bb=ba+4|0;a_=c[bb>>2]|0;if((a_|0)==(c[ba+8>>2]|0)){e3(ba|0,g);bc=c[g>>2]|0}else{if((a_|0)==0){bd=0}else{c[a_>>2]=aV;bd=c[bb>>2]|0}c[bb>>2]=bd+4;bc=aV}be=bc;if((a[H]&1)==0){c[ak>>2]=c[H>>2];c[ak+4>>2]=c[H+4>>2];c[ak+8>>2]=c[H+8>>2]}else{aV=c[_>>2]|0;a_=c[$>>2]|0;if(a_>>>0>4294967279>>>0){K=151;break L33}if(a_>>>0<11>>>0){a[ak]=a_<<1;bf=am}else{aO=a_+16&-16;q=(z=0,au(246,aO|0)|0);if(z){z=0;K=168;break L33}c[al>>2]=q;c[an>>2]=aO|1;c[ao>>2]=a_;bf=q}Ld(bf|0,aV|0,a_)|0;a[bf+a_|0]=0}a_=f;c[a_>>2]=c[N>>2];c[a_+4>>2]=c[N+4>>2];c[a_+8>>2]=c[N+8>>2];z=0;aq(14,bc|0,A|0,f|0,O|0,0);if(z){z=0;bh=1;K=171;break L33}a_=bc;c[e>>2]=a_;aV=c[W>>2]|0;q=aV;if((aV|0)==(c[X>>2]|0)){z=0;as(370,Y|0,e|0);if(z){z=0;bh=0;K=171;break L33}bi=c[e>>2]|0}else{if((aV|0)==0){bj=0}else{c[q>>2]=a_;bj=c[W>>2]|0}c[W>>2]=bj+4;bi=a_}z=0;as(c[c[T>>2]>>2]|0,U|0,bi|0);if(z){z=0;bh=0;K=171;break L33}if((a[ak]&1)==0){break}K4(c[al>>2]|0)}}while(0);a_=c[L>>2]|0;if(a_>>>0<(c[P>>2]|0)>>>0){aL=a_}else{K=187;break}}do{if((K|0)==171){aL=bS(-1,-1)|0;P=aL;aL=M;if((a[ak]&1)==0){if(bh){bk=aL;bl=P;K=174;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else{K4(c[al>>2]|0);if(bh){bk=aL;bl=P;K=174;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}}else if((K|0)==133){aL=bS(-1,-1)|0;P=aL;aL=M;if((a[ap]&1)==0){if(a7){bs=aL;bt=P;K=136;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else{K4(c[at>>2]|0);if(a7){bs=aL;bt=P;K=136;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}}else if((K|0)==60){aL=bS(-1,-1)|0;P=aL;aL=M;if((a[V]&1)==0){if(aW){bu=aL;bv=P;K=63;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else{K4(c[Z>>2]|0);if(aW){bu=aL;bv=P;K=63;break}else{bm=P;bn=aL}bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}}else if((K|0)==183){aL=bS(-1,-1)|0;P=aL;aL=M;if((a[aj]&1)==0){bm=P;bn=aL;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}K4(c[ad>>2]|0);bm=P;bn=aL;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else if((K|0)==151){z=0;ar(88,0);if(!z){return 0}else{z=0;aL=bS(-1,-1)|0;bw=M;bx=aL;K=170;break}}else if((K|0)==113){z=0;ar(88,0);if(!z){return 0}else{z=0;aL=bS(-1,-1)|0;by=M;bz=aL;K=132;break}}else if((K|0)==96){aL=bS(-1,-1)|0;P=aL;aL=M;if((a[aC]&1)!=0){K4(c[aH>>2]|0)}L=c[aE>>2]|0;if((L|0)==0){bA=P;bB=aL;K=102;break}U=c[aG>>2]|0;if((L|0)!=(U|0)){c[aG>>2]=U+(~((U-4+(-L|0)|0)>>>2)<<2)}K4(L);bA=P;bB=aL;K=102}else if((K|0)==30){z=0;ar(88,0);if(!z){return 0}else{z=0;aL=bS(-1,-1)|0;bC=M;bD=aL;K=59;break}}else if((K|0)==57){aL=bS(-1,-1)|0;bC=M;bD=aL;K=59}else if((K|0)==73){DH(0);return 0}else if((K|0)==168){aL=bS(-1,-1)|0;bw=M;bx=aL;K=170}else if((K|0)==187){i=d;return J|0}else if((K|0)==95){aL=bS(-1,-1)|0;bA=aL;bB=M;K=102}else if((K|0)==130){aL=bS(-1,-1)|0;by=M;bz=aL;K=132}}while(0);if((K|0)==170){bk=bw;bl=bx;K=174}else if((K|0)==132){bs=by;bt=bz;K=136}else if((K|0)==59){bu=bC;bv=bD;K=63}else if((K|0)==102){if((a[aA]&1)==0){bm=bA;bn=bB;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}K4(c[aF>>2]|0);bm=bA;bn=bB;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}if((K|0)==136){aG=c[a1>>2]|0;aE=c[a2>>2]|0;aH=aG;while(1){if((aH|0)==(aE|0)){bE=aE;break}if((c[aH>>2]|0)==(a3|0)){bE=aH;break}else{aH=aH+4|0}}aH=bE-aG>>2;aF=aG+(aH+1<<2)|0;aA=aE-aF|0;Le(aG+(aH<<2)|0,aF|0,aA|0)|0;aF=aG+((aA>>2)+aH<<2)|0;aH=c[a2>>2]|0;if((aF|0)!=(aH|0)){c[a2>>2]=aH+(~((aH-4+(-aF|0)|0)>>>2)<<2)}K4(a5);bm=bt;bn=bs;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else if((K|0)==63){aF=c[aM>>2]|0;aH=c[aN>>2]|0;aA=aF;while(1){if((aA|0)==(aH|0)){bF=aH;break}if((c[aA>>2]|0)==(aP|0)){bF=aA;break}else{aA=aA+4|0}}aA=bF-aF>>2;aG=aF+(aA+1<<2)|0;aE=aH-aG|0;Le(aF+(aA<<2)|0,aG|0,aE|0)|0;aG=aF+((aE>>2)+aA<<2)|0;aA=c[aN>>2]|0;if((aG|0)!=(aA|0)){c[aN>>2]=aA+(~((aA-4+(-aG|0)|0)>>>2)<<2)}K4(aS);bm=bv;bn=bu;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}else if((K|0)==174){aG=c[ba>>2]|0;aA=c[bb>>2]|0;aE=aG;while(1){if((aE|0)==(aA|0)){bG=aA;break}if((c[aE>>2]|0)==(bc|0)){bG=aE;break}else{aE=aE+4|0}}aE=bG-aG>>2;aF=aG+(aE+1<<2)|0;aH=aA-aF|0;Le(aG+(aE<<2)|0,aF|0,aH|0)|0;aF=aG+((aH>>2)+aE<<2)|0;aE=c[bb>>2]|0;if((aF|0)!=(aE|0)){c[bb>>2]=aE+(~((aE-4+(-aF|0)|0)>>>2)<<2)}K4(be);bm=bl;bn=bk;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0)}}}while(0);bk=c[E>>2]|0;E=c[G>>2]|0;bl=bk;while(1){if((bl|0)==(E|0)){bH=E;break}if((c[bl>>2]|0)==(I|0)){bH=bl;break}else{bl=bl+4|0}}bl=bH-bk>>2;bH=bk+(bl+1<<2)|0;I=E-bH|0;Le(bk+(bl<<2)|0,bH|0,I|0)|0;bH=bk+((I>>2)+bl<<2)|0;bl=c[G>>2]|0;if((bH|0)!=(bl|0)){c[G>>2]=bl+(~((bl-4+(-bH|0)|0)>>>2)<<2)}K4(F);bm=Q;bn=R;bo=bm;bp=0;bq=bo;br=bn;bg(bq|0);return 0}function u$(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zp(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u0(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zr(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u1(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yQ(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u2(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c8=0,c9=0,da=0,db=0,dc=0,dd=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0;d=i;i=i+344|0;e=d|0;f=d+8|0;g=d+24|0;h=d+32|0;j=d+40|0;k=d+56|0;l=d+64|0;m=d+72|0;n=d+88|0;o=d+96|0;p=d+104|0;q=d+120|0;r=d+128|0;s=d+136|0;t=d+152|0;u=d+160|0;v=d+168|0;w=d+184|0;x=d+192|0;y=d+200|0;A=d+216|0;B=d+224|0;C=d+232|0;D=d+248|0;E=d+256|0;F=d+272|0;G=d+336|0;H=G;I=i;i=i+12|0;i=i+7&-8;J=i;i=i+12|0;i=i+7&-8;K=i;i=i+12|0;i=i+7&-8;L=i;i=i+12|0;i=i+7&-8;N=i;i=i+12|0;i=i+7&-8;O=i;i=i+12|0;i=i+7&-8;P=i;i=i+12|0;i=i+7&-8;Q=i;i=i+12|0;i=i+7&-8;R=i;i=i+12|0;i=i+7&-8;S=i;i=i+12|0;i=i+7&-8;T=i;i=i+12|0;i=i+7&-8;U=i;i=i+12|0;i=i+7&-8;V=i;i=i+12|0;i=i+7&-8;W=i;i=i+12|0;i=i+7&-8;X=i;i=i+12|0;i=i+7&-8;Y=i;i=i+12|0;i=i+7&-8;Z=i;i=i+12|0;i=i+7&-8;_=i;i=i+12|0;i=i+7&-8;$=i;i=i+12|0;i=i+7&-8;aa=i;i=i+12|0;i=i+7&-8;ab=i;i=i+12|0;i=i+7&-8;ac=b|0;ad=c[ac>>2]|0;ae=K2(60)|0;c[D>>2]=ae;af=ad+4|0;ag=c[af>>2]|0;if((ag|0)==(c[ad+8>>2]|0)){e3(ad|0,D);ah=c[D>>2]|0}else{if((ag|0)==0){ai=0}else{c[ag>>2]=ae;ai=c[af>>2]|0}c[af>>2]=ai+4;ah=ae}ae=ah;ai=ah;ag=b+28|0;L8:do{if((a[ag]&1)==0){D=E;c[D>>2]=c[ag>>2];c[D+4>>2]=c[ag+4>>2];c[D+8>>2]=c[ag+8>>2];aj=16}else{D=c[b+36>>2]|0;ak=c[b+32>>2]|0;do{if(ak>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(ak>>>0<11>>>0){a[E]=ak<<1;al=E+1|0}else{am=ak+16&-16;an=(z=0,au(246,am|0)|0);if(z){z=0;break}c[E+8>>2]=an;c[E>>2]=am|1;c[E+4>>2]=ak;al=an}Ld(al|0,D|0,ak)|0;a[al+ak|0]=0;aj=16;break L8}}while(0);ak=bS(-1,-1)|0;ao=ak;ap=M}}while(0);do{if((aj|0)==16){al=b+44|0;ak=C;c[ak>>2]=c[al>>2];c[ak+4>>2]=c[al+4>>2];c[ak+8>>2]=c[al+8>>2];z=0;aD(2,ai|0,E|0,C|0,0,0,0);if(z){z=0;ak=bS(-1,-1)|0;D=ak;ak=M;if((a[E]&1)==0){ao=D;ap=ak;break}K4(c[E+8>>2]|0);ao=D;ap=ak;break}if((a[E]&1)!=0){K4(c[E+8>>2]|0)}ak=b+20|0;D=b+24|0;if((c[ak>>2]|0)>>>0>=(c[D>>2]|0)>>>0){i=d;return ai|0}an=aa+8|0;am=aa|0;at=aa+4|0;av=ab|0;aw=ab+4|0;ax=ab+8|0;ay=aa;az=ah+40|0;aA=az;aB=Z;aC=_;aE=b+56|0;aF=b+60|0;aG=$;aH=$+1|0;aI=f;aJ=az+8|0;aK=az+12|0;aL=az+4|0;aM=Z+8|0;aN=$+8|0;aO=$|0;aP=$+4|0;aQ=b+36|0;aS=b+32|0;aT=Z+1|0;aU=Z|0;aW=Z+4|0;aX=Y;aY=b+56|0;aZ=aY|0;a_=ah+56|0;a$=Y+8|0;a0=Y+1|0;a1=Y|0;a2=Y+4|0;a3=V;a4=W;a5=X;a6=X+1|0;a7=m;a8=V+8|0;a9=X+8|0;ba=X|0;bb=X+4|0;bc=V+1|0;bd=V|0;be=V+4|0;bf=S;bh=T;bi=U;bj=U+1|0;bk=p;bl=S+8|0;bm=U+8|0;bn=U|0;bo=U+4|0;bp=S+1|0;bq=S|0;br=S+4|0;bs=P;bt=Q;bu=R;bv=R+1|0;bw=s;bx=P+8|0;by=R+8|0;bz=R|0;bA=R+4|0;bB=P+1|0;bC=P|0;bD=P+4|0;bE=L;bF=N;bG=O;bH=O+1|0;bI=v;bJ=L+8|0;bK=O+8|0;bL=O|0;bM=O+4|0;bN=L+1|0;bO=L|0;bP=L+4|0;bQ=K;bR=K+8|0;bT=K+1|0;bU=K|0;bV=K+4|0;bW=I;bX=J;bY=F+28|0;bZ=F+4|0;b_=I+8|0;b$=F+8|0;b0=F+36|0;b1=I+1|0;b2=I|0;b3=I+4|0;b4=0;L33:while(1){do{if((va(b)|0)==0){if((tO(b)|0)!=0){b5=c[ac>>2]|0;b6=K2(52)|0;c[A>>2]=b6;b7=b5+4|0;b8=c[b7>>2]|0;if((b8|0)==(c[b5+8>>2]|0)){e3(b5|0,A);b9=c[A>>2]|0}else{if((b8|0)==0){ca=0}else{c[b8>>2]=b6;ca=c[b7>>2]|0}c[b7>>2]=ca+4;b9=b6}cb=b9;if((a[ag]&1)==0){c[bQ>>2]=c[ag>>2];c[bQ+4>>2]=c[ag+4>>2];c[bQ+8>>2]=c[ag+8>>2]}else{b6=c[aQ>>2]|0;b8=c[aS>>2]|0;if(b8>>>0>4294967279>>>0){aj=73;break L33}if(b8>>>0<11>>>0){a[bQ]=b8<<1;cc=bT}else{cd=b8+16&-16;ce=(z=0,au(246,cd|0)|0);if(z){z=0;aj=90;break L33}c[bR>>2]=ce;c[bU>>2]=cd|1;c[bV>>2]=b8;cc=ce}Ld(cc|0,b6|0,b8)|0;a[cc+b8|0]=0}b8=y;c[b8>>2]=c[al>>2];c[b8+4>>2]=c[al+4>>2];c[b8+8>>2]=c[al+8>>2];z=0;aq(14,b9|0,K|0,y|0,aY|0,0);if(z){z=0;cf=1;aj=93;break L33}b8=b9;c[x>>2]=b8;b6=c[aJ>>2]|0;ce=b6;if((b6|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,x|0);if(z){z=0;cf=0;aj=93;break L33}cg=c[x>>2]|0}else{if((b6|0)==0){ch=0}else{c[ce>>2]=b8;ch=c[aJ>>2]|0}c[aJ>>2]=ch+4;cg=b8}z=0;as(c[c[az>>2]>>2]|0,aA|0,cg|0);if(z){z=0;cf=0;aj=93;break L33}if((a[bQ]&1)==0){break}K4(c[bR>>2]|0);break}if((u6(b)|0)!=0){ci=c[ac>>2]|0;b8=K2(52)|0;c[w>>2]=b8;cj=ci+4|0;ce=c[cj>>2]|0;if((ce|0)==(c[ci+8>>2]|0)){e3(ci|0,w);ck=c[w>>2]|0}else{if((ce|0)==0){cl=0}else{c[ce>>2]=b8;cl=c[cj>>2]|0}c[cj>>2]=cl+4;ck=b8}cm=ck;b8=ck;if((a[ag]&1)==0){c[bE>>2]=c[ag>>2];c[bE+4>>2]=c[ag+4>>2];c[bE+8>>2]=c[ag+8>>2]}else{ce=c[aQ>>2]|0;b6=c[aS>>2]|0;if(b6>>>0>4294967279>>>0){aj=111;break L33}if(b6>>>0<11>>>0){a[bE]=b6<<1;cn=bN}else{cd=b6+16&-16;co=(z=0,au(246,cd|0)|0);if(z){z=0;aj=137;break L33}c[bJ>>2]=co;c[bO>>2]=cd|1;c[bP>>2]=b6;cn=co}Ld(cn|0,ce|0,b6)|0;a[cn+b6|0]=0}c[bF>>2]=c[al>>2];c[bF+4>>2]=c[al+4>>2];c[bF+8>>2]=c[al+8>>2];b6=c[aE>>2]|0;ce=(c[aF>>2]|0)-b6|0;if(ce>>>0>4294967279>>>0){aj=119;break L33}if(ce>>>0<11>>>0){a[bG]=ce<<1;cp=bH}else{co=ce+16&-16;cd=(z=0,au(246,co|0)|0);if(z){z=0;aj=140;break L33}c[bK>>2]=cd;c[bL>>2]=co|1;c[bM>>2]=ce;cp=cd}Ld(cp|0,b6|0,ce)|0;a[cp+ce|0]=0;c[bI>>2]=c[bF>>2];c[bI+4>>2]=c[bF+4>>2];c[bI+8>>2]=c[bF+8>>2];z=0;aq(32,b8|0,L|0,v|0,1,O|0);if(z){z=0;cq=1;aj=143;break L33}b8=ck;c[u>>2]=b8;ce=c[aJ>>2]|0;b6=ce;if((ce|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,u|0);if(z){z=0;cq=0;aj=143;break L33}cr=c[u>>2]|0}else{if((ce|0)==0){cs=0}else{c[b6>>2]=b8;cs=c[aJ>>2]|0}c[aJ>>2]=cs+4;cr=b8}z=0;as(c[c[az>>2]>>2]|0,aA|0,cr|0);if(z){z=0;cq=0;aj=143;break L33}if((a[bG]&1)!=0){K4(c[bK>>2]|0)}if((a[bE]&1)==0){break}K4(c[bJ>>2]|0);break}if((u7(b)|0)!=0){ct=c[ac>>2]|0;b8=K2(52)|0;c[t>>2]=b8;cu=ct+4|0;b6=c[cu>>2]|0;if((b6|0)==(c[ct+8>>2]|0)){e3(ct|0,t);cv=c[t>>2]|0}else{if((b6|0)==0){cw=0}else{c[b6>>2]=b8;cw=c[cu>>2]|0}c[cu>>2]=cw+4;cv=b8}cx=cv;b8=cv;if((a[ag]&1)==0){c[bs>>2]=c[ag>>2];c[bs+4>>2]=c[ag+4>>2];c[bs+8>>2]=c[ag+8>>2]}else{b6=c[aQ>>2]|0;ce=c[aS>>2]|0;if(ce>>>0>4294967279>>>0){aj=163;break L33}if(ce>>>0<11>>>0){a[bs]=ce<<1;cy=bB}else{cd=ce+16&-16;co=(z=0,au(246,cd|0)|0);if(z){z=0;aj=189;break L33}c[bx>>2]=co;c[bC>>2]=cd|1;c[bD>>2]=ce;cy=co}Ld(cy|0,b6|0,ce)|0;a[cy+ce|0]=0}c[bt>>2]=c[al>>2];c[bt+4>>2]=c[al+4>>2];c[bt+8>>2]=c[al+8>>2];ce=c[aE>>2]|0;b6=(c[aF>>2]|0)-ce|0;if(b6>>>0>4294967279>>>0){aj=171;break L33}if(b6>>>0<11>>>0){a[bu]=b6<<1;cz=bv}else{co=b6+16&-16;cd=(z=0,au(246,co|0)|0);if(z){z=0;aj=192;break L33}c[by>>2]=cd;c[bz>>2]=co|1;c[bA>>2]=b6;cz=cd}Ld(cz|0,ce|0,b6)|0;a[cz+b6|0]=0;c[bw>>2]=c[bt>>2];c[bw+4>>2]=c[bt+4>>2];c[bw+8>>2]=c[bt+8>>2];z=0;aq(32,b8|0,P|0,s|0,2,R|0);if(z){z=0;cB=1;aj=195;break L33}b8=cv;c[r>>2]=b8;b6=c[aJ>>2]|0;ce=b6;if((b6|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,r|0);if(z){z=0;cB=0;aj=195;break L33}cC=c[r>>2]|0}else{if((b6|0)==0){cD=0}else{c[ce>>2]=b8;cD=c[aJ>>2]|0}c[aJ>>2]=cD+4;cC=b8}z=0;as(c[c[az>>2]>>2]|0,aA|0,cC|0);if(z){z=0;cB=0;aj=195;break L33}if((a[bu]&1)!=0){K4(c[by>>2]|0)}if((a[bs]&1)==0){break}K4(c[bx>>2]|0);break}if((t9(b)|0)!=0){cE=c[ac>>2]|0;b8=K2(52)|0;c[q>>2]=b8;cF=cE+4|0;ce=c[cF>>2]|0;if((ce|0)==(c[cE+8>>2]|0)){e3(cE|0,q);cG=c[q>>2]|0}else{if((ce|0)==0){cH=0}else{c[ce>>2]=b8;cH=c[cF>>2]|0}c[cF>>2]=cH+4;cG=b8}cI=cG;b8=cG;if((a[ag]&1)==0){c[bf>>2]=c[ag>>2];c[bf+4>>2]=c[ag+4>>2];c[bf+8>>2]=c[ag+8>>2]}else{ce=c[aQ>>2]|0;b6=c[aS>>2]|0;if(b6>>>0>4294967279>>>0){aj=215;break L33}if(b6>>>0<11>>>0){a[bf]=b6<<1;cJ=bp}else{cd=b6+16&-16;co=(z=0,au(246,cd|0)|0);if(z){z=0;aj=241;break L33}c[bl>>2]=co;c[bq>>2]=cd|1;c[br>>2]=b6;cJ=co}Ld(cJ|0,ce|0,b6)|0;a[cJ+b6|0]=0}c[bh>>2]=c[al>>2];c[bh+4>>2]=c[al+4>>2];c[bh+8>>2]=c[al+8>>2];b6=c[aE>>2]|0;ce=(c[aF>>2]|0)-b6|0;if(ce>>>0>4294967279>>>0){aj=223;break L33}if(ce>>>0<11>>>0){a[bi]=ce<<1;cK=bj}else{co=ce+16&-16;cd=(z=0,au(246,co|0)|0);if(z){z=0;aj=244;break L33}c[bm>>2]=cd;c[bn>>2]=co|1;c[bo>>2]=ce;cK=cd}Ld(cK|0,b6|0,ce)|0;a[cK+ce|0]=0;c[bk>>2]=c[bh>>2];c[bk+4>>2]=c[bh+4>>2];c[bk+8>>2]=c[bh+8>>2];z=0;aq(32,b8|0,S|0,p|0,0,U|0);if(z){z=0;cL=1;aj=247;break L33}b8=cG;c[o>>2]=b8;ce=c[aJ>>2]|0;b6=ce;if((ce|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,o|0);if(z){z=0;cL=0;aj=247;break L33}cM=c[o>>2]|0}else{if((ce|0)==0){cN=0}else{c[b6>>2]=b8;cN=c[aJ>>2]|0}c[aJ>>2]=cN+4;cM=b8}z=0;as(c[c[az>>2]>>2]|0,aA|0,cM|0);if(z){z=0;cL=0;aj=247;break L33}if((a[bi]&1)!=0){K4(c[bm>>2]|0)}if((a[bf]&1)==0){break}K4(c[bl>>2]|0);break}if((u8(b)|0)!=0){cO=c[ac>>2]|0;b8=K2(52)|0;c[n>>2]=b8;cP=cO+4|0;b6=c[cP>>2]|0;if((b6|0)==(c[cO+8>>2]|0)){e3(cO|0,n);cQ=c[n>>2]|0}else{if((b6|0)==0){cR=0}else{c[b6>>2]=b8;cR=c[cP>>2]|0}c[cP>>2]=cR+4;cQ=b8}cS=cQ;b8=cQ;if((a[ag]&1)==0){c[a3>>2]=c[ag>>2];c[a3+4>>2]=c[ag+4>>2];c[a3+8>>2]=c[ag+8>>2]}else{b6=c[aQ>>2]|0;ce=c[aS>>2]|0;if(ce>>>0>4294967279>>>0){aj=267;break L33}if(ce>>>0<11>>>0){a[a3]=ce<<1;cT=bc}else{cd=ce+16&-16;co=(z=0,au(246,cd|0)|0);if(z){z=0;aj=293;break L33}c[a8>>2]=co;c[bd>>2]=cd|1;c[be>>2]=ce;cT=co}Ld(cT|0,b6|0,ce)|0;a[cT+ce|0]=0}c[a4>>2]=c[al>>2];c[a4+4>>2]=c[al+4>>2];c[a4+8>>2]=c[al+8>>2];ce=c[aE>>2]|0;b6=(c[aF>>2]|0)-ce|0;if(b6>>>0>4294967279>>>0){aj=275;break L33}if(b6>>>0<11>>>0){a[a5]=b6<<1;cU=a6}else{co=b6+16&-16;cd=(z=0,au(246,co|0)|0);if(z){z=0;aj=296;break L33}c[a9>>2]=cd;c[ba>>2]=co|1;c[bb>>2]=b6;cU=cd}Ld(cU|0,ce|0,b6)|0;a[cU+b6|0]=0;c[a7>>2]=c[a4>>2];c[a7+4>>2]=c[a4+4>>2];c[a7+8>>2]=c[a4+8>>2];z=0;aq(32,b8|0,V|0,m|0,3,X|0);if(z){z=0;cV=1;aj=299;break L33}b8=cQ;c[l>>2]=b8;b6=c[aJ>>2]|0;ce=b6;if((b6|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,l|0);if(z){z=0;cV=0;aj=299;break L33}cW=c[l>>2]|0}else{if((b6|0)==0){cX=0}else{c[ce>>2]=b8;cX=c[aJ>>2]|0}c[aJ>>2]=cX+4;cW=b8}z=0;as(c[c[az>>2]>>2]|0,aA|0,cW|0);if(z){z=0;cV=0;aj=299;break L33}if((a[a5]&1)!=0){K4(c[a9>>2]|0)}if((a[a3]&1)==0){break}K4(c[a8>>2]|0);break}if((tF(b)|0)!=0){cY=c[ac>>2]|0;b8=K2(52)|0;c[k>>2]=b8;cZ=cY+4|0;ce=c[cZ>>2]|0;if((ce|0)==(c[cY+8>>2]|0)){e3(cY|0,k);c_=c[k>>2]|0}else{if((ce|0)==0){c$=0}else{c[ce>>2]=b8;c$=c[cZ>>2]|0}c[cZ>>2]=c$+4;c_=b8}c0=c_;if((a[ag]&1)==0){c[aX>>2]=c[ag>>2];c[aX+4>>2]=c[ag+4>>2];c[aX+8>>2]=c[ag+8>>2]}else{b8=c[aQ>>2]|0;ce=c[aS>>2]|0;if(ce>>>0>4294967279>>>0){aj=319;break L33}if(ce>>>0<11>>>0){a[aX]=ce<<1;c1=a0}else{b6=ce+16&-16;cd=(z=0,au(246,b6|0)|0);if(z){z=0;aj=338;break L33}c[a$>>2]=cd;c[a1>>2]=b6|1;c[a2>>2]=ce;c1=cd}Ld(c1|0,b8|0,ce)|0;a[c1+ce|0]=0}ce=j;c[ce>>2]=c[al>>2];c[ce+4>>2]=c[al+4>>2];c[ce+8>>2]=c[al+8>>2];z=0;aq(14,c_|0,Y|0,j|0,aY|0,0);if(z){z=0;c2=1;aj=341;break L33}ce=c_;c[h>>2]=ce;b8=c[aJ>>2]|0;cd=b8;if((b8|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,h|0);if(z){z=0;c2=0;aj=341;break L33}c3=c[h>>2]|0}else{if((b8|0)==0){c4=0}else{c[cd>>2]=ce;c4=c[aJ>>2]|0}c[aJ>>2]=c4+4;c3=ce}z=0;as(c[c[az>>2]>>2]|0,aA|0,c3|0);if(z){z=0;c2=0;aj=341;break L33}if((a[aX]&1)!=0){K4(c[a$>>2]|0)}if((b4|0)!=0){break}a[a_]=a[c[aZ>>2]|0]|0;break}if((tS(b)|0)==0){ce=K2(48)|0;c[an>>2]=ce;c[am>>2]=49;c[at>>2]=32;Ld(ce|0,4528,32)|0;a[ce+32|0]=0;c[av>>2]=0;c[aw>>2]=0;c[ax>>2]=0;z=0;aR(482,b|0,aa|0,ab|0);if(z){z=0;aj=405;break L33}if((a[ay]&1)==0){break}K4(c[an>>2]|0);break}c5=c[ac>>2]|0;ce=K2(48)|0;c[g>>2]=ce;c6=c5+4|0;cd=c[c6>>2]|0;if((cd|0)==(c[c5+8>>2]|0)){e3(c5|0,g);c7=c[g>>2]|0}else{if((cd|0)==0){c8=0}else{c[cd>>2]=ce;c8=c[c6>>2]|0}c[c6>>2]=c8+4;c7=ce}c9=c7;ce=c7;if((a[ag]&1)==0){c[aB>>2]=c[ag>>2];c[aB+4>>2]=c[ag+4>>2];c[aB+8>>2]=c[ag+8>>2]}else{cd=c[aQ>>2]|0;b8=c[aS>>2]|0;if(b8>>>0>4294967279>>>0){aj=359;break L33}if(b8>>>0<11>>>0){a[aB]=b8<<1;da=aT}else{b6=b8+16&-16;co=(z=0,au(246,b6|0)|0);if(z){z=0;aj=385;break L33}c[aM>>2]=co;c[aU>>2]=b6|1;c[aW>>2]=b8;da=co}Ld(da|0,cd|0,b8)|0;a[da+b8|0]=0}c[aC>>2]=c[al>>2];c[aC+4>>2]=c[al+4>>2];c[aC+8>>2]=c[al+8>>2];b8=c[aE>>2]|0;cd=(c[aF>>2]|0)-b8|0;if(cd>>>0>4294967279>>>0){aj=367;break L33}if(cd>>>0<11>>>0){a[aG]=cd<<1;db=aH}else{co=cd+16&-16;b6=(z=0,au(246,co|0)|0);if(z){z=0;aj=388;break L33}c[aN>>2]=b6;c[aO>>2]=co|1;c[aP>>2]=cd;db=b6}Ld(db|0,b8|0,cd)|0;a[db+cd|0]=0;c[aI>>2]=c[aC>>2];c[aI+4>>2]=c[aC+4>>2];c[aI+8>>2]=c[aC+8>>2];z=0;aV(2,ce|0,Z|0,f|0,$|0);if(z){z=0;dc=1;aj=391;break L33}ce=c7;c[e>>2]=ce;cd=c[aJ>>2]|0;b8=cd;if((cd|0)==(c[aK>>2]|0)){z=0;as(370,aL|0,e|0);if(z){z=0;dc=0;aj=391;break L33}dd=c[e>>2]|0}else{if((cd|0)==0){de=0}else{c[b8>>2]=ce;de=c[aJ>>2]|0}c[aJ>>2]=de+4;dd=ce}z=0;as(c[c[az>>2]>>2]|0,aA|0,dd|0);if(z){z=0;dc=0;aj=391;break L33}if((a[aG]&1)!=0){K4(c[aN>>2]|0)}if((a[aB]&1)==0){break}K4(c[aM>>2]|0)}else{ce=(c[aF>>2]|0)-1|0;c[G>>2]=(c[aE>>2]|0)+2;c[G+4>>2]=ce;ce=c[ac>>2]|0;if((a[ag]&1)==0){c[bW>>2]=c[ag>>2];c[bW+4>>2]=c[ag+4>>2];c[bW+8>>2]=c[ag+8>>2]}else{b8=c[aQ>>2]|0;cd=c[aS>>2]|0;if(cd>>>0>4294967279>>>0){aj=25;break L33}if(cd>>>0<11>>>0){a[bW]=cd<<1;df=b1}else{b6=cd+16&-16;co=K2(b6)|0;c[b_>>2]=co;c[b2>>2]=b6|1;c[b3>>2]=cd;df=co}Ld(df|0,b8|0,cd)|0;a[df+cd|0]=0}c[bX>>2]=c[al>>2];c[bX+4>>2]=c[al+4>>2];c[bX+8>>2]=c[al+8>>2];z=0;aq(16,F|0,H|0,ce|0,I|0,J|0);if(z){z=0;aj=55;break L33}ce=(z=0,au(170,F|0)|0);if(z){z=0;aj=56;break L33}if((a[bY]&1)!=0){K4(c[b0>>2]|0)}cd=c[bZ>>2]|0;b8=cd;if((cd|0)!=0){co=c[b$>>2]|0;if((cd|0)!=(co|0)){c[b$>>2]=co+(~((co-4+(-b8|0)|0)>>>2)<<2)}K4(cd)}if((a[bW]&1)!=0){K4(c[b_>>2]|0)}a[ce+29|0]=1;c[B>>2]=ce;cd=c[aJ>>2]|0;b8=cd;if((cd|0)==(c[aK>>2]|0)){fo(aL,B);dg=c[B>>2]|0}else{if((cd|0)==0){dh=0}else{c[b8>>2]=ce;dh=c[aJ>>2]|0}c[aJ>>2]=dh+4;dg=ce}cA[c[c[az>>2]>>2]&1023](aA,dg)}}while(0);if((c[ak>>2]|0)>>>0<(c[D>>2]|0)>>>0){b4=b4+1|0}else{aj=410;break}}do{if((aj|0)==140){b4=bS(-1,-1)|0;di=M;dj=b4;aj=142}else if((aj|0)==195){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[bu]&1)==0){dk=cB;dl=D;dm=b4;aj=197;break}K4(c[by>>2]|0);dk=cB;dl=D;dm=b4;aj=197}else if((aj|0)==93){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[bQ]&1)==0){if(cf){dn=b4;dp=D;aj=96;break}else{dq=D;dr=b4}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[bR>>2]|0);if(cf){dn=b4;dp=D;aj=96;break}else{dq=D;dr=b4}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==388){b4=bS(-1,-1)|0;dw=M;dx=b4;aj=390}else if((aj|0)==391){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[aG]&1)==0){dy=dc;dz=D;dA=b4;aj=393;break}K4(c[aN>>2]|0);dy=dc;dz=D;dA=b4;aj=393}else if((aj|0)==163){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dB=M;dC=b4;aj=191;break}}else if((aj|0)==293){b4=bS(-1,-1)|0;dD=M;dE=b4;aj=295}else if((aj|0)==296){b4=bS(-1,-1)|0;dF=M;dG=b4;aj=298}else if((aj|0)==405){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[ay]&1)==0){dq=D;dr=b4;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}K4(c[an>>2]|0);dq=D;dr=b4;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==299){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[a5]&1)==0){dH=cV;dI=D;dJ=b4;aj=301;break}K4(c[a9>>2]|0);dH=cV;dI=D;dJ=b4;aj=301}else if((aj|0)==223){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dK=M;dL=b4;aj=246;break}}else if((aj|0)==171){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dM=M;dN=b4;aj=194;break}}else if((aj|0)==90){b4=bS(-1,-1)|0;dO=M;dP=b4;aj=92}else if((aj|0)==341){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[aX]&1)==0){if(c2){dQ=b4;dR=D;aj=344;break}else{dq=D;dr=b4}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[a$>>2]|0);if(c2){dQ=b4;dR=D;aj=344;break}else{dq=D;dr=b4}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==215){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dS=M;dT=b4;aj=243;break}}else if((aj|0)==56){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[bY]&1)!=0){K4(c[b0>>2]|0)}ak=c[bZ>>2]|0;if((ak|0)==0){dU=D;dV=b4;aj=62;break}aA=c[b$>>2]|0;if((ak|0)!=(aA|0)){c[b$>>2]=aA+(~((aA-4+(-ak|0)|0)>>>2)<<2)}K4(ak);dU=D;dV=b4;aj=62}else if((aj|0)==25){DH(0);return 0}else if((aj|0)==192){b4=bS(-1,-1)|0;dM=M;dN=b4;aj=194}else if((aj|0)==55){b4=bS(-1,-1)|0;dU=b4;dV=M;aj=62}else if((aj|0)==73){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dO=M;dP=b4;aj=92;break}}else if((aj|0)==367){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dw=M;dx=b4;aj=390;break}}else if((aj|0)==189){b4=bS(-1,-1)|0;dB=M;dC=b4;aj=191}else if((aj|0)==241){b4=bS(-1,-1)|0;dS=M;dT=b4;aj=243}else if((aj|0)==338){b4=bS(-1,-1)|0;dW=M;dX=b4;aj=340}else if((aj|0)==143){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[bG]&1)==0){dY=cq;dZ=D;d_=b4;aj=145;break}K4(c[bK>>2]|0);dY=cq;dZ=D;d_=b4;aj=145}else if((aj|0)==111){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;d$=M;d0=b4;aj=139;break}}else if((aj|0)==137){b4=bS(-1,-1)|0;d$=M;d0=b4;aj=139}else if((aj|0)==119){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;di=M;dj=b4;aj=142;break}}else if((aj|0)==275){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dF=M;dG=b4;aj=298;break}}else if((aj|0)==244){b4=bS(-1,-1)|0;dK=M;dL=b4;aj=246}else if((aj|0)==247){b4=bS(-1,-1)|0;D=b4;b4=M;if((a[bi]&1)==0){d1=cL;d2=D;d3=b4;aj=249;break}K4(c[bm>>2]|0);d1=cL;d2=D;d3=b4;aj=249}else if((aj|0)==319){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dW=M;dX=b4;aj=340;break}}else if((aj|0)==359){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;d4=M;d5=b4;aj=387;break}}else if((aj|0)==267){z=0;ar(88,0);if(!z){return 0}else{z=0;b4=bS(-1,-1)|0;dD=M;dE=b4;aj=295;break}}else if((aj|0)==385){b4=bS(-1,-1)|0;d4=M;d5=b4;aj=387}else if((aj|0)==410){i=d;return ai|0}}while(0);if((aj|0)==139){d6=d$;d7=d0;aj=148}else if((aj|0)==194){dk=1;dl=dN;dm=dM;aj=197}else if((aj|0)==92){dn=dO;dp=dP;aj=96}else if((aj|0)==387){d8=d4;d9=d5;aj=396}else if((aj|0)==390){dy=1;dz=dx;dA=dw;aj=393}else if((aj|0)==295){ea=dD;eb=dE;aj=304}else if((aj|0)==62){if((a[bW]&1)==0){dq=dU;dr=dV;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}K4(c[b_>>2]|0);dq=dU;dr=dV;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==298){dH=1;dI=dG;dJ=dF;aj=301}else if((aj|0)==340){dQ=dW;dR=dX;aj=344}else if((aj|0)==191){ec=dB;ed=dC;aj=200}else if((aj|0)==142){dY=1;dZ=dj;d_=di;aj=145}else if((aj|0)==243){ee=dS;ef=dT;aj=252}else if((aj|0)==246){d1=1;d2=dL;d3=dK;aj=249}do{if((aj|0)==197){if((a[bs]&1)==0){if(dk){ec=dm;ed=dl;aj=200;break}else{dq=dl;dr=dm}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[bx>>2]|0);if(dk){ec=dm;ed=dl;aj=200;break}else{dq=dl;dr=dm}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==393){if((a[aB]&1)==0){if(dy){d8=dA;d9=dz;aj=396;break}else{dq=dz;dr=dA}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[aM>>2]|0);if(dy){d8=dA;d9=dz;aj=396;break}else{dq=dz;dr=dA}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==301){if((a[a3]&1)==0){if(dH){ea=dJ;eb=dI;aj=304;break}else{dq=dI;dr=dJ}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[a8>>2]|0);if(dH){ea=dJ;eb=dI;aj=304;break}else{dq=dI;dr=dJ}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==344){bm=c[cY>>2]|0;bi=c[cZ>>2]|0;bK=bm;while(1){if((bK|0)==(bi|0)){eg=bi;break}if((c[bK>>2]|0)==(c_|0)){eg=bK;break}else{bK=bK+4|0}}bK=eg-bm>>2;bG=bm+(bK+1<<2)|0;b$=bi-bG|0;Le(bm+(bK<<2)|0,bG|0,b$|0)|0;bG=bm+((b$>>2)+bK<<2)|0;bK=c[cZ>>2]|0;if((bG|0)!=(bK|0)){c[cZ>>2]=bK+(~((bK-4+(-bG|0)|0)>>>2)<<2)}K4(c0);dq=dR;dr=dQ;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==96){bG=c[b5>>2]|0;bK=c[b7>>2]|0;b$=bG;while(1){if((b$|0)==(bK|0)){eh=bK;break}if((c[b$>>2]|0)==(b9|0)){eh=b$;break}else{b$=b$+4|0}}b$=eh-bG>>2;bm=bG+(b$+1<<2)|0;bi=bK-bm|0;Le(bG+(b$<<2)|0,bm|0,bi|0)|0;bm=bG+((bi>>2)+b$<<2)|0;b$=c[b7>>2]|0;if((bm|0)!=(b$|0)){c[b7>>2]=b$+(~((b$-4+(-bm|0)|0)>>>2)<<2)}K4(cb);dq=dp;dr=dn;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==249){if((a[bf]&1)==0){if(d1){ee=d3;ef=d2;aj=252;break}else{dq=d2;dr=d3}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[bl>>2]|0);if(d1){ee=d3;ef=d2;aj=252;break}else{dq=d2;dr=d3}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}else if((aj|0)==145){if((a[bE]&1)==0){if(dY){d6=d_;d7=dZ;aj=148;break}else{dq=dZ;dr=d_}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else{K4(c[bJ>>2]|0);if(dY){d6=d_;d7=dZ;aj=148;break}else{dq=dZ;dr=d_}ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}}while(0);if((aj|0)==396){bJ=c[c5>>2]|0;bE=c[c6>>2]|0;bl=bJ;while(1){if((bl|0)==(bE|0)){ei=bE;break}if((c[bl>>2]|0)==(c7|0)){ei=bl;break}else{bl=bl+4|0}}bl=ei-bJ>>2;bf=bJ+(bl+1<<2)|0;a8=bE-bf|0;Le(bJ+(bl<<2)|0,bf|0,a8|0)|0;bf=bJ+((a8>>2)+bl<<2)|0;bl=c[c6>>2]|0;if((bf|0)!=(bl|0)){c[c6>>2]=bl+(~((bl-4+(-bf|0)|0)>>>2)<<2)}K4(c9);dq=d9;dr=d8;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==200){bf=c[ct>>2]|0;bl=c[cu>>2]|0;a8=bf;while(1){if((a8|0)==(bl|0)){ej=bl;break}if((c[a8>>2]|0)==(cv|0)){ej=a8;break}else{a8=a8+4|0}}a8=ej-bf>>2;bJ=bf+(a8+1<<2)|0;bE=bl-bJ|0;Le(bf+(a8<<2)|0,bJ|0,bE|0)|0;bJ=bf+((bE>>2)+a8<<2)|0;a8=c[cu>>2]|0;if((bJ|0)!=(a8|0)){c[cu>>2]=a8+(~((a8-4+(-bJ|0)|0)>>>2)<<2)}K4(cx);dq=ed;dr=ec;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==148){bJ=c[ci>>2]|0;a8=c[cj>>2]|0;bE=bJ;while(1){if((bE|0)==(a8|0)){ek=a8;break}if((c[bE>>2]|0)==(ck|0)){ek=bE;break}else{bE=bE+4|0}}bE=ek-bJ>>2;bf=bJ+(bE+1<<2)|0;bl=a8-bf|0;Le(bJ+(bE<<2)|0,bf|0,bl|0)|0;bf=bJ+((bl>>2)+bE<<2)|0;bE=c[cj>>2]|0;if((bf|0)!=(bE|0)){c[cj>>2]=bE+(~((bE-4+(-bf|0)|0)>>>2)<<2)}K4(cm);dq=d7;dr=d6;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==304){bf=c[cO>>2]|0;bE=c[cP>>2]|0;bl=bf;while(1){if((bl|0)==(bE|0)){el=bE;break}if((c[bl>>2]|0)==(cQ|0)){el=bl;break}else{bl=bl+4|0}}bl=el-bf>>2;bJ=bf+(bl+1<<2)|0;a8=bE-bJ|0;Le(bf+(bl<<2)|0,bJ|0,a8|0)|0;bJ=bf+((a8>>2)+bl<<2)|0;bl=c[cP>>2]|0;if((bJ|0)!=(bl|0)){c[cP>>2]=bl+(~((bl-4+(-bJ|0)|0)>>>2)<<2)}K4(cS);dq=eb;dr=ea;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}else if((aj|0)==252){bJ=c[cE>>2]|0;bl=c[cF>>2]|0;a8=bJ;while(1){if((a8|0)==(bl|0)){em=bl;break}if((c[a8>>2]|0)==(cG|0)){em=a8;break}else{a8=a8+4|0}}a8=em-bJ>>2;bf=bJ+(a8+1<<2)|0;bE=bl-bf|0;Le(bJ+(a8<<2)|0,bf|0,bE|0)|0;bf=bJ+((bE>>2)+a8<<2)|0;a8=c[cF>>2]|0;if((bf|0)!=(a8|0)){c[cF>>2]=a8+(~((a8-4+(-bf|0)|0)>>>2)<<2)}K4(cI);dq=ef;dr=ee;ds=dq;dt=0;du=ds;dv=dr;bg(du|0)}}}while(0);ee=c[ad>>2]|0;ad=c[af>>2]|0;ef=ee;while(1){if((ef|0)==(ad|0)){en=ad;break}if((c[ef>>2]|0)==(ah|0)){en=ef;break}else{ef=ef+4|0}}ef=en-ee>>2;en=ee+(ef+1<<2)|0;ah=ad-en|0;Le(ee+(ef<<2)|0,en|0,ah|0)|0;en=ee+((ah>>2)+ef<<2)|0;ef=c[af>>2]|0;if((en|0)!=(ef|0)){c[af>>2]=ef+(~((ef-4+(-en|0)|0)>>>2)<<2)}K4(ae);dq=ao;dr=ap;ds=dq;dt=0;du=ds;dv=dr;bg(du|0);return 0}function u3(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zG(e)|0;if((f|0)==0){g=0;return g|0}h=(yO(f)|0)!=0;i=h?0:f;if((i|0)==0){g=0;return g|0}f=b+48|0;h=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L7}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[f>>2]=h+n;h=e;f=0;while(1){o=h-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{h=o;f=f+1|0}}h=b+40|0;if((n|0)!=0){c[h>>2]=1}n=c[h>>2]|0;c[b+52>>2]=n+f;j=i;o=e;c[h>>2]=j-o+f+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=i;g=i;return g|0}function u4(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zH(e)|0;if((f|0)==0){g=0;return g|0}h=(yO(f)|0)!=0;i=h?0:f;if((i|0)==0){g=0;return g|0}f=b+48|0;h=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L7}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[f>>2]=h+n;h=e;f=0;while(1){o=h-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{h=o;f=f+1|0}}h=b+40|0;if((n|0)!=0){c[h>>2]=1}n=c[h>>2]|0;c[b+52>>2]=n+f;j=i;o=e;c[h>>2]=j-o+f+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=i;g=i;return g|0}function u5(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y9(e)|0;if((f|0)==0){g=0;return g|0}h=(yO(f)|0)!=0;i=h?0:f;if((i|0)==0){g=0;return g|0}f=b+48|0;h=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<i>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L7}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<i>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[f>>2]=h+n;h=e;f=0;while(1){o=h-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{h=o;f=f+1|0}}h=b+40|0;if((n|0)!=0){c[h>>2]=1}n=c[h>>2]|0;c[b+52>>2]=n+f;j=i;o=e;c[h>>2]=j-o+f+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=i;g=i;return g|0}function u6(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zk(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u7(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zl(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u8(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zn(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function u9(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=zQ(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function va(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yL(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vb(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yO(e)|0;if((f|0)==0){g=0;return g|0}h=(a[f]|0)==58?f+1|0:0;if((h|0)==0){g=0;return g|0}f=b+48|0;i=c[f>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<h>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L7}else{n=l}m=k+1|0;if(m>>>0<h>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[f>>2]=i+o;i=e;f=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;f=f+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+f;j=h;n=e;c[i>>2]=j-n+f+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=h;g=h;return g|0}function vc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yR(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=(a[e]|0)==42?e+1|0:0;g=(f|0)!=0?f:e;if((g|0)==0){h=0;return h|0}f=yP(g)|0;if((f|0)==0){h=0;return h|0}g=b+48|0;i=c[g>>2]|0;j=c[d>>2]|0;L7:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L7}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[g>>2]=i+o;i=e;g=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;g=g+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+g;j=f;n=e;c[i>>2]=j-n+g+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;h=f;return h|0}function ve(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y$(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=a[36128]|0;L1:do{if(f<<24>>24==0){g=e;h=0}else{i=e;j=36128;k=f;while(1){if((a[i]|0)!=k<<24>>24){g=i;h=k;break L1}l=i+1|0;m=j+1|0;n=a[m]|0;if(n<<24>>24==0){g=l;h=0;break}else{i=l;j=m;k=n}}}}while(0);f=h<<24>>24!=0?0:g;if((f|0)==0){o=0;return o|0}g=b+48|0;h=c[g>>2]|0;k=c[d>>2]|0;L9:do{if(k>>>0<f>>>0){j=k;i=0;while(1){n=a[j]|0;if((n<<24>>24|0)==0){p=i;break L9}else if((n<<24>>24|0)==10){q=i+1|0}else{q=i}n=j+1|0;if(n>>>0<f>>>0){j=n;i=q}else{p=q;break}}}else{p=0}}while(0);c[g>>2]=h+p;h=e;g=0;while(1){q=h-1|0;if(q>>>0<k>>>0){break}if((a[q]|0)==10){break}else{h=q;g=g+1|0}}h=b+40|0;if((p|0)!=0){c[h>>2]=1}p=c[h>>2]|0;c[b+52>>2]=p+g;k=f;q=e;c[h>>2]=k-q+g+p;p=b+56|0;c[p>>2]=q;c[p+4>>2]=k;c[d>>2]=f;o=f;return o|0}function vg(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y0(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vh(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y1(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vi(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y2(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vj(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y4(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vk(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y3(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vl(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y5(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y6(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vn(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y7(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vo(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yU(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vp(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+56|0;e=d|0;f=d+8|0;g=d+16|0;h=d+32|0;j=d+40|0;k=c[b>>2]|0;l=K2(60)|0;c[h>>2]=l;m=k+4|0;n=c[m>>2]|0;if((n|0)==(c[k+8>>2]|0)){e3(k|0,h);o=c[h>>2]|0}else{if((n|0)==0){p=0}else{c[n>>2]=l;p=c[m>>2]|0}c[m>>2]=p+4;o=l}l=o;p=o;n=b+28|0;L8:do{if((a[n]&1)==0){h=j;c[h>>2]=c[n>>2];c[h+4>>2]=c[n+4>>2];c[h+8>>2]=c[n+8>>2];q=16}else{h=c[b+36>>2]|0;r=c[b+32>>2]|0;do{if(r>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(r>>>0<11>>>0){a[j]=r<<1;s=j+1|0}else{t=r+16&-16;u=(z=0,au(246,t|0)|0);if(z){z=0;break}c[j+8>>2]=u;c[j>>2]=t|1;c[j+4>>2]=r;s=u}Ld(s|0,h|0,r)|0;a[s+r|0]=0;q=16;break L8}}while(0);r=bS(-1,-1)|0;v=M;w=r}}while(0);do{if((q|0)==16){s=b+44|0;n=g;c[n>>2]=c[s>>2];c[n+4>>2]=c[s+4>>2];c[n+8>>2]=c[s+8>>2];z=0;aD(34,p|0,j|0,g|0,0,1,0);if(z){z=0;s=bS(-1,-1)|0;n=s;s=M;if((a[j]&1)==0){v=s;w=n;break}K4(c[j+8>>2]|0);v=s;w=n;break}if((a[j]&1)!=0){K4(c[j+8>>2]|0)}n=b+20|0;s=yN(c[n>>2]|0)|0;if((s+1|0)==0|(a[s]|0)!=123){s=o+36|0;r=s;h=vq(b)|0;c[f>>2]=h;u=s+8|0;t=u;x=c[t>>2]|0;if((x|0)==(c[s+12>>2]|0)){fo(s+4|0,f);y=c[f>>2]|0}else{if((x|0)==0){A=0}else{c[x>>2]=h;A=c[t>>2]|0}c[u>>2]=A+4;y=h}cA[c[c[s>>2]>>2]&1023](r,y)}r=yN(c[n>>2]|0)|0;s=(a[r]|0)==44?r+1|0:0;if((s|0)==0){i=d;return p|0}h=b+48|0;u=b+40|0;t=b+52|0;x=b+56|0;B=o+36|0;C=B;D=B+8|0;E=D;F=B+12|0;G=B+4|0;H=B;B=r;r=s;while(1){s=c[h>>2]|0;I=c[n>>2]|0;L45:do{if(I>>>0<r>>>0){J=I;K=0;while(1){L=a[J]|0;if((L<<24>>24|0)==10){N=K+1|0}else if((L<<24>>24|0)==0){O=K;break L45}else{N=K}L=J+1|0;if(L>>>0<r>>>0){J=L;K=N}else{O=N;break}}}else{O=0}}while(0);c[h>>2]=O+s;K=B;J=0;while(1){L=K-1|0;if(L>>>0<I>>>0){break}if((a[L]|0)==10){break}else{K=L;J=J+1|0}}if((O|0)!=0){c[u>>2]=1}K=c[u>>2]|0;c[t>>2]=K+J;I=r;s=B;c[u>>2]=I-s+J+K;c[x>>2]=s;c[x+4>>2]=I;c[n>>2]=r;if((r|0)==0){q=54;break}I=vq(b)|0;c[e>>2]=I;s=c[E>>2]|0;if((s|0)==(c[F>>2]|0)){fo(G,e);P=c[e>>2]|0}else{if((s|0)==0){Q=0}else{c[s>>2]=I;Q=c[E>>2]|0}c[D>>2]=Q+4;P=I}cA[c[c[H>>2]>>2]&1023](C,P);I=yN(c[n>>2]|0)|0;s=(a[I]|0)==44?I+1|0:0;if((s|0)==0){q=55;break}else{B=I;r=s}}if((q|0)==54){i=d;return p|0}else if((q|0)==55){i=d;return p|0}}}while(0);p=c[k>>2]|0;k=c[m>>2]|0;d=p;while(1){if((d|0)==(k|0)){R=k;break}if((c[d>>2]|0)==(o|0)){R=d;break}else{d=d+4|0}}d=R-p>>2;R=p+(d+1<<2)|0;o=k-R|0;Le(p+(d<<2)|0,R|0,o|0)|0;R=p+((o>>2)+d<<2)|0;d=c[m>>2]|0;if((R|0)==(d|0)){K4(l);S=w;T=0;U=S;V=v;bg(U|0)}c[m>>2]=d+(~((d-4+(-R|0)|0)>>>2)<<2);K4(l);S=w;T=0;U=S;V=v;bg(U|0);return 0}function vq(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;d=i;i=i+96|0;e=d|0;f=d+8|0;g=d+16|0;h=d+32|0;j=d+40|0;k=d+56|0;l=d+64|0;m=d+80|0;n=b|0;o=c[n>>2]|0;p=K2(60)|0;c[k>>2]=p;q=o+4|0;r=c[q>>2]|0;if((r|0)==(c[o+8>>2]|0)){e3(o|0,k);s=c[k>>2]|0}else{if((r|0)==0){t=0}else{c[r>>2]=p;t=c[q>>2]|0}c[q>>2]=t+4;s=p}p=s;t=s;r=b+28|0;L8:do{if((a[r]&1)==0){k=l;c[k>>2]=c[r>>2];c[k+4>>2]=c[r+4>>2];c[k+8>>2]=c[r+8>>2];u=16}else{k=c[b+36>>2]|0;v=c[b+32>>2]|0;do{if(v>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(v>>>0<11>>>0){a[l]=v<<1;w=l+1|0}else{x=v+16&-16;y=(z=0,au(246,x|0)|0);if(z){z=0;break}c[l+8>>2]=y;c[l>>2]=x|1;c[l+4>>2]=v;w=y}Ld(w|0,k|0,v)|0;a[w+v|0]=0;u=16;break L8}}while(0);v=bS(-1,-1)|0;A=M;B=v}}while(0);do{if((u|0)==16){w=b+44|0;v=j;c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];z=0;aI(88,t|0,l|0,j|0,0,0,0,0);if(z){z=0;v=bS(-1,-1)|0;k=v;v=M;if((a[l]&1)==0){A=v;B=k;break}K4(c[l+8>>2]|0);A=v;B=k;break}if((a[l]&1)!=0){K4(c[l+8>>2]|0)}do{if((vr(b)|0)==0){if((vs(b)|0)==0){break}a[t+57|0]=1}else{a[s+56|0]=1}}while(0);L35:do{if((yP(yN(c[b+20>>2]|0)|0)|0)==0){if((tO(b)|0)==0){k=s+36|0;v=k;y=vt(b)|0;c[f>>2]=y;x=k+8|0;C=x;D=c[C>>2]|0;if((D|0)==(c[k+12>>2]|0)){jM(k+4|0,f);E=c[f>>2]|0}else{if((D|0)==0){F=0}else{c[D>>2]=y;F=c[C>>2]|0}c[x>>2]=F+4;E=y}cA[c[c[k>>2]>>2]&1023](v,E);break}v=c[n>>2]|0;k=K2(52)|0;c[h>>2]=k;y=v+4|0;x=c[y>>2]|0;if((x|0)==(c[v+8>>2]|0)){e3(v|0,h);G=c[h>>2]|0}else{if((x|0)==0){H=0}else{c[x>>2]=k;H=c[y>>2]|0}c[y>>2]=H+4;G=k}k=G;L55:do{if((a[r]&1)==0){x=m;c[x>>2]=c[r>>2];c[x+4>>2]=c[r+4>>2];c[x+8>>2]=c[r+8>>2];u=50}else{x=c[b+36>>2]|0;C=c[b+32>>2]|0;do{if(C>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(C>>>0<11>>>0){a[m]=C<<1;I=m+1|0}else{D=C+16&-16;J=(z=0,au(246,D|0)|0);if(z){z=0;break}c[m+8>>2]=J;c[m>>2]=D|1;c[m+4>>2]=C;I=J}Ld(I|0,x|0,C)|0;a[I+C|0]=0;u=50;break L55}}while(0);C=bS(-1,-1)|0;K=M;L=C}}while(0);do{if((u|0)==50){C=g;c[C>>2]=c[w>>2];c[C+4>>2]=c[w+4>>2];c[C+8>>2]=c[w+8>>2];z=0;aq(14,G|0,m|0,g|0,b+56|0,0);if(!z){c[s+52>>2]=G;if((a[m]&1)==0){break L35}K4(c[m+8>>2]|0);break L35}else{z=0;C=bS(-1,-1)|0;x=C;C=M;if((a[m]&1)==0){K=C;L=x;break}K4(c[m+8>>2]|0);K=C;L=x;break}}}while(0);x=c[v>>2]|0;C=c[y>>2]|0;J=x;while(1){if((J|0)==(C|0)){N=C;break}if((c[J>>2]|0)==(G|0)){N=J;break}else{J=J+4|0}}J=N-x>>2;v=x+(J+1<<2)|0;D=C-v|0;Le(x+(J<<2)|0,v|0,D|0)|0;v=x+((D>>2)+J<<2)|0;J=c[y>>2]|0;if((v|0)!=(J|0)){c[y>>2]=J+(~((J-4+(-v|0)|0)>>>2)<<2)}K4(k);O=K;P=L;Q=P;R=0;S=Q;T=O;bg(S|0)}else{c[s+52>>2]=tZ(b)|0}}while(0);if((vu(b)|0)==0){i=d;return t|0}w=s+36|0;v=w;J=w+8|0;D=J;U=w+12|0;V=w+4|0;W=w;do{w=vt(b)|0;c[e>>2]=w;X=c[D>>2]|0;if((X|0)==(c[U>>2]|0)){jM(V,e);Y=c[e>>2]|0}else{if((X|0)==0){Z=0}else{c[X>>2]=w;Z=c[D>>2]|0}c[J>>2]=Z+4;Y=w}cA[c[c[W>>2]>>2]&1023](v,Y);}while((vu(b)|0)!=0);i=d;return t|0}}while(0);t=c[o>>2]|0;o=c[q>>2]|0;d=t;while(1){if((d|0)==(o|0)){_=o;break}if((c[d>>2]|0)==(s|0)){_=d;break}else{d=d+4|0}}d=_-t>>2;_=t+(d+1<<2)|0;s=o-_|0;Le(t+(d<<2)|0,_|0,s|0)|0;_=t+((s>>2)+d<<2)|0;d=c[q>>2]|0;if((_|0)!=(d|0)){c[q>>2]=d+(~((d-4+(-_|0)|0)>>>2)<<2)}K4(p);O=A;P=B;Q=P;R=0;S=Q;T=O;bg(S|0);return 0}function vr(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=a[36016]|0;L1:do{if(f<<24>>24==0){g=e;h=0}else{i=e;j=36016;k=f;while(1){if((a[i]|0)!=k<<24>>24){g=i;h=k;break L1}l=i+1|0;m=j+1|0;n=a[m]|0;if(n<<24>>24==0){g=l;h=0;break}else{i=l;j=m;k=n}}}}while(0);f=h<<24>>24!=0?0:g;if((f|0)==0){o=0;return o|0}g=b+48|0;h=c[g>>2]|0;k=c[d>>2]|0;L9:do{if(k>>>0<f>>>0){j=k;i=0;while(1){n=a[j]|0;if((n<<24>>24|0)==10){p=i+1|0}else if((n<<24>>24|0)==0){q=i;break L9}else{p=i}n=j+1|0;if(n>>>0<f>>>0){j=n;i=p}else{q=p;break}}}else{q=0}}while(0);c[g>>2]=h+q;h=e;g=0;while(1){p=h-1|0;if(p>>>0<k>>>0){break}if((a[p]|0)==10){break}else{h=p;g=g+1|0}}h=b+40|0;if((q|0)!=0){c[h>>2]=1}q=c[h>>2]|0;c[b+52>>2]=q+g;k=f;p=e;c[h>>2]=k-p+g+q;q=b+56|0;c[q>>2]=p;c[q+4>>2]=k;c[d>>2]=f;o=f;return o|0}function vs(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=a[35944]|0;L1:do{if(f<<24>>24==0){g=e;h=0}else{i=e;j=35944;k=f;while(1){if((a[i]|0)!=k<<24>>24){g=i;h=k;break L1}l=i+1|0;m=j+1|0;n=a[m]|0;if(n<<24>>24==0){g=l;h=0;break}else{i=l;j=m;k=n}}}}while(0);f=h<<24>>24!=0?0:g;if((f|0)==0){o=0;return o|0}g=b+48|0;h=c[g>>2]|0;k=c[d>>2]|0;L9:do{if(k>>>0<f>>>0){j=k;i=0;while(1){n=a[j]|0;if((n<<24>>24|0)==0){p=i;break L9}else if((n<<24>>24|0)==10){q=i+1|0}else{q=i}n=j+1|0;if(n>>>0<f>>>0){j=n;i=q}else{p=q;break}}}else{p=0}}while(0);c[g>>2]=h+p;h=e;g=0;while(1){q=h-1|0;if(q>>>0<k>>>0){break}if((a[q]|0)==10){break}else{h=q;g=g+1|0}}h=b+40|0;if((p|0)!=0){c[h>>2]=1}p=c[h>>2]|0;c[b+52>>2]=p+g;k=f;q=e;c[h>>2]=k-q+g+p;p=b+56|0;c[p>>2]=q;c[p+4>>2]=k;c[d>>2]=f;o=f;return o|0}function vt(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;d=i;i=i+176|0;e=d|0;f=d+8|0;g=d+16|0;h=d+32|0;j=d+48|0;k=d+64|0;l=d+80|0;m=d+96|0;n=d+112|0;o=d+128|0;p=d+144|0;q=d+160|0;r=b+20|0;if((yP(yN(c[r>>2]|0)|0)|0)!=0){s=tZ(b)|0;t=c[b>>2]|0;u=K2(48)|0;c[f>>2]=u;v=t+4|0;w=c[v>>2]|0;if((w|0)==(c[t+8>>2]|0)){e3(t|0,f);x=c[f>>2]|0}else{if((w|0)==0){y=0}else{c[w>>2]=u;y=c[v>>2]|0}c[v>>2]=y+4;x=u}u=x;y=x;w=b+28|0;L10:do{if((a[w]&1)==0){f=g;c[f>>2]=c[w>>2];c[f+4>>2]=c[w+4>>2];c[f+8>>2]=c[w+8>>2];A=17}else{f=c[b+36>>2]|0;B=c[b+32>>2]|0;do{if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(B>>>0<11>>>0){a[g]=B<<1;C=g+1|0}else{D=B+16&-16;E=(z=0,au(246,D|0)|0);if(z){z=0;break}c[g+8>>2]=E;c[g>>2]=D|1;c[g+4>>2]=B;C=E}Ld(C|0,f|0,B)|0;a[C+B|0]=0;A=17;break L10}}while(0);B=bS(-1,-1)|0;F=M;G=B}}while(0);do{if((A|0)==17){C=h;w=b+44|0;c[C>>2]=c[w>>2];c[C+4>>2]=c[w+4>>2];c[C+8>>2]=c[w+8>>2];z=0;aD(36,y|0,g|0,h|0,s|0,0,1);if(z){z=0;w=bS(-1,-1)|0;C=w;w=M;if((a[g]&1)==0){F=w;G=C;break}K4(c[g+8>>2]|0);F=w;G=C;break}if((a[g]&1)==0){H=y;i=d;return H|0}K4(c[g+8>>2]|0);H=y;i=d;return H|0}}while(0);y=c[t>>2]|0;t=c[v>>2]|0;g=y;while(1){if((g|0)==(t|0)){I=t;break}if((c[g>>2]|0)==(x|0)){I=g;break}else{g=g+4|0}}g=I-y>>2;I=y+(g+1<<2)|0;x=t-I|0;Le(y+(g<<2)|0,I|0,x|0)|0;I=y+((x>>2)+g<<2)|0;g=c[v>>2]|0;if((I|0)!=(g|0)){c[v>>2]=g+(~((g-4+(-I|0)|0)>>>2)<<2)}K4(u);J=F;K=G;L=K;N=0;O=L;P=J;bg(O|0)}G=yN(c[r>>2]|0)|0;F=(a[G]|0)==40?G+1|0:0;do{if((F|0)==0){u=K2(48)|0;I=j+8|0;c[I>>2]=u;c[j>>2]=49;c[j+4>>2]=42;Ld(u|0,2608,42)|0;a[u+42|0]=0;c[k>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;z=0;aR(482,b|0,j|0,k|0);if(!z){if((a[j]&1)==0){break}K4(c[I>>2]|0);break}else{z=0}u=bS(-1,-1)|0;g=u;u=M;if((a[j]&1)==0){J=u;K=g;L=K;N=0;O=L;P=J;bg(O|0)}K4(c[I>>2]|0);J=u;K=g;L=K;N=0;O=L;P=J;bg(O|0)}else{g=b+48|0;u=c[g>>2]|0;I=c[r>>2]|0;L54:do{if(I>>>0<F>>>0){v=I;x=0;while(1){y=a[v]|0;if((y<<24>>24|0)==0){Q=x;break L54}else if((y<<24>>24|0)==10){R=x+1|0}else{R=x}y=v+1|0;if(y>>>0<F>>>0){v=y;x=R}else{Q=R;break}}}else{Q=0}}while(0);c[g>>2]=Q+u;x=G;v=0;while(1){y=x-1|0;if(y>>>0<I>>>0){break}if((a[y]|0)==10){break}else{x=y;v=v+1|0}}x=b+40|0;if((Q|0)!=0){c[x>>2]=1}I=c[x>>2]|0;c[b+52>>2]=I+v;u=F;g=G;c[x>>2]=u-g+v+I;I=b+56|0;c[I>>2]=g;c[I+4>>2]=u;c[r>>2]=F}}while(0);F=yN(c[r>>2]|0)|0;do{if(!((F+1|0)==0|(a[F]|0)!=41)){G=K2(64)|0;Q=l+8|0;c[Q>>2]=G;c[l>>2]=65;c[l+4>>2]=48;Ld(G|0,2456,48)|0;a[G+48|0]=0;c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;z=0;aR(482,b|0,l|0,m|0);if(!z){if((a[l]&1)==0){break}K4(c[Q>>2]|0);break}else{z=0}G=bS(-1,-1)|0;R=G;G=M;if((a[l]&1)==0){J=G;K=R;L=K;N=0;O=L;P=J;bg(O|0)}K4(c[Q>>2]|0);J=G;K=R;L=K;N=0;O=L;P=J;bg(O|0)}}while(0);l=uC(b)|0;m=yN(c[r>>2]|0)|0;F=(a[m]|0)==58?m+1|0:0;if((F|0)==0){S=0}else{R=b+48|0;G=c[R>>2]|0;Q=c[r>>2]|0;L82:do{if(Q>>>0<F>>>0){j=Q;k=0;while(1){u=a[j]|0;if((u<<24>>24|0)==0){T=k;break L82}else if((u<<24>>24|0)==10){U=k+1|0}else{U=k}u=j+1|0;if(u>>>0<F>>>0){j=u;k=U}else{T=U;break}}}else{T=0}}while(0);c[R>>2]=T+G;G=m;R=0;while(1){U=G-1|0;if(U>>>0<Q>>>0){break}if((a[U]|0)==10){break}else{G=U;R=R+1|0}}G=b+40|0;if((T|0)!=0){c[G>>2]=1}T=c[G>>2]|0;c[b+52>>2]=T+R;Q=F;U=m;c[G>>2]=Q-U+R+T;T=b+56|0;c[T>>2]=U;c[T+4>>2]=Q;c[r>>2]=F;S=uv(b)|0}F=yN(c[r>>2]|0)|0;Q=(a[F]|0)==41?F+1|0:0;do{if((Q|0)==0){T=K2(48)|0;U=n+8|0;c[U>>2]=T;c[n>>2]=49;c[n+4>>2]=46;Ld(T|0,2336,46)|0;a[T+46|0]=0;c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;z=0;aR(482,b|0,n|0,o|0);if(!z){if((a[n]&1)==0){break}K4(c[U>>2]|0);break}else{z=0}T=bS(-1,-1)|0;R=T;T=M;if((a[n]&1)==0){J=T;K=R;L=K;N=0;O=L;P=J;bg(O|0)}K4(c[U>>2]|0);J=T;K=R;L=K;N=0;O=L;P=J;bg(O|0)}else{R=b+48|0;T=c[R>>2]|0;U=c[r>>2]|0;L99:do{if(U>>>0<Q>>>0){G=U;m=0;while(1){k=a[G]|0;if((k<<24>>24|0)==0){V=m;break L99}else if((k<<24>>24|0)==10){W=m+1|0}else{W=m}k=G+1|0;if(k>>>0<Q>>>0){G=k;m=W}else{V=W;break}}}else{V=0}}while(0);c[R>>2]=V+T;m=F;G=0;while(1){k=m-1|0;if(k>>>0<U>>>0){break}if((a[k]|0)==10){break}else{m=k;G=G+1|0}}m=b+40|0;if((V|0)!=0){c[m>>2]=1}U=c[m>>2]|0;c[b+52>>2]=U+G;T=Q;R=F;c[m>>2]=T-R+G+U;U=b+56|0;c[U>>2]=R;c[U+4>>2]=T;c[r>>2]=Q}}while(0);Q=c[b>>2]|0;r=K2(48)|0;c[e>>2]=r;F=Q+4|0;V=c[F>>2]|0;if((V|0)==(c[Q+8>>2]|0)){e3(Q|0,e);X=c[e>>2]|0}else{if((V|0)==0){Y=0}else{c[V>>2]=r;Y=c[F>>2]|0}c[F>>2]=Y+4;X=r}r=X;Y=X;V=b+28|0;L130:do{if((a[V]&1)==0){e=p;c[e>>2]=c[V>>2];c[e+4>>2]=c[V+4>>2];c[e+8>>2]=c[V+8>>2];A=93}else{e=c[b+36>>2]|0;W=c[b+32>>2]|0;do{if(W>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(W>>>0<11>>>0){a[p]=W<<1;Z=p+1|0}else{n=W+16&-16;o=(z=0,au(246,n|0)|0);if(z){z=0;break}c[p+8>>2]=o;c[p>>2]=n|1;c[p+4>>2]=W;Z=o}Ld(Z|0,e|0,W)|0;a[Z+W|0]=0;A=93;break L130}}while(0);W=bS(-1,-1)|0;_=M;$=W}}while(0);do{if((A|0)==93){Z=q;b=l+16|0;c[Z>>2]=c[b>>2];c[Z+4>>2]=c[b+4>>2];c[Z+8>>2]=c[b+8>>2];z=0;aD(36,Y|0,p|0,q|0,l|0,S|0,0);if(z){z=0;b=bS(-1,-1)|0;Z=b;b=M;if((a[p]&1)==0){_=b;$=Z;break}K4(c[p+8>>2]|0);_=b;$=Z;break}if((a[p]&1)==0){H=Y;i=d;return H|0}K4(c[p+8>>2]|0);H=Y;i=d;return H|0}}while(0);H=c[Q>>2]|0;Q=c[F>>2]|0;d=H;while(1){if((d|0)==(Q|0)){aa=Q;break}if((c[d>>2]|0)==(X|0)){aa=d;break}else{d=d+4|0}}d=aa-H>>2;aa=H+(d+1<<2)|0;X=Q-aa|0;Le(H+(d<<2)|0,aa|0,X|0)|0;aa=H+((X>>2)+d<<2)|0;d=c[F>>2]|0;if((aa|0)!=(d|0)){c[F>>2]=d+(~((d-4+(-aa|0)|0)>>>2)<<2)}K4(r);J=_;K=$;L=K;N=0;O=L;P=J;bg(O|0);return 0}function vu(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=a[36032]|0;L1:do{if(f<<24>>24==0){g=e;h=0}else{i=e;j=36032;k=f;while(1){if((a[i]|0)!=k<<24>>24){g=i;h=k;break L1}l=i+1|0;m=j+1|0;n=a[m]|0;if(n<<24>>24==0){g=l;h=0;break}else{i=l;j=m;k=n}}}}while(0);f=h<<24>>24!=0?0:g;if((f|0)==0){o=0;return o|0}g=b+48|0;h=c[g>>2]|0;k=c[d>>2]|0;L9:do{if(k>>>0<f>>>0){j=k;i=0;while(1){n=a[j]|0;if((n<<24>>24|0)==10){p=i+1|0}else if((n<<24>>24|0)==0){q=i;break L9}else{p=i}n=j+1|0;if(n>>>0<f>>>0){j=n;i=p}else{q=p;break}}}else{q=0}}while(0);c[g>>2]=h+q;h=e;g=0;while(1){p=h-1|0;if(p>>>0<k>>>0){break}if((a[p]|0)==10){break}else{h=p;g=g+1|0}}h=b+40|0;if((q|0)!=0){c[h>>2]=1}q=c[h>>2]|0;c[b+52>>2]=q+g;k=f;p=e;c[h>>2]=k-p+g+q;q=b+56|0;c[q>>2]=p;c[q+4>>2]=k;c[d>>2]=f;o=f;return o|0}function vv(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;j=i;i=i+48|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=j+32|0;Ld(m|0,e|0,12)|0;e=k;n=l;o=b|0;p=d;if((a[p]&1)==0){c[e>>2]=c[p>>2];c[e+4>>2]=c[p+4>>2];c[e+8>>2]=c[p+8>>2]}else{p=c[d+8>>2]|0;q=c[d+4>>2]|0;if(q>>>0>4294967279>>>0){DH(0)}if(q>>>0<11>>>0){a[e]=q<<1;r=k+1|0}else{d=q+16&-16;s=K2(d)|0;c[k+8>>2]=s;c[k>>2]=d|1;c[k+4>>2]=q;r=s}Ld(r|0,p|0,q)|0;a[r+q|0]=0}c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2];z=0;aD(6,o|0,k|0,l|0,0,0,0);if(!z){if((a[e]&1)==0){t=b|0;c[t>>2]=19368;u=b+36|0;c[u>>2]=f;v=b+40|0;c[v>>2]=g;w=b+44|0;x=h&1;a[w]=x;i=j;return}K4(c[k+8>>2]|0);t=b|0;c[t>>2]=19368;u=b+36|0;c[u>>2]=f;v=b+40|0;c[v>>2]=g;w=b+44|0;x=h&1;a[w]=x;i=j;return}else{z=0;j=bS(-1,-1)|0;if((a[e]&1)==0){bg(j|0)}K4(c[k+8>>2]|0);bg(j|0)}}function vw(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=yS(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==10){n=l+1|0}else if((m<<24>>24|0)==0){o=l;break L4}else{n=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=n}else{o=n;break}}}else{o=0}}while(0);c[h>>2]=i+o;i=e;h=0;while(1){n=i-1|0;if(n>>>0<j>>>0){break}if((a[n]|0)==10){break}else{i=n;h=h+1|0}}i=b+40|0;if((o|0)!=0){c[i>>2]=1}o=c[i>>2]|0;c[b+52>>2]=o+h;j=f;n=e;c[i>>2]=j-n+h+o;o=b+56|0;c[o>>2]=n;c[o+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vx(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=b+20|0;e=yN(c[d>>2]|0)|0;f=y8(e)|0;if((f|0)==0){g=0;return g|0}h=b+48|0;i=c[h>>2]|0;j=c[d>>2]|0;L4:do{if(j>>>0<f>>>0){k=j;l=0;while(1){m=a[k]|0;if((m<<24>>24|0)==0){n=l;break L4}else if((m<<24>>24|0)==10){o=l+1|0}else{o=l}m=k+1|0;if(m>>>0<f>>>0){k=m;l=o}else{n=o;break}}}else{n=0}}while(0);c[h>>2]=i+n;i=e;h=0;while(1){o=i-1|0;if(o>>>0<j>>>0){break}if((a[o]|0)==10){break}else{i=o;h=h+1|0}}i=b+40|0;if((n|0)!=0){c[i>>2]=1}n=c[i>>2]|0;c[b+52>>2]=n+h;j=f;o=e;c[i>>2]=j-o+h+n;n=b+56|0;c[n>>2]=o;c[n+4>>2]=j;c[d>>2]=f;g=f;return g|0}function vy(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Is(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K2(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;Ld(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K4(b);return}function vz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Is(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K2(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;Ld(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K4(b);return}function vA(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function vB(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function vC(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+68>>2]&1023](b,a);return}function vD(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+68>>2]&1023](b,a)|0}function vE(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+68>>2]&1023](b,a)|0}function vF(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+68>>2]&1023](b,a)|0}function vG(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+68>>2]&1023](b,a)|0}function vH(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+68>>2]&511](a,d,b);return}function vI(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+68>>2]&511](a,d,b);return}function vJ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DH(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K2(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}Ld(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aV(6,m|0,k|0,l|0,h|0);if(z){z=0;h=bS(-1,-1)|0;l=h;h=M;if((a[k]&1)==0){r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[k+8>>2]|0);r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K4(c[k+8>>2]|0)}k=b|0;c[k>>2]=19176;l=b+32|0;h=f;if((a[h]&1)==0){m=l;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];x=b+44|0;c[x>>2]=g;i=j;return}h=c[f+8>>2]|0;m=c[f+4>>2]|0;do{if(m>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(m>>>0<11>>>0){a[l]=m<<1;y=l+1|0}else{f=m+16&-16;p=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=p;c[l>>2]=f|1;c[b+36>>2]=m;y=p}Ld(y|0,h|0,m)|0;a[y+m|0]=0;x=b+44|0;c[x>>2]=g;i=j;return}}while(0);j=bS(-1,-1)|0;g=j;j=M;c[k>>2]=16776;if((a[b+4|0]&1)==0){r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[b+12>>2]|0);r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}function vK(b){b=b|0;var d=0;d=b|0;c[d>>2]=19176;if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function vL(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=19176;if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function vM(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+64>>2]&1023](b,a);return}function vN(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+64>>2]&1023](b,a)|0}function vO(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+64>>2]&1023](b,a)|0}function vP(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+64>>2]&1023](b,a)|0}function vQ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+64>>2]&1023](b,a)|0}function vR(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+64>>2]&511](a,d,b);return}function vS(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+64>>2]&511](a,d,b);return}function vT(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;l=i;i=i+32|0;m=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[m>>2];c[e+4>>2]=c[m+4>>2];c[e+8>>2]=c[m+8>>2];m=l|0;n=l+16|0;o=b|0;p=d;if((a[p]&1)==0){q=m;c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2]}else{p=c[d+8>>2]|0;q=c[d+4>>2]|0;if(q>>>0>4294967279>>>0){DH(0)}if(q>>>0<11>>>0){a[m]=q<<1;r=m+1|0}else{d=q+16&-16;s=K2(d)|0;c[m+8>>2]=s;c[m>>2]=d|1;c[m+4>>2]=q;r=s}Ld(r|0,p|0,q)|0;a[r+q|0]=0}q=n;r=e;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];z=0;aV(6,o|0,m|0,n|0,j|0);if(z){z=0;j=bS(-1,-1)|0;n=j;j=M;if((a[m]&1)==0){t=j;u=n;v=u;w=0;x=v;y=t;bg(x|0)}K4(c[m+8>>2]|0);t=j;u=n;v=u;w=0;x=v;y=t;bg(x|0)}if((a[m]&1)!=0){K4(c[m+8>>2]|0)}m=b|0;c[m>>2]=19240;n=b+32|0;j=f;if((a[j]&1)==0){o=n;c[o>>2]=c[j>>2];c[o+4>>2]=c[j+4>>2];c[o+8>>2]=c[j+8>>2];A=b+44|0;c[A>>2]=g;B=b+48|0;c[B>>2]=h;C=b+52|0;D=k&1;a[C]=D;i=l;return}j=c[f+8>>2]|0;o=c[f+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[n]=o<<1;E=n+1|0}else{f=o+16&-16;r=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=r;c[n>>2]=f|1;c[b+36>>2]=o;E=r}Ld(E|0,j|0,o)|0;a[E+o|0]=0;A=b+44|0;c[A>>2]=g;B=b+48|0;c[B>>2]=h;C=b+52|0;D=k&1;a[C]=D;i=l;return}}while(0);l=bS(-1,-1)|0;D=l;l=M;c[m>>2]=16776;if((a[b+4|0]&1)==0){t=l;u=D;v=u;w=0;x=v;y=t;bg(x|0)}K4(c[b+12>>2]|0);t=l;u=D;v=u;w=0;x=v;y=t;bg(x|0)}function vU(b){b=b|0;var d=0;d=b|0;c[d>>2]=19240;if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function vV(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=19240;if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function vW(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+60>>2]&1023](b,a);return}function vX(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+60>>2]&1023](b,a)|0}function vY(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+60>>2]&1023](b,a)|0}function vZ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+60>>2]&1023](b,a)|0}function v_(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+60>>2]&1023](b,a)|0}function v$(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+60>>2]&511](a,d,b);return}function v0(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+60>>2]&511](a,d,b);return}function v1(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function v2(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function v3(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+56>>2]&1023](b,a);return}function v4(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+56>>2]&1023](b,a)|0}function v5(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+56>>2]&1023](b,a)|0}function v6(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+56>>2]&1023](b,a)|0}function v7(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+56>>2]&1023](b,a)|0}function v8(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+56>>2]&511](a,d,b);return}function v9(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+56>>2]&511](a,d,b);return}function wa(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wb(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function wc(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+108>>2]&1023](b,a);return}function wd(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+108>>2]&1023](b,a)|0}function we(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+108>>2]&1023](b,a)|0}function wf(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+108>>2]&1023](b,a)|0}function wg(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+108>>2]&1023](b,a)|0}function wh(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+108>>2]&511](a,d,b);return}function wi(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+108>>2]&511](a,d,b);return}function wj(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DH(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K2(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}Ld(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aD(6,l|0,j|0,k|0,1,0,0);if(z){z=0;k=bS(-1,-1)|0;l=k;k=M;if((a[j]&1)==0){q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[j+8>>2]|0);q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K4(c[j+8>>2]|0)}j=b|0;c[j>>2]=16896;c[b+36>>2]=f;f=b+40|0;l=g;if((a[l]&1)==0){k=f;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];i=h;return}l=c[g+8>>2]|0;k=c[g+4>>2]|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(k>>>0<11>>>0){a[f]=k<<1;w=f+1|0}else{g=k+16&-16;o=(z=0,au(246,g|0)|0);if(z){z=0;break}c[b+48>>2]=o;c[f>>2]=g|1;c[b+44>>2]=k;w=o}Ld(w|0,l|0,k)|0;a[w+k|0]=0;i=h;return}}while(0);h=bS(-1,-1)|0;k=h;h=M;c[j>>2]=16776;if((a[b+4|0]&1)==0){q=h;r=k;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[b+12>>2]|0);q=h;r=k;s=r;t=0;u=s;v=q;bg(u|0)}function wk(b){b=b|0;var d=0;d=b|0;c[d>>2]=16896;if((a[b+40|0]&1)!=0){K4(c[b+48>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wl(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=16896;if((a[b+40|0]&1)!=0){K4(c[b+48>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function wm(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+116>>2]&1023](b,a);return}function wn(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+116>>2]&1023](b,a)|0}function wo(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+116>>2]&1023](b,a)|0}function wp(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+116>>2]&1023](b,a)|0}function wq(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+116>>2]&1023](b,a)|0}function wr(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+116>>2]&511](a,d,b);return}function ws(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+116>>2]&511](a,d,b);return}function wt(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wu(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function wv(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+100>>2]&1023](b,a);return}function ww(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+100>>2]&1023](b,a)|0}function wx(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+100>>2]&1023](b,a)|0}function wy(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+100>>2]&1023](b,a)|0}function wz(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+100>>2]&1023](b,a)|0}function wA(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+100>>2]&511](a,d,b);return}function wB(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+100>>2]&511](a,d,b);return}function wC(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DH(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K2(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}Ld(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aD(6,k|0,h|0,j|0,0,0,0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[h]&1)==0){p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[h+8>>2]|0);p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}h=b|0;c[h>>2]=16568;k=b+36|0;j=f;if((a[j]&1)==0){n=k;c[n>>2]=c[j>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];i=g;return}j=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[k]=n<<1;v=k+1|0}else{f=n+16&-16;m=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+44>>2]=m;c[k>>2]=f|1;c[b+40>>2]=n;v=m}Ld(v|0,j|0,n)|0;a[v+n|0]=0;i=g;return}}while(0);g=bS(-1,-1)|0;n=g;g=M;c[h>>2]=16776;if((a[b+4|0]&1)==0){p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[b+12>>2]|0);p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}function wD(b){b=b|0;var d=0;d=b|0;c[d>>2]=16568;if((a[b+36|0]&1)!=0){K4(c[b+44>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wE(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=16568;if((a[b+36|0]&1)!=0){K4(c[b+44>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function wF(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+112>>2]&1023](b,a);return}function wG(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+112>>2]&1023](b,a)|0}function wH(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+112>>2]&1023](b,a)|0}function wI(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+112>>2]&1023](b,a)|0}function wJ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+112>>2]&1023](b,a)|0}function wK(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+112>>2]&511](a,d,b);return}function wL(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+112>>2]&511](a,d,b);return}function wM(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wN(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function wO(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+96>>2]&1023](b,a);return}function wP(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+96>>2]&1023](b,a)|0}function wQ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+96>>2]&1023](b,a)|0}function wR(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+96>>2]&1023](b,a)|0}function wS(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+96>>2]&1023](b,a)|0}function wT(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+96>>2]&511](a,d,b);return}function wU(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+96>>2]&511](a,d,b);return}function wV(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function wW(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function wX(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+80>>2]&1023](b,a);return}function wY(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+80>>2]&1023](b,a)|0}function wZ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+80>>2]&1023](b,a)|0}function w_(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+80>>2]&1023](b,a)|0}function w$(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+80>>2]&1023](b,a)|0}function w0(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+80>>2]&511](a,d,b);return}function w1(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+80>>2]&511](a,d,b);return}function w2(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function w3(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function w4(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+76>>2]&1023](b,a);return}function w5(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+76>>2]&1023](b,a)|0}function w6(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+76>>2]&1023](b,a)|0}function w7(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+76>>2]&1023](b,a)|0}function w8(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+76>>2]&1023](b,a)|0}function w9(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+76>>2]&511](a,d,b);return}function xa(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+76>>2]&511](a,d,b);return}function xb(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function xc(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function xd(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+72>>2]&1023](b,a);return}function xe(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+72>>2]&1023](b,a)|0}function xf(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+72>>2]&1023](b,a)|0}function xg(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+72>>2]&1023](b,a)|0}function xh(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+72>>2]&1023](b,a)|0}function xi(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+72>>2]&511](a,d,b);return}function xj(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+72>>2]&511](a,d,b);return}function xk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DH(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K2(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}Ld(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aR(292,m|0,k|0,l|0);if(z){z=0;l=bS(-1,-1)|0;m=l;l=M;if((a[k]&1)==0){r=l;s=m;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[k+8>>2]|0);r=l;s=m;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K4(c[k+8>>2]|0)}k=b|0;c[k>>2]=19728;m=b+32|0;l=f;L22:do{if((a[l]&1)==0){p=m;c[p>>2]=c[l>>2];c[p+4>>2]=c[l+4>>2];c[p+8>>2]=c[l+8>>2];x=22}else{p=c[f+8>>2]|0;o=c[f+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[m]=o<<1;y=m+1|0}else{e=o+16&-16;n=(z=0,au(246,e|0)|0);if(z){z=0;break}c[b+40>>2]=n;c[m>>2]=e|1;c[b+36>>2]=o;y=n}Ld(y|0,p|0,o)|0;a[y+o|0]=0;x=22;break L22}}while(0);o=bS(-1,-1)|0;A=M;B=o}}while(0);do{if((x|0)==22){y=b+44|0;f=g;L37:do{if((a[f]&1)==0){l=y;c[l>>2]=c[f>>2];c[l+4>>2]=c[f+4>>2];c[l+8>>2]=c[f+8>>2];x=32}else{l=c[g+8>>2]|0;o=c[g+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[y]=o<<1;C=y+1|0}else{p=o+16&-16;n=(z=0,au(246,p|0)|0);if(z){z=0;break}c[b+52>>2]=n;c[y>>2]=p|1;c[b+48>>2]=o;C=n}Ld(C|0,l|0,o)|0;a[C+o|0]=0;x=32;break L37}}while(0);o=bS(-1,-1)|0;D=M;E=o}}while(0);do{if((x|0)==32){f=b+56|0;o=h;if((a[o]&1)==0){l=f;c[l>>2]=c[o>>2];c[l+4>>2]=c[o+4>>2];c[l+8>>2]=c[o+8>>2];i=j;return}o=c[h+8>>2]|0;l=c[h+4>>2]|0;do{if(l>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(l>>>0<11>>>0){a[f]=l<<1;F=f+1|0}else{n=l+16&-16;p=(z=0,au(246,n|0)|0);if(z){z=0;break}c[b+64>>2]=p;c[f>>2]=n|1;c[b+60>>2]=l;F=p}Ld(F|0,o|0,l)|0;a[F+l|0]=0;i=j;return}}while(0);l=bS(-1,-1)|0;o=l;l=M;if((a[y]&1)==0){D=l;E=o;break}K4(c[b+52>>2]|0);D=l;E=o}}while(0);if((a[m]&1)==0){A=D;B=E;break}K4(c[b+40>>2]|0);A=D;B=E}}while(0);c[k>>2]=16776;if((a[b+4|0]&1)==0){r=A;s=B;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[b+12>>2]|0);r=A;s=B;t=s;u=0;v=t;w=r;bg(v|0)}function xl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+32|0;g=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[e+8>>2]=c[g+8>>2];g=f|0;h=f+16|0;j=b|0;k=d;if((a[k]&1)==0){l=g;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2]}else{k=c[d+8>>2]|0;l=c[d+4>>2]|0;if(l>>>0>4294967279>>>0){DH(0)}if(l>>>0<11>>>0){a[g]=l<<1;m=g+1|0}else{d=l+16&-16;n=K2(d)|0;c[g+8>>2]=n;c[g>>2]=d|1;c[g+4>>2]=l;m=n}Ld(m|0,k|0,l)|0;a[m+l|0]=0}l=h;m=e;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];z=0;aq(20,j|0,g|0,h|0,0,0);if(!z){if((a[g]&1)==0){o=b|0;c[o>>2]=20472;i=f;return}K4(c[g+8>>2]|0);o=b|0;c[o>>2]=20472;i=f;return}else{z=0;f=bS(-1,-1)|0;if((a[g]&1)==0){bg(f|0)}K4(c[g+8>>2]|0);bg(f|0)}}function xm(b){b=b|0;var d=0;d=b|0;c[d>>2]=19728;if((a[b+56|0]&1)!=0){K4(c[b+64>>2]|0)}if((a[b+44|0]&1)!=0){K4(c[b+52>>2]|0)}if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function xn(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=19728;if((a[b+56|0]&1)!=0){K4(c[b+64>>2]|0)}if((a[b+44|0]&1)!=0){K4(c[b+52>>2]|0)}if((a[b+32|0]&1)!=0){K4(c[b+40>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function xo(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+188>>2]&1023](b,a);return}function xp(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+188>>2]&1023](b,a)|0}function xq(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+188>>2]&1023](b,a)|0}function xr(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+188>>2]&1023](b,a)|0}function xs(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+188>>2]&1023](b,a)|0}function xt(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+188>>2]&511](a,d,b);return}function xu(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+188>>2]&511](a,d,b);return}function xv(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DH(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K2(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}Ld(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aR(292,l|0,j|0,k|0);if(z){z=0;k=bS(-1,-1)|0;l=k;k=M;if((a[j]&1)==0){q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[j+8>>2]|0);q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K4(c[j+8>>2]|0)}j=b|0;c[j>>2]=20608;l=b+32|0;k=f;if((a[k]&1)==0){o=l;c[o>>2]=c[k>>2];c[o+4>>2]=c[k+4>>2];c[o+8>>2]=c[k+8>>2];w=b+44|0;c[w>>2]=g;i=h;return}k=c[f+8>>2]|0;o=c[f+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[l]=o<<1;x=l+1|0}else{f=o+16&-16;n=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=n;c[l>>2]=f|1;c[b+36>>2]=o;x=n}Ld(x|0,k|0,o)|0;a[x+o|0]=0;w=b+44|0;c[w>>2]=g;i=h;return}}while(0);h=bS(-1,-1)|0;g=h;h=M;c[j>>2]=16776;if((a[b+4|0]&1)==0){q=h;r=g;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[b+12>>2]|0);q=h;r=g;s=r;t=0;u=s;v=q;bg(u|0)}function xw(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DH(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K2(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}Ld(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aR(292,k|0,h|0,j|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[h]&1)==0){p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[h+8>>2]|0);p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}h=b|0;c[h>>2]=19440;k=b+32|0;j=f;if((a[j]&1)==0){n=k;c[n>>2]=c[j>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];v=b+29|0;a[v]=1;i=g;return}j=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[k]=n<<1;w=k+1|0}else{f=n+16&-16;m=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=m;c[k>>2]=f|1;c[b+36>>2]=n;w=m}Ld(w|0,j|0,n)|0;a[w+n|0]=0;v=b+29|0;a[v]=1;i=g;return}}while(0);g=bS(-1,-1)|0;v=g;g=M;c[h>>2]=16776;if((a[b+4|0]&1)==0){p=g;q=v;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[b+12>>2]|0);p=g;q=v;r=q;s=0;t=r;u=p;bg(t|0)}function xx(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DH(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K2(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}Ld(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aR(292,k|0,h|0,j|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[h]&1)==0){p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[h+8>>2]|0);p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}h=b|0;c[h>>2]=19656;k=b+32|0;j=f;if((a[j]&1)==0){n=k;c[n>>2]=c[j>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];i=g;return}j=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[k]=n<<1;v=k+1|0}else{f=n+16&-16;m=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=m;c[k>>2]=f|1;c[b+36>>2]=n;v=m}Ld(v|0,j|0,n)|0;a[v+n|0]=0;i=g;return}}while(0);g=bS(-1,-1)|0;n=g;g=M;c[h>>2]=16776;if((a[b+4|0]&1)==0){p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[b+12>>2]|0);p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}function xy(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DH(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K2(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}Ld(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aR(292,k|0,h|0,j|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[h]&1)==0){p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[h+8>>2]|0);p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}h=b|0;c[h>>2]=20680;k=b+32|0;j=f;if((a[j]&1)==0){n=k;c[n>>2]=c[j>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];i=g;return}j=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[k]=n<<1;v=k+1|0}else{f=n+16&-16;m=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=m;c[k>>2]=f|1;c[b+36>>2]=n;v=m}Ld(v|0,j|0,n)|0;a[v+n|0]=0;i=g;return}}while(0);g=bS(-1,-1)|0;n=g;g=M;c[h>>2]=16776;if((a[b+4|0]&1)==0){p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[b+12>>2]|0);p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}function xz(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function xA(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function xB(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+168>>2]&1023](b,a);return}function xC(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+168>>2]&1023](b,a)|0}function xD(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+168>>2]&1023](b,a)|0}function xE(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+168>>2]&1023](b,a)|0}function xF(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+168>>2]&1023](b,a)|0}function xG(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+168>>2]&511](a,d,b);return}function xH(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+168>>2]&511](a,d,b);return}function xI(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function xJ(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function xK(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+20>>2]&1023](b,a);return}function xL(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+20>>2]&1023](b,a)|0}function xM(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+20>>2]&1023](b,a)|0}function xN(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+20>>2]&1023](b,a)|0}function xO(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+20>>2]&1023](b,a)|0}function xP(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+20>>2]&511](a,d,b);return}function xQ(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+20>>2]&511](a,d,b);return}function xR(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DH(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K2(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}Ld(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aR(414,m|0,k|0,l|0);if(z){z=0;l=bS(-1,-1)|0;m=l;l=M;if((a[k]&1)==0){r=l;s=m;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[k+8>>2]|0);r=l;s=m;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K4(c[k+8>>2]|0)}k=b|0;c[k>>2]=22248;m=b+28|0;l=f;if((a[l]&1)==0){p=m;c[p>>2]=c[l>>2];c[p+4>>2]=c[l+4>>2];c[p+8>>2]=c[l+8>>2];x=b+40|0;c[x>>2]=g;y=b+44|0;A=h&1;a[y]=A;i=j;return}l=c[f+8>>2]|0;p=c[f+4>>2]|0;do{if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(p>>>0<11>>>0){a[m]=p<<1;B=m+1|0}else{f=p+16&-16;o=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+36>>2]=o;c[m>>2]=f|1;c[b+32>>2]=p;B=o}Ld(B|0,l|0,p)|0;a[B+p|0]=0;x=b+40|0;c[x>>2]=g;y=b+44|0;A=h&1;a[y]=A;i=j;return}}while(0);j=bS(-1,-1)|0;A=j;j=M;c[k>>2]=16776;if((a[b+4|0]&1)==0){r=j;s=A;t=s;u=0;v=t;w=r;bg(v|0)}K4(c[b+12>>2]|0);r=j;s=A;t=s;u=0;v=t;w=r;bg(v|0)}function xS(b){b=b|0;var d=0;d=b|0;c[d>>2]=22248;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function xT(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=22248;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function xU(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+36>>2]&1023](b,a);return}function xV(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+36>>2]&1023](b,a)|0}function xW(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+36>>2]&1023](b,a)|0}function xX(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+36>>2]&1023](b,a)|0}function xY(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+36>>2]&1023](b,a)|0}function xZ(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+36>>2]&511](a,d,b);return}function x_(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+36>>2]&511](a,d,b);return}function x$(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0;j=i;i=i+80|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=j+32|0;n=j+48|0;o=j+64|0;p=d;if((a[p]&1)==0){q=l;c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2];r=a[q]|0;s=q}else{q=c[d+8>>2]|0;p=c[d+4>>2]|0;if(p>>>0>4294967279>>>0){DH(0)}if(p>>>0<11>>>0){d=p<<1&255;t=l;a[t]=d;u=l+1|0;v=d;w=t}else{t=p+16&-16;d=K2(t)|0;c[l+8>>2]=d;x=t|1;c[l>>2]=x;c[l+4>>2]=p;u=d;v=x&255;w=l}Ld(u|0,q|0,p)|0;a[u+p|0]=0;r=v;s=w}w=e;e=k;c[e>>2]=c[w>>2];c[e+4>>2]=c[w+4>>2];c[e+8>>2]=c[w+8>>2];w=k;k=b|0;c[k>>2]=16776;e=b+4|0;L12:do{if((r&1)==0){v=e;c[v>>2]=c[s>>2];c[v+4>>2]=c[s+4>>2];c[v+8>>2]=c[s+8>>2]}else{v=c[l+8>>2]|0;p=c[l+4>>2]|0;do{if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(p>>>0<11>>>0){a[e]=p<<1;y=e+1|0}else{u=p+16&-16;q=(z=0,au(246,u|0)|0);if(z){z=0;break}c[b+12>>2]=q;c[e>>2]=u|1;c[b+8>>2]=p;y=q}Ld(y|0,v|0,p)|0;a[y+p|0]=0;break L12}}while(0);p=bS(-1,-1)|0;q=p;p=M;if((a[s]&1)==0){A=p;B=q;C=B;D=0;E=C;F=A;bg(E|0)}K4(v);A=p;B=q;C=B;D=0;E=C;F=A;bg(E|0)}}while(0);y=b+16|0;c[y>>2]=c[w>>2];c[y+4>>2]=c[w+4>>2];c[y+8>>2]=c[w+8>>2];if((a[s]&1)!=0){K4(c[l+8>>2]|0)}c[k>>2]=16288;l=b+28|0;s=f;L33:do{if((a[s]&1)==0){w=l;c[w>>2]=c[s>>2];c[w+4>>2]=c[s+4>>2];c[w+8>>2]=c[s+8>>2];G=31}else{w=c[f+8>>2]|0;r=c[f+4>>2]|0;do{if(r>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(r>>>0<11>>>0){a[l]=r<<1;H=l+1|0}else{q=r+16&-16;p=(z=0,au(246,q|0)|0);if(z){z=0;break}c[b+36>>2]=p;c[l>>2]=q|1;c[b+32>>2]=r;H=p}Ld(H|0,w|0,r)|0;a[H+r|0]=0;G=31;break L33}}while(0);r=bS(-1,-1)|0;I=M;J=r}}while(0);do{if((G|0)==31){c[b+40>>2]=g;a[b+44|0]=h&1;if((g|0)==0|h^1){i=j;return}H=(z=0,au(246,64)|0);do{if(!z){f=m+8|0;c[f>>2]=H;c[m>>2]=65;c[m+4>>2]=54;Ld(H|0,824,54)|0;a[H+54|0]=0;s=e;L54:do{if((a[s]&1)==0){r=n;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];G=43}else{r=c[b+12>>2]|0;w=c[b+8>>2]|0;do{if(w>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(w>>>0<11>>>0){a[n]=w<<1;K=n+1|0}else{v=w+16&-16;p=(z=0,au(246,v|0)|0);if(z){z=0;break}c[n+8>>2]=p;c[n>>2]=v|1;c[n+4>>2]=w;K=p}Ld(K|0,r|0,w)|0;a[K+w|0]=0;G=43;break L54}}while(0);w=bS(-1,-1)|0;L=M;N=w}}while(0);do{if((G|0)==43){s=o;c[s>>2]=c[y>>2];c[s+4>>2]=c[y+4>>2];c[s+8>>2]=c[y+8>>2];z=0;aR(372,m|0,n|0,o|0);if(z){z=0;s=bS(-1,-1)|0;w=s;s=M;if((a[n]&1)==0){L=s;N=w;break}K4(c[n+8>>2]|0);L=s;N=w;break}if((a[n]&1)!=0){K4(c[n+8>>2]|0)}if((a[m]&1)==0){i=j;return}K4(c[f>>2]|0);i=j;return}}while(0);if((a[m]&1)==0){O=L;P=N;break}K4(c[f>>2]|0);O=L;P=N}else{z=0;w=bS(-1,-1)|0;O=M;P=w}}while(0);if((a[l]&1)==0){I=O;J=P;break}K4(c[b+36>>2]|0);I=O;J=P}}while(0);c[k>>2]=16776;if((a[e]&1)==0){A=I;B=J;C=B;D=0;E=C;F=A;bg(E|0)}K4(c[b+12>>2]|0);A=I;B=J;C=B;D=0;E=C;F=A;bg(E|0)}function x0(b){b=b|0;var d=0;d=b|0;c[d>>2]=16288;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function x1(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=16288;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function x2(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+152>>2]&1023](b,a);return}function x3(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+152>>2]&1023](b,a)|0}function x4(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+152>>2]&1023](b,a)|0}function x5(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+152>>2]&1023](b,a)|0}function x6(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+152>>2]&1023](b,a)|0}function x7(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+152>>2]&511](a,d,b);return}function x8(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+152>>2]&511](a,d,b);return}function x9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+32|0;g=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[e+8>>2]=c[g+8>>2];g=f|0;h=f+16|0;j=b|0;k=d;if((a[k]&1)==0){l=g;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2]}else{k=c[d+8>>2]|0;l=c[d+4>>2]|0;if(l>>>0>4294967279>>>0){DH(0)}if(l>>>0<11>>>0){a[g]=l<<1;m=g+1|0}else{d=l+16&-16;n=K2(d)|0;c[g+8>>2]=n;c[g>>2]=d|1;c[g+4>>2]=l;m=n}Ld(m|0,k|0,l)|0;a[m+l|0]=0}l=h;m=e;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];z=0;aR(414,j|0,g|0,h|0);if(!z){if((a[g]&1)==0){o=b|0;c[o>>2]=17800;p=b+28|0;q=p;Lg(q|0,0,24)|0;i=f;return}K4(c[g+8>>2]|0);o=b|0;c[o>>2]=17800;p=b+28|0;q=p;Lg(q|0,0,24)|0;i=f;return}else{z=0;f=bS(-1,-1)|0;if((a[g]&1)==0){bg(f|0)}K4(c[g+8>>2]|0);bg(f|0)}}function ya(a){a=a|0;yj(a);return}function yb(a){a=a|0;var b=0;z=0;ar(54,a|0);if(!z){K4(a);return}else{z=0;b=bS(-1,-1)|0;K4(a);bg(b|0)}}function yc(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+40>>2]&1023](b,a);return}function yd(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+40>>2]&1023](b,a)|0}function ye(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+40>>2]&1023](b,a)|0}function yf(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+40>>2]&1023](b,a)|0}function yg(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+40>>2]&1023](b,a)|0}function yh(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+40>>2]&511](a,d,b);return}function yi(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+40>>2]&511](a,d,b);return}function yj(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=b|0;c[d>>2]=17800;e=c[b+40>>2]|0;f=e;if((e|0)!=0){g=b+44|0;h=c[g>>2]|0;if((e|0)!=(h|0)){c[g>>2]=h+(~((h-4+(-f|0)|0)>>>2)<<2)}K4(e)}e=b+28|0;f=c[e>>2]|0;if((f|0)!=0){h=b+32|0;g=c[h>>2]|0;if((f|0)==(g|0)){i=f}else{j=g;while(1){g=j-12|0;c[h>>2]=g;if((a[g]&1)==0){k=g}else{K4(c[j-12+8>>2]|0);k=c[h>>2]|0}if((f|0)==(k|0)){break}else{j=k}}i=c[e>>2]|0}K4(i)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function yk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DH(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K2(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}Ld(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aR(414,k|0,h|0,j|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[h]&1)==0){p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[h+8>>2]|0);p=j;q=k;r=q;s=0;t=r;u=p;bg(t|0)}if((a[h]&1)!=0){K4(c[h+8>>2]|0)}h=b|0;c[h>>2]=21616;k=b+28|0;j=f;if((a[j]&1)==0){n=k;c[n>>2]=c[j>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];i=g;return}j=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[k]=n<<1;v=k+1|0}else{f=n+16&-16;m=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+36>>2]=m;c[k>>2]=f|1;c[b+32>>2]=n;v=m}Ld(v|0,j|0,n)|0;a[v+n|0]=0;i=g;return}}while(0);g=bS(-1,-1)|0;n=g;g=M;c[h>>2]=16776;if((a[b+4|0]&1)==0){p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}K4(c[b+12>>2]|0);p=g;q=n;r=q;s=0;t=r;u=p;bg(t|0)}function yl(b){b=b|0;var d=0;d=b|0;c[d>>2]=21616;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function ym(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=21616;if((a[b+28|0]&1)!=0){K4(c[b+36>>2]|0)}c[d>>2]=16776;if((a[b+4|0]&1)==0){e=b;K4(e);return}K4(c[b+12>>2]|0);e=b;K4(e);return}function yn(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+44>>2]&1023](b,a);return}function yo(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+44>>2]&1023](b,a)|0}function yp(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+44>>2]&1023](b,a)|0}function yq(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+44>>2]&1023](b,a)|0}function yr(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+44>>2]&1023](b,a)|0}function ys(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+44>>2]&511](a,d,b);return}function yt(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+44>>2]&511](a,d,b);return}function yu(b){b=b|0;c[b>>2]=16776;if((a[b+4|0]&1)==0){return}K4(c[b+12>>2]|0);return}function yv(b){b=b|0;var d=0;c[b>>2]=16776;if((a[b+4|0]&1)==0){d=b;K4(d);return}K4(c[b+12>>2]|0);d=b;K4(d);return}function yw(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+52>>2]&1023](b,a);return}function yx(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+52>>2]&1023](b,a)|0}function yy(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+52>>2]&1023](b,a)|0}function yz(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+52>>2]&1023](b,a)|0}function yA(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+52>>2]&1023](b,a)|0}function yB(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+52>>2]&511](a,d,b);return}function yC(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+52>>2]&511](a,d,b);return}function yD(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DH(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K2(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}Ld(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aq(8,l|0,j|0,k|0,g|0,1);if(z){z=0;g=bS(-1,-1)|0;k=g;g=M;if((a[j]&1)==0){q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[j+8>>2]|0);q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K4(c[j+8>>2]|0)}j=b|0;c[j>>2]=20400;k=b+40|0;g=c[f>>2]|0;l=c[f+4>>2]|0;f=g;o=l-f|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[k]=o<<1;w=k+1|0}else{n=o+16&-16;e=(z=0,au(246,n|0)|0);if(z){z=0;break}c[b+48>>2]=e;c[k>>2]=n|1;c[b+44>>2]=o;w=e}if((g|0)==(l|0)){x=w;a[x]=0;i=h;return}e=l+(-f|0)|0;n=w;m=g;while(1){a[n]=a[m]|0;p=m+1|0;if((p|0)==(l|0)){break}else{n=n+1|0;m=p}}x=w+e|0;a[x]=0;i=h;return}}while(0);h=bS(-1,-1)|0;x=h;h=M;c[j>>2]=16776;if((a[b+4|0]&1)==0){q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}K4(c[b+12>>2]|0);q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}function yE(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0;g=i;i=i+8|0;h=f;f=i;i=i+12|0;i=i+7&-8;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];c[f+8>>2]=c[h+8>>2];h=g|0;c[b>>2]=d;d=b+4|0;j=d|0;k=b+8|0;l=b+12|0;m=b+28|0;n=e;Lg(d|0,0,24)|0;L1:do{if((a[n]&1)==0){o=m;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2];p=0;q=0;r=11}else{o=c[e+8>>2]|0;s=c[e+4>>2]|0;do{if(s>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(s>>>0<11>>>0){a[m]=s<<1;t=m+1|0}else{u=s+16&-16;v=(z=0,au(246,u|0)|0);if(z){z=0;break}c[b+36>>2]=v;c[m>>2]=u|1;c[b+32>>2]=s;t=v}Ld(t|0,o|0,s)|0;a[t+s|0]=0;p=c[k>>2]|0;q=c[l>>2]|0;r=11;break L1}}while(0);s=bS(-1,-1)|0;w=M;x=s}}while(0);do{if((r|0)==11){c[b+40>>2]=1;l=b+44|0;t=f;c[l>>2]=c[t>>2];c[l+4>>2]=c[t+4>>2];c[l+8>>2]=c[t+8>>2];c[b+56>>2]=0;c[b+60>>2]=0;c[h>>2]=0;if((p|0)==(q|0)){z=0;as(72,d|0,h|0);if(!z){i=g;return}else{z=0}t=bS(-1,-1)|0;l=t;t=M;if((a[m]&1)==0){w=t;x=l;break}K4(c[b+36>>2]|0);w=t;x=l;break}else{if((p|0)==0){y=0}else{c[p>>2]=0;y=c[k>>2]|0}c[k>>2]=y+4;i=g;return}}}while(0);g=c[j>>2]|0;if((g|0)==0){A=x;B=0;C=A;D=w;bg(C|0)}j=c[k>>2]|0;if((g|0)!=(j|0)){c[k>>2]=j+(~((j-4+(-g|0)|0)>>>2)<<2)}K4(g);A=x;B=0;C=A;D=w;bg(C|0)}function yF(b){b=b|0;var c=0,d=0,e=0,f=0;c=(a6(a[b]|0)|0)==0;d=c?0:b+1|0;if((d|0)==0){e=0;return e|0}else{f=d}while(1){d=(a6(a[f]|0)|0)==0;b=d?0:f+1|0;if((b|0)==0){e=f;break}else{f=b}}return e|0}function yG(b){b=b|0;var c=0,d=0,e=0;c=((a[b]|0)-48|0)>>>0<10>>>0?b+1|0:0;if((c|0)==0){d=0;return d|0}else{e=c}while(1){c=((a[e]|0)-48|0)>>>0<10>>>0?e+1|0:0;if((c|0)==0){d=e;break}else{e=c}}return d|0}function yH(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c=a[36296]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36296;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);c=e<<24>>24!=0?0:d;if((c|0)==0){l=0;return l|0}else{m=c}while(1){c=a[m]|0;if((c<<24>>24|0)==10|(c<<24>>24|0)==0){l=m;break}m=m+1|0}return l|0}function yI(a){a=a|0;return yJ(a)|0}function yJ(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=(a6(a[b]|0)|0)==0;d=c?0:b+1|0;if((d|0)==0){e=0}else{c=d;while(1){d=(a6(a[c]|0)|0)==0;f=d?0:c+1|0;if((f|0)==0){e=c;break}else{c=f}}}c=(e|0)!=0?e:b;if((c|0)==0){g=0;return g|0}b=a[36392]|0;L8:do{if(b<<24>>24==0){h=c;i=0}else{e=c;f=36392;d=b;while(1){if((a[e]|0)!=d<<24>>24){h=e;i=d;break L8}j=e+1|0;k=f+1|0;l=a[k]|0;if(l<<24>>24==0){h=j;i=0;break}else{e=j;f=k;d=l}}}}while(0);b=i<<24>>24!=0?0:h;if((b|0)==0){g=0;return g|0}h=a[36376]|0;if(h<<24>>24==0){i=b;while(1){if((a[i]|0)==0){g=0;m=19;break}if((i|0)==0){i=i+1|0}else{g=i;m=22;break}}if((m|0)==19){return g|0}else if((m|0)==22){return g|0}}else{n=b}while(1){b=a[n]|0;if(b<<24>>24==0){g=0;m=21;break}L26:do{if(b<<24>>24==h<<24>>24){i=36376;c=n;while(1){d=c+1|0;f=i+1|0;e=a[f]|0;if(e<<24>>24==0){o=d;p=0;break L26}if((a[d]|0)==e<<24>>24){i=f;c=d}else{o=d;p=e;break}}}else{o=n;p=h}}while(0);b=p<<24>>24!=0?0:o;if((b|0)==0){n=n+1|0}else{g=b;m=18;break}}if((m|0)==18){return g|0}else if((m|0)==21){return g|0}return 0}function yK(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;c=a[b]|0;d=b+1|0;b=c<<24>>24==34?d:0;L1:do{if((b|0)!=0){e=a[b]|0;if(e<<24>>24==0){break}else{f=b;g=e}while(1){e=f+1|0;h=g<<24>>24==34?e:0;if((h|0)==0){i=e}else{if((a[f-1|0]|0)==92){i=h}else{j=h;break}}h=a[i]|0;if(h<<24>>24==0){break L1}else{f=i;g=h}}return j|0}}while(0);g=c<<24>>24==39?d:0;if((g|0)==0){j=0;return j|0}d=a[g]|0;if(d<<24>>24==0){j=0;return j|0}else{k=g;l=d}while(1){d=k+1|0;g=l<<24>>24==39?d:0;if((g|0)==0){m=d}else{if((a[k-1|0]|0)==92){m=g}else{j=g;n=14;break}}g=a[m]|0;if(g<<24>>24==0){j=0;n=15;break}else{k=m;l=g}}if((n|0)==15){return j|0}else if((n|0)==14){return j|0}return 0}function yL(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=a[36320]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36320;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);c=e<<24>>24!=0?0:d;if((c|0)==0){l=0;return l|0}d=a[36048]|0;if(d<<24>>24==0){e=c;while(1){if((a[e]|0)==0){l=0;m=18;break}if((e|0)==0){e=e+1|0}else{l=e;m=15;break}}if((m|0)==15){return l|0}else if((m|0)==18){return l|0}}else{n=c}while(1){c=a[n]|0;if(c<<24>>24==0){l=0;m=16;break}L19:do{if(c<<24>>24==d<<24>>24){e=36048;b=n;while(1){h=b+1|0;g=e+1|0;f=a[g]|0;if(f<<24>>24==0){o=h;p=0;break L19}if((a[h]|0)==f<<24>>24){e=g;b=h}else{o=h;p=f;break}}}else{o=n;p=d}}while(0);c=p<<24>>24!=0?0:o;if((c|0)==0){n=n+1|0}else{l=c;m=17;break}}if((m|0)==16){return l|0}else if((m|0)==17){return l|0}return 0}function yM(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a6(a[b]|0)|0)==0;d=c?0:b+1|0;if((d|0)==0){e=0;f=(e|0)!=0;g=f?e:b;return g|0}else{h=d}while(1){d=(a6(a[h]|0)|0)==0;c=d?0:h+1|0;if((c|0)==0){e=h;break}else{h=c}}f=(e|0)!=0;g=f?e:b;return g|0}function yN(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;c=(a6(a[b]|0)|0)==0;d=c?0:b+1|0;do{if((d|0)==0){c=yJ(b)|0;if((c|0)!=0){e=c;break}c=a[36296]|0;L4:do{if(c<<24>>24==0){f=b;g=0}else{h=b;i=36296;j=c;while(1){if((a[h]|0)!=j<<24>>24){f=h;g=j;break L4}k=h+1|0;l=i+1|0;m=a[l]|0;if(m<<24>>24==0){f=k;g=0;break}else{h=k;i=l;j=m}}}}while(0);c=g<<24>>24!=0?0:f;if((c|0)==0){n=b;return n|0}else{o=c}while(1){c=a[o]|0;if((c<<24>>24|0)==10|(c<<24>>24|0)==0){break}o=o+1|0}if((o|0)==0){n=b}else{e=o;break}return n|0}else{c=d;while(1){j=(a6(a[c]|0)|0)==0;i=j?0:c+1|0;if((i|0)==0){e=c;break}else{c=i}}}}while(0);d=a[36296]|0;if(d<<24>>24==0){o=e;L20:while(1){b=(a6(a[o]|0)|0)==0;f=b?0:o+1|0;if((f|0)!=0){b=f;while(1){f=(a6(a[b]|0)|0)==0;g=f?0:b+1|0;if((g|0)==0){o=b;continue L20}else{b=g}}}b=yJ(o)|0;if((b|0)!=0){o=b;continue}if((o|0)==0){n=0;p=34;break}else{q=o}while(1){b=a[q]|0;if((b<<24>>24|0)==10|(b<<24>>24|0)==0){break}q=q+1|0}if((q|0)==0){n=o;p=31;break}else{o=q}}if((p|0)==31){return n|0}else if((p|0)==34){return n|0}}else{r=e}L34:while(1){e=(a6(a[r]|0)|0)==0;q=e?0:r+1|0;if((q|0)!=0){e=q;while(1){q=(a6(a[e]|0)|0)==0;o=q?0:e+1|0;if((o|0)==0){r=e;continue L34}else{e=o}}}e=yJ(r)|0;if((e|0)==0){s=r;t=36296;u=d}else{r=e;continue}while(1){if((a[s]|0)!=u<<24>>24){v=s;w=u;break}e=s+1|0;o=t+1|0;q=a[o]|0;if(q<<24>>24==0){v=e;w=0;break}else{s=e;t=o;u=q}}q=w<<24>>24!=0?0:v;if((q|0)==0){n=r;p=30;break}else{x=q}while(1){q=a[x]|0;if((q<<24>>24|0)==10|(q<<24>>24|0)==0){break}x=x+1|0}if((x|0)==0){n=r;p=32;break}else{r=x}}if((p|0)==30){return n|0}else if((p|0)==32){return n|0}return 0}function yO(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==45?b+1|0:0;d=(c|0)!=0?c:b;if((d|0)==0){e=0;return e|0}b=(bR(a[d]|0)|0)==0;c=d+1|0;f=b?0:c;do{if((f|0)==0){b=a[d]|0;g=b<<24>>24==95?c:0;if((g|0)!=0){h=g;break}g=b<<24>>24==92?c:0;if((g|0)==0){e=0;return e|0}b=(a[g]|0)!=0?g+1|0:g;if((b|0)==0){e=0}else{h=b;break}return e|0}else{h=f}}while(0);e=z3(h)|0;return e|0}function yP(a){a=a|0;var b=0,c=0,d=0;b=z1(a)|0;if((b|0)==0){c=0;return c|0}else{d=b}while(1){b=z1(d)|0;if((b|0)==0){c=d;break}else{d=b}}return c|0}function yQ(a){a=a|0;var b=0,c=0,d=0;b=z$(a)|0;if((b|0)==0){c=0;return c|0}else{d=b}while(1){b=z$(d)|0;if((b|0)==0){c=d;break}else{d=b}}return c|0}function yR(a){a=a|0;var b=0,c=0,d=0;b=zY(a)|0;if((b|0)==0){c=0;return c|0}else{d=b}while(1){b=zY(d)|0;if((b|0)==0){c=d;break}else{d=b}}return c|0}function yS(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==64?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(a[c]|0)==45?c+1|0:0;e=(b|0)!=0?b:c;if((e|0)==0){d=0;return d|0}c=(bR(a[e]|0)|0)==0;b=e+1|0;f=c?0:b;do{if((f|0)==0){c=a[e]|0;g=c<<24>>24==95?b:0;if((g|0)!=0){h=g;break}g=c<<24>>24==92?b:0;if((g|0)==0){d=0;return d|0}c=(a[g]|0)!=0?g+1|0:g;if((c|0)==0){d=0}else{h=c;break}return d|0}else{h=f}}while(0);d=z3(h)|0;return d|0}function yT(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36432]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36432;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yU(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35904]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35904;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yV(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35896]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35896;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yW(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36216]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36216;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yX(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36408]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36408;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yY(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36304]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36304;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function yZ(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36336]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36336;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y_(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36440]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36440;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y$(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36072]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36072;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y0(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35976]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35976;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y1(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36024]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36024;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y2(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35960]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35960;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y3(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36040]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36040;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y4(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36288]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36288;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y5(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35992]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35992;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y6(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36064]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36064;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y7(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35872]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35872;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y8(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35920]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35920;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function y9(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35952]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35952;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function za(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=zX(b)|0;if((c|0)==0){d=0;return d|0}b=(a[c]|0)==45?c+1|0:0;e=(b|0)!=0?b:c;if((e|0)==0){d=0;return d|0}c=(bR(a[e]|0)|0)==0;b=e+1|0;f=c?0:b;do{if((f|0)==0){c=a[e]|0;g=c<<24>>24==95?b:0;if((g|0)!=0){h=g;break}g=c<<24>>24==92?b:0;if((g|0)==0){d=0;return d|0}c=(a[g]|0)!=0?g+1|0:g;if((c|0)==0){d=0}else{h=c;break}return d|0}else{h=f}}while(0);d=z3(h)|0;return d|0}function zb(b){b=b|0;var c=0,d=0;c=zX(b)|0;if((c|0)==0){d=0;return d|0}d=(a[c]|0)==42?c+1|0:0;return d|0}function zc(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==35?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(bQ(a[c]|0)|0)==0;e=c+1|0;f=b?0:e;do{if((f|0)==0){b=a[c]|0;g=b<<24>>24==45?e:0;if((g|0)!=0){h=g;break}g=b<<24>>24==95?e:0;if((g|0)==0){d=0}else{h=g;break}return d|0}else{h=f}}while(0);while(1){f=(bQ(a[h]|0)|0)==0;e=h+1|0;c=f?0:e;if((c|0)!=0){h=c;continue}c=a[h]|0;f=c<<24>>24==45?e:0;if((f|0)!=0){h=f;continue}f=c<<24>>24==95?e:0;if((f|0)==0){d=h;break}else{h=f}}return d|0}function zd(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==46?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(a[c]|0)==45?c+1|0:0;e=(b|0)!=0?b:c;if((e|0)==0){d=0;return d|0}c=(bR(a[e]|0)|0)==0;b=e+1|0;f=c?0:b;do{if((f|0)==0){c=a[e]|0;g=c<<24>>24==95?b:0;if((g|0)!=0){h=g;break}g=c<<24>>24==92?b:0;if((g|0)==0){d=0;return d|0}c=(a[g]|0)!=0?g+1|0:g;if((c|0)==0){d=0}else{h=c;break}return d|0}else{h=f}}while(0);d=z3(h)|0;return d|0}function ze(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==37?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(a[c]|0)==45?c+1|0:0;e=(b|0)!=0?b:c;if((e|0)==0){d=0;return d|0}c=(bR(a[e]|0)|0)==0;b=e+1|0;f=c?0:b;do{if((f|0)==0){c=a[e]|0;g=c<<24>>24==95?b:0;if((g|0)!=0){h=g;break}g=c<<24>>24==92?b:0;if((g|0)==0){d=0;return d|0}c=(a[g]|0)!=0?g+1|0:g;if((c|0)==0){d=0}else{h=c;break}return d|0}else{h=f}}while(0);d=z3(h)|0;return d|0}function zf(b){b=b|0;var c=0,d=0,e=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}return(e?0:b+1|0)|0}function zg(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}c=e?0:b+1|0;e=(c|0)!=0?c:b;if((e|0)==0){f=0;return f|0}b=a[e]|0;c=((b<<24>>24)-48|0)>>>0<10>>>0?e+1|0:0;d=(c|0)==0;if(d){g=e;h=b}else{b=c;while(1){e=a[b]|0;i=((e<<24>>24)-48|0)>>>0<10>>>0?b+1|0:0;if((i|0)==0){g=b;h=e;break}else{b=i}}}b=h<<24>>24==46?g+1|0:0;do{if((b|0)!=0){g=((a[b]|0)-48|0)>>>0<10>>>0?b+1|0:0;if((g|0)==0){break}else{j=g}while(1){g=((a[j]|0)-48|0)>>>0<10>>>0?j+1|0:0;if((g|0)==0){f=j;break}else{j=g}}return f|0}}while(0);if(d){f=0;return f|0}else{k=c}while(1){c=((a[k]|0)-48|0)>>>0<10>>>0?k+1|0:0;if((c|0)==0){f=k;break}else{k=c}}return f|0}function zh(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}c=b+1|0;d=e?0:c;e=(d|0)!=0?d:b;do{if((e|0)==0){f=36400}else{d=((a[e]|0)-48|0)>>>0<10>>>0?e+1|0:0;if((d|0)==0){f=36400;break}else{g=d}while(1){d=((a[g]|0)-48|0)>>>0<10>>>0?g+1|0:0;if((d|0)==0){h=g;break}else{g=d}}return h|0}}while(0);while(1){g=a[f]|0;if(g<<24>>24==0){h=0;i=10;break}if((a[b]|0)==g<<24>>24){h=c;i=12;break}else{f=f+1|0}}if((i|0)==10){return h|0}else if((i|0)==12){return h|0}return 0}function zi(a){a=a|0;return zj(a)|0}function zj(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}c=e?0:b+1|0;e=(c|0)!=0?c:b;if((e|0)==0){f=0;return f|0}b=((a[e]|0)-48|0)>>>0<10>>>0?e+1|0:0;if((b|0)==0){g=0}else{c=b;while(1){b=((a[c]|0)-48|0)>>>0<10>>>0?c+1|0:0;if((b|0)==0){g=c;break}else{c=b}}}c=(g|0)!=0?g:e;if((c|0)==0){f=0;return f|0}e=(a[c]|0)==110?c+1|0:0;if((e|0)==0){f=0;return f|0}c=(a6(a[e]|0)|0)==0;g=c?0:e+1|0;if((g|0)==0){h=0}else{c=g;while(1){g=(a6(a[c]|0)|0)==0;b=g?0:c+1|0;if((b|0)==0){h=c;break}else{c=b}}}c=(h|0)!=0?h:e;if((c|0)==0){f=0;return f|0}else{i=36400}while(1){e=a[i]|0;if(e<<24>>24==0){j=1;break}if((a[c]|0)==e<<24>>24){j=0;break}else{i=i+1|0}}i=j?0:c+1|0;if((i|0)==0){f=0;return f|0}c=(a6(a[i]|0)|0)==0;j=c?0:i+1|0;if((j|0)==0){k=0}else{c=j;while(1){j=(a6(a[c]|0)|0)==0;e=j?0:c+1|0;if((e|0)==0){k=c;break}else{c=e}}}c=(k|0)!=0?k:i;if((c|0)==0){f=0;return f|0}i=((a[c]|0)-48|0)>>>0<10>>>0?c+1|0:0;if((i|0)==0){f=0;return f|0}else{l=i}while(1){i=((a[l]|0)-48|0)>>>0<10>>>0?l+1|0:0;if((i|0)==0){f=l;break}else{l=i}}return f|0}function zk(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}c=e?0:b+1|0;e=(c|0)!=0?c:b;if((e|0)==0){f=0;return f|0}b=a[e]|0;c=((b<<24>>24)-48|0)>>>0<10>>>0?e+1|0:0;d=(c|0)==0;if(d){g=e;h=b}else{b=c;while(1){e=a[b]|0;i=((e<<24>>24)-48|0)>>>0<10>>>0?b+1|0:0;if((i|0)==0){g=b;h=e;break}else{b=i}}}b=h<<24>>24==46?g+1|0:0;do{if((b|0)==0){j=10}else{g=((a[b]|0)-48|0)>>>0<10>>>0?b+1|0:0;if((g|0)==0){j=10;break}else{k=g}while(1){g=a[k]|0;h=((g<<24>>24)-48|0)>>>0<10>>>0?k+1|0:0;if((h|0)==0){l=k;m=g;break}else{k=h}}}}while(0);if((j|0)==10){if(d){f=0;return f|0}else{d=c;while(1){c=a[d]|0;j=((c<<24>>24)-48|0)>>>0<10>>>0?d+1|0:0;if((j|0)==0){l=d;m=c;break}else{d=j}}}}f=m<<24>>24==37?l+1|0:0;return f|0}function zl(a){a=a|0;return zm(a)|0}function zm(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;c=36400;while(1){d=a[c]|0;if(d<<24>>24==0){e=1;break}if((a[b]|0)==d<<24>>24){e=0;break}else{c=c+1|0}}c=e?0:b+1|0;e=(c|0)!=0?c:b;if((e|0)==0){f=0;return f|0}b=a[e]|0;c=((b<<24>>24)-48|0)>>>0<10>>>0?e+1|0:0;d=(c|0)==0;if(d){g=e;h=b}else{b=c;while(1){e=a[b]|0;i=((e<<24>>24)-48|0)>>>0<10>>>0?b+1|0:0;if((i|0)==0){g=b;h=e;break}else{b=i}}}b=h<<24>>24==46?g+1|0:0;do{if((b|0)==0){j=10}else{g=((a[b]|0)-48|0)>>>0<10>>>0?b+1|0:0;if((g|0)==0){j=10;break}else{k=g}while(1){g=a[k]|0;h=((g<<24>>24)-48|0)>>>0<10>>>0?k+1|0:0;if((h|0)==0){l=k;m=g;break}else{k=h}}}}while(0);if((j|0)==10){if(d){f=0;return f|0}else{d=c;while(1){c=a[d]|0;j=((c<<24>>24)-48|0)>>>0<10>>>0?d+1|0:0;if((j|0)==0){l=d;m=c;break}else{d=j}}}}d=m<<24>>24==45?l+1|0:0;m=(d|0)!=0?d:l;if((m|0)==0){f=0;return f|0}l=(bR(a[m]|0)|0)==0;d=m+1|0;j=l?0:d;do{if((j|0)==0){l=a[m]|0;c=l<<24>>24==95?d:0;if((c|0)!=0){n=c;break}c=l<<24>>24==92?d:0;if((c|0)==0){f=0;return f|0}l=(a[c]|0)!=0?c+1|0:c;if((l|0)==0){f=0}else{n=l;break}return f|0}else{n=j}}while(0);f=z3(n)|0;return f|0}function zn(b){b=b|0;var c=0,d=0,e=0,f=0,g=0;c=(a[b]|0)==35?b+1|0:0;do{if((c|0)==0){d=0}else{e=(bq(a[c]|0)|0)==0;f=e?0:c+1|0;if((f|0)==0){d=0;break}else{g=f}while(1){f=(bq(a[g]|0)|0)==0;e=f?0:g+1|0;if((e|0)==0){d=g;break}else{g=e}}}}while(0);g=d-b|0;return((g|0)!=4&(g|0)!=7?0:d)|0}function zo(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36e3]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36e3;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zp(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;c=(a[b]|0)==45?b+1|0:0;d=(c|0)!=0?c:b;L1:do{if((d|0)==0){e=0}else{c=(bR(a[d]|0)|0)==0;f=d+1|0;g=c?0:f;do{if((g|0)==0){c=a[d]|0;h=c<<24>>24==95?f:0;if((h|0)!=0){i=h;break}h=c<<24>>24==92?f:0;if((h|0)==0){e=0;break L1}c=(a[h]|0)!=0?h+1|0:h;if((c|0)==0){e=0;break L1}else{i=c}}else{i=g}}while(0);g=z3(i)|0;if((g|0)==0){e=0;break}e=(a[g]|0)==58?g+1|0:0}}while(0);i=(e|0)!=0?e:b;if((i|0)==0){j=0;return j|0}b=zW(i)|0;if((b|0)==0){j=0;return j|0}i=(a[b]|0)==47?b+1|0:0;j=(i|0)!=0?i:b;return j|0}function zq(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=(a[b]|0)==45?b+1|0:0;d=(c|0)!=0?c:b;L1:do{if((d|0)==0){e=0}else{c=(bR(a[d]|0)|0)==0;f=d+1|0;g=c?0:f;do{if((g|0)==0){c=a[d]|0;h=c<<24>>24==95?f:0;if((h|0)!=0){i=h;break}h=c<<24>>24==92?f:0;if((h|0)==0){e=0;break L1}c=(a[h]|0)!=0?h+1|0:h;if((c|0)==0){e=0;break L1}else{i=c}}else{i=g}}while(0);g=z3(i)|0;if((g|0)==0){e=0;break}e=(a[g]|0)==58?g+1|0:0}}while(0);i=(e|0)!=0?e:b;if((i|0)==0){j=0;return j|0}b=zZ(i)|0;if((b|0)==0){j=0;return j|0}else{k=b}while(1){b=zZ(k)|0;if((b|0)==0){j=k;break}else{k=b}}return j|0}function zr(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;c=(a[b]|0)==33?b+1|0:0;if((c|0)==0){d=0;return d|0}b=yN(c)|0;if((b|0)==0){d=0;return d|0}c=a[36192]|0;L7:do{if(c<<24>>24==0){e=b;f=0}else{g=b;h=36192;i=c;while(1){if((a[g]|0)!=i<<24>>24){e=g;f=i;break L7}j=g+1|0;k=h+1|0;l=a[k]|0;if(l<<24>>24==0){e=j;f=0;break}else{g=j;h=k;i=l}}}}while(0);d=f<<24>>24!=0?0:e;return d|0}function zs(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;c=(a[b]|0)==33?b+1|0:0;if((c|0)==0){d=0;return d|0}b=yN(c)|0;if((b|0)==0){d=0;return d|0}c=a[36328]|0;L7:do{if(c<<24>>24==0){e=b;f=0}else{g=b;h=36328;i=c;while(1){if((a[g]|0)!=i<<24>>24){e=g;f=i;break L7}j=g+1|0;k=h+1|0;l=a[k]|0;if(l<<24>>24==0){e=j;f=0;break}else{g=j;h=k;i=l}}}}while(0);d=f<<24>>24!=0?0:e;return d|0}function zt(b){b=b|0;var c=0,d=0;c=(a[b]|0)==58?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(a[c]|0)==58?c+1|0:0;d=(b|0)!=0?b:c;return d|0}function zu(b){b=b|0;var c=0,d=0,e=0;c=z1(b)|0;if((c|0)==0){d=0;return d|0}else{e=c}while(1){c=z1(e)|0;if((c|0)==0){break}else{e=c}}d=(a[e]|0)==40?e+1|0:0;return d|0}function zv(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==45?b+1|0:0;d=(c|0)!=0?c:b;if((d|0)==0){e=0;return e|0}b=(bR(a[d]|0)|0)==0;c=d+1|0;f=b?0:c;do{if((f|0)==0){b=a[d]|0;g=b<<24>>24==95?c:0;if((g|0)!=0){h=g;break}g=b<<24>>24==92?c:0;if((g|0)==0){e=0;return e|0}b=(a[g]|0)!=0?g+1|0:g;if((b|0)==0){e=0}else{h=b;break}return e|0}else{h=f}}while(0);f=z3(h)|0;if((f|0)==0){e=0;return e|0}e=(a[f]|0)==40?f+1|0:0;return e|0}function zw(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36152]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36152;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zx(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35968]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35968;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zy(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36008]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36008;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zz(b){b=b|0;return((a[b]|0)==61?b+1|0:0)|0}function zA(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36280]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36280;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zB(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36424]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36424;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zC(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36368]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36368;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zD(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36232]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36232;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zE(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36384]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36384;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zF(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=(a[b]|0)==36?b+1|0:0;if((c|0)==0){d=0;return d|0}b=(bQ(a[c]|0)|0)==0;e=c+1|0;f=b?0:e;do{if((f|0)==0){b=a[c]|0;g=b<<24>>24==45?e:0;if((g|0)!=0){h=g;break}g=b<<24>>24==95?e:0;if((g|0)==0){d=0}else{h=g;break}return d|0}else{h=f}}while(0);while(1){f=(bQ(a[h]|0)|0)==0;e=h+1|0;c=f?0:e;if((c|0)!=0){h=c;continue}c=a[h]|0;f=c<<24>>24==45?e:0;if((f|0)!=0){h=f;continue}f=c<<24>>24==95?e:0;if((f|0)==0){d=h;break}else{h=f}}return d|0}function zG(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35928]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35928;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zH(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[35912]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=35912;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zI(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36032]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36032;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zJ(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36056]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36056;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zK(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36120]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36120;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zL(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36080]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36080;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zM(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36112]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36112;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zN(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36096]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36096;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zO(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36104]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36104;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zP(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c=a[36088]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36088;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);return(e<<24>>24!=0?0:d)|0}function zQ(a){a=a|0;return zR(a)|0}function zR(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;c=a[36416]|0;L1:do{if(c<<24>>24==0){d=b;e=0}else{f=b;g=36416;h=c;while(1){if((a[f]|0)!=h<<24>>24){d=f;e=h;break L1}i=f+1|0;j=g+1|0;k=a[j]|0;if(k<<24>>24==0){d=i;e=0;break}else{f=i;g=j;h=k}}}}while(0);c=e<<24>>24!=0?0:d;if((c|0)==0){l=0;return l|0}d=(a[c]|0)==58?c+1|0:0;if((d|0)==0){l=0;return l|0}c=zV(d)|0;if((c|0)==0){l=0;return l|0}d=(a[c]|0)==46?c+1|0:0;if((d|0)==0){l=0;return l|0}c=zV(d)|0;if((c|0)==0){l=0;return l|0}else{m=c}while(1){c=a[m]|0;n=m+1|0;d=c<<24>>24==46?n:0;if((d|0)==0){o=c;break}c=zV(d)|0;if((c|0)==0){p=11;break}else{m=c}}do{if((p|0)==11){if((m|0)==0){l=0;return l|0}else{o=a[m]|0;break}}}while(0);m=o<<24>>24==40?n:0;if((m|0)==0){l=0;return l|0}n=a[m]|0;if(n<<24>>24==0){l=0;return l|0}else{q=m;r=n}while(1){n=q+1|0;m=r<<24>>24==59?n:0;if((m|0)==0){s=n}else{if((a[q-1|0]|0)==92){s=m}else{l=m;p=21;break}}m=a[s]|0;if(m<<24>>24==0){l=0;p=22;break}else{q=s;r=m}}if((p|0)==21){return l|0}else if((p|0)==22){return l|0}return 0}function zS(a){a=a|0;return zT(a)|0}function zT(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c=b+1|0;d=(a[b]|0)==36?c:0;L1:do{if((d|0)==0){e=9}else{f=(bQ(a[d]|0)|0)==0;g=d+1|0;h=f?0:g;do{if((h|0)==0){f=a[d]|0;i=f<<24>>24==45?g:0;if((i|0)!=0){j=i;break}i=f<<24>>24==95?g:0;if((i|0)==0){e=9;break L1}else{j=i}}else{j=h}}while(0);while(1){h=(bQ(a[j]|0)|0)==0;g=j+1|0;i=h?0:g;if((i|0)!=0){j=i;continue}i=a[j]|0;h=i<<24>>24==45?g:0;if((h|0)!=0){j=h;continue}h=i<<24>>24==95?g:0;if((h|0)==0){break}else{j=h}}if((j|0)==0){e=9}else{k=j}}}while(0);L11:do{if((e|0)==9){j=z1(b)|0;if((j|0)!=0){d=j;while(1){j=z1(d)|0;if((j|0)==0){k=d;break L11}else{d=j}}}d=(a[b]|0)==45?c:0;j=(d|0)!=0?d:b;if((j|0)==0){l=0;return l|0}d=(bR(a[j]|0)|0)==0;h=j+1|0;g=d?0:h;do{if((g|0)==0){d=a[j]|0;i=d<<24>>24==95?h:0;if((i|0)!=0){m=i;break}i=d<<24>>24==92?h:0;if((i|0)==0){l=0;return l|0}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){l=0}else{m=d;break}return l|0}else{m=g}}while(0);g=z3(m)|0;if((g|0)==0){l=0}else{k=g;break}return l|0}}while(0);m=yN(k)|0;if((m|0)==0){l=0;return l|0}k=(a[m]|0)==61?m+1|0:0;if((k|0)==0){l=0;return l|0}m=yN(k)|0;if((m|0)==0){l=0;return l|0}l=zU(m)|0;return l|0}function zU(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;c=b+1|0;d=(a[b]|0)==36?c:0;L1:do{if((d|0)!=0){e=(bQ(a[d]|0)|0)==0;f=d+1|0;g=e?0:f;do{if((g|0)==0){e=a[d]|0;h=e<<24>>24==45?f:0;if((h|0)!=0){i=h;break}h=e<<24>>24==95?f:0;if((h|0)==0){break L1}else{i=h}}else{i=g}}while(0);while(1){g=(bQ(a[i]|0)|0)==0;f=i+1|0;h=g?0:f;if((h|0)!=0){i=h;continue}h=a[i]|0;g=h<<24>>24==45?f:0;if((g|0)!=0){i=g;continue}g=h<<24>>24==95?f:0;if((g|0)==0){break}else{i=g}}if((i|0)==0){break}else{j=i}return j|0}}while(0);i=z1(b)|0;if((i|0)!=0){d=i;while(1){i=z1(d)|0;if((i|0)==0){j=d;break}else{d=i}}return j|0}d=(a[b]|0)==45?c:0;i=(d|0)!=0?d:b;L18:do{if((i|0)==0){k=36400}else{d=(bR(a[i]|0)|0)==0;g=i+1|0;f=d?0:g;do{if((f|0)==0){d=a[i]|0;h=d<<24>>24==95?g:0;if((h|0)!=0){l=h;break}h=d<<24>>24==92?g:0;if((h|0)==0){k=36400;break L18}d=(a[h]|0)!=0?h+1|0:h;if((d|0)==0){k=36400;break L18}else{l=d}}else{l=f}}while(0);f=z3(l)|0;if((f|0)==0){k=36400;break}else{j=f}return j|0}}while(0);while(1){l=a[k]|0;if(l<<24>>24==0){m=0;break}if((a[b]|0)==l<<24>>24){m=c;break}else{k=k+1|0}}k=(m|0)!=0?m:b;if((k|0)==0){j=0;return j|0}b=a[k]|0;m=((b<<24>>24)-48|0)>>>0<10>>>0?k+1|0:0;c=(m|0)==0;if(c){n=k;o=b}else{b=m;while(1){k=a[b]|0;l=((k<<24>>24)-48|0)>>>0<10>>>0?b+1|0:0;if((l|0)==0){n=b;o=k;break}else{b=l}}}b=o<<24>>24==46?n+1|0:0;do{if((b|0)!=0){n=((a[b]|0)-48|0)>>>0<10>>>0?b+1|0:0;if((n|0)==0){break}else{p=n}while(1){n=((a[p]|0)-48|0)>>>0<10>>>0?p+1|0:0;if((n|0)==0){j=p;break}else{p=n}}return j|0}}while(0);if(c){j=0;return j|0}else{q=m}while(1){m=((a[q]|0)-48|0)>>>0<10>>>0?q+1|0:0;if((m|0)==0){j=q;break}else{q=m}}return j|0}function zV(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=z1(b)|0;if((c|0)!=0){d=c;while(1){c=z1(d)|0;if((c|0)==0){e=d;break}else{d=c}}return e|0}d=(a[b]|0)==45?b+1|0:0;c=(d|0)!=0?d:b;if((c|0)==0){e=0;return e|0}b=(bR(a[c]|0)|0)==0;d=c+1|0;f=b?0:d;do{if((f|0)==0){b=a[c]|0;g=b<<24>>24==95?d:0;if((g|0)!=0){h=g;break}g=b<<24>>24==92?d:0;if((g|0)==0){e=0;return e|0}b=(a[g]|0)!=0?g+1|0:g;if((b|0)==0){e=0}else{h=b;break}return e|0}else{h=f}}while(0);e=z3(h)|0;return e|0}function zW(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;c=(a[b]|0)==47?b+1|0:0;if((c|0)==0){d=b}else{b=c;while(1){c=(a[b]|0)==47?b+1|0:0;if((c|0)==0){d=b;break}else{b=c}}}b=zY(d)|0;if((b|0)==0){e=0;return e|0}else{f=b}while(1){b=zY(f)|0;if((b|0)==0){g=f;break}else{f=b}}while(1){f=(a[g]|0)==47?g+1|0:0;if((f|0)==0){h=g}else{b=f;while(1){f=(a[b]|0)==47?b+1|0:0;if((f|0)==0){h=b;break}else{b=f}}}b=zY(h)|0;if((b|0)==0){e=g;i=11;break}else{j=b}while(1){b=zY(j)|0;if((b|0)==0){break}else{j=b}}if((j|0)==0){e=g;i=13;break}else{g=j}}if((i|0)==11){return e|0}else if((i|0)==13){return e|0}return 0}function zX(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=7}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=7;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=7;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=7}else{k=h}}}while(0);if((f|0)==7){k=(a[b]|0)==42?c:0}c=(k|0)!=0?k:b;if((c|0)==0){l=0;m=(l|0)!=0;n=m?l:b;return n|0}l=(a[c]|0)==124?c+1|0:0;m=(l|0)!=0;n=m?l:b;return n|0}function zY(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=36400}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=36400;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=36400;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=36400;break}else{k=h}return k|0}}while(0);while(1){j=a[f]|0;if(j<<24>>24==0){l=0;break}if((a[b]|0)==j<<24>>24){l=c;break}else{f=f+1|0}}f=(l|0)!=0?l:b;do{if((f|0)!=0){l=a[f]|0;j=((l<<24>>24)-48|0)>>>0<10>>>0?f+1|0:0;e=(j|0)==0;if(e){m=f;n=l}else{l=j;while(1){h=a[l]|0;g=((h<<24>>24)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){m=l;n=h;break}else{l=g}}}l=n<<24>>24==46?m+1|0:0;do{if((l|0)!=0){g=((a[l]|0)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){break}else{o=g}while(1){g=((a[o]|0)-48|0)>>>0<10>>>0?o+1|0:0;if((g|0)==0){k=o;break}else{o=g}}return k|0}}while(0);if(e){break}else{p=j}while(1){l=((a[p]|0)-48|0)>>>0<10>>>0?p+1|0:0;if((l|0)==0){k=p;break}else{p=l}}return k|0}}while(0);k=(a[b]|0)==46?c:0;return k|0}function zZ(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=z_(b)|0;do{if((c|0)==0){if((b|0)==0){d=0}else{e=b;break}return d|0}else{f=c;while(1){g=z_(f)|0;if((g|0)==0){e=f;break}else{f=g}}}}while(0);c=a[36320]|0;L7:do{if(c<<24>>24==0){h=e;i=0}else{b=e;f=36320;g=c;while(1){if((a[b]|0)!=g<<24>>24){h=b;i=g;break L7}j=b+1|0;k=f+1|0;l=a[k]|0;if(l<<24>>24==0){h=j;i=0;break}else{b=j;f=k;g=l}}}}while(0);c=i<<24>>24!=0?0:h;if((c|0)==0){d=0;return d|0}h=a[36048]|0;L15:do{if(h<<24>>24==0){i=c;while(1){if((a[i]|0)==0){d=0;break}if((i|0)==0){i=i+1|0}else{m=i;break L15}}return d|0}else{i=c;while(1){e=a[i]|0;if(e<<24>>24==0){d=0;break}L23:do{if(e<<24>>24==h<<24>>24){g=36048;f=i;while(1){b=f+1|0;l=g+1|0;k=a[l]|0;if(k<<24>>24==0){n=b;o=0;break L23}if((a[b]|0)==k<<24>>24){g=l;f=b}else{n=b;o=k;break}}}else{n=i;o=h}}while(0);e=o<<24>>24!=0?0:n;if((e|0)==0){i=i+1|0}else{m=e;break L15}}return d|0}}while(0);n=z_(m)|0;if((n|0)==0){d=m;return d|0}else{p=n}while(1){n=z_(p)|0;if((n|0)==0){d=p;break}else{p=n}}return d|0}function z_(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=36400}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=36400;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=36400;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=36400;break}else{k=h}return k|0}}while(0);while(1){j=a[f]|0;if(j<<24>>24==0){l=0;break}if((a[b]|0)==j<<24>>24){l=c;break}else{f=f+1|0}}f=(l|0)!=0?l:b;do{if((f|0)!=0){l=a[f]|0;j=((l<<24>>24)-48|0)>>>0<10>>>0?f+1|0:0;e=(j|0)==0;if(e){m=f;n=l}else{l=j;while(1){h=a[l]|0;g=((h<<24>>24)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){m=l;n=h;break}else{l=g}}}l=n<<24>>24==46?m+1|0:0;do{if((l|0)!=0){g=((a[l]|0)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){break}else{o=g}while(1){g=((a[o]|0)-48|0)>>>0<10>>>0?o+1|0:0;if((g|0)==0){k=o;break}else{o=g}}return k|0}}while(0);if(e){break}else{p=j}while(1){l=((a[p]|0)-48|0)>>>0<10>>>0?p+1|0:0;if((l|0)==0){k=p;break}else{p=l}}return k|0}}while(0);p=a[b]|0;b=p<<24>>24==46?c:0;if((b|0)!=0){k=b;return k|0}k=p<<24>>24==47?c:0;return k|0}function z$(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=z0(b)|0;do{if((c|0)==0){if((b|0)==0){d=0}else{e=b;break}return d|0}else{f=c;while(1){g=z0(f)|0;if((g|0)==0){e=f;break}else{f=g}}}}while(0);c=a[36320]|0;L7:do{if(c<<24>>24==0){h=e;i=0}else{b=e;f=36320;g=c;while(1){if((a[b]|0)!=g<<24>>24){h=b;i=g;break L7}j=b+1|0;k=f+1|0;l=a[k]|0;if(l<<24>>24==0){h=j;i=0;break}else{b=j;f=k;g=l}}}}while(0);c=i<<24>>24!=0?0:h;if((c|0)==0){d=0;return d|0}h=a[36048]|0;L15:do{if(h<<24>>24==0){i=c;while(1){if((a[i]|0)==0){d=0;break}if((i|0)==0){i=i+1|0}else{m=i;break L15}}return d|0}else{i=c;while(1){e=a[i]|0;if(e<<24>>24==0){d=0;break}L23:do{if(e<<24>>24==h<<24>>24){g=36048;f=i;while(1){b=f+1|0;l=g+1|0;k=a[l]|0;if(k<<24>>24==0){n=b;o=0;break L23}if((a[b]|0)==k<<24>>24){g=l;f=b}else{n=b;o=k;break}}}else{n=i;o=h}}while(0);e=o<<24>>24!=0?0:n;if((e|0)==0){i=i+1|0}else{m=e;break L15}}return d|0}}while(0);n=z0(m)|0;if((n|0)==0){d=m;return d|0}else{p=n}while(1){n=z0(p)|0;if((n|0)==0){d=p;break}else{p=n}}return d|0}function z0(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=36400}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=36400;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=36400;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=36400;break}else{k=h}return k|0}}while(0);while(1){j=a[f]|0;if(j<<24>>24==0){l=0;break}if((a[b]|0)==j<<24>>24){l=c;break}else{f=f+1|0}}f=(l|0)!=0?l:b;do{if((f|0)!=0){l=a[f]|0;j=((l<<24>>24)-48|0)>>>0<10>>>0?f+1|0:0;e=(j|0)==0;if(e){m=f;n=l}else{l=j;while(1){h=a[l]|0;g=((h<<24>>24)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){m=l;n=h;break}else{l=g}}}l=n<<24>>24==46?m+1|0:0;do{if((l|0)==0){o=15}else{g=((a[l]|0)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){o=15;break}else{p=g}while(1){g=a[p]|0;h=((g<<24>>24)-48|0)>>>0<10>>>0?p+1|0:0;if((h|0)==0){q=p;r=g;break}else{p=h}}}}while(0);if((o|0)==15){if(e){break}else{s=j}while(1){l=a[s]|0;h=((l<<24>>24)-48|0)>>>0<10>>>0?s+1|0:0;if((h|0)==0){q=s;r=l;break}else{s=h}}}j=r<<24>>24==37?q+1|0:0;if((j|0)==0){break}else{k=j}return k|0}}while(0);q=zm(b)|0;if((q|0)!=0){k=q;return k|0}q=(a[b]|0)==35?c:0;do{if((q|0)==0){t=0}else{r=(bq(a[q]|0)|0)==0;s=r?0:q+1|0;if((s|0)==0){t=0;break}else{u=s}while(1){s=(bq(a[u]|0)|0)==0;r=s?0:u+1|0;if((r|0)==0){t=u;break}else{u=r}}}}while(0);u=t-b|0;q=(u|0)!=4&(u|0)!=7?0:t;if((q|0)==0){v=36400}else{k=q;return k|0}while(1){q=a[v]|0;if(q<<24>>24==0){w=0;break}if((a[b]|0)==q<<24>>24){w=c;break}else{v=v+1|0}}v=(w|0)!=0?w:b;do{if((v|0)!=0){w=a[v]|0;q=((w<<24>>24)-48|0)>>>0<10>>>0?v+1|0:0;t=(q|0)==0;if(t){x=v;y=w}else{w=q;while(1){u=a[w]|0;r=((u<<24>>24)-48|0)>>>0<10>>>0?w+1|0:0;if((r|0)==0){x=w;y=u;break}else{w=r}}}w=y<<24>>24==46?x+1|0:0;do{if((w|0)!=0){r=((a[w]|0)-48|0)>>>0<10>>>0?w+1|0:0;if((r|0)==0){break}else{z=r}while(1){r=((a[z]|0)-48|0)>>>0<10>>>0?z+1|0:0;if((r|0)==0){k=z;break}else{z=r}}return k|0}}while(0);if(t){break}else{A=q}while(1){w=((a[A]|0)-48|0)>>>0<10>>>0?A+1|0:0;if((w|0)==0){k=A;break}else{A=w}}return k|0}}while(0);A=a[b]|0;b=A<<24>>24==34?c:0;L60:do{if((b|0)!=0){z=a[b]|0;if(z<<24>>24==0){break}else{B=b;C=z}while(1){z=B+1|0;x=C<<24>>24==34?z:0;if((x|0)==0){D=z}else{if((a[B-1|0]|0)==92){D=x}else{k=x;break}}x=a[D]|0;if(x<<24>>24==0){break L60}else{B=D;C=x}}return k|0}}while(0);C=A<<24>>24==39?c:0;if((C|0)==0){k=0;return k|0}c=a[C]|0;if(c<<24>>24==0){k=0;return k|0}else{E=C;F=c}while(1){c=E+1|0;C=F<<24>>24==39?c:0;if((C|0)==0){G=c}else{if((a[E-1|0]|0)==92){G=C}else{k=C;o=53;break}}C=a[G]|0;if(C<<24>>24==0){k=0;o=54;break}else{E=G;F=C}}if((o|0)==53){return k|0}else if((o|0)==54){return k|0}return 0}function z1(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=7}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=7;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=7;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=7}else{k=h;f=8}}}while(0);if((f|0)==7){j=a[b]|0;e=j<<24>>24==45?c:0;if((e|0)==0){l=b;m=j}else{k=e;f=8}}if((f|0)==8){L11:while(1){f=0;e=k+1|0;j=(a[k]|0)==45?e:0;b=(j|0)!=0?j:k;L13:do{if((b|0)!=0){j=(bR(a[b]|0)|0)==0;c=b+1|0;h=j?0:c;do{if((h|0)==0){j=a[b]|0;g=j<<24>>24==95?c:0;if((g|0)!=0){n=g;break}g=j<<24>>24==92?c:0;if((g|0)==0){break L13}j=(a[g]|0)!=0?g+1|0:g;if((j|0)==0){break L13}else{n=j}}else{n=h}}while(0);h=z3(n)|0;if((h|0)!=0){k=h;f=8;continue L11}}}while(0);b=a[k]|0;h=b<<24>>24==45?e:0;if((h|0)==0){l=k;m=b;break}else{k=h;f=8}}}if((l|0)==0){o=0;return o|0}f=a[36320]|0;L25:do{if(f<<24>>24==0){p=l;q=0}else{k=l;n=36320;h=f;b=m;while(1){if(b<<24>>24!=h<<24>>24){p=k;q=h;break L25}c=k+1|0;j=n+1|0;g=a[j]|0;if(g<<24>>24==0){p=c;q=0;break L25}k=c;n=j;h=g;b=a[c]|0}}}while(0);m=q<<24>>24!=0?0:p;if((m|0)==0){o=0;return o|0}p=a[36048]|0;L34:do{if(p<<24>>24==0){q=m;while(1){if((a[q]|0)==0){o=0;break}if((q|0)==0){q=q+1|0}else{r=q;break L34}}return o|0}else{q=m;while(1){f=a[q]|0;if(f<<24>>24==0){o=0;break}L38:do{if(f<<24>>24==p<<24>>24){l=36048;b=q;while(1){h=b+1|0;n=l+1|0;k=a[n]|0;if(k<<24>>24==0){s=h;t=0;break L38}if((a[h]|0)==k<<24>>24){l=n;b=h}else{s=h;t=k;break}}}else{s=q;t=p}}while(0);f=t<<24>>24!=0?0:s;if((f|0)==0){q=q+1|0}else{r=f;break L34}}return o|0}}while(0);s=z2(r)|0;if((s|0)==0){o=r;return o|0}else{u=s}while(1){s=z2(u)|0;if((s|0)==0){o=u;break}else{u=s}}return o|0}function z2(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=b+1|0;d=(a[b]|0)==45?c:0;e=(d|0)!=0?d:b;L1:do{if((e|0)==0){f=36400}else{d=(bR(a[e]|0)|0)==0;g=e+1|0;h=d?0:g;do{if((h|0)==0){d=a[e]|0;i=d<<24>>24==95?g:0;if((i|0)!=0){j=i;break}i=d<<24>>24==92?g:0;if((i|0)==0){f=36400;break L1}d=(a[i]|0)!=0?i+1|0:i;if((d|0)==0){f=36400;break L1}else{j=d}}else{j=h}}while(0);h=z3(j)|0;if((h|0)==0){f=36400;break}else{k=h}return k|0}}while(0);while(1){j=a[f]|0;if(j<<24>>24==0){l=0;break}if((a[b]|0)==j<<24>>24){l=c;break}else{f=f+1|0}}f=(l|0)!=0?l:b;do{if((f|0)!=0){l=a[f]|0;j=((l<<24>>24)-48|0)>>>0<10>>>0?f+1|0:0;e=(j|0)==0;if(e){m=f;n=l}else{l=j;while(1){h=a[l]|0;g=((h<<24>>24)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){m=l;n=h;break}else{l=g}}}l=n<<24>>24==46?m+1|0:0;do{if((l|0)!=0){g=((a[l]|0)-48|0)>>>0<10>>>0?l+1|0:0;if((g|0)==0){break}else{o=g}while(1){g=((a[o]|0)-48|0)>>>0<10>>>0?o+1|0:0;if((g|0)==0){k=o;break}else{o=g}}return k|0}}while(0);if(e){break}else{p=j}while(1){l=((a[p]|0)-48|0)>>>0<10>>>0?p+1|0:0;if((l|0)==0){k=p;break}else{p=l}}return k|0}}while(0);k=(a[b]|0)==45?c:0;return k|0}function z3(b){b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;c=(bQ(a[b]|0)|0)==0;d=b+1|0;e=c?0:d;do{if((e|0)==0){c=a[b]|0;f=c<<24>>24==45?d:0;if((f|0)!=0){g=f;break}f=c<<24>>24==95?d:0;if((f|0)!=0){g=f;break}f=c<<24>>24==92?d:0;if((f|0)==0){h=b;return h|0}c=(a[f]|0)!=0?f+1|0:f;if((c|0)==0){h=b}else{g=c;break}return h|0}else{g=e}}while(0);while(1){e=(bQ(a[g]|0)|0)==0;b=g+1|0;d=e?0:b;if((d|0)!=0){g=d;continue}d=a[g]|0;e=d<<24>>24==45?b:0;if((e|0)!=0){g=e;continue}e=d<<24>>24==95?b:0;if((e|0)!=0){g=e;continue}e=d<<24>>24==92?b:0;if((e|0)==0){h=g;i=15;break}b=(a[e]|0)!=0?e+1|0:e;if((b|0)==0){h=g;i=13;break}else{g=b}}if((i|0)==15){return h|0}else if((i|0)==13){return h|0}return 0}function z4(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=b;return}function z5(a,b,d){a=a|0;b=+b;d=d|0;c[a>>2]=1;h[a+8>>3]=b;c[a+16>>2]=bT(d|0)|0;return}function z6(a,b,d,e,f){a=a|0;b=+b;d=+d;e=+e;f=+f;c[a>>2]=2;h[a+8>>3]=b;h[a+16>>3]=d;h[a+24>>3]=e;h[a+32>>3]=f;return}function z7(a,b){a=a|0;b=b|0;c[a>>2]=3;c[a+4>>2]=bT(b|0)|0;return}function z8(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a;c[a>>2]=4;c[a+8>>2]=b;c[e+4>>2]=d;c[e+12>>2]=KY(b*40|0)|0;return}function z9(a){a=a|0;c[a>>2]=5;return}function Aa(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;c[b>>2]=c[d>>2];e=b+4|0;f=d+4|0;if((a[f]&1)==0){g=e;c[g>>2]=c[f>>2];c[g+4>>2]=c[f+4>>2];c[g+8>>2]=c[f+8>>2]}else{f=c[d+12>>2]|0;g=c[d+8>>2]|0;if(g>>>0>4294967279>>>0){DH(0)}if(g>>>0<11>>>0){a[e]=g<<1;h=e+1|0}else{i=g+16&-16;j=K2(i)|0;c[b+12>>2]=j;c[e>>2]=i|1;c[b+8>>2]=g;h=j}Ld(h|0,f|0,g)|0;a[h+g|0]=0}g=b+16|0;h=d+16|0;L12:do{if((a[h]&1)==0){f=g;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];c[f+8>>2]=c[h+8>>2];k=19}else{f=c[d+24>>2]|0;j=c[d+20>>2]|0;do{if(j>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(j>>>0<11>>>0){a[g]=j<<1;l=g+1|0}else{i=j+16&-16;m=(z=0,au(246,i|0)|0);if(z){z=0;break}c[b+24>>2]=m;c[g>>2]=i|1;c[b+20>>2]=j;l=m}Ld(l|0,f|0,j)|0;a[l+j|0]=0;k=19;break L12}}while(0);j=bS(-1,-1)|0;n=M;o=j}}while(0);do{if((k|0)==19){c[b+28>>2]=c[d+28>>2];c[b+32>>2]=c[d+32>>2];l=b+36|0;z=0;as(292,l|0,d+36|0);do{if(!z){a[b+48|0]=a[d+48|0]&1;a[b+49|0]=a[d+49|0]&1;c[b+52>>2]=c[d+52>>2];h=b+56|0;j=d+56|0;if((a[j]&1)==0){f=h;c[f>>2]=c[j>>2];c[f+4>>2]=c[j+4>>2];c[f+8>>2]=c[j+8>>2];return}j=c[d+64>>2]|0;f=c[d+60>>2]|0;do{if(f>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(f>>>0<11>>>0){a[h]=f<<1;p=h+1|0}else{m=f+16&-16;i=(z=0,au(246,m|0)|0);if(z){z=0;break}c[b+64>>2]=i;c[h>>2]=m|1;c[b+60>>2]=f;p=i}Ld(p|0,j|0,f)|0;a[p+f|0]=0;return}}while(0);f=bS(-1,-1)|0;j=f;f=M;h=l|0;i=c[h>>2]|0;if((i|0)==0){q=f;r=j;break}m=b+40|0;s=c[m>>2]|0;if((i|0)==(s|0)){t=i}else{u=s;while(1){s=u-12|0;c[m>>2]=s;if((a[s]&1)==0){v=s}else{K4(c[u-12+8>>2]|0);v=c[m>>2]|0}if((i|0)==(v|0)){break}else{u=v}}t=c[h>>2]|0}K4(t);q=f;r=j}else{z=0;u=bS(-1,-1)|0;q=M;r=u}}while(0);if((a[g]&1)==0){n=q;o=r;break}K4(c[b+24>>2]|0);n=q;o=r}}while(0);if((a[e]&1)==0){w=o;x=0;y=w;A=n;bg(y|0)}K4(c[b+12>>2]|0);w=o;x=0;y=w;A=n;bg(y|0)}function Ab(){return K_(1,44)|0}function Ac(a){a=a|0;var b=0,d=0,e=0,f=0;b=c[a+4>>2]|0;if((b|0)!=0){KZ(b)}b=c[a+28>>2]|0;if((b|0)!=0){KZ(b)}b=c[a+36>>2]|0;d=c[a+40>>2]|0;if((b|0)==0){e=a;KZ(e);return}if((d|0)>0){f=0;do{KZ(c[b+(f<<2)>>2]|0);f=f+1|0;}while((f|0)<(d|0))}KZ(b);e=a;KZ(e);return}function Ad(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=b|0;h=c[g>>2]|0;i=(c[b+4>>2]|0)-h|0;b=(i|0)/12|0;j=KY(b<<2)|0;if((i|0)>0){k=0;l=h}else{c[e>>2]=j;c[f>>2]=b;return}while(1){h=l+(k*12|0)|0;i=h;m=d[i]|0;if((m&1|0)==0){n=m>>>1}else{n=c[l+(k*12|0)+4>>2]|0}m=KY(n+1|0)|0;o=j+(k<<2)|0;c[o>>2]=m;p=a[i]|0;if((p&1)==0){q=h+1|0;r=h+1|0}else{h=c[l+(k*12|0)+8>>2]|0;q=h;r=h}h=p&255;if((h&1|0)==0){s=h>>>1}else{s=c[l+(k*12|0)+4>>2]|0}h=q+s|0;if((r|0)==(h|0)){t=l;u=p}else{p=r;i=m;while(1){a[i]=a[p]|0;m=p+1|0;if((m|0)==(h|0)){break}else{p=m;i=i+1|0}}i=c[g>>2]|0;t=i;u=a[i+(k*12|0)|0]|0}i=u&255;if((i&1|0)==0){v=i>>>1}else{v=c[t+(k*12|0)+4>>2]|0}a[(c[o>>2]|0)+v|0]=0;i=k+1|0;if((i|0)>=(b|0)){break}k=i;l=c[g>>2]|0}c[e>>2]=j;c[f>>2]=b;return}function Ae(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0;d=i;i=i+32|0;e=d|0;f=d+8|0;g=d+16|0;h=g;j=i;i=i+12|0;i=i+7&-8;k=j;l=i;i=i+196|0;i=i+7&-8;m=i;i=i+68|0;i=i+7&-8;n=i;i=i+68|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;r=i;i=i+144|0;s=i;i=i+12|0;i=i+7&-8;t=i;i=i+144|0;u=i;i=i+12|0;i=i+7&-8;v=n+36|0;w=n+40|0;Lg(n|0,0,68)|0;c[n>>2]=c[b>>2];x=o;a[x]=0;a[o+1|0]=0;y=n+4|0;z=0,aM(344,y|0,o|0)|0;L1:do{if(!z){c[n+52>>2]=c[b+8>>2];a[n+48|0]=(c[b+12>>2]|0)==1|0;a[n+49|0]=0;A=c[b+20>>2]|0;B=Lh(A|0)|0;if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;C=54;break}return 0}if(B>>>0<11>>>0){a[p]=B<<1;D=p+1|0}else{E=B+16&-16;F=(z=0,au(246,E|0)|0);if(z){z=0;C=54;break}c[p+8>>2]=F;c[p>>2]=E|1;c[p+4>>2]=B;D=F}Ld(D|0,A|0,B)|0;a[D+B|0]=0;B=n+16|0;z=0,aM(344,B|0,p|0)|0;L12:do{if(!z){c[n+28>>2]=c[b+16>>2];c[n+32>>2]=0;z=0;aR(142,n+36|0,0,0);do{if(!z){z=0;as(356,m|0,n|0);if(z){z=0;break}z=0;as(538,l|0,m|0);if(z){z=0;A=bS(-1,-1,30712,28584)|0;F=A;A=M;if((a[m+56|0]&1)!=0){K4(c[m+64>>2]|0)}E=m+36|0;G=c[E>>2]|0;if((G|0)!=0){H=m+40|0;I=c[H>>2]|0;if((G|0)==(I|0)){J=G}else{K=I;while(1){I=K-12|0;c[H>>2]=I;if((a[I]&1)==0){L=I}else{K4(c[K-12+8>>2]|0);L=c[H>>2]|0}if((G|0)==(L|0)){break}else{K=L}}J=c[E>>2]|0}K4(J)}if((a[m+16|0]&1)!=0){K4(c[m+24>>2]|0)}if((a[m+4|0]&1)==0){N=A;O=F;break L12}K4(c[m+12>>2]|0);N=A;O=F;break L12}if((a[m+56|0]&1)!=0){K4(c[m+64>>2]|0)}K=m+36|0;G=c[K>>2]|0;if((G|0)!=0){H=m+40|0;I=c[H>>2]|0;if((G|0)==(I|0)){P=G}else{Q=I;while(1){I=Q-12|0;c[H>>2]=I;if((a[I]&1)==0){R=I}else{K4(c[Q-12+8>>2]|0);R=c[H>>2]|0}if((G|0)==(R|0)){break}else{Q=R}}P=c[K>>2]|0}K4(P)}if((a[m+16|0]&1)!=0){K4(c[m+24>>2]|0)}if((a[m+4|0]&1)!=0){K4(c[m+12>>2]|0)}if((a[p]&1)!=0){K4(c[p+8>>2]|0)}if((a[x]&1)!=0){K4(c[o+8>>2]|0)}if((a[n+56|0]&1)!=0){K4(c[n+64>>2]|0)}Q=c[v>>2]|0;if((Q|0)!=0){G=c[w>>2]|0;if((Q|0)==(G|0)){S=Q}else{H=G;while(1){G=H-12|0;c[w>>2]=G;if((a[G]&1)==0){T=G}else{K4(c[H-12+8>>2]|0);T=c[w>>2]|0}if((Q|0)==(T|0)){break}else{H=T}}S=c[v>>2]|0}K4(S)}if((a[B]&1)!=0){K4(c[n+24>>2]|0)}if((a[y]&1)!=0){K4(c[n+12>>2]|0)}H=(z=0,au(142,l|0)|0);do{if(!z){c[b+4>>2]=H;c[b+28>>2]=0;c[b+24>>2]=0;z=0;as(14,q|0,l|0);if(z){z=0;break}Ad(q,b+36|0,b+40|0);Q=q|0;K=c[Q>>2]|0;if((K|0)!=0){G=q+4|0;F=c[G>>2]|0;if((K|0)==(F|0)){U=K}else{A=F;while(1){F=A-12|0;c[G>>2]=F;if((a[F]&1)==0){V=F}else{K4(c[A-12+8>>2]|0);V=c[G>>2]|0}if((K|0)==(V|0)){break}else{A=V}}U=c[Q>>2]|0}K4(U)}z=0;ar(318,l|0);if(!z){i=d;return 0}else{z=0;A=bS(-1,-1,30712,28584)|0;W=M;X=A;C=88;break L1}}else{z=0}}while(0);H=bS(-1,-1,30712,28584)|0;A=M;z=0;ar(318,l|0);if(!z){W=A;X=H;C=88;break L1}else{z=0;break L1}}else{z=0}}while(0);H=bS(-1,-1,30712,28584)|0;N=M;O=H}else{z=0;H=bS(-1,-1,30712,28584)|0;N=M;O=H}}while(0);if((a[p]&1)==0){Y=N;Z=O;C=72;break}K4(c[p+8>>2]|0);Y=N;Z=O;C=72}else{z=0;C=54}}while(0);if((C|0)==54){O=bS(-1,-1,30712,28584)|0;Y=M;Z=O;C=72}do{if((C|0)==72){if((a[x]&1)!=0){K4(c[o+8>>2]|0)}if((a[n+56|0]&1)!=0){K4(c[n+64>>2]|0)}O=c[v>>2]|0;if((O|0)!=0){N=c[w>>2]|0;if((O|0)==(N|0)){_=O}else{p=N;while(1){N=p-12|0;c[w>>2]=N;if((a[N]&1)==0){$=N}else{K4(c[p-12+8>>2]|0);$=c[w>>2]|0}if((O|0)==($|0)){break}else{p=$}}_=c[v>>2]|0}K4(_)}if((a[n+16|0]&1)!=0){K4(c[n+24>>2]|0)}if((a[y]&1)==0){W=Y;X=Z;C=88;break}K4(c[n+12>>2]|0);W=Y;X=Z;C=88}}while(0);L131:do{if((C|0)==88){if((W|0)!=(cr(30712)|0)){if((W|0)!=(cr(28584)|0)){aa=W;ab=X;ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}Z=bC(X|0)|0;Y=Z;n=r+64|0;y=r|0;_=r+8|0;v=_|0;c[v>>2]=14728;$=r+12|0;c[y>>2]=31804;w=r+64|0;c[w>>2]=31824;c[r+4>>2]=0;z=0;as(198,r+64|0,$|0);L138:do{if(!z){c[r+136>>2]=0;c[r+140>>2]=-1;o=r+8|0;c[y>>2]=14708;c[n>>2]=14748;c[v>>2]=14728;x=$|0;c[x>>2]=15032;p=r+16|0;Iy(p);Lg(r+20|0,0,24)|0;c[x>>2]=14888;O=r+44|0;Lg(r+44|0,0,16)|0;c[r+60>>2]=24;Lg(h|0,0,12)|0;z=0;as(212,$|0,g|0);if(z){z=0;N=bS(-1,-1)|0;l=M;if((a[h]&1)!=0){K4(c[g+8>>2]|0)}if((a[O]&1)!=0){K4(c[r+52>>2]|0)}c[x>>2]=15032;z=0;ar(396,p|0);if(!z){ag=N;ah=l;C=142;break}else{z=0}bS(-1,-1,0)|0;bW();return 0}if((a[h]&1)!=0){K4(c[g+8>>2]|0)}l=(z=0,aM(114,_|0,9416)|0);L153:do{if(!z){N=cC[c[(c[Z>>2]|0)+8>>2]&511](Y)|0;x=(z=0,aM(114,l|0,N|0)|0);if(z){z=0;C=170;break}z=0;as(346,e|0,x+(c[(c[x>>2]|0)-12>>2]|0)|0);if(z){z=0;C=170;break}N=(z=0,aM(198,e|0,40880)|0);do{if(!z){U=(z=0,aM(c[(c[N>>2]|0)+28>>2]|0,N|0,10)|0);if(z){z=0;break}z=0;ar(396,e|0);if(z){z=0;C=170;break L153}z=0,aM(242,x|0,U|0)|0;if(z){z=0;C=170;break L153}z=0,au(62,x|0)|0;if(z){z=0;C=170;break L153}z=0;as(568,s|0,$|0);if(z){z=0;C=170;break L153}U=s;if((a[U]&1)==0){ai=s+1|0}else{ai=c[s+8>>2]|0}c[b+28>>2]=bT(ai|0)|0;if((a[U]&1)!=0){K4(c[s+8>>2]|0)}c[b+24>>2]=1;c[b+4>>2]=0;c[y>>2]=14708;c[w>>2]=14748;c[o>>2]=14728;U=r+12|0;c[U>>2]=14888;if((a[O]&1)!=0){K4(c[r+52>>2]|0)}c[U>>2]=15032;z=0;ar(396,p|0);if(z){z=0;U=bS(-1,-1)|0;V=M;z=0;ar(272,r+64|0);if(!z){aj=V;ak=U;C=169;break L138}else{z=0}bS(-1,-1,0)|0;bW();return 0}z=0;ar(272,r+64|0);if(z){z=0;U=bS(-1,-1)|0;aj=M;ak=U;C=169;break L138}a$();i=d;return 0}else{z=0}}while(0);x=bS(-1,-1)|0;N=M;z=0;ar(396,e|0);if(!z){al=N;am=x;break}else{z=0}bS(-1,-1,0)|0;bW();return 0}else{z=0;C=170}}while(0);if((C|0)==170){l=bS(-1,-1)|0;al=M;am=l}l=am;x=al;c[y>>2]=14708;c[w>>2]=14748;c[o>>2]=14728;N=r+12|0;c[N>>2]=14888;if((a[O]&1)!=0){K4(c[r+52>>2]|0)}c[N>>2]=15032;z=0;ar(396,p|0);if(!z){z=0;ar(272,r+64|0);if(!z){an=x;ao=l;break}else{z=0;break L131}}else{z=0}bS(-1,-1,0)|0;z=0;ar(272,r+64|0);if(!z){bW();return 0}else{z=0;bS(-1,-1,0)|0;bW();return 0}}else{z=0;l=bS(-1,-1)|0;ag=l;ah=M;C=142}}while(0);do{if((C|0)==142){z=0;ar(272,n|0);if(!z){aj=ah;ak=ag;C=169;break}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);if((C|0)==169){an=aj;ao=ak}z=0;aS(2);if(!z){aa=an;ab=ao}else{z=0;break}ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}n=bC(X|0)|0;w=t+64|0;y=t|0;$=t+8|0;Y=$|0;c[Y>>2]=14728;Z=t+12|0;c[y>>2]=31804;_=t+64|0;c[_>>2]=31824;c[t+4>>2]=0;z=0;as(198,t+64|0,Z|0);L207:do{if(!z){c[t+136>>2]=0;c[t+140>>2]=-1;v=t+8|0;c[y>>2]=14708;c[w>>2]=14748;c[Y>>2]=14728;l=Z|0;c[l>>2]=15032;x=t+16|0;Iy(x);Lg(t+20|0,0,24)|0;c[l>>2]=14888;N=t+44|0;Lg(t+44|0,0,16)|0;c[t+60>>2]=24;Lg(k|0,0,12)|0;z=0;as(212,Z|0,j|0);if(z){z=0;U=bS(-1,-1)|0;V=M;if((a[k]&1)!=0){K4(c[j+8>>2]|0)}if((a[N]&1)!=0){K4(c[t+52>>2]|0)}c[l>>2]=15032;z=0;ar(396,x|0);if(!z){ap=U;aq=V;C=100;break}else{z=0}bS(-1,-1,0)|0;bW();return 0}if((a[k]&1)!=0){K4(c[j+8>>2]|0)}V=(z=0,aM(802,$|0,n+4|0)|0);L222:do{if(!z){U=(z=0,aM(114,V|0,7944)|0);if(z){z=0;C=180;break}l=(z=0,aM(312,U|0,c[n+20>>2]|0)|0);if(z){z=0;C=180;break}U=(z=0,aM(114,l|0,5968)|0);if(z){z=0;C=180;break}l=(z=0,aM(802,U|0,n+28|0)|0);if(z){z=0;C=180;break}z=0;as(346,f|0,l+(c[(c[l>>2]|0)-12>>2]|0)|0);if(z){z=0;C=180;break}U=(z=0,aM(198,f|0,40880)|0);do{if(!z){q=(z=0,aM(c[(c[U>>2]|0)+28>>2]|0,U|0,10)|0);if(z){z=0;break}z=0;ar(396,f|0);if(z){z=0;C=180;break L222}z=0,aM(242,l|0,q|0)|0;if(z){z=0;C=180;break L222}z=0,au(62,l|0)|0;if(z){z=0;C=180;break L222}z=0;as(568,u|0,Z|0);if(z){z=0;C=180;break L222}q=u;if((a[q]&1)==0){at=u+1|0}else{at=c[u+8>>2]|0}c[b+28>>2]=bT(at|0)|0;if((a[q]&1)!=0){K4(c[u+8>>2]|0)}c[b+24>>2]=1;c[b+4>>2]=0;c[y>>2]=14708;c[_>>2]=14748;c[v>>2]=14728;q=t+12|0;c[q>>2]=14888;if((a[N]&1)!=0){K4(c[t+52>>2]|0)}c[q>>2]=15032;z=0;ar(396,x|0);if(z){z=0;q=bS(-1,-1)|0;S=M;z=0;ar(272,t+64|0);if(!z){av=S;aw=q;C=179;break L207}else{z=0}bS(-1,-1,0)|0;bW();return 0}z=0;ar(272,t+64|0);if(z){z=0;q=bS(-1,-1)|0;av=M;aw=q;C=179;break L207}a$();i=d;return 0}else{z=0}}while(0);l=bS(-1,-1)|0;U=M;z=0;ar(396,f|0);if(!z){ax=U;ay=l;break}else{z=0}bS(-1,-1,0)|0;bW();return 0}else{z=0;C=180}}while(0);if((C|0)==180){V=bS(-1,-1)|0;ax=M;ay=V}V=ay;p=ax;c[y>>2]=14708;c[_>>2]=14748;c[v>>2]=14728;O=t+12|0;c[O>>2]=14888;if((a[N]&1)!=0){K4(c[t+52>>2]|0)}c[O>>2]=15032;z=0;ar(396,x|0);if(!z){z=0;ar(272,t+64|0);if(!z){az=p;aA=V;break}else{z=0;break L131}}else{z=0}bS(-1,-1,0)|0;z=0;ar(272,t+64|0);if(!z){bW();return 0}else{z=0;bS(-1,-1,0)|0;bW();return 0}}else{z=0;V=bS(-1,-1)|0;ap=V;aq=M;C=100}}while(0);do{if((C|0)==100){z=0;ar(272,w|0);if(!z){av=aq;aw=ap;C=179;break}else{z=0;bS(-1,-1,0)|0;bW();return 0}}}while(0);if((C|0)==179){az=av;aA=aw}z=0;aS(2);if(!z){aa=az;ab=aA}else{z=0;break}ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}}while(0);bS(-1,-1,0)|0;bW();return 0}function Af(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=b|0;f=b+4|0;g=b+12|0;h=b+16|0;Lg(b|0,0,28)|0;c[b+28>>2]=1;c[b+32>>2]=1;i=b+36|0;j=d;if((a[j]&1)==0){k=i;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2];return}j=c[d+8>>2]|0;k=c[d+4>>2]|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(k>>>0<11>>>0){a[i]=k<<1;l=i+1|0}else{d=k+16&-16;m=(z=0,au(246,d|0)|0);if(z){z=0;break}c[b+44>>2]=m;c[i>>2]=d|1;c[b+40>>2]=k;l=m}Ld(l|0,j|0,k)|0;a[l+k|0]=0;return}}while(0);k=bS(-1,-1)|0;l=c[g>>2]|0;g=l;if((l|0)!=0){j=c[h>>2]|0;if((l|0)!=(j|0)){c[h>>2]=j+(~(((j-24+(-g|0)|0)>>>0)/24|0)*24|0)}K4(l)}l=c[e>>2]|0;if((l|0)==0){bg(k|0)}g=c[f>>2]|0;if((l|0)==(g|0)){n=l}else{j=g;while(1){g=j-12|0;c[f>>2]=g;if((a[g]&1)==0){o=g}else{K4(c[j-12+8>>2]|0);o=c[f>>2]|0}if((l|0)==(o|0)){break}else{j=o}}n=c[e>>2]|0}K4(n);bg(k|0)}function Ag(a){a=a|0;var b=0;b=a+28|0;c[b>>2]=(c[b>>2]|0)+1;c[a+32>>2]=1;return}function Ah(a){a=a|0;var b=0;b=a+28|0;c[b>>2]=(c[b>>2]|0)-1;c[a+32>>2]=1;return}function Ai(a,b){a=a|0;b=b|0;var e=0,f=0;e=d[b]|0;if((e&1|0)==0){f=e>>>1}else{f=c[b+4>>2]|0}b=a+32|0;c[b>>2]=(c[b>>2]|0)+f;return}function Aj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+24|0;e=d|0;f=b+16|0;b=e;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];f=e;b=e+12|0;g=a+24|0;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];g=a+16|0;b=c[g>>2]|0;if((b|0)==(c[a+20>>2]|0)){Ak(a+12|0,e);i=d;return}if((b|0)==0){h=0}else{e=b;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];c[e+8>>2]=c[f+8>>2];c[e+12>>2]=c[f+12>>2];c[e+16>>2]=c[f+16>>2];c[e+20>>2]=c[f+20>>2];h=c[g>>2]|0}c[g>>2]=h+24;i=d;return}function Ak(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=(h|0)/24|0;j=i+1|0;if(j>>>0>178956970>>>0){Is(0)}k=a+8|0;a=((c[k>>2]|0)-g|0)/24|0;if(a>>>0>89478484>>>0){l=178956970;m=5}else{g=a<<1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K2(l*24|0)|0;o=l}l=n+(i*24|0)|0;if((l|0)!=0){m=l;l=b;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];c[m+16>>2]=c[l+16>>2];c[m+20>>2]=c[l+20>>2]}l=n+((((h|0)/-24|0)+i|0)*24|0)|0;i=f;Ld(l|0,i|0,h)|0;c[e>>2]=l;c[d>>2]=n+(j*24|0);c[k>>2]=n+(o*24|0);if((f|0)==0){return}K4(i);return}function Al(b,c,d){b=b|0;c=c|0;d=d|0;z4(b,a[d+36|0]&1);return}function Am(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0.0,j=0;d=i;i=i+16|0;f=d|0;g=+h[e+40>>3];ji(f,e);e=f;if((a[e]&1)==0){j=f+1|0}else{j=c[f+8>>2]|0}z=0;ay(2,b|0,+g,j|0);if(!z){if((a[e]&1)==0){i=d;return}K4(c[f+8>>2]|0);i=d;return}else{z=0;d=bS(-1,-1)|0;if((a[e]&1)==0){bg(d|0)}K4(c[f+8>>2]|0);bg(d|0)}}function An(a,b,c){a=a|0;b=b|0;c=c|0;z6(a,+h[c+40>>3],+h[c+48>>3],+h[c+56>>3],+h[c+64>>3]);return}function Ao(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+16|0;f=d|0;g=e+40|0;if((a[g]&1)==0){h=f;c[h>>2]=c[g>>2];c[h+4>>2]=c[g+4>>2];c[h+8>>2]=c[g+8>>2];j=a[h]|0;k=h}else{h=c[e+48>>2]|0;g=c[e+44>>2]|0;if(g>>>0>4294967279>>>0){DH(0)}if(g>>>0<11>>>0){e=g<<1&255;l=f;a[l]=e;m=f+1|0;n=e;o=l}else{l=g+16&-16;e=K2(l)|0;c[f+8>>2]=e;p=l|1;c[f>>2]=p;c[f+4>>2]=g;m=e;n=p&255;o=f}Ld(m|0,h|0,g)|0;a[m+g|0]=0;j=n;k=o}if((j&1)==0){q=f+1|0}else{q=c[f+8>>2]|0}z=0;as(544,b|0,q|0);if(!z){if((a[k]&1)==0){i=d;return}K4(c[f+8>>2]|0);i=d;return}else{z=0;d=bS(-1,-1)|0;if((a[k]&1)==0){bg(d|0)}K4(c[f+8>>2]|0);bg(d|0)}}function Ap(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+40|0;f=e|0;g=d+44|0;h=d+40|0;z8(a,(c[g>>2]|0)-(c[h>>2]|0)>>2,(c[d+52>>2]|0)!=1|0);d=c[h>>2]|0;j=(c[g>>2]|0)-d>>2;if((j|0)==0){i=e;return}g=a+12|0;a=b|0;b=f;k=0;l=d;while(1){d=(c[g>>2]|0)+(k*40|0)|0;m=c[l+(k<<2)>>2]|0;cZ[c[(c[m>>2]|0)+32>>2]&511](f,m|0,a);m=d;c[m>>2]=c[b>>2];c[m+4>>2]=c[b+4>>2];c[m+8>>2]=c[b+8>>2];c[m+12>>2]=c[b+12>>2];c[m+16>>2]=c[b+16>>2];c[m+20>>2]=c[b+20>>2];c[m+24>>2]=c[b+24>>2];c[m+28>>2]=c[b+28>>2];c[m+32>>2]=c[b+32>>2];c[m+36>>2]=c[b+36>>2];m=k+1|0;if(m>>>0>=j>>>0){break}k=m;l=c[h>>2]|0}i=e;return}function Aq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+40|0;f=e|0;g=d+44|0;h=d+40|0;z8(a,(c[g>>2]|0)-(c[h>>2]|0)>>2,0);d=c[h>>2]|0;j=(c[g>>2]|0)-d>>2;if((j|0)==0){i=e;return}g=a+12|0;a=b|0;b=f;k=0;l=d;while(1){d=(c[g>>2]|0)+(k*40|0)|0;m=c[l+(k<<2)>>2]|0;cZ[c[(c[m>>2]|0)+32>>2]&511](f,m,a);m=d;c[m>>2]=c[b>>2];c[m+4>>2]=c[b+4>>2];c[m+8>>2]=c[b+8>>2];c[m+12>>2]=c[b+12>>2];c[m+16>>2]=c[b+16>>2];c[m+20>>2]=c[b+20>>2];c[m+24>>2]=c[b+24>>2];c[m+28>>2]=c[b+28>>2];c[m+32>>2]=c[b+32>>2];c[m+36>>2]=c[b+36>>2];m=k+1|0;if(m>>>0>=j>>>0){break}k=m;l=c[h>>2]|0}i=e;return}
// EMSCRIPTEN_END_FUNCS
var cw=[Mo,Mo,FK,Mo,Fl,Mo,Mo,Mo];var cx=[Mp,Mp,pO,Mp];var cy=[Mq,Mq,tl,Mq,nY,Mq,KU,Mq,kO,Mq,k6,Mq,t$,Mq,yD,Mq,tm,Mq,xv,Mq,fa,Mq,KT,Mq,oc,Mq,g$,Mq,lg,Mq,KS,Mq,wj,Mq,iw,Mq,lr,Mq,uV,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq];var cz=[Mr,Mr,Im,Mr,e$,Mr,pM,Mr,Fd,Mr,Do,Mr,Db,Mr,Jh,Mr,k_,Mr,Ag,Mr,wM,Mr,E8,Mr,hh,Mr,kK,Mr,Ga,Mr,m6,Mr,kB,Mr,IE,Mr,Go,Mr,Ht,Mr,sy,Mr,w3,Mr,fw,Mr,li,Mr,KE,Mr,JF,Mr,HU,Mr,yj,Mr,Dt,Mr,Fe,Mr,on,Mr,JE,Mr,xn,Mr,wb,Mr,F9,Mr,my,Mr,wE,Mr,g2,Mr,G0,Mr,n9,Mr,wt,Mr,kc,Mr,Kh,Mr,Ki,Mr,DH,Mr,En,Mr,nl,Mr,Av,Mr,kq,Mr,vK,Mr,KB,Mr,mX,Mr,CR,Mr,E_,Mr,Bb,Mr,ef,Mr,v1,Mr,H_,Mr,er,Mr,Ic,Mr,C5,Mr,hg,Mr,kQ,Mr,wN,Mr,nE,Mr,d5,Mr,nh,Mr,xz,Mr,yb,Mr,EL,Mr,ES,Mr,xc,Mr,GC,Mr,KH,Mr,om,Mr,IU,Mr,g1,Mr,Is,Mr,hc,Mr,Dw,Mr,f8,Mr,E4,Mr,k7,Mr,eg,Mr,vU,Mr,EC,Mr,iH,Mr,ij,Mr,Au,Mr,e_,Mr,KK,Mr,gL,Mr,EF,Mr,E2,Mr,kL,Mr,JI,Mr,Ib,Mr,EK,Mr,Do,Mr,JG,Mr,x1,Mr,wa,Mr,fL,Mr,Hu,Mr,GP,Mr,Hi,Mr,D8,Mr,oa,Mr,KI,Mr,eD,Mr,I1,Mr,pC,Mr,E3,Mr,HP,Mr,kd,Mr,nZ,Mr,Iv,Mr,ya,Mr,yv,Mr,KA,Mr,G1,Mr,DI,Mr,kn,Mr,E7,Mr,eq,Mr,v2,Mr,HZ,Mr,rE,Mr,EQ,Mr,DF,Mr,f9,Mr,EA,Mr,k8,Mr,pz,Mr,vV,Mr,ge,Mr,D5,Mr,EP,Mr,Iy,Mr,ik,Mr,w2,Mr,HF,Mr,xS,Mr,Kg,Mr,wV,Mr,gB,Mr,CS,Mr,nw,Mr,KD,Mr,H6,Mr,DN,Mr,Ds,Mr,wu,Mr,Dv,Mr,Ah,Mr,FH,Mr,fK,Mr,vL,Mr,IT,Mr,gg,Mr,GQ,Mr,EY,Mr,xb,Mr,Ii,Mr,l2,Mr,n_,Mr,yu,Mr,eP,Mr,IG,Mr,iG,Mr,Dt,Mr,KG,Mr,E6,Mr,CZ,Mr,G3,Mr,pA,Mr,g_,Mr,dX,Mr,xI,Mr,iy,Mr,ER,Mr,K6,Mr,h8,Mr,qL,Mr,jP,Mr,vA,Mr,pB,Mr,fY,Mr,HE,Mr,x0,Mr,yl,Mr,nO,Mr,KF,Mr,eC,Mr,dO,Mr,m5,Mr,C4,Mr,px,Mr,IA,Mr,G7,Mr,Gn,Mr,wW,Mr,E9,Mr,CT,Mr,eF,Mr,H5,Mr,DZ,Mr,KB,Mr,KJ,Mr,qK,Mr,su,Mr,fl,Mr,fy,Mr,EX,Mr,Ih,Mr,wk,Mr,Ir,Mr,Dc,Mr,l1,Mr,sv,Mr,Em,Mr,EO,Mr,Bc,Mr,In,Mr,G4,Mr,xT,Mr,Kl,Mr,Fi,Mr,nv,Mr,D9,Mr,IF,Mr,C_,Mr,Dn,Mr,dY,Mr,kA,Mr,K7,Mr,Do,Mr,ID,Mr,FI,Mr,Kz,Mr,jj,Mr,nP,Mr,fv,Mr,fz,Mr,lh,Mr,lu,Mr,j0,Mr,Iw,Mr,ko,Mr,nF,Mr,pD,Mr,ym,Mr,xm,Mr,mz,Mr,G8,Mr,KZ,Mr,Hj,Mr,wD,Mr,gK,Mr,Ke,Mr,eE,Mr,kZ,Mr,Js,Mr,EB,Mr,E5,Mr,nm,Mr,xJ,Mr,EZ,Mr,gX,Mr,wl,Mr,ED,Mr,jQ,Mr,vB,Mr,Kk,Mr,fZ,Mr,kP,Mr,rD,Mr,HS,Mr,Kj,Mr,EM,Mr,eO,Mr,I9,Mr,JH,Mr,Fj,Mr,h7,Mr,d6,Mr,ng,Mr,lt,Mr,dP,Mr,fx,Mr,kr,Mr,xA,Mr,j1,Mr,mY,Mr,py,Mr,Lx,Mr,fA,Mr,DE,Mr,GB,Mr,fu,Mr,JD,Mr,HQ,Mr,EJ,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr];var cA=[Ms,Ms,sw,Ms,JR,Ms,mU,Ms,gM,Ms,CU,Ms,Af,Ms,gq,Ms,yc,Ms,sH,Ms,rf,Ms,C$,Ms,sC,Ms,gy,Ms,q6,Ms,eQ,Ms,oz,Ms,r_,Ms,sq,Ms,kC,Ms,ow,Ms,rB,Ms,qO,Ms,sr,Ms,n$,Ms,qM,Ms,sg,Ms,f_,Ms,sX,Ms,eh,Ms,s$,Ms,rw,Ms,eZ,Ms,sB,Ms,ot,Ms,HA,Ms,vz,Ms,rd,Ms,yn,Ms,qT,Ms,sb,Ms,sE,Ms,Iz,Ms,j2,Ms,rW,Ms,th,Ms,kp,Ms,C6,Ms,Dq,Ms,oL,Ms,qS,Ms,sF,Ms,pq,Ms,dC,Ms,jZ,Ms,rq,Ms,oP,Ms,HI,Ms,sJ,Ms,rS,Ms,tb,Ms,r3,Ms,oA,Ms,Hp,Ms,xK,Ms,qJ,Ms,oD,Ms,ke,Ms,fM,Ms,vW,Ms,oT,Ms,Ea,Ms,rn,Ms,r1,Ms,x2,Ms,sZ,Ms,sG,Ms,Iq,Ms,jL,Ms,wm,Ms,o$,Ms,oX,Ms,q_,Ms,rv,Ms,e7,Ms,rV,Ms,d7,Ms,oy,Ms,sa,Ms,Hc,Ms,rh,Ms,Kf,Ms,oE,Ms,tg,Ms,eA,Ms,q2,Ms,s7,Ms,dZ,Ms,vM,Ms,D7,Ms,sM,Ms,r2,Ms,ra,Ms,o4,Ms,HJ,Ms,nn,Ms,fG,Ms,qP,Ms,ov,Ms,kR,Ms,oW,Ms,oM,Ms,oQ,Ms,q3,Ms,oY,Ms,wv,Ms,fg,Ms,nQ,Ms,rJ,Ms,sn,Ms,It,Ms,oS,Ms,JO,Ms,ji,Ms,rG,Ms,sj,Ms,D1,Ms,JN,Ms,f7,Ms,q7,Ms,q8,Ms,Il,Ms,gd,Ms,Eo,Ms,Dd,Ms,h6,Ms,sf,Ms,gb,Ms,Ba,Ms,Hd,Ms,pr,Ms,e5,Ms,h9,Ms,sU,Ms,rC,Ms,rL,Ms,gI,Ms,HL,Ms,r9,Ms,rs,Ms,sP,Ms,ti,Ms,nf,Ms,rr,Ms,wO,Ms,qY,Ms,oU,Ms,sz,Ms,Ai,Ms,rY,Ms,so,Ms,fd,Ms,jh,Ms,sL,Ms,rP,Ms,xo,Ms,sA,Ms,rk,Ms,sc,Ms,JP,Ms,Hr,Ms,ha,Ms,s9,Ms,D6,Ms,te,Ms,ne,Ms,r8,Ms,op,Ms,Aa,Ms,qU,Ms,rx,Ms,D4,Ms,o3,Ms,Hx,Ms,rX,Ms,fo,Ms,e6,Ms,Hh,Ms,e3,Ms,rH,Ms,oK,Ms,pb,Ms,ob,Ms,o1,Ms,rI,Ms,r0,Ms,Hz,Ms,qQ,Ms,dD,Ms,wF,Ms,s8,Ms,mT,Ms,oI,Ms,r4,Ms,sD,Ms,wX,Ms,v3,Ms,HK,Ms,sN,Ms,rT,Ms,sQ,Ms,or,Ms,kJ,Ms,ri,Ms,oB,Ms,HD,Ms,yw,Ms,mZ,Ms,se,Ms,dF,Ms,es,Ms,s1,Ms,n7,Ms,rQ,Ms,oq,Ms,oO,Ms,sO,Ms,il,Ms,tf,Ms,mP,Ms,Dr,Ms,si,Ms,xB,Ms,re,Ms,sd,Ms,e4,Ms,Hb,Ms,s2,Ms,pc,Ms,lj,Ms,od,Ms,mR,Ms,lv,Ms,r6,Ms,sx,Ms,mA,Ms,os,Ms,q4,Ms,vy,Ms,JQ,Ms,rF,Ms,gc,Ms,D0,Ms,s3,Ms,sS,Ms,Hn,Ms,fU,Ms,ry,Ms,rR,Ms,Hm,Ms,eY,Ms,rO,Ms,gx,Ms,HC,Ms,sl,Ms,s5,Ms,r5,Ms,sR,Ms,mM,Ms,ga,Ms,vC,Ms,lq,Ms,z7,Ms,gm,Ms,oi,Ms,rm,Ms,g3,Ms,oC,Ms,sW,Ms,ls,Ms,kY,Ms,s0,Ms,eG,Ms,qV,Ms,ft,Ms,rc,Ms,o0,Ms,mK,Ms,n8,Ms,rz,Ms,f5,Ms,DT,Ms,Hy,Ms,sT,Ms,o5,Ms,ks,Ms,qW,Ms,oG,Ms,rM,Ms,Ho,Ms,ol,Ms,k9,Ms,oF,Ms,q$,Ms,k$,Ms,kM,Ms,DS,Ms,Dm,Ms,o2,Ms,km,Ms,nG,Ms,rt,Ms,sm,Ms,rN,Ms,sk,Ms,qR,Ms,j9,Ms,q0,Ms,nk,Ms,rl,Ms,rK,Ms,Hs,Ms,sV,Ms,He,Ms,lD,Ms,HN,Ms,rZ,Ms,wc,Ms,tj,Ms,s4,Ms,dQ,Ms,rp,Ms,oJ,Ms,oH,Ms,r$,Ms,w4,Ms,sI,Ms,xU,Ms,kl,Ms,qZ,Ms,HO,Ms,jR,Ms,q9,Ms,oN,Ms,qI,Ms,nx,Ms,m7,Ms,oh,Ms,pE,Ms,rU,Ms,ta,Ms,q5,Ms,ru,Ms,r7,Ms,JS,Ms,sY,Ms,rj,Ms,sh,Ms,sK,Ms,td,Ms,xd,Ms,tc,Ms,q1,Ms,EH,Ms,s6,Ms,Hg,Ms,e2,Ms,oo,Ms,ni,Ms,qX,Ms,rb,Ms,ou,Ms,sp,Ms,oe,Ms,oR,Ms,rg,Ms,eB,Ms,ox,Ms,s_,Ms,oV,Ms,ro,Ms,o_,Ms,jg,Ms,pn,Ms,oZ,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms,Ms];var cB=[Mt,Mt,p_,Mt,qr,Mt,p$,Mt,pW,Mt,p9,Mt,qH,Mt,qA,Mt,qh,Mt,p8,Mt,qk,Mt,pR,Mt,qd,Mt,qj,Mt,p3,Mt,qv,Mt,qa,Mt,qD,Mt,pV,Mt,p4,Mt,pP,Mt,p6,Mt,qo,Mt,qB,Mt,pX,Mt,qq,Mt,qe,Mt,qn,Mt,p1,Mt,qw,Mt,qE,Mt,qf,Mt,p5,Mt,p0,Mt,p2,Mt,qt,Mt,qi,Mt,qG,Mt,p7,Mt,qb,Mt,qF,Mt,qz,Mt,qp,Mt,ql,Mt,pS,Mt,qC,Mt,qm,Mt,qg,Mt,qx,Mt,pT,Mt,hi,Mt,pQ,Mt,qs,Mt,qu,Mt,qc,Mt,pU,Mt,qy,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt,Mt];var cC=[Mu,Mu,J4,Mu,JL,Mu,JW,Mu,uh,Mu,J2,Mu,C7,Mu,Ly,Mu,Hk,Mu,uk,Mu,GD,Mu,Df,Mu,dN,Mu,d4,Mu,Ev,Mu,lE,Mu,JM,Mu,dz,Mu,Lz,Mu,t2,Mu,um,Mu,JK,Mu,uj,Mu,CO,Mu,du,Mu,t1,Mu,zq,Mu,ui,Mu,dy,Mu,HG,Mu,JT,Mu,EE,Mu,E0,Mu,yN,Mu,uA,Mu,Es,Mu,Hq,Mu,J3,Mu,gT,Mu,up,Mu,Et,Mu,dr,Mu,GR,Mu,J0,Mu,K3,Mu,ux,Mu,tW,Mu,fV,Mu,dx,Mu,JY,Mu,KC,Mu,Du,Mu,HM,Mu,J$,Mu,Hl,Mu,Jo,Mu,lC,Mu,fW,Mu,LA,Mu,dM,Mu,Ku,Mu,tP,Mu,Hf,Mu,C1,Mu,ul,Mu,Jn,Mu,Je,Mu,jY,Mu,ds,Mu,tO,Mu,ih,Mu,gp,Mu,Hw,Mu,HH,Mu,uY,Mu,u$,Mu,JC,Mu,uL,Mu,Ei,Mu,Jz,Mu,eX,Mu,uy,Mu,dA,Mu,tX,Mu,EN,Mu,uv,Mu,tR,Mu,JJ,Mu,uB,Mu,Ee,Mu,I8,Mu,I5,Mu,fT,Mu,zi,Mu,ee,Mu,C0,Mu,vk,Mu,j$,Mu,vi,Mu,Ef,Mu,uC,Mu,pJ,Mu,nX,Mu,tF,Mu,De,Mu,yO,Mu,G9,Mu,JV,Mu,Ha,Mu,Hv,Mu,Jg,Mu,eN,Mu,Dp,Mu,JU,Mu,J1,Mu,tY,Mu,Eh,Mu,yK,Mu,I6,Mu,f6,Mu,ez,Mu,Ew,Mu,tQ,Mu,K2,Mu,iu,Mu,Jy,Mu,J_,Mu,JZ,Mu,pI,Mu,gU,Mu,u2,Mu,CV,Mu,uO,Mu,vm,Mu,LB,Mu,LC,Mu,j_,Mu,tT,Mu,n6,Mu,tn,Mu,tU,Mu,vj,Mu,zg,Mu,pw,Mu,eo,Mu,dB,Mu,zp,Mu,K8,Mu,ep,Mu,uZ,Mu,HB,Mu,JX,Mu,u_,Mu,Jd,Mu,uK,Mu,fD,Mu,LD,Mu,Jr,Mu,nN,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu,Mu];var cD=[Mv,Mv,g0,Mv];var cE=[Mw,Mw,pZ,Mw];var cF=[Mx,Mx,H0,Mx,HT,Mx,Mx,Mx];var cG=[My,My,z5,My];var cH=[Mz,Mz,of,Mz,Km,Mz,KM,Mz,IH,Mz,I$,Mz,dE,Mz,CW,Mz,DA,Mz,Ij,Mz,og,Mz,Fc,Mz,iV,Mz,IR,Mz,Ep,Mz,LE,Mz,oj,Mz,iW,Mz,IM,Mz,dn,Mz,dp,Mz,iI,Mz,IO,Mz,dm,Mz,IW,Mz,dl,Mz,Kq,Mz,Fh,Mz,Ek,Mz,Io,Mz,HW,Mz,KQ,Mz,IY,Mz,dq,Mz,LF,Mz,H2,Mz,EG,Mz,Kr,Mz,pF,Mz,DR,Mz,Dz,Mz,Eg,Mz,DU,Mz,KL,Mz,Eu,Mz,Eb,Mz,C8,Mz,Ey,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz];var cI=[MA,MA,H9,MA,If,MA,MA,MA];var cJ=[MB,MB,Gl,MB,Gi,MB,Gy,MB,Gw,MB,MB,MB,MB,MB,MB,MB];var cK=[MC,MC,G5,MC,vT,MC,G2,MC,DV,MC,H1,MC,HR,MC,HV,MC,gJ,MC,H$,MC,MC,MC,MC,MC,MC,MC,MC,MC,MC,MC,MC,MC];var cL=[MD,MD,kN,MD,KW,MD,fJ,MD,nu,MD,Eq,MD,uJ,MD,KX,MD,xR,MD,e9,MD,Ec,MD,fh,MD,x$,MD,fB,MD,fI,MD,KV,MD,pG,MD,fX,MD,vv,MD,mV,MD,Gu,MD,Gb,MD,Gg,MD,Gc,MD,lG,MD,Gq,MD,Gp,MD,Gz,MD,xk,MD,vJ,MD,Gm,MD,Ik,MD,Ip,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD,MD];var cM=[ME,ME,LG,ME,iB,ME,iD,ME,iC,ME,iE,ME,ME,ME,ME,ME];var cN=[MF,MF,J7,MF];var cO=[MG,MG,lF,MG];var cP=[MH,MH,EV,MH];var cQ=[MI,MI,GI,MI,nj,MI,GV,MI,FV,MI,FN,MI,FP,MI,FT,MI,FL,MI,FJ,MI,F$,MI,FZ,MI,FX,MI,GW,MI,Fw,MI,Fo,MI,Fq,MI,Fu,MI,FC,MI,FA,MI,Fy,MI,GU,MI,Ig,MI,DW,MI,Gr,MI,GG,MI,Gs,MI,Fm,MI,fr,MI,hf,MI,Fs,MI,GS,MI,Ia,MI,GE,MI,GH,MI,Gx,MI,F1,MI,Gh,MI,Gf,MI,FE,MI,Ge,MI,Gv,MI,Gt,MI,Gk,MI,kz,MI,FR,MI,GT,MI,Fk,MI,GF,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI,MI];var cR=[MJ,MJ,H7,MJ,Id,MJ,MJ,MJ];var cS=[MK,MK,GJ,MK,GX,MK,MK,MK];var cT=[ML,ML,Ie,ML,HX,ML,H3,ML,H8,ML,ML,ML,ML,ML,ML,ML];var cU=[MM,MM,xY,MM,wI,MM,kv,MM,ev,MM,dH,MM,xg,MM,lT,MM,lJ,MM,d1,MM,iS,MM,vD,MM,jC,MM,mw,MM,hL,MM,ht,MM,fO,MM,ld,MM,nr,MM,x3,MM,nS,MM,xs,MM,et,MM,lb,MM,v5,MM,f$,MM,dt,MM,hy,MM,ll,MM,gP,MM,jr,MM,nR,MM,yp,MM,mr,MM,LH,MM,nU,MM,h0,MM,j3,MM,xp,MM,ho,MM,dj,MM,hS,MM,i9,MM,iR,MM,mj,MM,gs,MM,jF,MM,lK,MM,i8,MM,mE,MM,jb,MM,wg,MM,hq,MM,ka,MM,ln,MM,hQ,MM,hP,MM,fj,MM,mc,MM,mh,MM,ml,MM,g4,MM,kT,MM,iJ,MM,vF,MM,nz,MM,mv,MM,l9,MM,gO,MM,x6,MM,h4,MM,xN,MM,fi,MM,j4,MM,v4,MM,hE,MM,d$,MM,l6,MM,lX,MM,xO,MM,hu,MM,xV,MM,LI,MM,wG,MM,v_,MM,dI,MM,IB,MM,lH,MM,l$,MM,fm,MM,hD,MM,hR,MM,xf,MM,dJ,MM,ny,MM,la,MM,lQ,MM,w8,MM,iK,MM,IC,MM,yx,MM,hn,MM,mt,MM,hk,MM,nK,MM,jA,MM,jw,MM,hX,MM,l0,MM,l3,MM,wQ,MM,D_,MM,mu,MM,yf,MM,eR,MM,wd,MM,xF,MM,l4,MM,vZ,MM,w_,MM,wR,MM,EW,MM,ew,MM,IZ,MM,ja,MM,Ex,MM,wy,MM,xE,MM,vP,MM,yA,MM,i0,MM,gh,MM,h2,MM,C9,MM,md,MM,mm,MM,nb,MM,hM,MM,mB,MM,ju,MM,hK,MM,eu,MM,hr,MM,eU,MM,fF,MM,xL,MM,hv,MM,eT,MM,mg,MM,jT,MM,jH,MM,mn,MM,me,MM,wP,MM,nB,MM,EU,MM,ET,MM,d8,MM,h1,MM,i1,MM,mq,MM,nJ,MM,n1,MM,jz,MM,pv,MM,dT,MM,hV,MM,nH,MM,hx,MM,wq,MM,jd,MM,xM,MM,DO,MM,vQ,MM,d0,MM,xD,MM,n2,MM,ye,MM,w5,MM,iQ,MM,mb,MM,lU,MM,hl,MM,jI,MM,g6,MM,el,MM,xh,MM,iN,MM,w7,MM,lW,MM,we,MM,vY,MM,h5,MM,kV,MM,lN,MM,fE,MM,wS,MM,im,MM,m_,MM,xX,MM,vE,MM,h_,MM,v7,MM,yg,MM,lV,MM,dU,MM,f1,MM,kg,MM,jq,MM,jt,MM,ek,MM,mC,MM,k3,MM,hp,MM,hO,MM,iM,MM,ms,MM,m0,MM,nq,MM,i4,MM,hB,MM,Dg,MM,eI,MM,i6,MM,jl,MM,hY,MM,g5,MM,xq,MM,vX,MM,lw,MM,w$,MM,wx,MM,hI,MM,k1,MM,hT,MM,jf,MM,kS,MM,mo,MM,jn,MM,iP,MM,ic,MM,h$,MM,gQ,MM,jo,MM,ma,MM,hW,MM,uM,MM,yr,MM,IL,MM,wo,MM,lI,MM,gj,MM,kG,MM,jE,MM,hz,MM,yd,MM,wZ,MM,na,MM,lc,MM,d_,MM,jp,MM,w6,MM,js,MM,dG,MM,hJ,MM,xr,MM,no,MM,DP,MM,nI,MM,lZ,MM,ww,MM,m1,MM,wz,MM,eb,MM,lR,MM,kh,MM,iL,MM,jJ,MM,mk,MM,m9,MM,np,MM,kf,MM,vG,MM,jk,MM,hH,MM,x5,MM,Ez,MM,f0,MM,jV,MM,t0,MM,dR,MM,ej,MM,eJ,MM,nA,MM,ku,MM,x4,MM,l7,MM,l5,MM,dS,MM,mD,MM,wn,MM,xC,MM,hA,MM,nT,MM,kF,MM,ea,MM,hG,MM,j5,MM,mf,MM,n0,MM,lm,MM,g7,MM,wJ,MM,lO,MM,jD,MM,Ej,MM,dw,MM,CX,MM,vN,MM,f2,MM,hm,MM,jU,MM,iT,MM,l8,MM,xW,MM,lS,MM,m8,MM,hN,MM,kD,MM,jK,MM,mi,MM,kE,MM,iq,MM,ip,MM,IV,MM,xe,MM,i5,MM,kt,MM,fP,MM,mp,MM,lz,MM,yo,MM,d9,MM,gN,MM,vO,MM,l_,MM,IP,MM,eS,MM,i7,MM,wp,MM,wH,MM,hj,MM,fQ,MM,iO,MM,C2,MM,gi,MM,yq,MM,ei,MM,eK,MM,yz,MM,lx,MM,hC,MM,h3,MM,io,MM,m$,MM,k2,MM,jv,MM,n3,MM,id,MM,jB,MM,jG,MM,wf,MM,hU,MM,ly,MM,pK,MM,hw,MM,kw,MM,jx,MM,IX,MM,hF,MM,lL,MM,ib,MM,ia,MM,hs,MM,lk,MM,k0,MM,jy,MM,fN,MM,je,MM,IN,MM,jS,MM,ki,MM,jm,MM,wY,MM,j6,MM,lP,MM,kU,MM,lM,MM,El,MM,pL,MM,v6,MM,fk,MM,jc,MM,yy,MM,eH,MM,hZ,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM,MM];var cV=[MN,MN,J5,MN,J6,MN,MN,MN];var cW=[MO,MO,CP,MO];var cX=[MP,MP,LJ,MP,Ix,MP,LK,MP,LL,MP,MP,MP,MP,MP,MP,MP];var cY=[MQ,MQ,IS,MQ,Fa,MQ,Ko,MQ,I7,MQ,Jf,MQ,JA,MQ,Jp,MQ,Ks,MQ,Jm,MQ,i3,MQ,Jx,MQ,Ff,MQ,I0,MQ,I4,MQ,Jc,MQ];var cZ=[MR,MR,DG,MR,k4,MR,eM,MR,ex,MR,Bx,MR,BP,MR,st,MR,nt,MR,gS,MR,wL,MR,o6,MR,ps,MR,Bh,MR,lp,MR,gn,MR,Ay,MR,BZ,MR,lo,MR,v8,MR,kI,MR,xP,MR,BH,MR,kb,MR,j8,MR,nd,MR,Bf,MR,wT,MR,iA,MR,A_,MR,Bm,MR,lf,MR,A$,MR,AB,MR,DX,MR,x8,MR,AR,MR,vH,MR,Bk,MR,v0,MR,w0,MR,DQ,MR,AO,MR,dL,MR,Bj,MR,DK,MR,H4,MR,AH,MR,A0,MR,AW,MR,Bl,MR,ie,MR,dV,MR,w1,MR,xQ,MR,is,MR,Ax,MR,nM,MR,Bu,MR,yt,MR,kW,MR,BS,MR,Ao,MR,xa,MR,BE,MR,Bd,MR,BG,MR,v$,MR,Bq,MR,Bv,MR,g9,MR,jO,MR,AT,MR,LN,MR,A2,MR,BI,MR,AX,MR,AM,MR,k5,MR,Ar,MR,AK,MR,lB,MR,ok,MR,Bt,MR,As,MR,Bs,MR,yC,MR,ff,MR,yB,MR,Bi,MR,AC,MR,A5,MR,wK,MR,le,MR,wh,MR,nV,MR,lA,MR,wA,MR,BU,MR,kk,MR,i2,MR,Bz,MR,x9,MR,AP,MR,BD,MR,xj,MR,ky,MR,kx,MR,lY,MR,At,MR,A6,MR,w9,MR,Bg,MR,AQ,MR,An,MR,BB,MR,n4,MR,xu,MR,AE,MR,mJ,MR,yi,MR,nC,MR,BL,MR,BJ,MR,AN,MR,jW,MR,DC,MR,kH,MR,xt,MR,kj,MR,Iu,MR,m3,MR,Bn,MR,kX,MR,ig,MR,nL,MR,ws,MR,A3,MR,rA,MR,jX,MR,BV,MR,xi,MR,AV,MR,B$,MR,wB,MR,xZ,MR,xl,MR,BF,MR,yh,MR,mG,MR,wi,MR,By,MR,BT,MR,BK,MR,vI,MR,ys,MR,ir,MR,A4,MR,eW,MR,fS,MR,n5,MR,A7,MR,Aq,MR,d3,MR,Bw,MR,BA,MR,f4,MR,pt,MR,BW,MR,Bo,MR,AJ,MR,A8,MR,em,MR,m2,MR,Dy,MR,ey,MR,AI,MR,AF,MR,BM,MR,Aw,MR,v9,MR,Am,MR,ed,MR,wU,MR,eL,MR,Az,MR,ix,MR,gf,MR,Be,MR,x_,MR,B_,MR,Bp,MR,BO,MR,dW,MR,mO,MR,gu,MR,g8,MR,wr,MR,en,MR,dK,MR,go,MR,Ap,MR,AZ,MR,gC,MR,ec,MR,A9,MR,mQ,MR,gV,MR,gR,MR,AD,MR,eV,MR,mF,MR,ut,MR,A1,MR,BN,MR,DD,MR,BR,MR,AA,MR,BX,MR,BQ,MR,AS,MR,AL,MR,x7,MR,AU,MR,BC,MR,Al,MR,AG,MR,nD,MR,xH,MR,pf,MR,BY,MR,Br,MR,fR,MR,m4,MR,nW,MR,f3,MR,dv,MR,E1,MR,j7,MR,vS,MR,vR,MR,tt,MR,nc,MR,AY,MR,xG,MR,d2,MR,ns,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR];var c_=[MS,MS,LO,MS,K9,MS,LP,MS,LQ,MS,LR,MS,MS,MS,MS,MS];var c$=[MT,MT,Jt,MT,I3,MT,Jv,MT,I2,MT,Ji,MT,Ja,MT,Jk,MT,Jb,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT,MT];var c0=[MU,MU,Ka,MU,Kc,MU,Kb,MU,IJ,MU,iY,MU,IK,MU,II,MU,Kp,MU,FG,MU,iZ,MU,J8,MU,EI,MU,Gj,MU,J9,MU,uz,MU,LM,MU,fe,MU,IQ,MU,Kn,MU,Kd,MU,I_,MU,i_,MU,uN,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU,MU];var c1=[MV,MV,wC,MV,iU,MV,mW,MV,gk,MV,xy,MV,Fg,MV,Er,MV,mH,MV,Fb,MV,fC,MV,KO,MV,KP,MV,Ed,MV,yk,MV,xx,MV,tr,MV,pH,MV,pe,MV,yE,MV,o8,MV,fc,MV,pu,MV,iz,MV,KN,MV,xw,MV,iF,MV,t3,MV,ii,MV,it,MV,MV,MV,MV,MV];return{_memcmp:Lf,_strlen:Lh,_free:KZ,_realloc:K$,_sass_compile_emscripten:iv,_memmove:Le,__GLOBAL__I_a:Di,_memset:Lg,_malloc:KY,_memcpy:Ld,_strcpy:Li,_calloc:K_,runPostSets:di,stackAlloc:c2,stackSave:c3,stackRestore:c4,setThrew:c5,setTempRet0:c8,setTempRet1:c9,setTempRet2:da,setTempRet3:db,setTempRet4:dc,setTempRet5:dd,setTempRet6:de,setTempRet7:df,setTempRet8:dg,setTempRet9:dh,dynCall_iiiiiiii:LS,dynCall_iiiiiiddi:LT,dynCall_viiiii:LU,dynCall_vi:LV,dynCall_vii:LW,dynCall_iiiiiii:LX,dynCall_ii:LY,dynCall_viiiddddi:LZ,dynCall_iddddiii:L_,dynCall_iiiiiiiiiiii:L$,dynCall_vidi:L0,dynCall_iiii:L1,dynCall_viiiiiiiiiiiiiii:L2,dynCall_viiiiid:L3,dynCall_viiiiiiii:L4,dynCall_viiiiii:L5,dynCall_ddd:L6,dynCall_fiii:L7,dynCall_viiidi:L8,dynCall_iid:L9,dynCall_viiiiiii:Ma,dynCall_viiiiiid:Mb,dynCall_viiiiiiiii:Mc,dynCall_viiiiiiiiii:Md,dynCall_iii:Me,dynCall_diii:Mf,dynCall_dii:Mg,dynCall_i:Mh,dynCall_iiiiii:Mi,dynCall_viii:Mj,dynCall_v:Mk,dynCall_iiiiiiiii:Ml,dynCall_iiiii:Mm,dynCall_viiii:Mn}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiiiiiii": invoke_iiiiiiii, "invoke_iiiiiiddi": invoke_iiiiiiddi, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_ii": invoke_ii, "invoke_viiiddddi": invoke_viiiddddi, "invoke_iddddiii": invoke_iddddiii, "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii, "invoke_vidi": invoke_vidi, "invoke_iiii": invoke_iiii, "invoke_viiiiiiiiiiiiiii": invoke_viiiiiiiiiiiiiii, "invoke_viiiiid": invoke_viiiiid, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_ddd": invoke_ddd, "invoke_fiii": invoke_fiii, "invoke_viiidi": invoke_viiidi, "invoke_iid": invoke_iid, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_iii": invoke_iii, "invoke_diii": invoke_diii, "invoke_dii": invoke_dii, "invoke_i": invoke_i, "invoke_iiiiii": invoke_iiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_fflush": _fflush, "_strtol": _strtol, "__isLeapYear": __isLeapYear, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_read": _read, "_ceil": _ceil, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_fmod": _fmod, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "__getFloat": __getFloat, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_asprintf": _asprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "_catgets": _catgets, "___cxa_is_number_type": ___cxa_is_number_type, "_getcwd": _getcwd, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_llvm_eh_exception": _llvm_eh_exception, "_toupper": _toupper, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "_isalnum": _isalnum, "_isalpha": _isalpha, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_strdup": _strdup, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__ZSt9terminatev": __ZSt9terminatev, "_isascii": _isascii, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_catclose": _catclose, "_llvm_lifetime_start": _llvm_lifetime_start, "__parseInt": __parseInt, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__addDays": __addDays, "_fabs": _fabs, "_floor": _floor, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "___cxa_bad_typeid": ___cxa_bad_typeid, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "_stat": _stat, "___cxa_pure_virtual": ___cxa_pure_virtual, "_vasprintf": _vasprintf, "_catopen": _catopen, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "___fsmu8": ___fsmu8, "__ZTIc": __ZTIc, "_stdout": _stdout, "__ZTVN10__cxxabiv119__pointer_type_infoE": __ZTVN10__cxxabiv119__pointer_type_infoE, "___dso_handle": ___dso_handle, "_stdin": _stdin, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _sass_compile_emscripten = Module["_sass_compile_emscripten"] = asm["_sass_compile_emscripten"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_iiiiiiddi = Module["dynCall_iiiiiiddi"] = asm["dynCall_iiiiiiddi"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiddddi = Module["dynCall_viiiddddi"] = asm["dynCall_viiiddddi"];
var dynCall_iddddiii = Module["dynCall_iddddiii"] = asm["dynCall_iddddiii"];
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiii"];
var dynCall_vidi = Module["dynCall_vidi"] = asm["dynCall_vidi"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = asm["dynCall_viiiiiiiiiiiiiii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_ddd = Module["dynCall_ddd"] = asm["dynCall_ddd"];
var dynCall_fiii = Module["dynCall_fiii"] = asm["dynCall_fiii"];
var dynCall_viiidi = Module["dynCall_viiidi"] = asm["dynCall_viiidi"];
var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_diii = Module["dynCall_diii"] = asm["dynCall_diii"];
var dynCall_dii = Module["dynCall_dii"] = asm["dynCall_dii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}