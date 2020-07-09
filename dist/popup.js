(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('path'), require('util')) :
  typeof define === 'function' && define.amd ? define(['path', 'util'], factory) :
  (global = global || self, factory(global.path, global.util));
}(this, (function (path, util) { 'use strict';

  path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
  util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;

  var bail_1 = bail;

  function bail(err) {
    if (err) {
      throw err
    }
  }

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  var isBuffer = function isBuffer (obj) {
    return obj != null && obj.constructor != null &&
      typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  };

  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var defineProperty = Object.defineProperty;
  var gOPD = Object.getOwnPropertyDescriptor;

  var isArray = function isArray(arr) {
  	if (typeof Array.isArray === 'function') {
  		return Array.isArray(arr);
  	}

  	return toStr.call(arr) === '[object Array]';
  };

  var isPlainObject = function isPlainObject(obj) {
  	if (!obj || toStr.call(obj) !== '[object Object]') {
  		return false;
  	}

  	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  	// Not own constructor property must be Object
  	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
  		return false;
  	}

  	// Own properties are enumerated firstly, so to speed up,
  	// if last one is own, then all properties are own.
  	var key;
  	for (key in obj) { /**/ }

  	return typeof key === 'undefined' || hasOwn.call(obj, key);
  };

  // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
  var setProperty = function setProperty(target, options) {
  	if (defineProperty && options.name === '__proto__') {
  		defineProperty(target, options.name, {
  			enumerable: true,
  			configurable: true,
  			value: options.newValue,
  			writable: true
  		});
  	} else {
  		target[options.name] = options.newValue;
  	}
  };

  // Return undefined instead of __proto__ if '__proto__' is not an own property
  var getProperty = function getProperty(obj, name) {
  	if (name === '__proto__') {
  		if (!hasOwn.call(obj, name)) {
  			return void 0;
  		} else if (gOPD) {
  			// In early versions of node, obj['__proto__'] is buggy when obj has
  			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
  			return gOPD(obj, name).value;
  		}
  	}

  	return obj[name];
  };

  var extend = function extend() {
  	var options, name, src, copy, copyIsArray, clone;
  	var target = arguments[0];
  	var i = 1;
  	var length = arguments.length;
  	var deep = false;

  	// Handle a deep copy situation
  	if (typeof target === 'boolean') {
  		deep = target;
  		target = arguments[1] || {};
  		// skip the boolean and the target
  		i = 2;
  	}
  	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
  		target = {};
  	}

  	for (; i < length; ++i) {
  		options = arguments[i];
  		// Only deal with non-null/undefined values
  		if (options != null) {
  			// Extend the base object
  			for (name in options) {
  				src = getProperty(target, name);
  				copy = getProperty(options, name);

  				// Prevent never-ending loop
  				if (target !== copy) {
  					// Recurse if we're merging plain objects or arrays
  					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
  						if (copyIsArray) {
  							copyIsArray = false;
  							clone = src && isArray(src) ? src : [];
  						} else {
  							clone = src && isPlainObject(src) ? src : {};
  						}

  						// Never move original objects, clone them
  						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

  					// Don't bring in undefined values
  					} else if (typeof copy !== 'undefined') {
  						setProperty(target, { name: name, newValue: copy });
  					}
  				}
  			}
  		}
  	}

  	// Return the modified object
  	return target;
  };

  var isPlainObj = value => {
  	if (Object.prototype.toString.call(value) !== '[object Object]') {
  		return false;
  	}

  	const prototype = Object.getPrototypeOf(value);
  	return prototype === null || prototype === Object.prototype;
  };

  var slice = [].slice;

  var wrap_1 = wrap;

  // Wrap `fn`.
  // Can be sync or async; return a promise, receive a completion handler, return
  // new values and errors.
  function wrap(fn, callback) {
    var invoked;

    return wrapped

    function wrapped() {
      var params = slice.call(arguments, 0);
      var callback = fn.length > params.length;
      var result;

      if (callback) {
        params.push(done);
      }

      try {
        result = fn.apply(null, params);
      } catch (error) {
        // Well, this is quite the pickle.
        // `fn` received a callback and invoked it (thus continuing the pipeline),
        // but later also threw an error.
        // We’re not about to restart the pipeline again, so the only thing left
        // to do is to throw the thing instead.
        if (callback && invoked) {
          throw error
        }

        return done(error)
      }

      if (!callback) {
        if (result && typeof result.then === 'function') {
          result.then(then, done);
        } else if (result instanceof Error) {
          done(result);
        } else {
          then(result);
        }
      }
    }

    // Invoke `next`, only once.
    function done() {
      if (!invoked) {
        invoked = true;

        callback.apply(null, arguments);
      }
    }

    // Invoke `done` with one value.
    // Tracks if an error is passed, too.
    function then(value) {
      done(null, value);
    }
  }

  var trough_1 = trough;

  trough.wrap = wrap_1;

  var slice$1 = [].slice;

  // Create new middleware.
  function trough() {
    var fns = [];
    var middleware = {};

    middleware.run = run;
    middleware.use = use;

    return middleware

    // Run `fns`.  Last argument must be a completion handler.
    function run() {
      var index = -1;
      var input = slice$1.call(arguments, 0, -1);
      var done = arguments[arguments.length - 1];

      if (typeof done !== 'function') {
        throw new Error('Expected function as last argument, not ' + done)
      }

      next.apply(null, [null].concat(input));

      // Run the next `fn`, if any.
      function next(err) {
        var fn = fns[++index];
        var params = slice$1.call(arguments, 0);
        var values = params.slice(1);
        var length = input.length;
        var pos = -1;

        if (err) {
          done(err);
          return
        }

        // Copy non-nully input into values.
        while (++pos < length) {
          if (values[pos] === null || values[pos] === undefined) {
            values[pos] = input[pos];
          }
        }

        input = values;

        // Next or done.
        if (fn) {
          wrap_1(fn, next).apply(null, input);
        } else {
          done.apply(null, [null].concat(input));
        }
      }
    }

    // Add `fn` to the list.
    function use(fn) {
      if (typeof fn !== 'function') {
        throw new Error('Expected `fn` to be a function, not ' + fn)
      }

      fns.push(fn);

      return middleware
    }
  }

  var own = {}.hasOwnProperty;

  var unistUtilStringifyPosition = stringify;

  function stringify(value) {
    // Nothing.
    if (!value || typeof value !== 'object') {
      return ''
    }

    // Node.
    if (own.call(value, 'position') || own.call(value, 'type')) {
      return position(value.position)
    }

    // Position.
    if (own.call(value, 'start') || own.call(value, 'end')) {
      return position(value)
    }

    // Point.
    if (own.call(value, 'line') || own.call(value, 'column')) {
      return point(value)
    }

    // ?
    return ''
  }

  function point(point) {
    if (!point || typeof point !== 'object') {
      point = {};
    }

    return index(point.line) + ':' + index(point.column)
  }

  function position(pos) {
    if (!pos || typeof pos !== 'object') {
      pos = {};
    }

    return point(pos.start) + '-' + point(pos.end)
  }

  function index(value) {
    return value && typeof value === 'number' ? value : 1
  }

  var vfileMessage = VMessage;

  // Inherit from `Error#`.
  function VMessagePrototype() {}
  VMessagePrototype.prototype = Error.prototype;
  VMessage.prototype = new VMessagePrototype();

  // Message properties.
  var proto = VMessage.prototype;

  proto.file = '';
  proto.name = '';
  proto.reason = '';
  proto.message = '';
  proto.stack = '';
  proto.fatal = null;
  proto.column = null;
  proto.line = null;

  // Construct a new VMessage.
  //
  // Note: We cannot invoke `Error` on the created context, as that adds readonly
  // `line` and `column` attributes on Safari 9, thus throwing and failing the
  // data.
  function VMessage(reason, position, origin) {
    var parts;
    var range;
    var location;

    if (typeof position === 'string') {
      origin = position;
      position = null;
    }

    parts = parseOrigin(origin);
    range = unistUtilStringifyPosition(position) || '1:1';

    location = {
      start: {line: null, column: null},
      end: {line: null, column: null}
    };

    // Node.
    if (position && position.position) {
      position = position.position;
    }

    if (position) {
      // Position.
      if (position.start) {
        location = position;
        position = position.start;
      } else {
        // Point.
        location.start = position;
      }
    }

    if (reason.stack) {
      this.stack = reason.stack;
      reason = reason.message;
    }

    this.message = reason;
    this.name = range;
    this.reason = reason;
    this.line = position ? position.line : null;
    this.column = position ? position.column : null;
    this.location = location;
    this.source = parts[0];
    this.ruleId = parts[1];
  }

  function parseOrigin(origin) {
    var result = [null, null];
    var index;

    if (typeof origin === 'string') {
      index = origin.indexOf(':');

      if (index === -1) {
        result[1] = origin;
      } else {
        result[0] = origin.slice(0, index);
        result[1] = origin.slice(index + 1);
      }
    }

    return result
  }

  var global$1 = (typeof global !== "undefined" ? global :
              typeof self !== "undefined" ? self :
              typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var process = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  function replaceExt(npath, ext) {
    if (typeof npath !== 'string') {
      return npath;
    }

    if (npath.length === 0) {
      return npath;
    }

    var nFileName = path.basename(npath, path.extname(npath)) + ext;
    return path.join(path.dirname(npath), nFileName);
  }

  var replaceExt_1 = replaceExt;

  var core = VFile;

  var own$1 = {}.hasOwnProperty;
  var proto$1 = VFile.prototype;

  // Order of setting (least specific to most), we need this because otherwise
  // `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
  // stem can be set.
  var order = ['history', 'path', 'basename', 'stem', 'extname', 'dirname'];

  proto$1.toString = toString;

  // Access full path (`~/index.min.js`).
  Object.defineProperty(proto$1, 'path', {get: getPath, set: setPath});

  // Access parent path (`~`).
  Object.defineProperty(proto$1, 'dirname', {get: getDirname, set: setDirname});

  // Access basename (`index.min.js`).
  Object.defineProperty(proto$1, 'basename', {get: getBasename, set: setBasename});

  // Access extname (`.js`).
  Object.defineProperty(proto$1, 'extname', {get: getExtname, set: setExtname});

  // Access stem (`index.min`).
  Object.defineProperty(proto$1, 'stem', {get: getStem, set: setStem});

  // Construct a new file.
  function VFile(options) {
    var prop;
    var index;
    var length;

    if (!options) {
      options = {};
    } else if (typeof options === 'string' || isBuffer(options)) {
      options = {contents: options};
    } else if ('message' in options && 'messages' in options) {
      return options
    }

    if (!(this instanceof VFile)) {
      return new VFile(options)
    }

    this.data = {};
    this.messages = [];
    this.history = [];
    this.cwd = process.cwd();

    // Set path related properties in the correct order.
    index = -1;
    length = order.length;

    while (++index < length) {
      prop = order[index];

      if (own$1.call(options, prop)) {
        this[prop] = options[prop];
      }
    }

    // Set non-path related properties.
    for (prop in options) {
      if (order.indexOf(prop) === -1) {
        this[prop] = options[prop];
      }
    }
  }

  function getPath() {
    return this.history[this.history.length - 1]
  }

  function setPath(path) {
    assertNonEmpty(path, 'path');

    if (path !== this.path) {
      this.history.push(path);
    }
  }

  function getDirname() {
    return typeof this.path === 'string' ? path.dirname(this.path) : undefined
  }

  function setDirname(dirname) {
    assertPath(this.path, 'dirname');
    this.path = path.join(dirname || '', this.basename);
  }

  function getBasename() {
    return typeof this.path === 'string' ? path.basename(this.path) : undefined
  }

  function setBasename(basename) {
    assertNonEmpty(basename, 'basename');
    assertPart(basename, 'basename');
    this.path = path.join(this.dirname || '', basename);
  }

  function getExtname() {
    return typeof this.path === 'string' ? path.extname(this.path) : undefined
  }

  function setExtname(extname) {
    var ext = extname || '';

    assertPart(ext, 'extname');
    assertPath(this.path, 'extname');

    if (ext) {
      if (ext.charAt(0) !== '.') {
        throw new Error('`extname` must start with `.`')
      }

      if (ext.indexOf('.', 1) !== -1) {
        throw new Error('`extname` cannot contain multiple dots')
      }
    }

    this.path = replaceExt_1(this.path, ext);
  }

  function getStem() {
    return typeof this.path === 'string'
      ? path.basename(this.path, this.extname)
      : undefined
  }

  function setStem(stem) {
    assertNonEmpty(stem, 'stem');
    assertPart(stem, 'stem');
    this.path = path.join(this.dirname || '', stem + (this.extname || ''));
  }

  // Get the value of the file.
  function toString(encoding) {
    var value = this.contents || '';
    return isBuffer(value) ? value.toString(encoding) : String(value)
  }

  // Assert that `part` is not a path (i.e., does not contain `path.sep`).
  function assertPart(part, name) {
    if (part.indexOf(path.sep) !== -1) {
      throw new Error(
        '`' + name + '` cannot be a path: did not expect `' + path.sep + '`'
      )
    }
  }

  // Assert that `part` is not empty.
  function assertNonEmpty(part, name) {
    if (!part) {
      throw new Error('`' + name + '` cannot be empty')
    }
  }

  // Assert `path` exists.
  function assertPath(path, name) {
    if (!path) {
      throw new Error('Setting `' + name + '` requires `path` to be set too')
    }
  }

  var vfile = core;

  var proto$2 = core.prototype;

  proto$2.message = message;
  proto$2.info = info;
  proto$2.fail = fail;

  // Create a message with `reason` at `position`.
  // When an error is passed in as `reason`, copies the stack.
  function message(reason, position, origin) {
    var filePath = this.path;
    var message = new vfileMessage(reason, position, origin);

    if (filePath) {
      message.name = filePath + ':' + message.name;
      message.file = filePath;
    }

    message.fatal = false;

    this.messages.push(message);

    return message
  }

  // Fail: creates a vmessage, associates it with the file, and throws it.
  function fail() {
    var message = this.message.apply(this, arguments);

    message.fatal = true;

    throw message
  }

  // Info: creates a vmessage, associates it with the file, and marks the fatality
  // as null.
  function info() {
    var message = this.message.apply(this, arguments);

    message.fatal = null;

    return message
  }

  // Expose a frozen processor.
  var unified_1 = unified().freeze();

  var slice$2 = [].slice;
  var own$2 = {}.hasOwnProperty;

  // Process pipeline.
  var pipeline = trough_1()
    .use(pipelineParse)
    .use(pipelineRun)
    .use(pipelineStringify);

  function pipelineParse(p, ctx) {
    ctx.tree = p.parse(ctx.file);
  }

  function pipelineRun(p, ctx, next) {
    p.run(ctx.tree, ctx.file, done);

    function done(err, tree, file) {
      if (err) {
        next(err);
      } else {
        ctx.tree = tree;
        ctx.file = file;
        next();
      }
    }
  }

  function pipelineStringify(p, ctx) {
    var result = p.stringify(ctx.tree, ctx.file);
    var file = ctx.file;

    if (result === undefined || result === null) ; else if (typeof result === 'string' || isBuffer(result)) {
      file.contents = result;
    } else {
      file.result = result;
    }
  }

  // Function to create the first processor.
  function unified() {
    var attachers = [];
    var transformers = trough_1();
    var namespace = {};
    var frozen = false;
    var freezeIndex = -1;

    // Data management.
    processor.data = data;

    // Lock.
    processor.freeze = freeze;

    // Plugins.
    processor.attachers = attachers;
    processor.use = use;

    // API.
    processor.parse = parse;
    processor.stringify = stringify;
    processor.run = run;
    processor.runSync = runSync;
    processor.process = process;
    processor.processSync = processSync;

    // Expose.
    return processor

    // Create a new processor based on the processor in the current scope.
    function processor() {
      var destination = unified();
      var length = attachers.length;
      var index = -1;

      while (++index < length) {
        destination.use.apply(null, attachers[index]);
      }

      destination.data(extend(true, {}, namespace));

      return destination
    }

    // Freeze: used to signal a processor that has finished configuration.
    //
    // For example, take unified itself: it’s frozen.
    // Plugins should not be added to it.
    // Rather, it should be extended, by invoking it, before modifying it.
    //
    // In essence, always invoke this when exporting a processor.
    function freeze() {
      var values;
      var plugin;
      var options;
      var transformer;

      if (frozen) {
        return processor
      }

      while (++freezeIndex < attachers.length) {
        values = attachers[freezeIndex];
        plugin = values[0];
        options = values[1];
        transformer = null;

        if (options === false) {
          continue
        }

        if (options === true) {
          values[1] = undefined;
        }

        transformer = plugin.apply(processor, values.slice(1));

        if (typeof transformer === 'function') {
          transformers.use(transformer);
        }
      }

      frozen = true;
      freezeIndex = Infinity;

      return processor
    }

    // Data management.
    // Getter / setter for processor-specific informtion.
    function data(key, value) {
      if (typeof key === 'string') {
        // Set `key`.
        if (arguments.length === 2) {
          assertUnfrozen('data', frozen);

          namespace[key] = value;

          return processor
        }

        // Get `key`.
        return (own$2.call(namespace, key) && namespace[key]) || null
      }

      // Set space.
      if (key) {
        assertUnfrozen('data', frozen);
        namespace = key;
        return processor
      }

      // Get space.
      return namespace
    }

    // Plugin management.
    //
    // Pass it:
    // *   an attacher and options,
    // *   a preset,
    // *   a list of presets, attachers, and arguments (list of attachers and
    //     options).
    function use(value) {
      var settings;

      assertUnfrozen('use', frozen);

      if (value === null || value === undefined) ; else if (typeof value === 'function') {
        addPlugin.apply(null, arguments);
      } else if (typeof value === 'object') {
        if ('length' in value) {
          addList(value);
        } else {
          addPreset(value);
        }
      } else {
        throw new Error('Expected usable value, not `' + value + '`')
      }

      if (settings) {
        namespace.settings = extend(namespace.settings || {}, settings);
      }

      return processor

      function addPreset(result) {
        addList(result.plugins);

        if (result.settings) {
          settings = extend(settings || {}, result.settings);
        }
      }

      function add(value) {
        if (typeof value === 'function') {
          addPlugin(value);
        } else if (typeof value === 'object') {
          if ('length' in value) {
            addPlugin.apply(null, value);
          } else {
            addPreset(value);
          }
        } else {
          throw new Error('Expected usable value, not `' + value + '`')
        }
      }

      function addList(plugins) {
        var length;
        var index;

        if (plugins === null || plugins === undefined) ; else if (typeof plugins === 'object' && 'length' in plugins) {
          length = plugins.length;
          index = -1;

          while (++index < length) {
            add(plugins[index]);
          }
        } else {
          throw new Error('Expected a list of plugins, not `' + plugins + '`')
        }
      }

      function addPlugin(plugin, value) {
        var entry = find(plugin);

        if (entry) {
          if (isPlainObj(entry[1]) && isPlainObj(value)) {
            value = extend(entry[1], value);
          }

          entry[1] = value;
        } else {
          attachers.push(slice$2.call(arguments));
        }
      }
    }

    function find(plugin) {
      var length = attachers.length;
      var index = -1;
      var entry;

      while (++index < length) {
        entry = attachers[index];

        if (entry[0] === plugin) {
          return entry
        }
      }
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor.
    function parse(doc) {
      var file = vfile(doc);
      var Parser;

      freeze();
      Parser = processor.Parser;
      assertParser('parse', Parser);

      if (newable(Parser, 'parse')) {
        return new Parser(String(file), file).parse()
      }

      return Parser(String(file), file) // eslint-disable-line new-cap
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), async.
    function run(node, file, cb) {
      assertNode(node);
      freeze();

      if (!cb && typeof file === 'function') {
        cb = file;
        file = null;
      }

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        transformers.run(node, vfile(file), done);

        function done(err, tree, file) {
          tree = tree || node;
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(tree);
          } else {
            cb(null, tree, file);
          }
        }
      }
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), sync.
    function runSync(node, file) {
      var complete = false;
      var result;

      run(node, file, done);

      assertDone('runSync', 'run', complete);

      return result

      function done(err, tree) {
        complete = true;
        bail_1(err);
        result = tree;
      }
    }

    // Stringify a unist node representation of a file (in string or vfile
    // representation) into a string using the `Compiler` on the processor.
    function stringify(node, doc) {
      var file = vfile(doc);
      var Compiler;

      freeze();
      Compiler = processor.Compiler;
      assertCompiler('stringify', Compiler);
      assertNode(node);

      if (newable(Compiler, 'compile')) {
        return new Compiler(node, file).compile()
      }

      return Compiler(node, file) // eslint-disable-line new-cap
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor, then run transforms on that node, and
    // compile the resulting node using the `Compiler` on the processor, and
    // store that result on the vfile.
    function process(doc, cb) {
      freeze();
      assertParser('process', processor.Parser);
      assertCompiler('process', processor.Compiler);

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        var file = vfile(doc);

        pipeline.run(processor, {file: file}, done);

        function done(err) {
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(file);
          } else {
            cb(null, file);
          }
        }
      }
    }

    // Process the given document (in string or vfile representation), sync.
    function processSync(doc) {
      var complete = false;
      var file;

      freeze();
      assertParser('processSync', processor.Parser);
      assertCompiler('processSync', processor.Compiler);
      file = vfile(doc);

      process(file, done);

      assertDone('processSync', 'process', complete);

      return file

      function done(err) {
        complete = true;
        bail_1(err);
      }
    }
  }

  // Check if `value` is a constructor.
  function newable(value, name) {
    return (
      typeof value === 'function' &&
      value.prototype &&
      // A function with keys in its prototype is probably a constructor.
      // Classes’ prototype methods are not enumerable, so we check if some value
      // exists in the prototype.
      (keys(value.prototype) || name in value.prototype)
    )
  }

  // Check if `value` is an object with keys.
  function keys(value) {
    var key;
    for (key in value) {
      return true
    }

    return false
  }

  // Assert a parser is available.
  function assertParser(name, Parser) {
    if (typeof Parser !== 'function') {
      throw new Error('Cannot `' + name + '` without `Parser`')
    }
  }

  // Assert a compiler is available.
  function assertCompiler(name, Compiler) {
    if (typeof Compiler !== 'function') {
      throw new Error('Cannot `' + name + '` without `Compiler`')
    }
  }

  // Assert the processor is not frozen.
  function assertUnfrozen(name, frozen) {
    if (frozen) {
      throw new Error(
        'Cannot invoke `' +
          name +
          '` on a frozen processor.\nCreate a new processor first, by invoking it: use `processor()` instead of `processor`.'
      )
    }
  }

  // Assert `node` is a unist node.
  function assertNode(node) {
    if (!node || typeof node.type !== 'string') {
      throw new Error('Expected node, got `' + node + '`')
    }
  }

  // Assert that `complete` is `true`.
  function assertDone(name, asyncName, complete) {
    if (!complete) {
      throw new Error(
        '`' + name + '` finished async. Use `' + asyncName + '` instead'
      )
    }
  }

  var immutable = extend$1;

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function extend$1() {
      var target = {};

      for (var i = 0; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
              if (hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
              }
          }
      }

      return target
  }

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
      }
  	}, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var inherits_browser = createCommonjsModule(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  });

  var inherits = createCommonjsModule(function (module) {
  try {
    var util$1 = util;
    /* istanbul ignore next */
    if (typeof util$1.inherits !== 'function') throw '';
    module.exports = util$1.inherits;
  } catch (e) {
    /* istanbul ignore next */
    module.exports = inherits_browser;
  }
  });

  var unherit_1 = unherit;

  // Create a custom constructor which can be modified without affecting the
  // original class.
  function unherit(Super) {
    var result;
    var key;
    var value;

    inherits(Of, Super);
    inherits(From, Of);

    // Clone values.
    result = Of.prototype;

    for (key in result) {
      value = result[key];

      if (value && typeof value === 'object') {
        result[key] = 'concat' in value ? value.concat() : immutable(value);
      }
    }

    return Of

    // Constructor accepting a single argument, which itself is an `arguments`
    // object.
    function From(parameters) {
      return Super.apply(this, parameters)
    }

    // Constructor accepting variadic arguments.
    function Of() {
      if (!(this instanceof Of)) {
        return new From(arguments)
      }

      return Super.apply(this, arguments)
    }
  }

  var stateToggle = factory;

  // Construct a state `toggler`: a function which inverses `property` in context
  // based on its current value.
  // The by `toggler` returned function restores that value.
  function factory(key, state, ctx) {
    return enter

    function enter() {
      var context = ctx || this;
      var current = context[key];

      context[key] = !state;

      return exit

      function exit() {
        context[key] = current;
      }
    }
  }

  var vfileLocation = factory$1;

  function factory$1(file) {
    var contents = indices(String(file));

    return {
      toPosition: offsetToPositionFactory(contents),
      toOffset: positionToOffsetFactory(contents)
    }
  }

  // Factory to get the line and column-based `position` for `offset` in the bound
  // indices.
  function offsetToPositionFactory(indices) {
    return offsetToPosition

    // Get the line and column-based `position` for `offset` in the bound indices.
    function offsetToPosition(offset) {
      var index = -1;
      var length = indices.length;

      if (offset < 0) {
        return {}
      }

      while (++index < length) {
        if (indices[index] > offset) {
          return {
            line: index + 1,
            column: offset - (indices[index - 1] || 0) + 1,
            offset: offset
          }
        }
      }

      return {}
    }
  }

  // Factory to get the `offset` for a line and column-based `position` in the
  // bound indices.
  function positionToOffsetFactory(indices) {
    return positionToOffset

    // Get the `offset` for a line and column-based `position` in the bound
    // indices.
    function positionToOffset(position) {
      var line = position && position.line;
      var column = position && position.column;

      if (!isNaN(line) && !isNaN(column) && line - 1 in indices) {
        return (indices[line - 2] || 0) + column - 1 || 0
      }

      return -1
    }
  }

  // Get indices of line-breaks in `value`.
  function indices(value) {
    var result = [];
    var index = value.indexOf('\n');

    while (index !== -1) {
      result.push(index + 1);
      index = value.indexOf('\n', index + 1);
    }

    result.push(value.length + 1);

    return result
  }

  var _unescape = factory$2;

  var backslash = '\\';

  // Factory to de-escape a value, based on a list at `key` in `ctx`.
  function factory$2(ctx, key) {
    return unescape

    // De-escape a string using the expression at `key` in `ctx`.
    function unescape(value) {
      var previous = 0;
      var index = value.indexOf(backslash);
      var escape = ctx[key];
      var queue = [];
      var character;

      while (index !== -1) {
        queue.push(value.slice(previous, index));
        previous = index + 1;
        character = value.charAt(previous);

        // If the following character is not a valid escape, add the slash.
        if (!character || escape.indexOf(character) === -1) {
          queue.push(backslash);
        }

        index = value.indexOf(backslash, previous + 1);
      }

      queue.push(value.slice(previous));

      return queue.join('')
    }
  }

  var AElig = "Æ";
  var AMP = "&";
  var Aacute = "Á";
  var Acirc = "Â";
  var Agrave = "À";
  var Aring = "Å";
  var Atilde = "Ã";
  var Auml = "Ä";
  var COPY = "©";
  var Ccedil = "Ç";
  var ETH = "Ð";
  var Eacute = "É";
  var Ecirc = "Ê";
  var Egrave = "È";
  var Euml = "Ë";
  var GT = ">";
  var Iacute = "Í";
  var Icirc = "Î";
  var Igrave = "Ì";
  var Iuml = "Ï";
  var LT = "<";
  var Ntilde = "Ñ";
  var Oacute = "Ó";
  var Ocirc = "Ô";
  var Ograve = "Ò";
  var Oslash = "Ø";
  var Otilde = "Õ";
  var Ouml = "Ö";
  var QUOT = "\"";
  var REG = "®";
  var THORN = "Þ";
  var Uacute = "Ú";
  var Ucirc = "Û";
  var Ugrave = "Ù";
  var Uuml = "Ü";
  var Yacute = "Ý";
  var aacute = "á";
  var acirc = "â";
  var acute = "´";
  var aelig = "æ";
  var agrave = "à";
  var amp = "&";
  var aring = "å";
  var atilde = "ã";
  var auml = "ä";
  var brvbar = "¦";
  var ccedil = "ç";
  var cedil = "¸";
  var cent = "¢";
  var copy = "©";
  var curren = "¤";
  var deg = "°";
  var divide = "÷";
  var eacute = "é";
  var ecirc = "ê";
  var egrave = "è";
  var eth = "ð";
  var euml = "ë";
  var frac12 = "½";
  var frac14 = "¼";
  var frac34 = "¾";
  var gt = ">";
  var iacute = "í";
  var icirc = "î";
  var iexcl = "¡";
  var igrave = "ì";
  var iquest = "¿";
  var iuml = "ï";
  var laquo = "«";
  var lt = "<";
  var macr = "¯";
  var micro = "µ";
  var middot = "·";
  var nbsp = " ";
  var not = "¬";
  var ntilde = "ñ";
  var oacute = "ó";
  var ocirc = "ô";
  var ograve = "ò";
  var ordf = "ª";
  var ordm = "º";
  var oslash = "ø";
  var otilde = "õ";
  var ouml = "ö";
  var para = "¶";
  var plusmn = "±";
  var pound = "£";
  var quot = "\"";
  var raquo = "»";
  var reg = "®";
  var sect = "§";
  var shy = "­";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var szlig = "ß";
  var thorn = "þ";
  var times = "×";
  var uacute = "ú";
  var ucirc = "û";
  var ugrave = "ù";
  var uml = "¨";
  var uuml = "ü";
  var yacute = "ý";
  var yen = "¥";
  var yuml = "ÿ";
  var index$1 = {
  	AElig: AElig,
  	AMP: AMP,
  	Aacute: Aacute,
  	Acirc: Acirc,
  	Agrave: Agrave,
  	Aring: Aring,
  	Atilde: Atilde,
  	Auml: Auml,
  	COPY: COPY,
  	Ccedil: Ccedil,
  	ETH: ETH,
  	Eacute: Eacute,
  	Ecirc: Ecirc,
  	Egrave: Egrave,
  	Euml: Euml,
  	GT: GT,
  	Iacute: Iacute,
  	Icirc: Icirc,
  	Igrave: Igrave,
  	Iuml: Iuml,
  	LT: LT,
  	Ntilde: Ntilde,
  	Oacute: Oacute,
  	Ocirc: Ocirc,
  	Ograve: Ograve,
  	Oslash: Oslash,
  	Otilde: Otilde,
  	Ouml: Ouml,
  	QUOT: QUOT,
  	REG: REG,
  	THORN: THORN,
  	Uacute: Uacute,
  	Ucirc: Ucirc,
  	Ugrave: Ugrave,
  	Uuml: Uuml,
  	Yacute: Yacute,
  	aacute: aacute,
  	acirc: acirc,
  	acute: acute,
  	aelig: aelig,
  	agrave: agrave,
  	amp: amp,
  	aring: aring,
  	atilde: atilde,
  	auml: auml,
  	brvbar: brvbar,
  	ccedil: ccedil,
  	cedil: cedil,
  	cent: cent,
  	copy: copy,
  	curren: curren,
  	deg: deg,
  	divide: divide,
  	eacute: eacute,
  	ecirc: ecirc,
  	egrave: egrave,
  	eth: eth,
  	euml: euml,
  	frac12: frac12,
  	frac14: frac14,
  	frac34: frac34,
  	gt: gt,
  	iacute: iacute,
  	icirc: icirc,
  	iexcl: iexcl,
  	igrave: igrave,
  	iquest: iquest,
  	iuml: iuml,
  	laquo: laquo,
  	lt: lt,
  	macr: macr,
  	micro: micro,
  	middot: middot,
  	nbsp: nbsp,
  	not: not,
  	ntilde: ntilde,
  	oacute: oacute,
  	ocirc: ocirc,
  	ograve: ograve,
  	ordf: ordf,
  	ordm: ordm,
  	oslash: oslash,
  	otilde: otilde,
  	ouml: ouml,
  	para: para,
  	plusmn: plusmn,
  	pound: pound,
  	quot: quot,
  	raquo: raquo,
  	reg: reg,
  	sect: sect,
  	shy: shy,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	szlig: szlig,
  	thorn: thorn,
  	times: times,
  	uacute: uacute,
  	ucirc: ucirc,
  	ugrave: ugrave,
  	uml: uml,
  	uuml: uuml,
  	yacute: yacute,
  	yen: yen,
  	yuml: yuml
  };

  var characterEntitiesLegacy = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AElig: AElig,
    AMP: AMP,
    Aacute: Aacute,
    Acirc: Acirc,
    Agrave: Agrave,
    Aring: Aring,
    Atilde: Atilde,
    Auml: Auml,
    COPY: COPY,
    Ccedil: Ccedil,
    ETH: ETH,
    Eacute: Eacute,
    Ecirc: Ecirc,
    Egrave: Egrave,
    Euml: Euml,
    GT: GT,
    Iacute: Iacute,
    Icirc: Icirc,
    Igrave: Igrave,
    Iuml: Iuml,
    LT: LT,
    Ntilde: Ntilde,
    Oacute: Oacute,
    Ocirc: Ocirc,
    Ograve: Ograve,
    Oslash: Oslash,
    Otilde: Otilde,
    Ouml: Ouml,
    QUOT: QUOT,
    REG: REG,
    THORN: THORN,
    Uacute: Uacute,
    Ucirc: Ucirc,
    Ugrave: Ugrave,
    Uuml: Uuml,
    Yacute: Yacute,
    aacute: aacute,
    acirc: acirc,
    acute: acute,
    aelig: aelig,
    agrave: agrave,
    amp: amp,
    aring: aring,
    atilde: atilde,
    auml: auml,
    brvbar: brvbar,
    ccedil: ccedil,
    cedil: cedil,
    cent: cent,
    copy: copy,
    curren: curren,
    deg: deg,
    divide: divide,
    eacute: eacute,
    ecirc: ecirc,
    egrave: egrave,
    eth: eth,
    euml: euml,
    frac12: frac12,
    frac14: frac14,
    frac34: frac34,
    gt: gt,
    iacute: iacute,
    icirc: icirc,
    iexcl: iexcl,
    igrave: igrave,
    iquest: iquest,
    iuml: iuml,
    laquo: laquo,
    lt: lt,
    macr: macr,
    micro: micro,
    middot: middot,
    nbsp: nbsp,
    not: not,
    ntilde: ntilde,
    oacute: oacute,
    ocirc: ocirc,
    ograve: ograve,
    ordf: ordf,
    ordm: ordm,
    oslash: oslash,
    otilde: otilde,
    ouml: ouml,
    para: para,
    plusmn: plusmn,
    pound: pound,
    quot: quot,
    raquo: raquo,
    reg: reg,
    sect: sect,
    shy: shy,
    sup1: sup1,
    sup2: sup2,
    sup3: sup3,
    szlig: szlig,
    thorn: thorn,
    times: times,
    uacute: uacute,
    ucirc: ucirc,
    ugrave: ugrave,
    uml: uml,
    uuml: uuml,
    yacute: yacute,
    yen: yen,
    yuml: yuml,
    'default': index$1
  });

  var index$2 = {
  	"0": "�",
  	"128": "€",
  	"130": "‚",
  	"131": "ƒ",
  	"132": "„",
  	"133": "…",
  	"134": "†",
  	"135": "‡",
  	"136": "ˆ",
  	"137": "‰",
  	"138": "Š",
  	"139": "‹",
  	"140": "Œ",
  	"142": "Ž",
  	"145": "‘",
  	"146": "’",
  	"147": "“",
  	"148": "”",
  	"149": "•",
  	"150": "–",
  	"151": "—",
  	"152": "˜",
  	"153": "™",
  	"154": "š",
  	"155": "›",
  	"156": "œ",
  	"158": "ž",
  	"159": "Ÿ"
  };

  var characterReferenceInvalid = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': index$2
  });

  var isDecimal = decimal;

  // Check if the given character code, or the character code at the first
  // character, is decimal.
  function decimal(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return code >= 48 && code <= 57 /* 0-9 */
  }

  var isHexadecimal = hexadecimal;

  // Check if the given character code, or the character code at the first
  // character, is hexadecimal.
  function hexadecimal(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return (
      (code >= 97 /* a */ && code <= 102) /* z */ ||
      (code >= 65 /* A */ && code <= 70) /* Z */ ||
      (code >= 48 /* A */ && code <= 57) /* Z */
    )
  }

  var isAlphabetical = alphabetical;

  // Check if the given character code, or the character code at the first
  // character, is alphabetical.
  function alphabetical(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return (
      (code >= 97 && code <= 122) /* a-z */ ||
      (code >= 65 && code <= 90) /* A-Z */
    )
  }

  var isAlphanumerical = alphanumerical;

  // Check if the given character code, or the character code at the first
  // character, is alphanumerical.
  function alphanumerical(character) {
    return isAlphabetical(character) || isDecimal(character)
  }

  var AEli = "Æ";
  var AElig$1 = "Æ";
  var AM = "&";
  var AMP$1 = "&";
  var Aacut = "Á";
  var Aacute$1 = "Á";
  var Abreve = "Ă";
  var Acir = "Â";
  var Acirc$1 = "Â";
  var Acy = "А";
  var Afr = "𝔄";
  var Agrav = "À";
  var Agrave$1 = "À";
  var Alpha = "Α";
  var Amacr = "Ā";
  var And = "⩓";
  var Aogon = "Ą";
  var Aopf = "𝔸";
  var ApplyFunction = "⁡";
  var Arin = "Å";
  var Aring$1 = "Å";
  var Ascr = "𝒜";
  var Assign = "≔";
  var Atild = "Ã";
  var Atilde$1 = "Ã";
  var Aum = "Ä";
  var Auml$1 = "Ä";
  var Backslash = "∖";
  var Barv = "⫧";
  var Barwed = "⌆";
  var Bcy = "Б";
  var Because = "∵";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var Bfr = "𝔅";
  var Bopf = "𝔹";
  var Breve = "˘";
  var Bscr = "ℬ";
  var Bumpeq = "≎";
  var CHcy = "Ч";
  var COP = "©";
  var COPY$1 = "©";
  var Cacute = "Ć";
  var Cap = "⋒";
  var CapitalDifferentialD = "ⅅ";
  var Cayleys = "ℭ";
  var Ccaron = "Č";
  var Ccedi = "Ç";
  var Ccedil$1 = "Ç";
  var Ccirc = "Ĉ";
  var Cconint = "∰";
  var Cdot = "Ċ";
  var Cedilla = "¸";
  var CenterDot = "·";
  var Cfr = "ℭ";
  var Chi = "Χ";
  var CircleDot = "⊙";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var Colon = "∷";
  var Colone = "⩴";
  var Congruent = "≡";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var Copf = "ℂ";
  var Coproduct = "∐";
  var CounterClockwiseContourIntegral = "∳";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var Cup = "⋓";
  var CupCap = "≍";
  var DD = "ⅅ";
  var DDotrahd = "⤑";
  var DJcy = "Ђ";
  var DScy = "Ѕ";
  var DZcy = "Џ";
  var Dagger = "‡";
  var Darr = "↡";
  var Dashv = "⫤";
  var Dcaron = "Ď";
  var Dcy = "Д";
  var Del = "∇";
  var Delta = "Δ";
  var Dfr = "𝔇";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var Diamond = "⋄";
  var DifferentialD = "ⅆ";
  var Dopf = "𝔻";
  var Dot = "¨";
  var DotDot = "⃜";
  var DotEqual = "≐";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrow = "↓";
  var DownArrowBar = "⤓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVector = "↽";
  var DownLeftVectorBar = "⥖";
  var DownRightTeeVector = "⥟";
  var DownRightVector = "⇁";
  var DownRightVectorBar = "⥗";
  var DownTee = "⊤";
  var DownTeeArrow = "↧";
  var Downarrow = "⇓";
  var Dscr = "𝒟";
  var Dstrok = "Đ";
  var ENG = "Ŋ";
  var ET = "Ð";
  var ETH$1 = "Ð";
  var Eacut = "É";
  var Eacute$1 = "É";
  var Ecaron = "Ě";
  var Ecir = "Ê";
  var Ecirc$1 = "Ê";
  var Ecy = "Э";
  var Edot = "Ė";
  var Efr = "𝔈";
  var Egrav = "È";
  var Egrave$1 = "È";
  var Element = "∈";
  var Emacr = "Ē";
  var EmptySmallSquare = "◻";
  var EmptyVerySmallSquare = "▫";
  var Eogon = "Ę";
  var Eopf = "𝔼";
  var Epsilon = "Ε";
  var Equal = "⩵";
  var EqualTilde = "≂";
  var Equilibrium = "⇌";
  var Escr = "ℰ";
  var Esim = "⩳";
  var Eta = "Η";
  var Eum = "Ë";
  var Euml$1 = "Ë";
  var Exists = "∃";
  var ExponentialE = "ⅇ";
  var Fcy = "Ф";
  var Ffr = "𝔉";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var Fopf = "𝔽";
  var ForAll = "∀";
  var Fouriertrf = "ℱ";
  var Fscr = "ℱ";
  var GJcy = "Ѓ";
  var G = ">";
  var GT$1 = ">";
  var Gamma = "Γ";
  var Gammad = "Ϝ";
  var Gbreve = "Ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var Gcy = "Г";
  var Gdot = "Ġ";
  var Gfr = "𝔊";
  var Gg = "⋙";
  var Gopf = "𝔾";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var Gt = "≫";
  var HARDcy = "Ъ";
  var Hacek = "ˇ";
  var Hat = "^";
  var Hcirc = "Ĥ";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var Hopf = "ℍ";
  var HorizontalLine = "─";
  var Hscr = "ℋ";
  var Hstrok = "Ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var IEcy = "Е";
  var IJlig = "Ĳ";
  var IOcy = "Ё";
  var Iacut = "Í";
  var Iacute$1 = "Í";
  var Icir = "Î";
  var Icirc$1 = "Î";
  var Icy = "И";
  var Idot = "İ";
  var Ifr = "ℑ";
  var Igrav = "Ì";
  var Igrave$1 = "Ì";
  var Im = "ℑ";
  var Imacr = "Ī";
  var ImaginaryI = "ⅈ";
  var Implies = "⇒";
  var Int = "∬";
  var Integral = "∫";
  var Intersection = "⋂";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var Iogon = "Į";
  var Iopf = "𝕀";
  var Iota = "Ι";
  var Iscr = "ℐ";
  var Itilde = "Ĩ";
  var Iukcy = "І";
  var Ium = "Ï";
  var Iuml$1 = "Ï";
  var Jcirc = "Ĵ";
  var Jcy = "Й";
  var Jfr = "𝔍";
  var Jopf = "𝕁";
  var Jscr = "𝒥";
  var Jsercy = "Ј";
  var Jukcy = "Є";
  var KHcy = "Х";
  var KJcy = "Ќ";
  var Kappa = "Κ";
  var Kcedil = "Ķ";
  var Kcy = "К";
  var Kfr = "𝔎";
  var Kopf = "𝕂";
  var Kscr = "𝒦";
  var LJcy = "Љ";
  var L = "<";
  var LT$1 = "<";
  var Lacute = "Ĺ";
  var Lambda = "Λ";
  var Lang = "⟪";
  var Laplacetrf = "ℒ";
  var Larr = "↞";
  var Lcaron = "Ľ";
  var Lcedil = "Ļ";
  var Lcy = "Л";
  var LeftAngleBracket = "⟨";
  var LeftArrow = "←";
  var LeftArrowBar = "⇤";
  var LeftArrowRightArrow = "⇆";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVector = "⇃";
  var LeftDownVectorBar = "⥙";
  var LeftFloor = "⌊";
  var LeftRightArrow = "↔";
  var LeftRightVector = "⥎";
  var LeftTee = "⊣";
  var LeftTeeArrow = "↤";
  var LeftTeeVector = "⥚";
  var LeftTriangle = "⊲";
  var LeftTriangleBar = "⧏";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVector = "↿";
  var LeftUpVectorBar = "⥘";
  var LeftVector = "↼";
  var LeftVectorBar = "⥒";
  var Leftarrow = "⇐";
  var Leftrightarrow = "⇔";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var LessLess = "⪡";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var Lfr = "𝔏";
  var Ll = "⋘";
  var Lleftarrow = "⇚";
  var Lmidot = "Ŀ";
  var LongLeftArrow = "⟵";
  var LongLeftRightArrow = "⟷";
  var LongRightArrow = "⟶";
  var Longleftarrow = "⟸";
  var Longleftrightarrow = "⟺";
  var Longrightarrow = "⟹";
  var Lopf = "𝕃";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var Lscr = "ℒ";
  var Lsh = "↰";
  var Lstrok = "Ł";
  var Lt = "≪";
  var Mcy = "М";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var MinusPlus = "∓";
  var Mopf = "𝕄";
  var Mscr = "ℳ";
  var Mu = "Μ";
  var NJcy = "Њ";
  var Nacute = "Ń";
  var Ncaron = "Ň";
  var Ncedil = "Ņ";
  var Ncy = "Н";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var Nfr = "𝔑";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var Nopf = "ℕ";
  var Not = "⫬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangle = "⋫";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var Nscr = "𝒩";
  var Ntild = "Ñ";
  var Ntilde$1 = "Ñ";
  var Nu = "Ν";
  var OElig = "Œ";
  var Oacut = "Ó";
  var Oacute$1 = "Ó";
  var Ocir = "Ô";
  var Ocirc$1 = "Ô";
  var Ocy = "О";
  var Odblac = "Ő";
  var Ofr = "𝔒";
  var Ograv = "Ò";
  var Ograve$1 = "Ò";
  var Omacr = "Ō";
  var Omega = "Ω";
  var Omicron = "Ο";
  var Oopf = "𝕆";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var Or = "⩔";
  var Oscr = "𝒪";
  var Oslas = "Ø";
  var Oslash$1 = "Ø";
  var Otild = "Õ";
  var Otilde$1 = "Õ";
  var Otimes = "⨷";
  var Oum = "Ö";
  var Ouml$1 = "Ö";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var PartialD = "∂";
  var Pcy = "П";
  var Pfr = "𝔓";
  var Phi = "Φ";
  var Pi = "Π";
  var PlusMinus = "±";
  var Poincareplane = "ℌ";
  var Popf = "ℙ";
  var Pr = "⪻";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var Prime = "″";
  var Product = "∏";
  var Proportion = "∷";
  var Proportional = "∝";
  var Pscr = "𝒫";
  var Psi = "Ψ";
  var QUO = "\"";
  var QUOT$1 = "\"";
  var Qfr = "𝔔";
  var Qopf = "ℚ";
  var Qscr = "𝒬";
  var RBarr = "⤐";
  var RE = "®";
  var REG$1 = "®";
  var Racute = "Ŕ";
  var Rang = "⟫";
  var Rarr = "↠";
  var Rarrtl = "⤖";
  var Rcaron = "Ř";
  var Rcedil = "Ŗ";
  var Rcy = "Р";
  var Re = "ℜ";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var Rfr = "ℜ";
  var Rho = "Ρ";
  var RightAngleBracket = "⟩";
  var RightArrow = "→";
  var RightArrowBar = "⇥";
  var RightArrowLeftArrow = "⇄";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVector = "⇂";
  var RightDownVectorBar = "⥕";
  var RightFloor = "⌋";
  var RightTee = "⊢";
  var RightTeeArrow = "↦";
  var RightTeeVector = "⥛";
  var RightTriangle = "⊳";
  var RightTriangleBar = "⧐";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVector = "↾";
  var RightUpVectorBar = "⥔";
  var RightVector = "⇀";
  var RightVectorBar = "⥓";
  var Rightarrow = "⇒";
  var Ropf = "ℝ";
  var RoundImplies = "⥰";
  var Rrightarrow = "⇛";
  var Rscr = "ℛ";
  var Rsh = "↱";
  var RuleDelayed = "⧴";
  var SHCHcy = "Щ";
  var SHcy = "Ш";
  var SOFTcy = "Ь";
  var Sacute = "Ś";
  var Sc = "⪼";
  var Scaron = "Š";
  var Scedil = "Ş";
  var Scirc = "Ŝ";
  var Scy = "С";
  var Sfr = "𝔖";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var Sigma = "Σ";
  var SmallCircle = "∘";
  var Sopf = "𝕊";
  var Sqrt = "√";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var Sscr = "𝒮";
  var Star = "⋆";
  var Sub = "⋐";
  var Subset = "⋐";
  var SubsetEqual = "⊆";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var SuchThat = "∋";
  var Sum = "∑";
  var Sup = "⋑";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var Supset = "⋑";
  var THOR = "Þ";
  var THORN$1 = "Þ";
  var TRADE = "™";
  var TSHcy = "Ћ";
  var TScy = "Ц";
  var Tab = "\t";
  var Tau = "Τ";
  var Tcaron = "Ť";
  var Tcedil = "Ţ";
  var Tcy = "Т";
  var Tfr = "𝔗";
  var Therefore = "∴";
  var Theta = "Θ";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var Topf = "𝕋";
  var TripleDot = "⃛";
  var Tscr = "𝒯";
  var Tstrok = "Ŧ";
  var Uacut = "Ú";
  var Uacute$1 = "Ú";
  var Uarr = "↟";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var Ubreve = "Ŭ";
  var Ucir = "Û";
  var Ucirc$1 = "Û";
  var Ucy = "У";
  var Udblac = "Ű";
  var Ufr = "𝔘";
  var Ugrav = "Ù";
  var Ugrave$1 = "Ù";
  var Umacr = "Ū";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var Uopf = "𝕌";
  var UpArrow = "↑";
  var UpArrowBar = "⤒";
  var UpArrowDownArrow = "⇅";
  var UpDownArrow = "↕";
  var UpEquilibrium = "⥮";
  var UpTee = "⊥";
  var UpTeeArrow = "↥";
  var Uparrow = "⇑";
  var Updownarrow = "⇕";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var Upsi = "ϒ";
  var Upsilon = "Υ";
  var Uring = "Ů";
  var Uscr = "𝒰";
  var Utilde = "Ũ";
  var Uum = "Ü";
  var Uuml$1 = "Ü";
  var VDash = "⊫";
  var Vbar = "⫫";
  var Vcy = "В";
  var Vdash = "⊩";
  var Vdashl = "⫦";
  var Vee = "⋁";
  var Verbar = "‖";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var Vopf = "𝕍";
  var Vscr = "𝒱";
  var Vvdash = "⊪";
  var Wcirc = "Ŵ";
  var Wedge = "⋀";
  var Wfr = "𝔚";
  var Wopf = "𝕎";
  var Wscr = "𝒲";
  var Xfr = "𝔛";
  var Xi = "Ξ";
  var Xopf = "𝕏";
  var Xscr = "𝒳";
  var YAcy = "Я";
  var YIcy = "Ї";
  var YUcy = "Ю";
  var Yacut = "Ý";
  var Yacute$1 = "Ý";
  var Ycirc = "Ŷ";
  var Ycy = "Ы";
  var Yfr = "𝔜";
  var Yopf = "𝕐";
  var Yscr = "𝒴";
  var Yuml = "Ÿ";
  var ZHcy = "Ж";
  var Zacute = "Ź";
  var Zcaron = "Ž";
  var Zcy = "З";
  var Zdot = "Ż";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var Zfr = "ℨ";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var aacut = "á";
  var aacute$1 = "á";
  var abreve = "ă";
  var ac = "∾";
  var acE = "∾̳";
  var acd = "∿";
  var acir = "â";
  var acirc$1 = "â";
  var acut = "´";
  var acute$1 = "´";
  var acy = "а";
  var aeli = "æ";
  var aelig$1 = "æ";
  var af = "⁡";
  var afr = "𝔞";
  var agrav = "à";
  var agrave$1 = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var alpha = "α";
  var amacr = "ā";
  var amalg = "⨿";
  var am = "&";
  var amp$1 = "&";
  var and = "∧";
  var andand = "⩕";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsd = "∡";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var aogon = "ą";
  var aopf = "𝕒";
  var ap = "≈";
  var apE = "⩰";
  var apacir = "⩯";
  var ape = "≊";
  var apid = "≋";
  var apos = "'";
  var approx = "≈";
  var approxeq = "≊";
  var arin = "å";
  var aring$1 = "å";
  var ascr = "𝒶";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var atild = "ã";
  var atilde$1 = "ã";
  var aum = "ä";
  var auml$1 = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var bNot = "⫭";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var barvee = "⊽";
  var barwed = "⌅";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bnot = "⌐";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxDL = "╗";
  var boxDR = "╔";
  var boxDl = "╖";
  var boxDr = "╓";
  var boxH = "═";
  var boxHD = "╦";
  var boxHU = "╩";
  var boxHd = "╤";
  var boxHu = "╧";
  var boxUL = "╝";
  var boxUR = "╚";
  var boxUl = "╜";
  var boxUr = "╙";
  var boxV = "║";
  var boxVH = "╬";
  var boxVL = "╣";
  var boxVR = "╠";
  var boxVh = "╫";
  var boxVl = "╢";
  var boxVr = "╟";
  var boxbox = "⧉";
  var boxdL = "╕";
  var boxdR = "╒";
  var boxdl = "┐";
  var boxdr = "┌";
  var boxh = "─";
  var boxhD = "╥";
  var boxhU = "╨";
  var boxhd = "┬";
  var boxhu = "┴";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxuL = "╛";
  var boxuR = "╘";
  var boxul = "┘";
  var boxur = "└";
  var boxv = "│";
  var boxvH = "╪";
  var boxvL = "╡";
  var boxvR = "╞";
  var boxvh = "┼";
  var boxvl = "┤";
  var boxvr = "├";
  var bprime = "‵";
  var breve = "˘";
  var brvba = "¦";
  var brvbar$1 = "¦";
  var bscr = "𝒷";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsol = "\\";
  var bsolb = "⧅";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var bumpeq = "≏";
  var cacute = "ć";
  var cap = "∩";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var capcup = "⩇";
  var capdot = "⩀";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var ccaps = "⩍";
  var ccaron = "č";
  var ccedi = "ç";
  var ccedil$1 = "ç";
  var ccirc = "ĉ";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var cdot = "ċ";
  var cedi = "¸";
  var cedil$1 = "¸";
  var cemptyv = "⦲";
  var cen = "¢";
  var cent$1 = "¢";
  var centerdot = "·";
  var cfr = "𝔠";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var chi = "χ";
  var cir = "○";
  var cirE = "⧃";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledR = "®";
  var circledS = "Ⓢ";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var conint = "∮";
  var copf = "𝕔";
  var coprod = "∐";
  var cop = "©";
  var copy$1 = "©";
  var copysr = "℗";
  var crarr = "↵";
  var cross = "✗";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cup = "∪";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curre = "¤";
  var curren$1 = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dArr = "⇓";
  var dHar = "⥥";
  var dagger = "†";
  var daleth = "ℸ";
  var darr = "↓";
  var dash = "‐";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var dcaron = "ď";
  var dcy = "д";
  var dd = "ⅆ";
  var ddagger = "‡";
  var ddarr = "⇊";
  var ddotseq = "⩷";
  var de = "°";
  var deg$1 = "°";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var dfr = "𝔡";
  var dharl = "⇃";
  var dharr = "⇂";
  var diam = "⋄";
  var diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divid = "÷";
  var divide$1 = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var dopf = "𝕕";
  var dot = "˙";
  var doteq = "≐";
  var doteqdot = "≑";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var downarrow = "↓";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var dscr = "𝒹";
  var dscy = "ѕ";
  var dsol = "⧶";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var eDDot = "⩷";
  var eDot = "≑";
  var eacut = "é";
  var eacute$1 = "é";
  var easter = "⩮";
  var ecaron = "ě";
  var ecir = "ê";
  var ecirc$1 = "ê";
  var ecolon = "≕";
  var ecy = "э";
  var edot = "ė";
  var ee = "ⅇ";
  var efDot = "≒";
  var efr = "𝔢";
  var eg = "⪚";
  var egrav = "è";
  var egrave$1 = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var emacr = "ē";
  var empty = "∅";
  var emptyset = "∅";
  var emptyv = "∅";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var eng = "ŋ";
  var ensp = " ";
  var eogon = "ę";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var equals = "=";
  var equest = "≟";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erDot = "≓";
  var erarr = "⥱";
  var escr = "ℯ";
  var esdot = "≐";
  var esim = "≂";
  var eta = "η";
  var et = "ð";
  var eth$1 = "ð";
  var eum = "ë";
  var euml$1 = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var fallingdotseq = "≒";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var fopf = "𝕗";
  var forall = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var fpartint = "⨍";
  var frac1 = "¼";
  var frac12$1 = "½";
  var frac13 = "⅓";
  var frac14$1 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac3 = "¾";
  var frac34$1 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var gE = "≧";
  var gEl = "⪌";
  var gacute = "ǵ";
  var gamma = "γ";
  var gammad = "ϝ";
  var gap = "⪆";
  var gbreve = "ğ";
  var gcirc = "ĝ";
  var gcy = "г";
  var gdot = "ġ";
  var ge = "≥";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var ges = "⩾";
  var gescc = "⪩";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var gfr = "𝔤";
  var gg = "≫";
  var ggg = "⋙";
  var gimel = "ℷ";
  var gjcy = "ѓ";
  var gl = "≷";
  var glE = "⪒";
  var gla = "⪥";
  var glj = "⪤";
  var gnE = "≩";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var gopf = "𝕘";
  var grave = "`";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var g = ">";
  var gt$1 = ">";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var hArr = "⇔";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var hardcy = "ъ";
  var harr = "↔";
  var harrcir = "⥈";
  var harrw = "↭";
  var hbar = "ℏ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var horbar = "―";
  var hscr = "𝒽";
  var hslash = "ℏ";
  var hstrok = "ħ";
  var hybull = "⁃";
  var hyphen = "‐";
  var iacut = "í";
  var iacute$1 = "í";
  var ic = "⁣";
  var icir = "î";
  var icirc$1 = "î";
  var icy = "и";
  var iecy = "е";
  var iexc = "¡";
  var iexcl$1 = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var igrav = "ì";
  var igrave$1 = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var ijlig = "ĳ";
  var imacr = "ī";
  var image = "ℑ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var imof = "⊷";
  var imped = "Ƶ";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var int = "∫";
  var intcal = "⊺";
  var integers = "ℤ";
  var intercal = "⊺";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var iocy = "ё";
  var iogon = "į";
  var iopf = "𝕚";
  var iota = "ι";
  var iprod = "⨼";
  var iques = "¿";
  var iquest$1 = "¿";
  var iscr = "𝒾";
  var isin = "∈";
  var isinE = "⋹";
  var isindot = "⋵";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var itilde = "ĩ";
  var iukcy = "і";
  var ium = "ï";
  var iuml$1 = "ï";
  var jcirc = "ĵ";
  var jcy = "й";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var jopf = "𝕛";
  var jscr = "𝒿";
  var jsercy = "ј";
  var jukcy = "є";
  var kappa = "κ";
  var kappav = "ϰ";
  var kcedil = "ķ";
  var kcy = "к";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var khcy = "х";
  var kjcy = "ќ";
  var kopf = "𝕜";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var lArr = "⇐";
  var lAtail = "⤛";
  var lBarr = "⤎";
  var lE = "≦";
  var lEg = "⪋";
  var lHar = "⥢";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var lambda = "λ";
  var lang = "⟨";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var laqu = "«";
  var laquo$1 = "«";
  var larr = "←";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var lat = "⪫";
  var latail = "⤙";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var lcaron = "ľ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var leftarrow = "←";
  var leftarrowtail = "↢";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var leftthreetimes = "⋋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var les = "⩽";
  var lescc = "⪨";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var lessgtr = "≶";
  var lesssim = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var ljcy = "љ";
  var ll = "≪";
  var llarr = "⇇";
  var llcorner = "⌞";
  var llhard = "⥫";
  var lltri = "◺";
  var lmidot = "ŀ";
  var lmoust = "⎰";
  var lmoustache = "⎰";
  var lnE = "≨";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var longleftrightarrow = "⟷";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var lstrok = "ł";
  var l = "<";
  var lt$1 = "<";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltrPar = "⦖";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var mDDot = "∺";
  var mac = "¯";
  var macr$1 = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var mcy = "м";
  var mdash = "—";
  var measuredangle = "∡";
  var mfr = "𝔪";
  var mho = "℧";
  var micr = "µ";
  var micro$1 = "µ";
  var mid = "∣";
  var midast = "*";
  var midcir = "⫰";
  var middo = "·";
  var middot$1 = "·";
  var minus = "−";
  var minusb = "⊟";
  var minusd = "∸";
  var minusdu = "⨪";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var mstpos = "∾";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nGg = "⋙̸";
  var nGt = "≫⃒";
  var nGtv = "≫̸";
  var nLeftarrow = "⇍";
  var nLeftrightarrow = "⇎";
  var nLl = "⋘̸";
  var nLt = "≪⃒";
  var nLtv = "≪̸";
  var nRightarrow = "⇏";
  var nVDash = "⊯";
  var nVdash = "⊮";
  var nabla = "∇";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natur = "♮";
  var natural = "♮";
  var naturals = "ℕ";
  var nbs = " ";
  var nbsp$1 = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var ncaron = "ň";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var ncy = "н";
  var ndash = "–";
  var ne = "≠";
  var neArr = "⇗";
  var nearhk = "⤤";
  var nearr = "↗";
  var nearrow = "↗";
  var nedot = "≐̸";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var nexist = "∄";
  var nexists = "∄";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var ngsim = "≵";
  var ngt = "≯";
  var ngtr = "≯";
  var nhArr = "⇎";
  var nharr = "↮";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var njcy = "њ";
  var nlArr = "⇍";
  var nlE = "≦̸";
  var nlarr = "↚";
  var nldr = "‥";
  var nle = "≰";
  var nleftarrow = "↚";
  var nleftrightarrow = "↮";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nlsim = "≴";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nmid = "∤";
  var nopf = "𝕟";
  var no = "¬";
  var not$1 = "¬";
  var notin = "∉";
  var notinE = "⋹̸";
  var notindot = "⋵̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var npar = "∦";
  var nparallel = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var npre = "⪯̸";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var nrArr = "⇏";
  var nrarr = "↛";
  var nrarrc = "⤳̸";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var ntild = "ñ";
  var ntilde$1 = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvDash = "⊭";
  var nvHarr = "⤄";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwArr = "⇖";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var oS = "Ⓢ";
  var oacut = "ó";
  var oacute$1 = "ó";
  var oast = "⊛";
  var ocir = "ô";
  var ocirc$1 = "ô";
  var ocy = "о";
  var odash = "⊝";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var oelig = "œ";
  var ofcir = "⦿";
  var ofr = "𝔬";
  var ogon = "˛";
  var ograv = "ò";
  var ograve$1 = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var omacr = "ō";
  var omega = "ω";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var oopf = "𝕠";
  var opar = "⦷";
  var operp = "⦹";
  var oplus = "⊕";
  var or = "∨";
  var orarr = "↻";
  var ord = "º";
  var order$1 = "ℴ";
  var orderof = "ℴ";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oscr = "ℴ";
  var oslas = "ø";
  var oslash$1 = "ø";
  var osol = "⊘";
  var otild = "õ";
  var otilde$1 = "õ";
  var otimes = "⊗";
  var otimesas = "⨶";
  var oum = "ö";
  var ouml$1 = "ö";
  var ovbar = "⌽";
  var par = "¶";
  var para$1 = "¶";
  var parallel = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var pfr = "𝔭";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plus = "+";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var plusm = "±";
  var plusmn$1 = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var pointint = "⨕";
  var popf = "𝕡";
  var poun = "£";
  var pound$1 = "£";
  var pr = "≺";
  var prE = "⪳";
  var prap = "⪷";
  var prcue = "≼";
  var pre = "⪯";
  var prec = "≺";
  var precapprox = "⪷";
  var preccurlyeq = "≼";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var precsim = "≾";
  var prime = "′";
  var primes = "ℙ";
  var prnE = "⪵";
  var prnap = "⪹";
  var prnsim = "⋨";
  var prod = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var pscr = "𝓅";
  var psi = "ψ";
  var puncsp = " ";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var qprime = "⁗";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quo = "\"";
  var quot$1 = "\"";
  var rAarr = "⇛";
  var rArr = "⇒";
  var rAtail = "⤜";
  var rBarr = "⤏";
  var rHar = "⥤";
  var race = "∽̱";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raqu = "»";
  var raquo$1 = "»";
  var rarr = "→";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var rcaron = "ř";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var rect = "▭";
  var re = "®";
  var reg$1 = "®";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var rho = "ρ";
  var rhov = "ϱ";
  var rightarrow = "→";
  var rightarrowtail = "↣";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var rightthreetimes = "⋌";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoust = "⎱";
  var rmoustache = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var roplus = "⨮";
  var rotimes = "⨵";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var rsaquo = "›";
  var rscr = "𝓇";
  var rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var ruluhar = "⥨";
  var rx = "℞";
  var sacute = "ś";
  var sbquo = "‚";
  var sc = "≻";
  var scE = "⪴";
  var scap = "⪸";
  var scaron = "š";
  var sccue = "≽";
  var sce = "⪰";
  var scedil = "ş";
  var scirc = "ŝ";
  var scnE = "⪶";
  var scnap = "⪺";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var scy = "с";
  var sdot = "⋅";
  var sdotb = "⊡";
  var sdote = "⩦";
  var seArr = "⇘";
  var searhk = "⤥";
  var searr = "↘";
  var searrow = "↘";
  var sec = "§";
  var sect$1 = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var shchcy = "щ";
  var shcy = "ш";
  var shortmid = "∣";
  var shortparallel = "∥";
  var sh = "­";
  var shy$1 = "­";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var softcy = "ь";
  var sol = "/";
  var solb = "⧄";
  var solbar = "⌿";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var squ = "□";
  var square = "□";
  var squarf = "▪";
  var squf = "▪";
  var srarr = "→";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var subE = "⫅";
  var subdot = "⪽";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succ = "≻";
  var succapprox = "⪸";
  var succcurlyeq = "≽";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var sum = "∑";
  var sung = "♪";
  var sup = "⊃";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var supE = "⫆";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supe = "⊇";
  var supedot = "⫄";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swArr = "⇙";
  var swarhk = "⤦";
  var swarr = "↙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szli = "ß";
  var szlig$1 = "ß";
  var target = "⌖";
  var tau = "τ";
  var tbrk = "⎴";
  var tcaron = "ť";
  var tcedil = "ţ";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var thor = "þ";
  var thorn$1 = "þ";
  var tilde = "˜";
  var time = "×";
  var times$1 = "×";
  var timesb = "⊠";
  var timesbar = "⨱";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var top = "⊤";
  var topbot = "⌶";
  var topcir = "⫱";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var tscr = "𝓉";
  var tscy = "ц";
  var tshcy = "ћ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var uArr = "⇑";
  var uHar = "⥣";
  var uacut = "ú";
  var uacute$1 = "ú";
  var uarr = "↑";
  var ubrcy = "ў";
  var ubreve = "ŭ";
  var ucir = "û";
  var ucirc$1 = "û";
  var ucy = "у";
  var udarr = "⇅";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var ufr = "𝔲";
  var ugrav = "ù";
  var ugrave$1 = "ù";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var umacr = "ū";
  var um = "¨";
  var uml$1 = "¨";
  var uogon = "ų";
  var uopf = "𝕦";
  var uparrow = "↑";
  var updownarrow = "↕";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var upsi = "υ";
  var upsih = "ϒ";
  var upsilon = "υ";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var uring = "ů";
  var urtri = "◹";
  var uscr = "𝓊";
  var utdot = "⋰";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var uum = "ü";
  var uuml$1 = "ü";
  var uwangle = "⦧";
  var vArr = "⇕";
  var vBar = "⫨";
  var vBarv = "⫩";
  var vDash = "⊨";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vcy = "в";
  var vdash = "⊢";
  var vee = "∨";
  var veebar = "⊻";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var vert = "|";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var vzigzag = "⦚";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var wedgeq = "≙";
  var weierp = "℘";
  var wfr = "𝔴";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var xfr = "𝔵";
  var xhArr = "⟺";
  var xharr = "⟷";
  var xi = "ξ";
  var xlArr = "⟸";
  var xlarr = "⟵";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrArr = "⟹";
  var xrarr = "⟶";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var yacut = "ý";
  var yacute$1 = "ý";
  var yacy = "я";
  var ycirc = "ŷ";
  var ycy = "ы";
  var ye = "¥";
  var yen$1 = "¥";
  var yfr = "𝔶";
  var yicy = "ї";
  var yopf = "𝕪";
  var yscr = "𝓎";
  var yucy = "ю";
  var yum = "ÿ";
  var yuml$1 = "ÿ";
  var zacute = "ź";
  var zcaron = "ž";
  var zcy = "з";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var index$3 = {
  	AEli: AEli,
  	AElig: AElig$1,
  	AM: AM,
  	AMP: AMP$1,
  	Aacut: Aacut,
  	Aacute: Aacute$1,
  	Abreve: Abreve,
  	Acir: Acir,
  	Acirc: Acirc$1,
  	Acy: Acy,
  	Afr: Afr,
  	Agrav: Agrav,
  	Agrave: Agrave$1,
  	Alpha: Alpha,
  	Amacr: Amacr,
  	And: And,
  	Aogon: Aogon,
  	Aopf: Aopf,
  	ApplyFunction: ApplyFunction,
  	Arin: Arin,
  	Aring: Aring$1,
  	Ascr: Ascr,
  	Assign: Assign,
  	Atild: Atild,
  	Atilde: Atilde$1,
  	Aum: Aum,
  	Auml: Auml$1,
  	Backslash: Backslash,
  	Barv: Barv,
  	Barwed: Barwed,
  	Bcy: Bcy,
  	Because: Because,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	Bfr: Bfr,
  	Bopf: Bopf,
  	Breve: Breve,
  	Bscr: Bscr,
  	Bumpeq: Bumpeq,
  	CHcy: CHcy,
  	COP: COP,
  	COPY: COPY$1,
  	Cacute: Cacute,
  	Cap: Cap,
  	CapitalDifferentialD: CapitalDifferentialD,
  	Cayleys: Cayleys,
  	Ccaron: Ccaron,
  	Ccedi: Ccedi,
  	Ccedil: Ccedil$1,
  	Ccirc: Ccirc,
  	Cconint: Cconint,
  	Cdot: Cdot,
  	Cedilla: Cedilla,
  	CenterDot: CenterDot,
  	Cfr: Cfr,
  	Chi: Chi,
  	CircleDot: CircleDot,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	Colon: Colon,
  	Colone: Colone,
  	Congruent: Congruent,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	Copf: Copf,
  	Coproduct: Coproduct,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	Cross: Cross,
  	Cscr: Cscr,
  	Cup: Cup,
  	CupCap: CupCap,
  	DD: DD,
  	DDotrahd: DDotrahd,
  	DJcy: DJcy,
  	DScy: DScy,
  	DZcy: DZcy,
  	Dagger: Dagger,
  	Darr: Darr,
  	Dashv: Dashv,
  	Dcaron: Dcaron,
  	Dcy: Dcy,
  	Del: Del,
  	Delta: Delta,
  	Dfr: Dfr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	Diamond: Diamond,
  	DifferentialD: DifferentialD,
  	Dopf: Dopf,
  	Dot: Dot,
  	DotDot: DotDot,
  	DotEqual: DotEqual,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrow: DownArrow,
  	DownArrowBar: DownArrowBar,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVector: DownLeftVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVector: DownRightVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownTee: DownTee,
  	DownTeeArrow: DownTeeArrow,
  	Downarrow: Downarrow,
  	Dscr: Dscr,
  	Dstrok: Dstrok,
  	ENG: ENG,
  	ET: ET,
  	ETH: ETH$1,
  	Eacut: Eacut,
  	Eacute: Eacute$1,
  	Ecaron: Ecaron,
  	Ecir: Ecir,
  	Ecirc: Ecirc$1,
  	Ecy: Ecy,
  	Edot: Edot,
  	Efr: Efr,
  	Egrav: Egrav,
  	Egrave: Egrave$1,
  	Element: Element,
  	Emacr: Emacr,
  	EmptySmallSquare: EmptySmallSquare,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	Eogon: Eogon,
  	Eopf: Eopf,
  	Epsilon: Epsilon,
  	Equal: Equal,
  	EqualTilde: EqualTilde,
  	Equilibrium: Equilibrium,
  	Escr: Escr,
  	Esim: Esim,
  	Eta: Eta,
  	Eum: Eum,
  	Euml: Euml$1,
  	Exists: Exists,
  	ExponentialE: ExponentialE,
  	Fcy: Fcy,
  	Ffr: Ffr,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	Fopf: Fopf,
  	ForAll: ForAll,
  	Fouriertrf: Fouriertrf,
  	Fscr: Fscr,
  	GJcy: GJcy,
  	G: G,
  	GT: GT$1,
  	Gamma: Gamma,
  	Gammad: Gammad,
  	Gbreve: Gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	Gcy: Gcy,
  	Gdot: Gdot,
  	Gfr: Gfr,
  	Gg: Gg,
  	Gopf: Gopf,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	Gt: Gt,
  	HARDcy: HARDcy,
  	Hacek: Hacek,
  	Hat: Hat,
  	Hcirc: Hcirc,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	Hopf: Hopf,
  	HorizontalLine: HorizontalLine,
  	Hscr: Hscr,
  	Hstrok: Hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	IEcy: IEcy,
  	IJlig: IJlig,
  	IOcy: IOcy,
  	Iacut: Iacut,
  	Iacute: Iacute$1,
  	Icir: Icir,
  	Icirc: Icirc$1,
  	Icy: Icy,
  	Idot: Idot,
  	Ifr: Ifr,
  	Igrav: Igrav,
  	Igrave: Igrave$1,
  	Im: Im,
  	Imacr: Imacr,
  	ImaginaryI: ImaginaryI,
  	Implies: Implies,
  	Int: Int,
  	Integral: Integral,
  	Intersection: Intersection,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	Iogon: Iogon,
  	Iopf: Iopf,
  	Iota: Iota,
  	Iscr: Iscr,
  	Itilde: Itilde,
  	Iukcy: Iukcy,
  	Ium: Ium,
  	Iuml: Iuml$1,
  	Jcirc: Jcirc,
  	Jcy: Jcy,
  	Jfr: Jfr,
  	Jopf: Jopf,
  	Jscr: Jscr,
  	Jsercy: Jsercy,
  	Jukcy: Jukcy,
  	KHcy: KHcy,
  	KJcy: KJcy,
  	Kappa: Kappa,
  	Kcedil: Kcedil,
  	Kcy: Kcy,
  	Kfr: Kfr,
  	Kopf: Kopf,
  	Kscr: Kscr,
  	LJcy: LJcy,
  	L: L,
  	LT: LT$1,
  	Lacute: Lacute,
  	Lambda: Lambda,
  	Lang: Lang,
  	Laplacetrf: Laplacetrf,
  	Larr: Larr,
  	Lcaron: Lcaron,
  	Lcedil: Lcedil,
  	Lcy: Lcy,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrow: LeftArrow,
  	LeftArrowBar: LeftArrowBar,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVector: LeftDownVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftFloor: LeftFloor,
  	LeftRightArrow: LeftRightArrow,
  	LeftRightVector: LeftRightVector,
  	LeftTee: LeftTee,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTeeVector: LeftTeeVector,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVector: LeftUpVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftVector: LeftVector,
  	LeftVectorBar: LeftVectorBar,
  	Leftarrow: Leftarrow,
  	Leftrightarrow: Leftrightarrow,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	LessLess: LessLess,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	Lfr: Lfr,
  	Ll: Ll,
  	Lleftarrow: Lleftarrow,
  	Lmidot: Lmidot,
  	LongLeftArrow: LongLeftArrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	LongRightArrow: LongRightArrow,
  	Longleftarrow: Longleftarrow,
  	Longleftrightarrow: Longleftrightarrow,
  	Longrightarrow: Longrightarrow,
  	Lopf: Lopf,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	Lscr: Lscr,
  	Lsh: Lsh,
  	Lstrok: Lstrok,
  	Lt: Lt,
  	"Map": "⤅",
  	Mcy: Mcy,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	MinusPlus: MinusPlus,
  	Mopf: Mopf,
  	Mscr: Mscr,
  	Mu: Mu,
  	NJcy: NJcy,
  	Nacute: Nacute,
  	Ncaron: Ncaron,
  	Ncedil: Ncedil,
  	Ncy: Ncy,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	Nfr: Nfr,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	Nopf: Nopf,
  	Not: Not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	Nscr: Nscr,
  	Ntild: Ntild,
  	Ntilde: Ntilde$1,
  	Nu: Nu,
  	OElig: OElig,
  	Oacut: Oacut,
  	Oacute: Oacute$1,
  	Ocir: Ocir,
  	Ocirc: Ocirc$1,
  	Ocy: Ocy,
  	Odblac: Odblac,
  	Ofr: Ofr,
  	Ograv: Ograv,
  	Ograve: Ograve$1,
  	Omacr: Omacr,
  	Omega: Omega,
  	Omicron: Omicron,
  	Oopf: Oopf,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	Or: Or,
  	Oscr: Oscr,
  	Oslas: Oslas,
  	Oslash: Oslash$1,
  	Otild: Otild,
  	Otilde: Otilde$1,
  	Otimes: Otimes,
  	Oum: Oum,
  	Ouml: Ouml$1,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	Pfr: Pfr,
  	Phi: Phi,
  	Pi: Pi,
  	PlusMinus: PlusMinus,
  	Poincareplane: Poincareplane,
  	Popf: Popf,
  	Pr: Pr,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	Prime: Prime,
  	Product: Product,
  	Proportion: Proportion,
  	Proportional: Proportional,
  	Pscr: Pscr,
  	Psi: Psi,
  	QUO: QUO,
  	QUOT: QUOT$1,
  	Qfr: Qfr,
  	Qopf: Qopf,
  	Qscr: Qscr,
  	RBarr: RBarr,
  	RE: RE,
  	REG: REG$1,
  	Racute: Racute,
  	Rang: Rang,
  	Rarr: Rarr,
  	Rarrtl: Rarrtl,
  	Rcaron: Rcaron,
  	Rcedil: Rcedil,
  	Rcy: Rcy,
  	Re: Re,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	Rfr: Rfr,
  	Rho: Rho,
  	RightAngleBracket: RightAngleBracket,
  	RightArrow: RightArrow,
  	RightArrowBar: RightArrowBar,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVector: RightDownVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightFloor: RightFloor,
  	RightTee: RightTee,
  	RightTeeArrow: RightTeeArrow,
  	RightTeeVector: RightTeeVector,
  	RightTriangle: RightTriangle,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVector: RightUpVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightVector: RightVector,
  	RightVectorBar: RightVectorBar,
  	Rightarrow: Rightarrow,
  	Ropf: Ropf,
  	RoundImplies: RoundImplies,
  	Rrightarrow: Rrightarrow,
  	Rscr: Rscr,
  	Rsh: Rsh,
  	RuleDelayed: RuleDelayed,
  	SHCHcy: SHCHcy,
  	SHcy: SHcy,
  	SOFTcy: SOFTcy,
  	Sacute: Sacute,
  	Sc: Sc,
  	Scaron: Scaron,
  	Scedil: Scedil,
  	Scirc: Scirc,
  	Scy: Scy,
  	Sfr: Sfr,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	Sigma: Sigma,
  	SmallCircle: SmallCircle,
  	Sopf: Sopf,
  	Sqrt: Sqrt,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	Sscr: Sscr,
  	Star: Star,
  	Sub: Sub,
  	Subset: Subset,
  	SubsetEqual: SubsetEqual,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	SuchThat: SuchThat,
  	Sum: Sum,
  	Sup: Sup,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	Supset: Supset,
  	THOR: THOR,
  	THORN: THORN$1,
  	TRADE: TRADE,
  	TSHcy: TSHcy,
  	TScy: TScy,
  	Tab: Tab,
  	Tau: Tau,
  	Tcaron: Tcaron,
  	Tcedil: Tcedil,
  	Tcy: Tcy,
  	Tfr: Tfr,
  	Therefore: Therefore,
  	Theta: Theta,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	Topf: Topf,
  	TripleDot: TripleDot,
  	Tscr: Tscr,
  	Tstrok: Tstrok,
  	Uacut: Uacut,
  	Uacute: Uacute$1,
  	Uarr: Uarr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	Ubreve: Ubreve,
  	Ucir: Ucir,
  	Ucirc: Ucirc$1,
  	Ucy: Ucy,
  	Udblac: Udblac,
  	Ufr: Ufr,
  	Ugrav: Ugrav,
  	Ugrave: Ugrave$1,
  	Umacr: Umacr,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	Uopf: Uopf,
  	UpArrow: UpArrow,
  	UpArrowBar: UpArrowBar,
  	UpArrowDownArrow: UpArrowDownArrow,
  	UpDownArrow: UpDownArrow,
  	UpEquilibrium: UpEquilibrium,
  	UpTee: UpTee,
  	UpTeeArrow: UpTeeArrow,
  	Uparrow: Uparrow,
  	Updownarrow: Updownarrow,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	Upsi: Upsi,
  	Upsilon: Upsilon,
  	Uring: Uring,
  	Uscr: Uscr,
  	Utilde: Utilde,
  	Uum: Uum,
  	Uuml: Uuml$1,
  	VDash: VDash,
  	Vbar: Vbar,
  	Vcy: Vcy,
  	Vdash: Vdash,
  	Vdashl: Vdashl,
  	Vee: Vee,
  	Verbar: Verbar,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	Vopf: Vopf,
  	Vscr: Vscr,
  	Vvdash: Vvdash,
  	Wcirc: Wcirc,
  	Wedge: Wedge,
  	Wfr: Wfr,
  	Wopf: Wopf,
  	Wscr: Wscr,
  	Xfr: Xfr,
  	Xi: Xi,
  	Xopf: Xopf,
  	Xscr: Xscr,
  	YAcy: YAcy,
  	YIcy: YIcy,
  	YUcy: YUcy,
  	Yacut: Yacut,
  	Yacute: Yacute$1,
  	Ycirc: Ycirc,
  	Ycy: Ycy,
  	Yfr: Yfr,
  	Yopf: Yopf,
  	Yscr: Yscr,
  	Yuml: Yuml,
  	ZHcy: ZHcy,
  	Zacute: Zacute,
  	Zcaron: Zcaron,
  	Zcy: Zcy,
  	Zdot: Zdot,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	Zfr: Zfr,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	aacut: aacut,
  	aacute: aacute$1,
  	abreve: abreve,
  	ac: ac,
  	acE: acE,
  	acd: acd,
  	acir: acir,
  	acirc: acirc$1,
  	acut: acut,
  	acute: acute$1,
  	acy: acy,
  	aeli: aeli,
  	aelig: aelig$1,
  	af: af,
  	afr: afr,
  	agrav: agrav,
  	agrave: agrave$1,
  	alefsym: alefsym,
  	aleph: aleph,
  	alpha: alpha,
  	amacr: amacr,
  	amalg: amalg,
  	am: am,
  	amp: amp$1,
  	and: and,
  	andand: andand,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsd: angmsd,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	aogon: aogon,
  	aopf: aopf,
  	ap: ap,
  	apE: apE,
  	apacir: apacir,
  	ape: ape,
  	apid: apid,
  	apos: apos,
  	approx: approx,
  	approxeq: approxeq,
  	arin: arin,
  	aring: aring$1,
  	ascr: ascr,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	atild: atild,
  	atilde: atilde$1,
  	aum: aum,
  	auml: auml$1,
  	awconint: awconint,
  	awint: awint,
  	bNot: bNot,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	barvee: barvee,
  	barwed: barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	beta: beta,
  	beth: beth,
  	between: between,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bnot: bnot,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxDL: boxDL,
  	boxDR: boxDR,
  	boxDl: boxDl,
  	boxDr: boxDr,
  	boxH: boxH,
  	boxHD: boxHD,
  	boxHU: boxHU,
  	boxHd: boxHd,
  	boxHu: boxHu,
  	boxUL: boxUL,
  	boxUR: boxUR,
  	boxUl: boxUl,
  	boxUr: boxUr,
  	boxV: boxV,
  	boxVH: boxVH,
  	boxVL: boxVL,
  	boxVR: boxVR,
  	boxVh: boxVh,
  	boxVl: boxVl,
  	boxVr: boxVr,
  	boxbox: boxbox,
  	boxdL: boxdL,
  	boxdR: boxdR,
  	boxdl: boxdl,
  	boxdr: boxdr,
  	boxh: boxh,
  	boxhD: boxhD,
  	boxhU: boxhU,
  	boxhd: boxhd,
  	boxhu: boxhu,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxuL: boxuL,
  	boxuR: boxuR,
  	boxul: boxul,
  	boxur: boxur,
  	boxv: boxv,
  	boxvH: boxvH,
  	boxvL: boxvL,
  	boxvR: boxvR,
  	boxvh: boxvh,
  	boxvl: boxvl,
  	boxvr: boxvr,
  	bprime: bprime,
  	breve: breve,
  	brvba: brvba,
  	brvbar: brvbar$1,
  	bscr: bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsol: bsol,
  	bsolb: bsolb,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	bumpeq: bumpeq,
  	cacute: cacute,
  	cap: cap,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	capcup: capcup,
  	capdot: capdot,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	ccaps: ccaps,
  	ccaron: ccaron,
  	ccedi: ccedi,
  	ccedil: ccedil$1,
  	ccirc: ccirc,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	cdot: cdot,
  	cedi: cedi,
  	cedil: cedil$1,
  	cemptyv: cemptyv,
  	cen: cen,
  	cent: cent$1,
  	centerdot: centerdot,
  	cfr: cfr,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	chi: chi,
  	cir: cir,
  	cirE: cirE,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledR: circledR,
  	circledS: circledS,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	conint: conint,
  	copf: copf,
  	coprod: coprod,
  	cop: cop,
  	copy: copy$1,
  	copysr: copysr,
  	crarr: crarr,
  	cross: cross,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cup: cup,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curre: curre,
  	curren: curren$1,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dArr: dArr,
  	dHar: dHar,
  	dagger: dagger,
  	daleth: daleth,
  	darr: darr,
  	dash: dash,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	dcaron: dcaron,
  	dcy: dcy,
  	dd: dd,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	ddotseq: ddotseq,
  	de: de,
  	deg: deg$1,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	dfr: dfr,
  	dharl: dharl,
  	dharr: dharr,
  	diam: diam,
  	diamond: diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divid: divid,
  	divide: divide$1,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	dopf: dopf,
  	dot: dot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	downarrow: downarrow,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	dscr: dscr,
  	dscy: dscy,
  	dsol: dsol,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	eDDot: eDDot,
  	eDot: eDot,
  	eacut: eacut,
  	eacute: eacute$1,
  	easter: easter,
  	ecaron: ecaron,
  	ecir: ecir,
  	ecirc: ecirc$1,
  	ecolon: ecolon,
  	ecy: ecy,
  	edot: edot,
  	ee: ee,
  	efDot: efDot,
  	efr: efr,
  	eg: eg,
  	egrav: egrav,
  	egrave: egrave$1,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	emptyv: emptyv,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	eng: eng,
  	ensp: ensp,
  	eogon: eogon,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	equals: equals,
  	equest: equest,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erDot: erDot,
  	erarr: erarr,
  	escr: escr,
  	esdot: esdot,
  	esim: esim,
  	eta: eta,
  	et: et,
  	eth: eth$1,
  	eum: eum,
  	euml: euml$1,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	fallingdotseq: fallingdotseq,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	ffr: ffr,
  	filig: filig,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	fopf: fopf,
  	forall: forall,
  	fork: fork,
  	forkv: forkv,
  	fpartint: fpartint,
  	frac1: frac1,
  	frac12: frac12$1,
  	frac13: frac13,
  	frac14: frac14$1,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac3: frac3,
  	frac34: frac34$1,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	gE: gE,
  	gEl: gEl,
  	gacute: gacute,
  	gamma: gamma,
  	gammad: gammad,
  	gap: gap,
  	gbreve: gbreve,
  	gcirc: gcirc,
  	gcy: gcy,
  	gdot: gdot,
  	ge: ge,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	ges: ges,
  	gescc: gescc,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	gfr: gfr,
  	gg: gg,
  	ggg: ggg,
  	gimel: gimel,
  	gjcy: gjcy,
  	gl: gl,
  	glE: glE,
  	gla: gla,
  	glj: glj,
  	gnE: gnE,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	gopf: gopf,
  	grave: grave,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	g: g,
  	gt: gt$1,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	hArr: hArr,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	hardcy: hardcy,
  	harr: harr,
  	harrcir: harrcir,
  	harrw: harrw,
  	hbar: hbar,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	horbar: horbar,
  	hscr: hscr,
  	hslash: hslash,
  	hstrok: hstrok,
  	hybull: hybull,
  	hyphen: hyphen,
  	iacut: iacut,
  	iacute: iacute$1,
  	ic: ic,
  	icir: icir,
  	icirc: icirc$1,
  	icy: icy,
  	iecy: iecy,
  	iexc: iexc,
  	iexcl: iexcl$1,
  	iff: iff,
  	ifr: ifr,
  	igrav: igrav,
  	igrave: igrave$1,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	ijlig: ijlig,
  	imacr: imacr,
  	image: image,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	imof: imof,
  	imped: imped,
  	"in": "∈",
  	incare: incare,
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	int: int,
  	intcal: intcal,
  	integers: integers,
  	intercal: intercal,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	iocy: iocy,
  	iogon: iogon,
  	iopf: iopf,
  	iota: iota,
  	iprod: iprod,
  	iques: iques,
  	iquest: iquest$1,
  	iscr: iscr,
  	isin: isin,
  	isinE: isinE,
  	isindot: isindot,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	itilde: itilde,
  	iukcy: iukcy,
  	ium: ium,
  	iuml: iuml$1,
  	jcirc: jcirc,
  	jcy: jcy,
  	jfr: jfr,
  	jmath: jmath,
  	jopf: jopf,
  	jscr: jscr,
  	jsercy: jsercy,
  	jukcy: jukcy,
  	kappa: kappa,
  	kappav: kappav,
  	kcedil: kcedil,
  	kcy: kcy,
  	kfr: kfr,
  	kgreen: kgreen,
  	khcy: khcy,
  	kjcy: kjcy,
  	kopf: kopf,
  	kscr: kscr,
  	lAarr: lAarr,
  	lArr: lArr,
  	lAtail: lAtail,
  	lBarr: lBarr,
  	lE: lE,
  	lEg: lEg,
  	lHar: lHar,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	lambda: lambda,
  	lang: lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	laqu: laqu,
  	laquo: laquo$1,
  	larr: larr,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	lat: lat,
  	latail: latail,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	lcaron: lcaron,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	leftarrow: leftarrow,
  	leftarrowtail: leftarrowtail,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	leftthreetimes: leftthreetimes,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	les: les,
  	lescc: lescc,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	lessgtr: lessgtr,
  	lesssim: lesssim,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	ljcy: ljcy,
  	ll: ll,
  	llarr: llarr,
  	llcorner: llcorner,
  	llhard: llhard,
  	lltri: lltri,
  	lmidot: lmidot,
  	lmoust: lmoust,
  	lmoustache: lmoustache,
  	lnE: lnE,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	lsh: lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	lstrok: lstrok,
  	l: l,
  	lt: lt$1,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltrPar: ltrPar,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	mDDot: mDDot,
  	mac: mac,
  	macr: macr$1,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	mcy: mcy,
  	mdash: mdash,
  	measuredangle: measuredangle,
  	mfr: mfr,
  	mho: mho,
  	micr: micr,
  	micro: micro$1,
  	mid: mid,
  	midast: midast,
  	midcir: midcir,
  	middo: middo,
  	middot: middot$1,
  	minus: minus,
  	minusb: minusb,
  	minusd: minusd,
  	minusdu: minusdu,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	mstpos: mstpos,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nGg: nGg,
  	nGt: nGt,
  	nGtv: nGtv,
  	nLeftarrow: nLeftarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nLl: nLl,
  	nLt: nLt,
  	nLtv: nLtv,
  	nRightarrow: nRightarrow,
  	nVDash: nVDash,
  	nVdash: nVdash,
  	nabla: nabla,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natur: natur,
  	natural: natural,
  	naturals: naturals,
  	nbs: nbs,
  	nbsp: nbsp$1,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	ncaron: ncaron,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	ncy: ncy,
  	ndash: ndash,
  	ne: ne,
  	neArr: neArr,
  	nearhk: nearhk,
  	nearr: nearr,
  	nearrow: nearrow,
  	nedot: nedot,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	nexist: nexist,
  	nexists: nexists,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	ngsim: ngsim,
  	ngt: ngt,
  	ngtr: ngtr,
  	nhArr: nhArr,
  	nharr: nharr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	njcy: njcy,
  	nlArr: nlArr,
  	nlE: nlE,
  	nlarr: nlarr,
  	nldr: nldr,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nlsim: nlsim,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nmid: nmid,
  	nopf: nopf,
  	no: no,
  	not: not$1,
  	notin: notin,
  	notinE: notinE,
  	notindot: notindot,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	npar: npar,
  	nparallel: nparallel,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	npre: npre,
  	nprec: nprec,
  	npreceq: npreceq,
  	nrArr: nrArr,
  	nrarr: nrarr,
  	nrarrc: nrarrc,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	ntild: ntild,
  	ntilde: ntilde$1,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvDash: nvDash,
  	nvHarr: nvHarr,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwArr: nwArr,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	oS: oS,
  	oacut: oacut,
  	oacute: oacute$1,
  	oast: oast,
  	ocir: ocir,
  	ocirc: ocirc$1,
  	ocy: ocy,
  	odash: odash,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	oelig: oelig,
  	ofcir: ofcir,
  	ofr: ofr,
  	ogon: ogon,
  	ograv: ograv,
  	ograve: ograve$1,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	omacr: omacr,
  	omega: omega,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	oopf: oopf,
  	opar: opar,
  	operp: operp,
  	oplus: oplus,
  	or: or,
  	orarr: orarr,
  	ord: ord,
  	order: order$1,
  	orderof: orderof,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oscr: oscr,
  	oslas: oslas,
  	oslash: oslash$1,
  	osol: osol,
  	otild: otild,
  	otilde: otilde$1,
  	otimes: otimes,
  	otimesas: otimesas,
  	oum: oum,
  	ouml: ouml$1,
  	ovbar: ovbar,
  	par: par,
  	para: para$1,
  	parallel: parallel,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	pfr: pfr,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plus: plus,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	plusm: plusm,
  	plusmn: plusmn$1,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	pointint: pointint,
  	popf: popf,
  	poun: poun,
  	pound: pound$1,
  	pr: pr,
  	prE: prE,
  	prap: prap,
  	prcue: prcue,
  	pre: pre,
  	prec: prec,
  	precapprox: precapprox,
  	preccurlyeq: preccurlyeq,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	precsim: precsim,
  	prime: prime,
  	primes: primes,
  	prnE: prnE,
  	prnap: prnap,
  	prnsim: prnsim,
  	prod: prod,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	pscr: pscr,
  	psi: psi,
  	puncsp: puncsp,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	qprime: qprime,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quo: quo,
  	quot: quot$1,
  	rAarr: rAarr,
  	rArr: rArr,
  	rAtail: rAtail,
  	rBarr: rBarr,
  	rHar: rHar,
  	race: race,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raqu: raqu,
  	raquo: raquo$1,
  	rarr: rarr,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	rcaron: rcaron,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	rect: rect,
  	re: re,
  	reg: reg$1,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	rho: rho,
  	rhov: rhov,
  	rightarrow: rightarrow,
  	rightarrowtail: rightarrowtail,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	rightthreetimes: rightthreetimes,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoust: rmoust,
  	rmoustache: rmoustache,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	rsh: rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	ruluhar: ruluhar,
  	rx: rx,
  	sacute: sacute,
  	sbquo: sbquo,
  	sc: sc,
  	scE: scE,
  	scap: scap,
  	scaron: scaron,
  	sccue: sccue,
  	sce: sce,
  	scedil: scedil,
  	scirc: scirc,
  	scnE: scnE,
  	scnap: scnap,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	scy: scy,
  	sdot: sdot,
  	sdotb: sdotb,
  	sdote: sdote,
  	seArr: seArr,
  	searhk: searhk,
  	searr: searr,
  	searrow: searrow,
  	sec: sec,
  	sect: sect$1,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	shchcy: shchcy,
  	shcy: shcy,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	sh: sh,
  	shy: shy$1,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	softcy: softcy,
  	sol: sol,
  	solb: solb,
  	solbar: solbar,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	squ: squ,
  	square: square,
  	squarf: squarf,
  	squf: squf,
  	srarr: srarr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	subE: subE,
  	subdot: subdot,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succ: succ,
  	succapprox: succapprox,
  	succcurlyeq: succcurlyeq,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	sum: sum,
  	sung: sung,
  	sup: sup,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	supE: supE,
  	supdot: supdot,
  	supdsub: supdsub,
  	supe: supe,
  	supedot: supedot,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swArr: swArr,
  	swarhk: swarhk,
  	swarr: swarr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szli: szli,
  	szlig: szlig$1,
  	target: target,
  	tau: tau,
  	tbrk: tbrk,
  	tcaron: tcaron,
  	tcedil: tcedil,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	thor: thor,
  	thorn: thorn$1,
  	tilde: tilde,
  	time: time,
  	times: times$1,
  	timesb: timesb,
  	timesbar: timesbar,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	top: top,
  	topbot: topbot,
  	topcir: topcir,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	tscr: tscr,
  	tscy: tscy,
  	tshcy: tshcy,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	uArr: uArr,
  	uHar: uHar,
  	uacut: uacut,
  	uacute: uacute$1,
  	uarr: uarr,
  	ubrcy: ubrcy,
  	ubreve: ubreve,
  	ucir: ucir,
  	ucirc: ucirc$1,
  	ucy: ucy,
  	udarr: udarr,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	ufr: ufr,
  	ugrav: ugrav,
  	ugrave: ugrave$1,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	umacr: umacr,
  	um: um,
  	uml: uml$1,
  	uogon: uogon,
  	uopf: uopf,
  	uparrow: uparrow,
  	updownarrow: updownarrow,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	upsi: upsi,
  	upsih: upsih,
  	upsilon: upsilon,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	uring: uring,
  	urtri: urtri,
  	uscr: uscr,
  	utdot: utdot,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	uum: uum,
  	uuml: uuml$1,
  	uwangle: uwangle,
  	vArr: vArr,
  	vBar: vBar,
  	vBarv: vBarv,
  	vDash: vDash,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vcy: vcy,
  	vdash: vdash,
  	vee: vee,
  	veebar: veebar,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	vert: vert,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	vzigzag: vzigzag,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	wfr: wfr,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	xfr: xfr,
  	xhArr: xhArr,
  	xharr: xharr,
  	xi: xi,
  	xlArr: xlArr,
  	xlarr: xlarr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrArr: xrArr,
  	xrarr: xrarr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	yacut: yacut,
  	yacute: yacute$1,
  	yacy: yacy,
  	ycirc: ycirc,
  	ycy: ycy,
  	ye: ye,
  	yen: yen$1,
  	yfr: yfr,
  	yicy: yicy,
  	yopf: yopf,
  	yscr: yscr,
  	yucy: yucy,
  	yum: yum,
  	yuml: yuml$1,
  	zacute: zacute,
  	zcaron: zcaron,
  	zcy: zcy,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	zeta: zeta,
  	zfr: zfr,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj
  };

  var characterEntities = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AEli: AEli,
    AElig: AElig$1,
    AM: AM,
    AMP: AMP$1,
    Aacut: Aacut,
    Aacute: Aacute$1,
    Abreve: Abreve,
    Acir: Acir,
    Acirc: Acirc$1,
    Acy: Acy,
    Afr: Afr,
    Agrav: Agrav,
    Agrave: Agrave$1,
    Alpha: Alpha,
    Amacr: Amacr,
    And: And,
    Aogon: Aogon,
    Aopf: Aopf,
    ApplyFunction: ApplyFunction,
    Arin: Arin,
    Aring: Aring$1,
    Ascr: Ascr,
    Assign: Assign,
    Atild: Atild,
    Atilde: Atilde$1,
    Aum: Aum,
    Auml: Auml$1,
    Backslash: Backslash,
    Barv: Barv,
    Barwed: Barwed,
    Bcy: Bcy,
    Because: Because,
    Bernoullis: Bernoullis,
    Beta: Beta,
    Bfr: Bfr,
    Bopf: Bopf,
    Breve: Breve,
    Bscr: Bscr,
    Bumpeq: Bumpeq,
    CHcy: CHcy,
    COP: COP,
    COPY: COPY$1,
    Cacute: Cacute,
    Cap: Cap,
    CapitalDifferentialD: CapitalDifferentialD,
    Cayleys: Cayleys,
    Ccaron: Ccaron,
    Ccedi: Ccedi,
    Ccedil: Ccedil$1,
    Ccirc: Ccirc,
    Cconint: Cconint,
    Cdot: Cdot,
    Cedilla: Cedilla,
    CenterDot: CenterDot,
    Cfr: Cfr,
    Chi: Chi,
    CircleDot: CircleDot,
    CircleMinus: CircleMinus,
    CirclePlus: CirclePlus,
    CircleTimes: CircleTimes,
    ClockwiseContourIntegral: ClockwiseContourIntegral,
    CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
    CloseCurlyQuote: CloseCurlyQuote,
    Colon: Colon,
    Colone: Colone,
    Congruent: Congruent,
    Conint: Conint,
    ContourIntegral: ContourIntegral,
    Copf: Copf,
    Coproduct: Coproduct,
    CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
    Cross: Cross,
    Cscr: Cscr,
    Cup: Cup,
    CupCap: CupCap,
    DD: DD,
    DDotrahd: DDotrahd,
    DJcy: DJcy,
    DScy: DScy,
    DZcy: DZcy,
    Dagger: Dagger,
    Darr: Darr,
    Dashv: Dashv,
    Dcaron: Dcaron,
    Dcy: Dcy,
    Del: Del,
    Delta: Delta,
    Dfr: Dfr,
    DiacriticalAcute: DiacriticalAcute,
    DiacriticalDot: DiacriticalDot,
    DiacriticalDoubleAcute: DiacriticalDoubleAcute,
    DiacriticalGrave: DiacriticalGrave,
    DiacriticalTilde: DiacriticalTilde,
    Diamond: Diamond,
    DifferentialD: DifferentialD,
    Dopf: Dopf,
    Dot: Dot,
    DotDot: DotDot,
    DotEqual: DotEqual,
    DoubleContourIntegral: DoubleContourIntegral,
    DoubleDot: DoubleDot,
    DoubleDownArrow: DoubleDownArrow,
    DoubleLeftArrow: DoubleLeftArrow,
    DoubleLeftRightArrow: DoubleLeftRightArrow,
    DoubleLeftTee: DoubleLeftTee,
    DoubleLongLeftArrow: DoubleLongLeftArrow,
    DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
    DoubleLongRightArrow: DoubleLongRightArrow,
    DoubleRightArrow: DoubleRightArrow,
    DoubleRightTee: DoubleRightTee,
    DoubleUpArrow: DoubleUpArrow,
    DoubleUpDownArrow: DoubleUpDownArrow,
    DoubleVerticalBar: DoubleVerticalBar,
    DownArrow: DownArrow,
    DownArrowBar: DownArrowBar,
    DownArrowUpArrow: DownArrowUpArrow,
    DownBreve: DownBreve,
    DownLeftRightVector: DownLeftRightVector,
    DownLeftTeeVector: DownLeftTeeVector,
    DownLeftVector: DownLeftVector,
    DownLeftVectorBar: DownLeftVectorBar,
    DownRightTeeVector: DownRightTeeVector,
    DownRightVector: DownRightVector,
    DownRightVectorBar: DownRightVectorBar,
    DownTee: DownTee,
    DownTeeArrow: DownTeeArrow,
    Downarrow: Downarrow,
    Dscr: Dscr,
    Dstrok: Dstrok,
    ENG: ENG,
    ET: ET,
    ETH: ETH$1,
    Eacut: Eacut,
    Eacute: Eacute$1,
    Ecaron: Ecaron,
    Ecir: Ecir,
    Ecirc: Ecirc$1,
    Ecy: Ecy,
    Edot: Edot,
    Efr: Efr,
    Egrav: Egrav,
    Egrave: Egrave$1,
    Element: Element,
    Emacr: Emacr,
    EmptySmallSquare: EmptySmallSquare,
    EmptyVerySmallSquare: EmptyVerySmallSquare,
    Eogon: Eogon,
    Eopf: Eopf,
    Epsilon: Epsilon,
    Equal: Equal,
    EqualTilde: EqualTilde,
    Equilibrium: Equilibrium,
    Escr: Escr,
    Esim: Esim,
    Eta: Eta,
    Eum: Eum,
    Euml: Euml$1,
    Exists: Exists,
    ExponentialE: ExponentialE,
    Fcy: Fcy,
    Ffr: Ffr,
    FilledSmallSquare: FilledSmallSquare,
    FilledVerySmallSquare: FilledVerySmallSquare,
    Fopf: Fopf,
    ForAll: ForAll,
    Fouriertrf: Fouriertrf,
    Fscr: Fscr,
    GJcy: GJcy,
    G: G,
    GT: GT$1,
    Gamma: Gamma,
    Gammad: Gammad,
    Gbreve: Gbreve,
    Gcedil: Gcedil,
    Gcirc: Gcirc,
    Gcy: Gcy,
    Gdot: Gdot,
    Gfr: Gfr,
    Gg: Gg,
    Gopf: Gopf,
    GreaterEqual: GreaterEqual,
    GreaterEqualLess: GreaterEqualLess,
    GreaterFullEqual: GreaterFullEqual,
    GreaterGreater: GreaterGreater,
    GreaterLess: GreaterLess,
    GreaterSlantEqual: GreaterSlantEqual,
    GreaterTilde: GreaterTilde,
    Gscr: Gscr,
    Gt: Gt,
    HARDcy: HARDcy,
    Hacek: Hacek,
    Hat: Hat,
    Hcirc: Hcirc,
    Hfr: Hfr,
    HilbertSpace: HilbertSpace,
    Hopf: Hopf,
    HorizontalLine: HorizontalLine,
    Hscr: Hscr,
    Hstrok: Hstrok,
    HumpDownHump: HumpDownHump,
    HumpEqual: HumpEqual,
    IEcy: IEcy,
    IJlig: IJlig,
    IOcy: IOcy,
    Iacut: Iacut,
    Iacute: Iacute$1,
    Icir: Icir,
    Icirc: Icirc$1,
    Icy: Icy,
    Idot: Idot,
    Ifr: Ifr,
    Igrav: Igrav,
    Igrave: Igrave$1,
    Im: Im,
    Imacr: Imacr,
    ImaginaryI: ImaginaryI,
    Implies: Implies,
    Int: Int,
    Integral: Integral,
    Intersection: Intersection,
    InvisibleComma: InvisibleComma,
    InvisibleTimes: InvisibleTimes,
    Iogon: Iogon,
    Iopf: Iopf,
    Iota: Iota,
    Iscr: Iscr,
    Itilde: Itilde,
    Iukcy: Iukcy,
    Ium: Ium,
    Iuml: Iuml$1,
    Jcirc: Jcirc,
    Jcy: Jcy,
    Jfr: Jfr,
    Jopf: Jopf,
    Jscr: Jscr,
    Jsercy: Jsercy,
    Jukcy: Jukcy,
    KHcy: KHcy,
    KJcy: KJcy,
    Kappa: Kappa,
    Kcedil: Kcedil,
    Kcy: Kcy,
    Kfr: Kfr,
    Kopf: Kopf,
    Kscr: Kscr,
    LJcy: LJcy,
    L: L,
    LT: LT$1,
    Lacute: Lacute,
    Lambda: Lambda,
    Lang: Lang,
    Laplacetrf: Laplacetrf,
    Larr: Larr,
    Lcaron: Lcaron,
    Lcedil: Lcedil,
    Lcy: Lcy,
    LeftAngleBracket: LeftAngleBracket,
    LeftArrow: LeftArrow,
    LeftArrowBar: LeftArrowBar,
    LeftArrowRightArrow: LeftArrowRightArrow,
    LeftCeiling: LeftCeiling,
    LeftDoubleBracket: LeftDoubleBracket,
    LeftDownTeeVector: LeftDownTeeVector,
    LeftDownVector: LeftDownVector,
    LeftDownVectorBar: LeftDownVectorBar,
    LeftFloor: LeftFloor,
    LeftRightArrow: LeftRightArrow,
    LeftRightVector: LeftRightVector,
    LeftTee: LeftTee,
    LeftTeeArrow: LeftTeeArrow,
    LeftTeeVector: LeftTeeVector,
    LeftTriangle: LeftTriangle,
    LeftTriangleBar: LeftTriangleBar,
    LeftTriangleEqual: LeftTriangleEqual,
    LeftUpDownVector: LeftUpDownVector,
    LeftUpTeeVector: LeftUpTeeVector,
    LeftUpVector: LeftUpVector,
    LeftUpVectorBar: LeftUpVectorBar,
    LeftVector: LeftVector,
    LeftVectorBar: LeftVectorBar,
    Leftarrow: Leftarrow,
    Leftrightarrow: Leftrightarrow,
    LessEqualGreater: LessEqualGreater,
    LessFullEqual: LessFullEqual,
    LessGreater: LessGreater,
    LessLess: LessLess,
    LessSlantEqual: LessSlantEqual,
    LessTilde: LessTilde,
    Lfr: Lfr,
    Ll: Ll,
    Lleftarrow: Lleftarrow,
    Lmidot: Lmidot,
    LongLeftArrow: LongLeftArrow,
    LongLeftRightArrow: LongLeftRightArrow,
    LongRightArrow: LongRightArrow,
    Longleftarrow: Longleftarrow,
    Longleftrightarrow: Longleftrightarrow,
    Longrightarrow: Longrightarrow,
    Lopf: Lopf,
    LowerLeftArrow: LowerLeftArrow,
    LowerRightArrow: LowerRightArrow,
    Lscr: Lscr,
    Lsh: Lsh,
    Lstrok: Lstrok,
    Lt: Lt,
    Mcy: Mcy,
    MediumSpace: MediumSpace,
    Mellintrf: Mellintrf,
    Mfr: Mfr,
    MinusPlus: MinusPlus,
    Mopf: Mopf,
    Mscr: Mscr,
    Mu: Mu,
    NJcy: NJcy,
    Nacute: Nacute,
    Ncaron: Ncaron,
    Ncedil: Ncedil,
    Ncy: Ncy,
    NegativeMediumSpace: NegativeMediumSpace,
    NegativeThickSpace: NegativeThickSpace,
    NegativeThinSpace: NegativeThinSpace,
    NegativeVeryThinSpace: NegativeVeryThinSpace,
    NestedGreaterGreater: NestedGreaterGreater,
    NestedLessLess: NestedLessLess,
    NewLine: NewLine,
    Nfr: Nfr,
    NoBreak: NoBreak,
    NonBreakingSpace: NonBreakingSpace,
    Nopf: Nopf,
    Not: Not,
    NotCongruent: NotCongruent,
    NotCupCap: NotCupCap,
    NotDoubleVerticalBar: NotDoubleVerticalBar,
    NotElement: NotElement,
    NotEqual: NotEqual,
    NotEqualTilde: NotEqualTilde,
    NotExists: NotExists,
    NotGreater: NotGreater,
    NotGreaterEqual: NotGreaterEqual,
    NotGreaterFullEqual: NotGreaterFullEqual,
    NotGreaterGreater: NotGreaterGreater,
    NotGreaterLess: NotGreaterLess,
    NotGreaterSlantEqual: NotGreaterSlantEqual,
    NotGreaterTilde: NotGreaterTilde,
    NotHumpDownHump: NotHumpDownHump,
    NotHumpEqual: NotHumpEqual,
    NotLeftTriangle: NotLeftTriangle,
    NotLeftTriangleBar: NotLeftTriangleBar,
    NotLeftTriangleEqual: NotLeftTriangleEqual,
    NotLess: NotLess,
    NotLessEqual: NotLessEqual,
    NotLessGreater: NotLessGreater,
    NotLessLess: NotLessLess,
    NotLessSlantEqual: NotLessSlantEqual,
    NotLessTilde: NotLessTilde,
    NotNestedGreaterGreater: NotNestedGreaterGreater,
    NotNestedLessLess: NotNestedLessLess,
    NotPrecedes: NotPrecedes,
    NotPrecedesEqual: NotPrecedesEqual,
    NotPrecedesSlantEqual: NotPrecedesSlantEqual,
    NotReverseElement: NotReverseElement,
    NotRightTriangle: NotRightTriangle,
    NotRightTriangleBar: NotRightTriangleBar,
    NotRightTriangleEqual: NotRightTriangleEqual,
    NotSquareSubset: NotSquareSubset,
    NotSquareSubsetEqual: NotSquareSubsetEqual,
    NotSquareSuperset: NotSquareSuperset,
    NotSquareSupersetEqual: NotSquareSupersetEqual,
    NotSubset: NotSubset,
    NotSubsetEqual: NotSubsetEqual,
    NotSucceeds: NotSucceeds,
    NotSucceedsEqual: NotSucceedsEqual,
    NotSucceedsSlantEqual: NotSucceedsSlantEqual,
    NotSucceedsTilde: NotSucceedsTilde,
    NotSuperset: NotSuperset,
    NotSupersetEqual: NotSupersetEqual,
    NotTilde: NotTilde,
    NotTildeEqual: NotTildeEqual,
    NotTildeFullEqual: NotTildeFullEqual,
    NotTildeTilde: NotTildeTilde,
    NotVerticalBar: NotVerticalBar,
    Nscr: Nscr,
    Ntild: Ntild,
    Ntilde: Ntilde$1,
    Nu: Nu,
    OElig: OElig,
    Oacut: Oacut,
    Oacute: Oacute$1,
    Ocir: Ocir,
    Ocirc: Ocirc$1,
    Ocy: Ocy,
    Odblac: Odblac,
    Ofr: Ofr,
    Ograv: Ograv,
    Ograve: Ograve$1,
    Omacr: Omacr,
    Omega: Omega,
    Omicron: Omicron,
    Oopf: Oopf,
    OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
    OpenCurlyQuote: OpenCurlyQuote,
    Or: Or,
    Oscr: Oscr,
    Oslas: Oslas,
    Oslash: Oslash$1,
    Otild: Otild,
    Otilde: Otilde$1,
    Otimes: Otimes,
    Oum: Oum,
    Ouml: Ouml$1,
    OverBar: OverBar,
    OverBrace: OverBrace,
    OverBracket: OverBracket,
    OverParenthesis: OverParenthesis,
    PartialD: PartialD,
    Pcy: Pcy,
    Pfr: Pfr,
    Phi: Phi,
    Pi: Pi,
    PlusMinus: PlusMinus,
    Poincareplane: Poincareplane,
    Popf: Popf,
    Pr: Pr,
    Precedes: Precedes,
    PrecedesEqual: PrecedesEqual,
    PrecedesSlantEqual: PrecedesSlantEqual,
    PrecedesTilde: PrecedesTilde,
    Prime: Prime,
    Product: Product,
    Proportion: Proportion,
    Proportional: Proportional,
    Pscr: Pscr,
    Psi: Psi,
    QUO: QUO,
    QUOT: QUOT$1,
    Qfr: Qfr,
    Qopf: Qopf,
    Qscr: Qscr,
    RBarr: RBarr,
    RE: RE,
    REG: REG$1,
    Racute: Racute,
    Rang: Rang,
    Rarr: Rarr,
    Rarrtl: Rarrtl,
    Rcaron: Rcaron,
    Rcedil: Rcedil,
    Rcy: Rcy,
    Re: Re,
    ReverseElement: ReverseElement,
    ReverseEquilibrium: ReverseEquilibrium,
    ReverseUpEquilibrium: ReverseUpEquilibrium,
    Rfr: Rfr,
    Rho: Rho,
    RightAngleBracket: RightAngleBracket,
    RightArrow: RightArrow,
    RightArrowBar: RightArrowBar,
    RightArrowLeftArrow: RightArrowLeftArrow,
    RightCeiling: RightCeiling,
    RightDoubleBracket: RightDoubleBracket,
    RightDownTeeVector: RightDownTeeVector,
    RightDownVector: RightDownVector,
    RightDownVectorBar: RightDownVectorBar,
    RightFloor: RightFloor,
    RightTee: RightTee,
    RightTeeArrow: RightTeeArrow,
    RightTeeVector: RightTeeVector,
    RightTriangle: RightTriangle,
    RightTriangleBar: RightTriangleBar,
    RightTriangleEqual: RightTriangleEqual,
    RightUpDownVector: RightUpDownVector,
    RightUpTeeVector: RightUpTeeVector,
    RightUpVector: RightUpVector,
    RightUpVectorBar: RightUpVectorBar,
    RightVector: RightVector,
    RightVectorBar: RightVectorBar,
    Rightarrow: Rightarrow,
    Ropf: Ropf,
    RoundImplies: RoundImplies,
    Rrightarrow: Rrightarrow,
    Rscr: Rscr,
    Rsh: Rsh,
    RuleDelayed: RuleDelayed,
    SHCHcy: SHCHcy,
    SHcy: SHcy,
    SOFTcy: SOFTcy,
    Sacute: Sacute,
    Sc: Sc,
    Scaron: Scaron,
    Scedil: Scedil,
    Scirc: Scirc,
    Scy: Scy,
    Sfr: Sfr,
    ShortDownArrow: ShortDownArrow,
    ShortLeftArrow: ShortLeftArrow,
    ShortRightArrow: ShortRightArrow,
    ShortUpArrow: ShortUpArrow,
    Sigma: Sigma,
    SmallCircle: SmallCircle,
    Sopf: Sopf,
    Sqrt: Sqrt,
    Square: Square,
    SquareIntersection: SquareIntersection,
    SquareSubset: SquareSubset,
    SquareSubsetEqual: SquareSubsetEqual,
    SquareSuperset: SquareSuperset,
    SquareSupersetEqual: SquareSupersetEqual,
    SquareUnion: SquareUnion,
    Sscr: Sscr,
    Star: Star,
    Sub: Sub,
    Subset: Subset,
    SubsetEqual: SubsetEqual,
    Succeeds: Succeeds,
    SucceedsEqual: SucceedsEqual,
    SucceedsSlantEqual: SucceedsSlantEqual,
    SucceedsTilde: SucceedsTilde,
    SuchThat: SuchThat,
    Sum: Sum,
    Sup: Sup,
    Superset: Superset,
    SupersetEqual: SupersetEqual,
    Supset: Supset,
    THOR: THOR,
    THORN: THORN$1,
    TRADE: TRADE,
    TSHcy: TSHcy,
    TScy: TScy,
    Tab: Tab,
    Tau: Tau,
    Tcaron: Tcaron,
    Tcedil: Tcedil,
    Tcy: Tcy,
    Tfr: Tfr,
    Therefore: Therefore,
    Theta: Theta,
    ThickSpace: ThickSpace,
    ThinSpace: ThinSpace,
    Tilde: Tilde,
    TildeEqual: TildeEqual,
    TildeFullEqual: TildeFullEqual,
    TildeTilde: TildeTilde,
    Topf: Topf,
    TripleDot: TripleDot,
    Tscr: Tscr,
    Tstrok: Tstrok,
    Uacut: Uacut,
    Uacute: Uacute$1,
    Uarr: Uarr,
    Uarrocir: Uarrocir,
    Ubrcy: Ubrcy,
    Ubreve: Ubreve,
    Ucir: Ucir,
    Ucirc: Ucirc$1,
    Ucy: Ucy,
    Udblac: Udblac,
    Ufr: Ufr,
    Ugrav: Ugrav,
    Ugrave: Ugrave$1,
    Umacr: Umacr,
    UnderBar: UnderBar,
    UnderBrace: UnderBrace,
    UnderBracket: UnderBracket,
    UnderParenthesis: UnderParenthesis,
    Union: Union,
    UnionPlus: UnionPlus,
    Uogon: Uogon,
    Uopf: Uopf,
    UpArrow: UpArrow,
    UpArrowBar: UpArrowBar,
    UpArrowDownArrow: UpArrowDownArrow,
    UpDownArrow: UpDownArrow,
    UpEquilibrium: UpEquilibrium,
    UpTee: UpTee,
    UpTeeArrow: UpTeeArrow,
    Uparrow: Uparrow,
    Updownarrow: Updownarrow,
    UpperLeftArrow: UpperLeftArrow,
    UpperRightArrow: UpperRightArrow,
    Upsi: Upsi,
    Upsilon: Upsilon,
    Uring: Uring,
    Uscr: Uscr,
    Utilde: Utilde,
    Uum: Uum,
    Uuml: Uuml$1,
    VDash: VDash,
    Vbar: Vbar,
    Vcy: Vcy,
    Vdash: Vdash,
    Vdashl: Vdashl,
    Vee: Vee,
    Verbar: Verbar,
    Vert: Vert,
    VerticalBar: VerticalBar,
    VerticalLine: VerticalLine,
    VerticalSeparator: VerticalSeparator,
    VerticalTilde: VerticalTilde,
    VeryThinSpace: VeryThinSpace,
    Vfr: Vfr,
    Vopf: Vopf,
    Vscr: Vscr,
    Vvdash: Vvdash,
    Wcirc: Wcirc,
    Wedge: Wedge,
    Wfr: Wfr,
    Wopf: Wopf,
    Wscr: Wscr,
    Xfr: Xfr,
    Xi: Xi,
    Xopf: Xopf,
    Xscr: Xscr,
    YAcy: YAcy,
    YIcy: YIcy,
    YUcy: YUcy,
    Yacut: Yacut,
    Yacute: Yacute$1,
    Ycirc: Ycirc,
    Ycy: Ycy,
    Yfr: Yfr,
    Yopf: Yopf,
    Yscr: Yscr,
    Yuml: Yuml,
    ZHcy: ZHcy,
    Zacute: Zacute,
    Zcaron: Zcaron,
    Zcy: Zcy,
    Zdot: Zdot,
    ZeroWidthSpace: ZeroWidthSpace,
    Zeta: Zeta,
    Zfr: Zfr,
    Zopf: Zopf,
    Zscr: Zscr,
    aacut: aacut,
    aacute: aacute$1,
    abreve: abreve,
    ac: ac,
    acE: acE,
    acd: acd,
    acir: acir,
    acirc: acirc$1,
    acut: acut,
    acute: acute$1,
    acy: acy,
    aeli: aeli,
    aelig: aelig$1,
    af: af,
    afr: afr,
    agrav: agrav,
    agrave: agrave$1,
    alefsym: alefsym,
    aleph: aleph,
    alpha: alpha,
    amacr: amacr,
    amalg: amalg,
    am: am,
    amp: amp$1,
    and: and,
    andand: andand,
    andd: andd,
    andslope: andslope,
    andv: andv,
    ang: ang,
    ange: ange,
    angle: angle,
    angmsd: angmsd,
    angmsdaa: angmsdaa,
    angmsdab: angmsdab,
    angmsdac: angmsdac,
    angmsdad: angmsdad,
    angmsdae: angmsdae,
    angmsdaf: angmsdaf,
    angmsdag: angmsdag,
    angmsdah: angmsdah,
    angrt: angrt,
    angrtvb: angrtvb,
    angrtvbd: angrtvbd,
    angsph: angsph,
    angst: angst,
    angzarr: angzarr,
    aogon: aogon,
    aopf: aopf,
    ap: ap,
    apE: apE,
    apacir: apacir,
    ape: ape,
    apid: apid,
    apos: apos,
    approx: approx,
    approxeq: approxeq,
    arin: arin,
    aring: aring$1,
    ascr: ascr,
    ast: ast,
    asymp: asymp,
    asympeq: asympeq,
    atild: atild,
    atilde: atilde$1,
    aum: aum,
    auml: auml$1,
    awconint: awconint,
    awint: awint,
    bNot: bNot,
    backcong: backcong,
    backepsilon: backepsilon,
    backprime: backprime,
    backsim: backsim,
    backsimeq: backsimeq,
    barvee: barvee,
    barwed: barwed,
    barwedge: barwedge,
    bbrk: bbrk,
    bbrktbrk: bbrktbrk,
    bcong: bcong,
    bcy: bcy,
    bdquo: bdquo,
    becaus: becaus,
    because: because,
    bemptyv: bemptyv,
    bepsi: bepsi,
    bernou: bernou,
    beta: beta,
    beth: beth,
    between: between,
    bfr: bfr,
    bigcap: bigcap,
    bigcirc: bigcirc,
    bigcup: bigcup,
    bigodot: bigodot,
    bigoplus: bigoplus,
    bigotimes: bigotimes,
    bigsqcup: bigsqcup,
    bigstar: bigstar,
    bigtriangledown: bigtriangledown,
    bigtriangleup: bigtriangleup,
    biguplus: biguplus,
    bigvee: bigvee,
    bigwedge: bigwedge,
    bkarow: bkarow,
    blacklozenge: blacklozenge,
    blacksquare: blacksquare,
    blacktriangle: blacktriangle,
    blacktriangledown: blacktriangledown,
    blacktriangleleft: blacktriangleleft,
    blacktriangleright: blacktriangleright,
    blank: blank,
    blk12: blk12,
    blk14: blk14,
    blk34: blk34,
    block: block,
    bne: bne,
    bnequiv: bnequiv,
    bnot: bnot,
    bopf: bopf,
    bot: bot,
    bottom: bottom,
    bowtie: bowtie,
    boxDL: boxDL,
    boxDR: boxDR,
    boxDl: boxDl,
    boxDr: boxDr,
    boxH: boxH,
    boxHD: boxHD,
    boxHU: boxHU,
    boxHd: boxHd,
    boxHu: boxHu,
    boxUL: boxUL,
    boxUR: boxUR,
    boxUl: boxUl,
    boxUr: boxUr,
    boxV: boxV,
    boxVH: boxVH,
    boxVL: boxVL,
    boxVR: boxVR,
    boxVh: boxVh,
    boxVl: boxVl,
    boxVr: boxVr,
    boxbox: boxbox,
    boxdL: boxdL,
    boxdR: boxdR,
    boxdl: boxdl,
    boxdr: boxdr,
    boxh: boxh,
    boxhD: boxhD,
    boxhU: boxhU,
    boxhd: boxhd,
    boxhu: boxhu,
    boxminus: boxminus,
    boxplus: boxplus,
    boxtimes: boxtimes,
    boxuL: boxuL,
    boxuR: boxuR,
    boxul: boxul,
    boxur: boxur,
    boxv: boxv,
    boxvH: boxvH,
    boxvL: boxvL,
    boxvR: boxvR,
    boxvh: boxvh,
    boxvl: boxvl,
    boxvr: boxvr,
    bprime: bprime,
    breve: breve,
    brvba: brvba,
    brvbar: brvbar$1,
    bscr: bscr,
    bsemi: bsemi,
    bsim: bsim,
    bsime: bsime,
    bsol: bsol,
    bsolb: bsolb,
    bsolhsub: bsolhsub,
    bull: bull,
    bullet: bullet,
    bump: bump,
    bumpE: bumpE,
    bumpe: bumpe,
    bumpeq: bumpeq,
    cacute: cacute,
    cap: cap,
    capand: capand,
    capbrcup: capbrcup,
    capcap: capcap,
    capcup: capcup,
    capdot: capdot,
    caps: caps,
    caret: caret,
    caron: caron,
    ccaps: ccaps,
    ccaron: ccaron,
    ccedi: ccedi,
    ccedil: ccedil$1,
    ccirc: ccirc,
    ccups: ccups,
    ccupssm: ccupssm,
    cdot: cdot,
    cedi: cedi,
    cedil: cedil$1,
    cemptyv: cemptyv,
    cen: cen,
    cent: cent$1,
    centerdot: centerdot,
    cfr: cfr,
    chcy: chcy,
    check: check,
    checkmark: checkmark,
    chi: chi,
    cir: cir,
    cirE: cirE,
    circ: circ,
    circeq: circeq,
    circlearrowleft: circlearrowleft,
    circlearrowright: circlearrowright,
    circledR: circledR,
    circledS: circledS,
    circledast: circledast,
    circledcirc: circledcirc,
    circleddash: circleddash,
    cire: cire,
    cirfnint: cirfnint,
    cirmid: cirmid,
    cirscir: cirscir,
    clubs: clubs,
    clubsuit: clubsuit,
    colon: colon,
    colone: colone,
    coloneq: coloneq,
    comma: comma,
    commat: commat,
    comp: comp,
    compfn: compfn,
    complement: complement,
    complexes: complexes,
    cong: cong,
    congdot: congdot,
    conint: conint,
    copf: copf,
    coprod: coprod,
    cop: cop,
    copy: copy$1,
    copysr: copysr,
    crarr: crarr,
    cross: cross,
    cscr: cscr,
    csub: csub,
    csube: csube,
    csup: csup,
    csupe: csupe,
    ctdot: ctdot,
    cudarrl: cudarrl,
    cudarrr: cudarrr,
    cuepr: cuepr,
    cuesc: cuesc,
    cularr: cularr,
    cularrp: cularrp,
    cup: cup,
    cupbrcap: cupbrcap,
    cupcap: cupcap,
    cupcup: cupcup,
    cupdot: cupdot,
    cupor: cupor,
    cups: cups,
    curarr: curarr,
    curarrm: curarrm,
    curlyeqprec: curlyeqprec,
    curlyeqsucc: curlyeqsucc,
    curlyvee: curlyvee,
    curlywedge: curlywedge,
    curre: curre,
    curren: curren$1,
    curvearrowleft: curvearrowleft,
    curvearrowright: curvearrowright,
    cuvee: cuvee,
    cuwed: cuwed,
    cwconint: cwconint,
    cwint: cwint,
    cylcty: cylcty,
    dArr: dArr,
    dHar: dHar,
    dagger: dagger,
    daleth: daleth,
    darr: darr,
    dash: dash,
    dashv: dashv,
    dbkarow: dbkarow,
    dblac: dblac,
    dcaron: dcaron,
    dcy: dcy,
    dd: dd,
    ddagger: ddagger,
    ddarr: ddarr,
    ddotseq: ddotseq,
    de: de,
    deg: deg$1,
    delta: delta,
    demptyv: demptyv,
    dfisht: dfisht,
    dfr: dfr,
    dharl: dharl,
    dharr: dharr,
    diam: diam,
    diamond: diamond,
    diamondsuit: diamondsuit,
    diams: diams,
    die: die,
    digamma: digamma,
    disin: disin,
    div: div,
    divid: divid,
    divide: divide$1,
    divideontimes: divideontimes,
    divonx: divonx,
    djcy: djcy,
    dlcorn: dlcorn,
    dlcrop: dlcrop,
    dollar: dollar,
    dopf: dopf,
    dot: dot,
    doteq: doteq,
    doteqdot: doteqdot,
    dotminus: dotminus,
    dotplus: dotplus,
    dotsquare: dotsquare,
    doublebarwedge: doublebarwedge,
    downarrow: downarrow,
    downdownarrows: downdownarrows,
    downharpoonleft: downharpoonleft,
    downharpoonright: downharpoonright,
    drbkarow: drbkarow,
    drcorn: drcorn,
    drcrop: drcrop,
    dscr: dscr,
    dscy: dscy,
    dsol: dsol,
    dstrok: dstrok,
    dtdot: dtdot,
    dtri: dtri,
    dtrif: dtrif,
    duarr: duarr,
    duhar: duhar,
    dwangle: dwangle,
    dzcy: dzcy,
    dzigrarr: dzigrarr,
    eDDot: eDDot,
    eDot: eDot,
    eacut: eacut,
    eacute: eacute$1,
    easter: easter,
    ecaron: ecaron,
    ecir: ecir,
    ecirc: ecirc$1,
    ecolon: ecolon,
    ecy: ecy,
    edot: edot,
    ee: ee,
    efDot: efDot,
    efr: efr,
    eg: eg,
    egrav: egrav,
    egrave: egrave$1,
    egs: egs,
    egsdot: egsdot,
    el: el,
    elinters: elinters,
    ell: ell,
    els: els,
    elsdot: elsdot,
    emacr: emacr,
    empty: empty,
    emptyset: emptyset,
    emptyv: emptyv,
    emsp13: emsp13,
    emsp14: emsp14,
    emsp: emsp,
    eng: eng,
    ensp: ensp,
    eogon: eogon,
    eopf: eopf,
    epar: epar,
    eparsl: eparsl,
    eplus: eplus,
    epsi: epsi,
    epsilon: epsilon,
    epsiv: epsiv,
    eqcirc: eqcirc,
    eqcolon: eqcolon,
    eqsim: eqsim,
    eqslantgtr: eqslantgtr,
    eqslantless: eqslantless,
    equals: equals,
    equest: equest,
    equiv: equiv,
    equivDD: equivDD,
    eqvparsl: eqvparsl,
    erDot: erDot,
    erarr: erarr,
    escr: escr,
    esdot: esdot,
    esim: esim,
    eta: eta,
    et: et,
    eth: eth$1,
    eum: eum,
    euml: euml$1,
    euro: euro,
    excl: excl,
    exist: exist,
    expectation: expectation,
    exponentiale: exponentiale,
    fallingdotseq: fallingdotseq,
    fcy: fcy,
    female: female,
    ffilig: ffilig,
    fflig: fflig,
    ffllig: ffllig,
    ffr: ffr,
    filig: filig,
    fjlig: fjlig,
    flat: flat,
    fllig: fllig,
    fltns: fltns,
    fnof: fnof,
    fopf: fopf,
    forall: forall,
    fork: fork,
    forkv: forkv,
    fpartint: fpartint,
    frac1: frac1,
    frac12: frac12$1,
    frac13: frac13,
    frac14: frac14$1,
    frac15: frac15,
    frac16: frac16,
    frac18: frac18,
    frac23: frac23,
    frac25: frac25,
    frac3: frac3,
    frac34: frac34$1,
    frac35: frac35,
    frac38: frac38,
    frac45: frac45,
    frac56: frac56,
    frac58: frac58,
    frac78: frac78,
    frasl: frasl,
    frown: frown,
    fscr: fscr,
    gE: gE,
    gEl: gEl,
    gacute: gacute,
    gamma: gamma,
    gammad: gammad,
    gap: gap,
    gbreve: gbreve,
    gcirc: gcirc,
    gcy: gcy,
    gdot: gdot,
    ge: ge,
    gel: gel,
    geq: geq,
    geqq: geqq,
    geqslant: geqslant,
    ges: ges,
    gescc: gescc,
    gesdot: gesdot,
    gesdoto: gesdoto,
    gesdotol: gesdotol,
    gesl: gesl,
    gesles: gesles,
    gfr: gfr,
    gg: gg,
    ggg: ggg,
    gimel: gimel,
    gjcy: gjcy,
    gl: gl,
    glE: glE,
    gla: gla,
    glj: glj,
    gnE: gnE,
    gnap: gnap,
    gnapprox: gnapprox,
    gne: gne,
    gneq: gneq,
    gneqq: gneqq,
    gnsim: gnsim,
    gopf: gopf,
    grave: grave,
    gscr: gscr,
    gsim: gsim,
    gsime: gsime,
    gsiml: gsiml,
    g: g,
    gt: gt$1,
    gtcc: gtcc,
    gtcir: gtcir,
    gtdot: gtdot,
    gtlPar: gtlPar,
    gtquest: gtquest,
    gtrapprox: gtrapprox,
    gtrarr: gtrarr,
    gtrdot: gtrdot,
    gtreqless: gtreqless,
    gtreqqless: gtreqqless,
    gtrless: gtrless,
    gtrsim: gtrsim,
    gvertneqq: gvertneqq,
    gvnE: gvnE,
    hArr: hArr,
    hairsp: hairsp,
    half: half,
    hamilt: hamilt,
    hardcy: hardcy,
    harr: harr,
    harrcir: harrcir,
    harrw: harrw,
    hbar: hbar,
    hcirc: hcirc,
    hearts: hearts,
    heartsuit: heartsuit,
    hellip: hellip,
    hercon: hercon,
    hfr: hfr,
    hksearow: hksearow,
    hkswarow: hkswarow,
    hoarr: hoarr,
    homtht: homtht,
    hookleftarrow: hookleftarrow,
    hookrightarrow: hookrightarrow,
    hopf: hopf,
    horbar: horbar,
    hscr: hscr,
    hslash: hslash,
    hstrok: hstrok,
    hybull: hybull,
    hyphen: hyphen,
    iacut: iacut,
    iacute: iacute$1,
    ic: ic,
    icir: icir,
    icirc: icirc$1,
    icy: icy,
    iecy: iecy,
    iexc: iexc,
    iexcl: iexcl$1,
    iff: iff,
    ifr: ifr,
    igrav: igrav,
    igrave: igrave$1,
    ii: ii,
    iiiint: iiiint,
    iiint: iiint,
    iinfin: iinfin,
    iiota: iiota,
    ijlig: ijlig,
    imacr: imacr,
    image: image,
    imagline: imagline,
    imagpart: imagpart,
    imath: imath,
    imof: imof,
    imped: imped,
    incare: incare,
    infin: infin,
    infintie: infintie,
    inodot: inodot,
    int: int,
    intcal: intcal,
    integers: integers,
    intercal: intercal,
    intlarhk: intlarhk,
    intprod: intprod,
    iocy: iocy,
    iogon: iogon,
    iopf: iopf,
    iota: iota,
    iprod: iprod,
    iques: iques,
    iquest: iquest$1,
    iscr: iscr,
    isin: isin,
    isinE: isinE,
    isindot: isindot,
    isins: isins,
    isinsv: isinsv,
    isinv: isinv,
    it: it,
    itilde: itilde,
    iukcy: iukcy,
    ium: ium,
    iuml: iuml$1,
    jcirc: jcirc,
    jcy: jcy,
    jfr: jfr,
    jmath: jmath,
    jopf: jopf,
    jscr: jscr,
    jsercy: jsercy,
    jukcy: jukcy,
    kappa: kappa,
    kappav: kappav,
    kcedil: kcedil,
    kcy: kcy,
    kfr: kfr,
    kgreen: kgreen,
    khcy: khcy,
    kjcy: kjcy,
    kopf: kopf,
    kscr: kscr,
    lAarr: lAarr,
    lArr: lArr,
    lAtail: lAtail,
    lBarr: lBarr,
    lE: lE,
    lEg: lEg,
    lHar: lHar,
    lacute: lacute,
    laemptyv: laemptyv,
    lagran: lagran,
    lambda: lambda,
    lang: lang,
    langd: langd,
    langle: langle,
    lap: lap,
    laqu: laqu,
    laquo: laquo$1,
    larr: larr,
    larrb: larrb,
    larrbfs: larrbfs,
    larrfs: larrfs,
    larrhk: larrhk,
    larrlp: larrlp,
    larrpl: larrpl,
    larrsim: larrsim,
    larrtl: larrtl,
    lat: lat,
    latail: latail,
    late: late,
    lates: lates,
    lbarr: lbarr,
    lbbrk: lbbrk,
    lbrace: lbrace,
    lbrack: lbrack,
    lbrke: lbrke,
    lbrksld: lbrksld,
    lbrkslu: lbrkslu,
    lcaron: lcaron,
    lcedil: lcedil,
    lceil: lceil,
    lcub: lcub,
    lcy: lcy,
    ldca: ldca,
    ldquo: ldquo,
    ldquor: ldquor,
    ldrdhar: ldrdhar,
    ldrushar: ldrushar,
    ldsh: ldsh,
    le: le,
    leftarrow: leftarrow,
    leftarrowtail: leftarrowtail,
    leftharpoondown: leftharpoondown,
    leftharpoonup: leftharpoonup,
    leftleftarrows: leftleftarrows,
    leftrightarrow: leftrightarrow,
    leftrightarrows: leftrightarrows,
    leftrightharpoons: leftrightharpoons,
    leftrightsquigarrow: leftrightsquigarrow,
    leftthreetimes: leftthreetimes,
    leg: leg,
    leq: leq,
    leqq: leqq,
    leqslant: leqslant,
    les: les,
    lescc: lescc,
    lesdot: lesdot,
    lesdoto: lesdoto,
    lesdotor: lesdotor,
    lesg: lesg,
    lesges: lesges,
    lessapprox: lessapprox,
    lessdot: lessdot,
    lesseqgtr: lesseqgtr,
    lesseqqgtr: lesseqqgtr,
    lessgtr: lessgtr,
    lesssim: lesssim,
    lfisht: lfisht,
    lfloor: lfloor,
    lfr: lfr,
    lg: lg,
    lgE: lgE,
    lhard: lhard,
    lharu: lharu,
    lharul: lharul,
    lhblk: lhblk,
    ljcy: ljcy,
    ll: ll,
    llarr: llarr,
    llcorner: llcorner,
    llhard: llhard,
    lltri: lltri,
    lmidot: lmidot,
    lmoust: lmoust,
    lmoustache: lmoustache,
    lnE: lnE,
    lnap: lnap,
    lnapprox: lnapprox,
    lne: lne,
    lneq: lneq,
    lneqq: lneqq,
    lnsim: lnsim,
    loang: loang,
    loarr: loarr,
    lobrk: lobrk,
    longleftarrow: longleftarrow,
    longleftrightarrow: longleftrightarrow,
    longmapsto: longmapsto,
    longrightarrow: longrightarrow,
    looparrowleft: looparrowleft,
    looparrowright: looparrowright,
    lopar: lopar,
    lopf: lopf,
    loplus: loplus,
    lotimes: lotimes,
    lowast: lowast,
    lowbar: lowbar,
    loz: loz,
    lozenge: lozenge,
    lozf: lozf,
    lpar: lpar,
    lparlt: lparlt,
    lrarr: lrarr,
    lrcorner: lrcorner,
    lrhar: lrhar,
    lrhard: lrhard,
    lrm: lrm,
    lrtri: lrtri,
    lsaquo: lsaquo,
    lscr: lscr,
    lsh: lsh,
    lsim: lsim,
    lsime: lsime,
    lsimg: lsimg,
    lsqb: lsqb,
    lsquo: lsquo,
    lsquor: lsquor,
    lstrok: lstrok,
    l: l,
    lt: lt$1,
    ltcc: ltcc,
    ltcir: ltcir,
    ltdot: ltdot,
    lthree: lthree,
    ltimes: ltimes,
    ltlarr: ltlarr,
    ltquest: ltquest,
    ltrPar: ltrPar,
    ltri: ltri,
    ltrie: ltrie,
    ltrif: ltrif,
    lurdshar: lurdshar,
    luruhar: luruhar,
    lvertneqq: lvertneqq,
    lvnE: lvnE,
    mDDot: mDDot,
    mac: mac,
    macr: macr$1,
    male: male,
    malt: malt,
    maltese: maltese,
    map: map,
    mapsto: mapsto,
    mapstodown: mapstodown,
    mapstoleft: mapstoleft,
    mapstoup: mapstoup,
    marker: marker,
    mcomma: mcomma,
    mcy: mcy,
    mdash: mdash,
    measuredangle: measuredangle,
    mfr: mfr,
    mho: mho,
    micr: micr,
    micro: micro$1,
    mid: mid,
    midast: midast,
    midcir: midcir,
    middo: middo,
    middot: middot$1,
    minus: minus,
    minusb: minusb,
    minusd: minusd,
    minusdu: minusdu,
    mlcp: mlcp,
    mldr: mldr,
    mnplus: mnplus,
    models: models,
    mopf: mopf,
    mp: mp,
    mscr: mscr,
    mstpos: mstpos,
    mu: mu,
    multimap: multimap,
    mumap: mumap,
    nGg: nGg,
    nGt: nGt,
    nGtv: nGtv,
    nLeftarrow: nLeftarrow,
    nLeftrightarrow: nLeftrightarrow,
    nLl: nLl,
    nLt: nLt,
    nLtv: nLtv,
    nRightarrow: nRightarrow,
    nVDash: nVDash,
    nVdash: nVdash,
    nabla: nabla,
    nacute: nacute,
    nang: nang,
    nap: nap,
    napE: napE,
    napid: napid,
    napos: napos,
    napprox: napprox,
    natur: natur,
    natural: natural,
    naturals: naturals,
    nbs: nbs,
    nbsp: nbsp$1,
    nbump: nbump,
    nbumpe: nbumpe,
    ncap: ncap,
    ncaron: ncaron,
    ncedil: ncedil,
    ncong: ncong,
    ncongdot: ncongdot,
    ncup: ncup,
    ncy: ncy,
    ndash: ndash,
    ne: ne,
    neArr: neArr,
    nearhk: nearhk,
    nearr: nearr,
    nearrow: nearrow,
    nedot: nedot,
    nequiv: nequiv,
    nesear: nesear,
    nesim: nesim,
    nexist: nexist,
    nexists: nexists,
    nfr: nfr,
    ngE: ngE,
    nge: nge,
    ngeq: ngeq,
    ngeqq: ngeqq,
    ngeqslant: ngeqslant,
    nges: nges,
    ngsim: ngsim,
    ngt: ngt,
    ngtr: ngtr,
    nhArr: nhArr,
    nharr: nharr,
    nhpar: nhpar,
    ni: ni,
    nis: nis,
    nisd: nisd,
    niv: niv,
    njcy: njcy,
    nlArr: nlArr,
    nlE: nlE,
    nlarr: nlarr,
    nldr: nldr,
    nle: nle,
    nleftarrow: nleftarrow,
    nleftrightarrow: nleftrightarrow,
    nleq: nleq,
    nleqq: nleqq,
    nleqslant: nleqslant,
    nles: nles,
    nless: nless,
    nlsim: nlsim,
    nlt: nlt,
    nltri: nltri,
    nltrie: nltrie,
    nmid: nmid,
    nopf: nopf,
    no: no,
    not: not$1,
    notin: notin,
    notinE: notinE,
    notindot: notindot,
    notinva: notinva,
    notinvb: notinvb,
    notinvc: notinvc,
    notni: notni,
    notniva: notniva,
    notnivb: notnivb,
    notnivc: notnivc,
    npar: npar,
    nparallel: nparallel,
    nparsl: nparsl,
    npart: npart,
    npolint: npolint,
    npr: npr,
    nprcue: nprcue,
    npre: npre,
    nprec: nprec,
    npreceq: npreceq,
    nrArr: nrArr,
    nrarr: nrarr,
    nrarrc: nrarrc,
    nrarrw: nrarrw,
    nrightarrow: nrightarrow,
    nrtri: nrtri,
    nrtrie: nrtrie,
    nsc: nsc,
    nsccue: nsccue,
    nsce: nsce,
    nscr: nscr,
    nshortmid: nshortmid,
    nshortparallel: nshortparallel,
    nsim: nsim,
    nsime: nsime,
    nsimeq: nsimeq,
    nsmid: nsmid,
    nspar: nspar,
    nsqsube: nsqsube,
    nsqsupe: nsqsupe,
    nsub: nsub,
    nsubE: nsubE,
    nsube: nsube,
    nsubset: nsubset,
    nsubseteq: nsubseteq,
    nsubseteqq: nsubseteqq,
    nsucc: nsucc,
    nsucceq: nsucceq,
    nsup: nsup,
    nsupE: nsupE,
    nsupe: nsupe,
    nsupset: nsupset,
    nsupseteq: nsupseteq,
    nsupseteqq: nsupseteqq,
    ntgl: ntgl,
    ntild: ntild,
    ntilde: ntilde$1,
    ntlg: ntlg,
    ntriangleleft: ntriangleleft,
    ntrianglelefteq: ntrianglelefteq,
    ntriangleright: ntriangleright,
    ntrianglerighteq: ntrianglerighteq,
    nu: nu,
    num: num,
    numero: numero,
    numsp: numsp,
    nvDash: nvDash,
    nvHarr: nvHarr,
    nvap: nvap,
    nvdash: nvdash,
    nvge: nvge,
    nvgt: nvgt,
    nvinfin: nvinfin,
    nvlArr: nvlArr,
    nvle: nvle,
    nvlt: nvlt,
    nvltrie: nvltrie,
    nvrArr: nvrArr,
    nvrtrie: nvrtrie,
    nvsim: nvsim,
    nwArr: nwArr,
    nwarhk: nwarhk,
    nwarr: nwarr,
    nwarrow: nwarrow,
    nwnear: nwnear,
    oS: oS,
    oacut: oacut,
    oacute: oacute$1,
    oast: oast,
    ocir: ocir,
    ocirc: ocirc$1,
    ocy: ocy,
    odash: odash,
    odblac: odblac,
    odiv: odiv,
    odot: odot,
    odsold: odsold,
    oelig: oelig,
    ofcir: ofcir,
    ofr: ofr,
    ogon: ogon,
    ograv: ograv,
    ograve: ograve$1,
    ogt: ogt,
    ohbar: ohbar,
    ohm: ohm,
    oint: oint,
    olarr: olarr,
    olcir: olcir,
    olcross: olcross,
    oline: oline,
    olt: olt,
    omacr: omacr,
    omega: omega,
    omicron: omicron,
    omid: omid,
    ominus: ominus,
    oopf: oopf,
    opar: opar,
    operp: operp,
    oplus: oplus,
    or: or,
    orarr: orarr,
    ord: ord,
    order: order$1,
    orderof: orderof,
    ordf: ordf$1,
    ordm: ordm$1,
    origof: origof,
    oror: oror,
    orslope: orslope,
    orv: orv,
    oscr: oscr,
    oslas: oslas,
    oslash: oslash$1,
    osol: osol,
    otild: otild,
    otilde: otilde$1,
    otimes: otimes,
    otimesas: otimesas,
    oum: oum,
    ouml: ouml$1,
    ovbar: ovbar,
    par: par,
    para: para$1,
    parallel: parallel,
    parsim: parsim,
    parsl: parsl,
    part: part,
    pcy: pcy,
    percnt: percnt,
    period: period,
    permil: permil,
    perp: perp,
    pertenk: pertenk,
    pfr: pfr,
    phi: phi,
    phiv: phiv,
    phmmat: phmmat,
    phone: phone,
    pi: pi,
    pitchfork: pitchfork,
    piv: piv,
    planck: planck,
    planckh: planckh,
    plankv: plankv,
    plus: plus,
    plusacir: plusacir,
    plusb: plusb,
    pluscir: pluscir,
    plusdo: plusdo,
    plusdu: plusdu,
    pluse: pluse,
    plusm: plusm,
    plusmn: plusmn$1,
    plussim: plussim,
    plustwo: plustwo,
    pm: pm,
    pointint: pointint,
    popf: popf,
    poun: poun,
    pound: pound$1,
    pr: pr,
    prE: prE,
    prap: prap,
    prcue: prcue,
    pre: pre,
    prec: prec,
    precapprox: precapprox,
    preccurlyeq: preccurlyeq,
    preceq: preceq,
    precnapprox: precnapprox,
    precneqq: precneqq,
    precnsim: precnsim,
    precsim: precsim,
    prime: prime,
    primes: primes,
    prnE: prnE,
    prnap: prnap,
    prnsim: prnsim,
    prod: prod,
    profalar: profalar,
    profline: profline,
    profsurf: profsurf,
    prop: prop,
    propto: propto,
    prsim: prsim,
    prurel: prurel,
    pscr: pscr,
    psi: psi,
    puncsp: puncsp,
    qfr: qfr,
    qint: qint,
    qopf: qopf,
    qprime: qprime,
    qscr: qscr,
    quaternions: quaternions,
    quatint: quatint,
    quest: quest,
    questeq: questeq,
    quo: quo,
    quot: quot$1,
    rAarr: rAarr,
    rArr: rArr,
    rAtail: rAtail,
    rBarr: rBarr,
    rHar: rHar,
    race: race,
    racute: racute,
    radic: radic,
    raemptyv: raemptyv,
    rang: rang,
    rangd: rangd,
    range: range,
    rangle: rangle,
    raqu: raqu,
    raquo: raquo$1,
    rarr: rarr,
    rarrap: rarrap,
    rarrb: rarrb,
    rarrbfs: rarrbfs,
    rarrc: rarrc,
    rarrfs: rarrfs,
    rarrhk: rarrhk,
    rarrlp: rarrlp,
    rarrpl: rarrpl,
    rarrsim: rarrsim,
    rarrtl: rarrtl,
    rarrw: rarrw,
    ratail: ratail,
    ratio: ratio,
    rationals: rationals,
    rbarr: rbarr,
    rbbrk: rbbrk,
    rbrace: rbrace,
    rbrack: rbrack,
    rbrke: rbrke,
    rbrksld: rbrksld,
    rbrkslu: rbrkslu,
    rcaron: rcaron,
    rcedil: rcedil,
    rceil: rceil,
    rcub: rcub,
    rcy: rcy,
    rdca: rdca,
    rdldhar: rdldhar,
    rdquo: rdquo,
    rdquor: rdquor,
    rdsh: rdsh,
    real: real,
    realine: realine,
    realpart: realpart,
    reals: reals,
    rect: rect,
    re: re,
    reg: reg$1,
    rfisht: rfisht,
    rfloor: rfloor,
    rfr: rfr,
    rhard: rhard,
    rharu: rharu,
    rharul: rharul,
    rho: rho,
    rhov: rhov,
    rightarrow: rightarrow,
    rightarrowtail: rightarrowtail,
    rightharpoondown: rightharpoondown,
    rightharpoonup: rightharpoonup,
    rightleftarrows: rightleftarrows,
    rightleftharpoons: rightleftharpoons,
    rightrightarrows: rightrightarrows,
    rightsquigarrow: rightsquigarrow,
    rightthreetimes: rightthreetimes,
    ring: ring,
    risingdotseq: risingdotseq,
    rlarr: rlarr,
    rlhar: rlhar,
    rlm: rlm,
    rmoust: rmoust,
    rmoustache: rmoustache,
    rnmid: rnmid,
    roang: roang,
    roarr: roarr,
    robrk: robrk,
    ropar: ropar,
    ropf: ropf,
    roplus: roplus,
    rotimes: rotimes,
    rpar: rpar,
    rpargt: rpargt,
    rppolint: rppolint,
    rrarr: rrarr,
    rsaquo: rsaquo,
    rscr: rscr,
    rsh: rsh,
    rsqb: rsqb,
    rsquo: rsquo,
    rsquor: rsquor,
    rthree: rthree,
    rtimes: rtimes,
    rtri: rtri,
    rtrie: rtrie,
    rtrif: rtrif,
    rtriltri: rtriltri,
    ruluhar: ruluhar,
    rx: rx,
    sacute: sacute,
    sbquo: sbquo,
    sc: sc,
    scE: scE,
    scap: scap,
    scaron: scaron,
    sccue: sccue,
    sce: sce,
    scedil: scedil,
    scirc: scirc,
    scnE: scnE,
    scnap: scnap,
    scnsim: scnsim,
    scpolint: scpolint,
    scsim: scsim,
    scy: scy,
    sdot: sdot,
    sdotb: sdotb,
    sdote: sdote,
    seArr: seArr,
    searhk: searhk,
    searr: searr,
    searrow: searrow,
    sec: sec,
    sect: sect$1,
    semi: semi,
    seswar: seswar,
    setminus: setminus,
    setmn: setmn,
    sext: sext,
    sfr: sfr,
    sfrown: sfrown,
    sharp: sharp,
    shchcy: shchcy,
    shcy: shcy,
    shortmid: shortmid,
    shortparallel: shortparallel,
    sh: sh,
    shy: shy$1,
    sigma: sigma,
    sigmaf: sigmaf,
    sigmav: sigmav,
    sim: sim,
    simdot: simdot,
    sime: sime,
    simeq: simeq,
    simg: simg,
    simgE: simgE,
    siml: siml,
    simlE: simlE,
    simne: simne,
    simplus: simplus,
    simrarr: simrarr,
    slarr: slarr,
    smallsetminus: smallsetminus,
    smashp: smashp,
    smeparsl: smeparsl,
    smid: smid,
    smile: smile,
    smt: smt,
    smte: smte,
    smtes: smtes,
    softcy: softcy,
    sol: sol,
    solb: solb,
    solbar: solbar,
    sopf: sopf,
    spades: spades,
    spadesuit: spadesuit,
    spar: spar,
    sqcap: sqcap,
    sqcaps: sqcaps,
    sqcup: sqcup,
    sqcups: sqcups,
    sqsub: sqsub,
    sqsube: sqsube,
    sqsubset: sqsubset,
    sqsubseteq: sqsubseteq,
    sqsup: sqsup,
    sqsupe: sqsupe,
    sqsupset: sqsupset,
    sqsupseteq: sqsupseteq,
    squ: squ,
    square: square,
    squarf: squarf,
    squf: squf,
    srarr: srarr,
    sscr: sscr,
    ssetmn: ssetmn,
    ssmile: ssmile,
    sstarf: sstarf,
    star: star,
    starf: starf,
    straightepsilon: straightepsilon,
    straightphi: straightphi,
    strns: strns,
    sub: sub,
    subE: subE,
    subdot: subdot,
    sube: sube,
    subedot: subedot,
    submult: submult,
    subnE: subnE,
    subne: subne,
    subplus: subplus,
    subrarr: subrarr,
    subset: subset,
    subseteq: subseteq,
    subseteqq: subseteqq,
    subsetneq: subsetneq,
    subsetneqq: subsetneqq,
    subsim: subsim,
    subsub: subsub,
    subsup: subsup,
    succ: succ,
    succapprox: succapprox,
    succcurlyeq: succcurlyeq,
    succeq: succeq,
    succnapprox: succnapprox,
    succneqq: succneqq,
    succnsim: succnsim,
    succsim: succsim,
    sum: sum,
    sung: sung,
    sup: sup,
    sup1: sup1$1,
    sup2: sup2$1,
    sup3: sup3$1,
    supE: supE,
    supdot: supdot,
    supdsub: supdsub,
    supe: supe,
    supedot: supedot,
    suphsol: suphsol,
    suphsub: suphsub,
    suplarr: suplarr,
    supmult: supmult,
    supnE: supnE,
    supne: supne,
    supplus: supplus,
    supset: supset,
    supseteq: supseteq,
    supseteqq: supseteqq,
    supsetneq: supsetneq,
    supsetneqq: supsetneqq,
    supsim: supsim,
    supsub: supsub,
    supsup: supsup,
    swArr: swArr,
    swarhk: swarhk,
    swarr: swarr,
    swarrow: swarrow,
    swnwar: swnwar,
    szli: szli,
    szlig: szlig$1,
    target: target,
    tau: tau,
    tbrk: tbrk,
    tcaron: tcaron,
    tcedil: tcedil,
    tcy: tcy,
    tdot: tdot,
    telrec: telrec,
    tfr: tfr,
    there4: there4,
    therefore: therefore,
    theta: theta,
    thetasym: thetasym,
    thetav: thetav,
    thickapprox: thickapprox,
    thicksim: thicksim,
    thinsp: thinsp,
    thkap: thkap,
    thksim: thksim,
    thor: thor,
    thorn: thorn$1,
    tilde: tilde,
    time: time,
    times: times$1,
    timesb: timesb,
    timesbar: timesbar,
    timesd: timesd,
    tint: tint,
    toea: toea,
    top: top,
    topbot: topbot,
    topcir: topcir,
    topf: topf,
    topfork: topfork,
    tosa: tosa,
    tprime: tprime,
    trade: trade,
    triangle: triangle,
    triangledown: triangledown,
    triangleleft: triangleleft,
    trianglelefteq: trianglelefteq,
    triangleq: triangleq,
    triangleright: triangleright,
    trianglerighteq: trianglerighteq,
    tridot: tridot,
    trie: trie,
    triminus: triminus,
    triplus: triplus,
    trisb: trisb,
    tritime: tritime,
    trpezium: trpezium,
    tscr: tscr,
    tscy: tscy,
    tshcy: tshcy,
    tstrok: tstrok,
    twixt: twixt,
    twoheadleftarrow: twoheadleftarrow,
    twoheadrightarrow: twoheadrightarrow,
    uArr: uArr,
    uHar: uHar,
    uacut: uacut,
    uacute: uacute$1,
    uarr: uarr,
    ubrcy: ubrcy,
    ubreve: ubreve,
    ucir: ucir,
    ucirc: ucirc$1,
    ucy: ucy,
    udarr: udarr,
    udblac: udblac,
    udhar: udhar,
    ufisht: ufisht,
    ufr: ufr,
    ugrav: ugrav,
    ugrave: ugrave$1,
    uharl: uharl,
    uharr: uharr,
    uhblk: uhblk,
    ulcorn: ulcorn,
    ulcorner: ulcorner,
    ulcrop: ulcrop,
    ultri: ultri,
    umacr: umacr,
    um: um,
    uml: uml$1,
    uogon: uogon,
    uopf: uopf,
    uparrow: uparrow,
    updownarrow: updownarrow,
    upharpoonleft: upharpoonleft,
    upharpoonright: upharpoonright,
    uplus: uplus,
    upsi: upsi,
    upsih: upsih,
    upsilon: upsilon,
    upuparrows: upuparrows,
    urcorn: urcorn,
    urcorner: urcorner,
    urcrop: urcrop,
    uring: uring,
    urtri: urtri,
    uscr: uscr,
    utdot: utdot,
    utilde: utilde,
    utri: utri,
    utrif: utrif,
    uuarr: uuarr,
    uum: uum,
    uuml: uuml$1,
    uwangle: uwangle,
    vArr: vArr,
    vBar: vBar,
    vBarv: vBarv,
    vDash: vDash,
    vangrt: vangrt,
    varepsilon: varepsilon,
    varkappa: varkappa,
    varnothing: varnothing,
    varphi: varphi,
    varpi: varpi,
    varpropto: varpropto,
    varr: varr,
    varrho: varrho,
    varsigma: varsigma,
    varsubsetneq: varsubsetneq,
    varsubsetneqq: varsubsetneqq,
    varsupsetneq: varsupsetneq,
    varsupsetneqq: varsupsetneqq,
    vartheta: vartheta,
    vartriangleleft: vartriangleleft,
    vartriangleright: vartriangleright,
    vcy: vcy,
    vdash: vdash,
    vee: vee,
    veebar: veebar,
    veeeq: veeeq,
    vellip: vellip,
    verbar: verbar,
    vert: vert,
    vfr: vfr,
    vltri: vltri,
    vnsub: vnsub,
    vnsup: vnsup,
    vopf: vopf,
    vprop: vprop,
    vrtri: vrtri,
    vscr: vscr,
    vsubnE: vsubnE,
    vsubne: vsubne,
    vsupnE: vsupnE,
    vsupne: vsupne,
    vzigzag: vzigzag,
    wcirc: wcirc,
    wedbar: wedbar,
    wedge: wedge,
    wedgeq: wedgeq,
    weierp: weierp,
    wfr: wfr,
    wopf: wopf,
    wp: wp,
    wr: wr,
    wreath: wreath,
    wscr: wscr,
    xcap: xcap,
    xcirc: xcirc,
    xcup: xcup,
    xdtri: xdtri,
    xfr: xfr,
    xhArr: xhArr,
    xharr: xharr,
    xi: xi,
    xlArr: xlArr,
    xlarr: xlarr,
    xmap: xmap,
    xnis: xnis,
    xodot: xodot,
    xopf: xopf,
    xoplus: xoplus,
    xotime: xotime,
    xrArr: xrArr,
    xrarr: xrarr,
    xscr: xscr,
    xsqcup: xsqcup,
    xuplus: xuplus,
    xutri: xutri,
    xvee: xvee,
    xwedge: xwedge,
    yacut: yacut,
    yacute: yacute$1,
    yacy: yacy,
    ycirc: ycirc,
    ycy: ycy,
    ye: ye,
    yen: yen$1,
    yfr: yfr,
    yicy: yicy,
    yopf: yopf,
    yscr: yscr,
    yucy: yucy,
    yum: yum,
    yuml: yuml$1,
    zacute: zacute,
    zcaron: zcaron,
    zcy: zcy,
    zdot: zdot,
    zeetrf: zeetrf,
    zeta: zeta,
    zfr: zfr,
    zhcy: zhcy,
    zigrarr: zigrarr,
    zopf: zopf,
    zscr: zscr,
    zwj: zwj,
    zwnj: zwnj,
    'default': index$3
  });

  var characterEntities$1 = getCjsExportFromNamespace(characterEntities);

  var decodeEntity_1 = decodeEntity;

  var own$3 = {}.hasOwnProperty;

  function decodeEntity(characters) {
    return own$3.call(characterEntities$1, characters)
      ? characterEntities$1[characters]
      : false
  }

  var legacy = getCjsExportFromNamespace(characterEntitiesLegacy);

  var invalid = getCjsExportFromNamespace(characterReferenceInvalid);

  var parseEntities_1 = parseEntities;

  var own$4 = {}.hasOwnProperty;
  var fromCharCode = String.fromCharCode;
  var noop$1 = Function.prototype;

  // Default settings.
  var defaults = {
    warning: null,
    reference: null,
    text: null,
    warningContext: null,
    referenceContext: null,
    textContext: null,
    position: {},
    additional: null,
    attribute: false,
    nonTerminated: true
  };

  // Characters.
  var tab = 9; // '\t'
  var lineFeed = 10; // '\n'
  var formFeed = 12; // '\f'
  var space = 32; // ' '
  var ampersand = 38; // '&'
  var semicolon = 59; // ';'
  var lessThan = 60; // '<'
  var equalsTo = 61; // '='
  var numberSign = 35; // '#'
  var uppercaseX = 88; // 'X'
  var lowercaseX = 120; // 'x'
  var replacementCharacter = 65533; // '�'

  // Reference types.
  var name = 'named';
  var hexa = 'hexadecimal';
  var deci = 'decimal';

  // Map of bases.
  var bases = {};

  bases[hexa] = 16;
  bases[deci] = 10;

  // Map of types to tests.
  // Each type of character reference accepts different characters.
  // This test is used to detect whether a reference has ended (as the semicolon
  // is not strictly needed).
  var tests = {};

  tests[name] = isAlphanumerical;
  tests[deci] = isDecimal;
  tests[hexa] = isHexadecimal;

  // Warning types.
  var namedNotTerminated = 1;
  var numericNotTerminated = 2;
  var namedEmpty = 3;
  var numericEmpty = 4;
  var namedUnknown = 5;
  var numericDisallowed = 6;
  var numericProhibited = 7;

  // Warning messages.
  var messages = {};

  messages[namedNotTerminated] =
    'Named character references must be terminated by a semicolon';
  messages[numericNotTerminated] =
    'Numeric character references must be terminated by a semicolon';
  messages[namedEmpty] = 'Named character references cannot be empty';
  messages[numericEmpty] = 'Numeric character references cannot be empty';
  messages[namedUnknown] = 'Named character references must be known';
  messages[numericDisallowed] =
    'Numeric character references cannot be disallowed';
  messages[numericProhibited] =
    'Numeric character references cannot be outside the permissible Unicode range';

  // Wrap to ensure clean parameters are given to `parse`.
  function parseEntities(value, options) {
    var settings = {};
    var option;
    var key;

    if (!options) {
      options = {};
    }

    for (key in defaults) {
      option = options[key];
      settings[key] =
        option === null || option === undefined ? defaults[key] : option;
    }

    if (settings.position.indent || settings.position.start) {
      settings.indent = settings.position.indent || [];
      settings.position = settings.position.start;
    }

    return parse(value, settings)
  }

  // Parse entities.
  // eslint-disable-next-line complexity
  function parse(value, settings) {
    var additional = settings.additional;
    var nonTerminated = settings.nonTerminated;
    var handleText = settings.text;
    var handleReference = settings.reference;
    var handleWarning = settings.warning;
    var textContext = settings.textContext;
    var referenceContext = settings.referenceContext;
    var warningContext = settings.warningContext;
    var pos = settings.position;
    var indent = settings.indent || [];
    var length = value.length;
    var index = 0;
    var lines = -1;
    var column = pos.column || 1;
    var line = pos.line || 1;
    var queue = '';
    var result = [];
    var entityCharacters;
    var namedEntity;
    var terminated;
    var characters;
    var character;
    var reference;
    var following;
    var warning;
    var reason;
    var output;
    var entity;
    var begin;
    var start;
    var type;
    var test;
    var prev;
    var next;
    var diff;
    var end;

    if (typeof additional === 'string') {
      additional = additional.charCodeAt(0);
    }

    // Cache the current point.
    prev = now();

    // Wrap `handleWarning`.
    warning = handleWarning ? parseError : noop$1;

    // Ensure the algorithm walks over the first character and the end
    // (inclusive).
    index--;
    length++;

    while (++index < length) {
      // If the previous character was a newline.
      if (character === lineFeed) {
        column = indent[lines] || 1;
      }

      character = value.charCodeAt(index);

      if (character === ampersand) {
        following = value.charCodeAt(index + 1);

        // The behaviour depends on the identity of the next character.
        if (
          following === tab ||
          following === lineFeed ||
          following === formFeed ||
          following === space ||
          following === ampersand ||
          following === lessThan ||
          following !== following ||
          (additional && following === additional)
        ) {
          // Not a character reference.
          // No characters are consumed, and nothing is returned.
          // This is not an error, either.
          queue += fromCharCode(character);
          column++;

          continue
        }

        start = index + 1;
        begin = start;
        end = start;

        if (following === numberSign) {
          // Numerical entity.
          end = ++begin;

          // The behaviour further depends on the next character.
          following = value.charCodeAt(end);

          if (following === uppercaseX || following === lowercaseX) {
            // ASCII hex digits.
            type = hexa;
            end = ++begin;
          } else {
            // ASCII digits.
            type = deci;
          }
        } else {
          // Named entity.
          type = name;
        }

        entityCharacters = '';
        entity = '';
        characters = '';
        test = tests[type];
        end--;

        while (++end < length) {
          following = value.charCodeAt(end);

          if (!test(following)) {
            break
          }

          characters += fromCharCode(following);

          // Check if we can match a legacy named reference.
          // If so, we cache that as the last viable named reference.
          // This ensures we do not need to walk backwards later.
          if (type === name && own$4.call(legacy, characters)) {
            entityCharacters = characters;
            entity = legacy[characters];
          }
        }

        terminated = value.charCodeAt(end) === semicolon;

        if (terminated) {
          end++;

          namedEntity = type === name ? decodeEntity_1(characters) : false;

          if (namedEntity) {
            entityCharacters = characters;
            entity = namedEntity;
          }
        }

        diff = 1 + end - start;

        if (!terminated && !nonTerminated) ; else if (!characters) {
          // An empty (possible) entity is valid, unless it’s numeric (thus an
          // ampersand followed by an octothorp).
          if (type !== name) {
            warning(numericEmpty, diff);
          }
        } else if (type === name) {
          // An ampersand followed by anything unknown, and not terminated, is
          // invalid.
          if (terminated && !entity) {
            warning(namedUnknown, 1);
          } else {
            // If theres something after an entity name which is not known, cap
            // the reference.
            if (entityCharacters !== characters) {
              end = begin + entityCharacters.length;
              diff = 1 + end - begin;
              terminated = false;
            }

            // If the reference is not terminated, warn.
            if (!terminated) {
              reason = entityCharacters ? namedNotTerminated : namedEmpty;

              if (settings.attribute) {
                following = value.charCodeAt(end);

                if (following === equalsTo) {
                  warning(reason, diff);
                  entity = null;
                } else if (isAlphanumerical(following)) {
                  entity = null;
                } else {
                  warning(reason, diff);
                }
              } else {
                warning(reason, diff);
              }
            }
          }

          reference = entity;
        } else {
          if (!terminated) {
            // All non-terminated numeric entities are not rendered, and trigger a
            // warning.
            warning(numericNotTerminated, diff);
          }

          // When terminated and number, parse as either hexadecimal or decimal.
          reference = parseInt(characters, bases[type]);

          // Trigger a warning when the parsed number is prohibited, and replace
          // with replacement character.
          if (prohibited(reference)) {
            warning(numericProhibited, diff);
            reference = fromCharCode(replacementCharacter);
          } else if (reference in invalid) {
            // Trigger a warning when the parsed number is disallowed, and replace
            // by an alternative.
            warning(numericDisallowed, diff);
            reference = invalid[reference];
          } else {
            // Parse the number.
            output = '';

            // Trigger a warning when the parsed number should not be used.
            if (disallowed(reference)) {
              warning(numericDisallowed, diff);
            }

            // Stringify the number.
            if (reference > 0xffff) {
              reference -= 0x10000;
              output += fromCharCode((reference >>> (10 & 0x3ff)) | 0xd800);
              reference = 0xdc00 | (reference & 0x3ff);
            }

            reference = output + fromCharCode(reference);
          }
        }

        // Found it!
        // First eat the queued characters as normal text, then eat an entity.
        if (reference) {
          flush();

          prev = now();
          index = end - 1;
          column += end - start + 1;
          result.push(reference);
          next = now();
          next.offset++;

          if (handleReference) {
            handleReference.call(
              referenceContext,
              reference,
              {start: prev, end: next},
              value.slice(start - 1, end)
            );
          }

          prev = next;
        } else {
          // If we could not find a reference, queue the checked characters (as
          // normal characters), and move the pointer to their end.
          // This is possible because we can be certain neither newlines nor
          // ampersands are included.
          characters = value.slice(start - 1, end);
          queue += characters;
          column += characters.length;
          index = end - 1;
        }
      } else {
        // Handle anything other than an ampersand, including newlines and EOF.
        if (
          character === 10 // Line feed
        ) {
          line++;
          lines++;
          column = 0;
        }

        if (character === character) {
          queue += fromCharCode(character);
          column++;
        } else {
          flush();
        }
      }
    }

    // Return the reduced nodes.
    return result.join('')

    // Get current position.
    function now() {
      return {
        line: line,
        column: column,
        offset: index + (pos.offset || 0)
      }
    }

    // “Throw” a parse-error: a warning.
    function parseError(code, offset) {
      var position = now();

      position.column += offset;
      position.offset += offset;

      handleWarning.call(warningContext, messages[code], position, code);
    }

    // Flush `queue` (normal text).
    // Macro invoked before each entity and at the end of `value`.
    // Does nothing when `queue` is empty.
    function flush() {
      if (queue) {
        result.push(queue);

        if (handleText) {
          handleText.call(textContext, queue, {start: prev, end: now()});
        }

        queue = '';
      }
    }
  }

  // Check if `character` is outside the permissible unicode range.
  function prohibited(code) {
    return (code >= 0xd800 && code <= 0xdfff) || code > 0x10ffff
  }

  // Check if `character` is disallowed.
  function disallowed(code) {
    return (
      (code >= 0x0001 && code <= 0x0008) ||
      code === 0x000b ||
      (code >= 0x000d && code <= 0x001f) ||
      (code >= 0x007f && code <= 0x009f) ||
      (code >= 0xfdd0 && code <= 0xfdef) ||
      (code & 0xffff) === 0xffff ||
      (code & 0xffff) === 0xfffe
    )
  }

  var decode = factory$3;

  // Factory to create an entity decoder.
  function factory$3(ctx) {
    decoder.raw = decodeRaw;

    return decoder

    // Normalize `position` to add an `indent`.
    function normalize(position) {
      var offsets = ctx.offset;
      var line = position.line;
      var result = [];

      while (++line) {
        if (!(line in offsets)) {
          break
        }

        result.push((offsets[line] || 0) + 1);
      }

      return {start: position, indent: result}
    }

    // Decode `value` (at `position`) into text-nodes.
    function decoder(value, position, handler) {
      parseEntities_1(value, {
        position: normalize(position),
        warning: handleWarning,
        text: handler,
        reference: handler,
        textContext: ctx,
        referenceContext: ctx
      });
    }

    // Decode `value` (at `position`) into a string.
    function decodeRaw(value, position, options) {
      return parseEntities_1(
        value,
        immutable(options, {position: normalize(position), warning: handleWarning})
      )
    }

    // Handle a warning.
    // See <https://github.com/wooorm/parse-entities> for the warnings.
    function handleWarning(reason, position, code) {
      if (code !== 3) {
        ctx.file.message(reason, position);
      }
    }
  }

  var tokenizer = factory$4;

  // Construct a tokenizer.  This creates both `tokenizeInline` and `tokenizeBlock`.
  function factory$4(type) {
    return tokenize

    // Tokenizer for a bound `type`.
    function tokenize(value, location) {
      var self = this;
      var offset = self.offset;
      var tokens = [];
      var methods = self[type + 'Methods'];
      var tokenizers = self[type + 'Tokenizers'];
      var line = location.line;
      var column = location.column;
      var index;
      var length;
      var method;
      var name;
      var matched;
      var valueLength;

      // Trim white space only lines.
      if (!value) {
        return tokens
      }

      // Expose on `eat`.
      eat.now = now;
      eat.file = self.file;

      // Sync initial offset.
      updatePosition('');

      // Iterate over `value`, and iterate over all tokenizers.  When one eats
      // something, re-iterate with the remaining value.  If no tokenizer eats,
      // something failed (should not happen) and an exception is thrown.
      while (value) {
        index = -1;
        length = methods.length;
        matched = false;

        while (++index < length) {
          name = methods[index];
          method = tokenizers[name];

          // Previously, we had constructs such as footnotes and YAML that used
          // these properties.
          // Those are now external (plus there are userland extensions), that may
          // still use them.
          if (
            method &&
            /* istanbul ignore next */ (!method.onlyAtStart || self.atStart) &&
            /* istanbul ignore next */ (!method.notInList || !self.inList) &&
            /* istanbul ignore next */ (!method.notInBlock || !self.inBlock) &&
            (!method.notInLink || !self.inLink)
          ) {
            valueLength = value.length;

            method.apply(self, [eat, value]);

            matched = valueLength !== value.length;

            if (matched) {
              break
            }
          }
        }

        /* istanbul ignore if */
        if (!matched) {
          self.file.fail(new Error('Infinite loop'), eat.now());
        }
      }

      self.eof = now();

      return tokens

      // Update line, column, and offset based on `value`.
      function updatePosition(subvalue) {
        var lastIndex = -1;
        var index = subvalue.indexOf('\n');

        while (index !== -1) {
          line++;
          lastIndex = index;
          index = subvalue.indexOf('\n', index + 1);
        }

        if (lastIndex === -1) {
          column += subvalue.length;
        } else {
          column = subvalue.length - lastIndex;
        }

        if (line in offset) {
          if (lastIndex !== -1) {
            column += offset[line];
          } else if (column <= offset[line]) {
            column = offset[line] + 1;
          }
        }
      }

      // Get offset.  Called before the first character is eaten to retrieve the
      // range’s offsets.
      function getOffset() {
        var indentation = [];
        var pos = line + 1;

        // Done.  Called when the last character is eaten to retrieve the range’s
        // offsets.
        return function () {
          var last = line + 1;

          while (pos < last) {
            indentation.push((offset[pos] || 0) + 1);

            pos++;
          }

          return indentation
        }
      }

      // Get the current position.
      function now() {
        var pos = {line: line, column: column};

        pos.offset = self.toOffset(pos);

        return pos
      }

      // Store position information for a node.
      function Position(start) {
        this.start = start;
        this.end = now();
      }

      // Throw when a value is incorrectly eaten.  This shouldn’t happen but will
      // throw on new, incorrect rules.
      function validateEat(subvalue) {
        /* istanbul ignore if */
        if (value.slice(0, subvalue.length) !== subvalue) {
          // Capture stack-trace.
          self.file.fail(
            new Error(
              'Incorrectly eaten value: please report this warning on https://git.io/vg5Ft'
            ),
            now()
          );
        }
      }

      // Mark position and patch `node.position`.
      function position() {
        var before = now();

        return update

        // Add the position to a node.
        function update(node, indent) {
          var previous = node.position;
          var start = previous ? previous.start : before;
          var combined = [];
          var n = previous && previous.end.line;
          var l = before.line;

          node.position = new Position(start);

          // If there was already a `position`, this node was merged.  Fixing
          // `start` wasn’t hard, but the indent is different.  Especially
          // because some information, the indent between `n` and `l` wasn’t
          // tracked.  Luckily, that space is (should be?) empty, so we can
          // safely check for it now.
          if (previous && indent && previous.indent) {
            combined = previous.indent;

            if (n < l) {
              while (++n < l) {
                combined.push((offset[n] || 0) + 1);
              }

              combined.push(before.column);
            }

            indent = combined.concat(indent);
          }

          node.position.indent = indent || [];

          return node
        }
      }

      // Add `node` to `parent`s children or to `tokens`.  Performs merges where
      // possible.
      function add(node, parent) {
        var children = parent ? parent.children : tokens;
        var previous = children[children.length - 1];
        var fn;

        if (
          previous &&
          node.type === previous.type &&
          (node.type === 'text' || node.type === 'blockquote') &&
          mergeable(previous) &&
          mergeable(node)
        ) {
          fn = node.type === 'text' ? mergeText : mergeBlockquote;
          node = fn.call(self, previous, node);
        }

        if (node !== previous) {
          children.push(node);
        }

        if (self.atStart && tokens.length !== 0) {
          self.exitStart();
        }

        return node
      }

      // Remove `subvalue` from `value`.  `subvalue` must be at the start of
      // `value`.
      function eat(subvalue) {
        var indent = getOffset();
        var pos = position();
        var current = now();

        validateEat(subvalue);

        apply.reset = reset;
        reset.test = test;
        apply.test = test;

        value = value.slice(subvalue.length);

        updatePosition(subvalue);

        indent = indent();

        return apply

        // Add the given arguments, add `position` to the returned node, and
        // return the node.
        function apply(node, parent) {
          return pos(add(pos(node), parent), indent)
        }

        // Functions just like apply, but resets the content: the line and
        // column are reversed, and the eaten value is re-added.   This is
        // useful for nodes with a single type of content, such as lists and
        // tables.  See `apply` above for what parameters are expected.
        function reset() {
          var node = apply.apply(null, arguments);

          line = current.line;
          column = current.column;
          value = subvalue + value;

          return node
        }

        // Test the position, after eating, and reverse to a not-eaten state.
        function test() {
          var result = pos({});

          line = current.line;
          column = current.column;
          value = subvalue + value;

          return result.position
        }
      }
    }
  }

  // Check whether a node is mergeable with adjacent nodes.
  function mergeable(node) {
    var start;
    var end;

    if (node.type !== 'text' || !node.position) {
      return true
    }

    start = node.position.start;
    end = node.position.end;

    // Only merge nodes which occupy the same size as their `value`.
    return (
      start.line !== end.line || end.column - start.column === node.value.length
    )
  }

  // Merge two text nodes: `node` into `prev`.
  function mergeText(previous, node) {
    previous.value += node.value;

    return previous
  }

  // Merge two blockquotes: `node` into `prev`, unless in CommonMark or gfm modes.
  function mergeBlockquote(previous, node) {
    if (this.options.commonmark || this.options.gfm) {
      return node
    }

    previous.children = previous.children.concat(node.children);

    return previous
  }

  var markdownEscapes = escapes;

  var defaults$1 = [
    '\\',
    '`',
    '*',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!',
    '_',
    '>'
  ];

  var gfm = defaults$1.concat(['~', '|']);

  var commonmark = gfm.concat([
    '\n',
    '"',
    '$',
    '%',
    '&',
    "'",
    ',',
    '/',
    ':',
    ';',
    '<',
    '=',
    '?',
    '@',
    '^'
  ]);

  escapes.default = defaults$1;
  escapes.gfm = gfm;
  escapes.commonmark = commonmark;

  // Get markdown escapes.
  function escapes(options) {
    var settings = options || {};

    if (settings.commonmark) {
      return commonmark
    }

    return settings.gfm ? gfm : defaults$1
  }

  var blockElements = [
    'address',
    'article',
    'aside',
    'base',
    'basefont',
    'blockquote',
    'body',
    'caption',
    'center',
    'col',
    'colgroup',
    'dd',
    'details',
    'dialog',
    'dir',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'iframe',
    'legend',
    'li',
    'link',
    'main',
    'menu',
    'menuitem',
    'meta',
    'nav',
    'noframes',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'pre',
    'section',
    'source',
    'title',
    'summary',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'title',
    'tr',
    'track',
    'ul'
  ];

  var defaults$2 = {
    position: true,
    gfm: true,
    commonmark: false,
    pedantic: false,
    blocks: blockElements
  };

  var setOptions_1 = setOptions;

  function setOptions(options) {
    var self = this;
    var current = self.options;
    var key;
    var value;

    if (options == null) {
      options = {};
    } else if (typeof options === 'object') {
      options = immutable(options);
    } else {
      throw new Error('Invalid value `' + options + '` for setting `options`')
    }

    for (key in defaults$2) {
      value = options[key];

      if (value == null) {
        value = current[key];
      }

      if (
        (key !== 'blocks' && typeof value !== 'boolean') ||
        (key === 'blocks' && typeof value !== 'object')
      ) {
        throw new Error(
          'Invalid value `' + value + '` for setting `options.' + key + '`'
        )
      }

      options[key] = value;
    }

    self.options = options;
    self.escape = markdownEscapes(options);

    return self
  }

  var convert_1 = convert;

  function convert(test) {
    if (typeof test === 'string') {
      return typeFactory(test)
    }

    if (test === null || test === undefined) {
      return ok
    }

    if (typeof test === 'object') {
      return ('length' in test ? anyFactory : matchesFactory)(test)
    }

    if (typeof test === 'function') {
      return test
    }

    throw new Error('Expected function, string, or object as test')
  }

  function convertAll(tests) {
    var results = [];
    var length = tests.length;
    var index = -1;

    while (++index < length) {
      results[index] = convert(tests[index]);
    }

    return results
  }

  // Utility assert each property in `test` is represented in `node`, and each
  // values are strictly equal.
  function matchesFactory(test) {
    return matches

    function matches(node) {
      var key;

      for (key in test) {
        if (node[key] !== test[key]) {
          return false
        }
      }

      return true
    }
  }

  function anyFactory(tests) {
    var checks = convertAll(tests);
    var length = checks.length;

    return matches

    function matches() {
      var index = -1;

      while (++index < length) {
        if (checks[index].apply(this, arguments)) {
          return true
        }
      }

      return false
    }
  }

  // Utility to convert a string into a function which checks a given node’s type
  // for said string.
  function typeFactory(test) {
    return type

    function type(node) {
      return Boolean(node && node.type === test)
    }
  }

  // Utility to return true.
  function ok() {
    return true
  }

  var unistUtilVisitParents = visitParents;



  var CONTINUE = true;
  var SKIP = 'skip';
  var EXIT = false;

  visitParents.CONTINUE = CONTINUE;
  visitParents.SKIP = SKIP;
  visitParents.EXIT = EXIT;

  function visitParents(tree, test, visitor, reverse) {
    var is;

    if (typeof test === 'function' && typeof visitor !== 'function') {
      reverse = visitor;
      visitor = test;
      test = null;
    }

    is = convert_1(test);

    one(tree, null, []);

    // Visit a single node.
    function one(node, index, parents) {
      var result = [];
      var subresult;

      if (!test || is(node, index, parents[parents.length - 1] || null)) {
        result = toResult(visitor(node, parents));

        if (result[0] === EXIT) {
          return result
        }
      }

      if (node.children && result[0] !== SKIP) {
        subresult = toResult(all(node.children, parents.concat(node)));
        return subresult[0] === EXIT ? subresult : result
      }

      return result
    }

    // Visit children in `parent`.
    function all(children, parents) {
      var min = -1;
      var step = reverse ? -1 : 1;
      var index = (reverse ? children.length : min) + step;
      var result;

      while (index > min && index < children.length) {
        result = one(children[index], index, parents);

        if (result[0] === EXIT) {
          return result
        }

        index = typeof result[1] === 'number' ? result[1] : index + step;
      }
    }
  }

  function toResult(value) {
    if (value !== null && typeof value === 'object' && 'length' in value) {
      return value
    }

    if (typeof value === 'number') {
      return [CONTINUE, value]
    }

    return [value]
  }

  var unistUtilVisit = visit;



  var CONTINUE$1 = unistUtilVisitParents.CONTINUE;
  var SKIP$1 = unistUtilVisitParents.SKIP;
  var EXIT$1 = unistUtilVisitParents.EXIT;

  visit.CONTINUE = CONTINUE$1;
  visit.SKIP = SKIP$1;
  visit.EXIT = EXIT$1;

  function visit(tree, test, visitor, reverse) {
    if (typeof test === 'function' && typeof visitor !== 'function') {
      reverse = visitor;
      visitor = test;
      test = null;
    }

    unistUtilVisitParents(tree, test, overload, reverse);

    function overload(node, parents) {
      var parent = parents[parents.length - 1];
      var index = parent ? parent.children.indexOf(node) : null;
      return visitor(node, index, parent)
    }
  }

  var unistUtilRemovePosition = removePosition;

  function removePosition(node, force) {
    unistUtilVisit(node, force ? hard : soft);
    return node
  }

  function hard(node) {
    delete node.position;
  }

  function soft(node) {
    node.position = undefined;
  }

  var parse_1 = parse$1;

  var lineFeed$1 = '\n';
  var lineBreaksExpression = /\r\n|\r/g;

  // Parse the bound file.
  function parse$1() {
    var self = this;
    var value = String(self.file);
    var start = {line: 1, column: 1, offset: 0};
    var content = immutable(start);
    var node;

    // Clean non-unix newlines: `\r\n` and `\r` are all changed to `\n`.
    // This should not affect positional information.
    value = value.replace(lineBreaksExpression, lineFeed$1);

    // BOM.
    if (value.charCodeAt(0) === 0xfeff) {
      value = value.slice(1);

      content.column++;
      content.offset++;
    }

    node = {
      type: 'root',
      children: self.tokenizeBlock(value, content),
      position: {start: start, end: self.eof || immutable(start)}
    };

    if (!self.options.position) {
      unistUtilRemovePosition(node, true);
    }

    return node
  }

  // A line containing no characters, or a line containing only spaces (U+0020) or
  // tabs (U+0009), is called a blank line.
  // See <https://spec.commonmark.org/0.29/#blank-line>.
  var reBlankLine = /^[ \t]*(\n|$)/;

  // Note that though blank lines play a special role in lists to determine
  // whether the list is tight or loose
  // (<https://spec.commonmark.org/0.29/#blank-lines>), it’s done by the list
  // tokenizer and this blank line tokenizer does not have to be responsible for
  // that.
  // Therefore, configs such as `blankLine.notInList` do not have to be set here.
  var blankLine_1 = blankLine;

  function blankLine(eat, value, silent) {
    var match;
    var subvalue = '';
    var index = 0;
    var length = value.length;

    while (index < length) {
      match = reBlankLine.exec(value.slice(index));

      if (match == null) {
        break
      }

      index += match[0].length;
      subvalue += match[0];
    }

    if (subvalue === '') {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    eat(subvalue);
  }

  /*!
   * repeat-string <https://github.com/jonschlinkert/repeat-string>
   *
   * Copyright (c) 2014-2015, Jon Schlinkert.
   * Licensed under the MIT License.
   */

  /**
   * Results cache
   */

  var res = '';
  var cache;

  /**
   * Expose `repeat`
   */

  var repeatString = repeat;

  /**
   * Repeat the given `string` the specified `number`
   * of times.
   *
   * **Example:**
   *
   * ```js
   * var repeat = require('repeat-string');
   * repeat('A', 5);
   * //=> AAAAA
   * ```
   *
   * @param {String} `string` The string to repeat
   * @param {Number} `number` The number of times to repeat the string
   * @return {String} Repeated string
   * @api public
   */

  function repeat(str, num) {
    if (typeof str !== 'string') {
      throw new TypeError('expected a string');
    }

    // cover common, quick use cases
    if (num === 1) return str;
    if (num === 2) return str + str;

    var max = str.length * num;
    if (cache !== str || typeof cache === 'undefined') {
      cache = str;
      res = '';
    } else if (res.length >= max) {
      return res.substr(0, max);
    }

    while (max > res.length && num > 1) {
      if (num & 1) {
        res += str;
      }

      num >>= 1;
      str += str;
    }

    res += str;
    res = res.substr(0, max);
    return res;
  }

  var trimTrailingLines_1 = trimTrailingLines;

  var line = '\n';

  // Remove final newline characters from `value`.
  function trimTrailingLines(value) {
    var val = String(value);
    var index = val.length;

    while (val.charAt(--index) === line) {
      // Empty
    }

    return val.slice(0, index + 1)
  }

  var codeIndented = indentedCode;

  var lineFeed$2 = '\n';
  var tab$1 = '\t';
  var space$1 = ' ';

  var tabSize = 4;
  var codeIndent = repeatString(space$1, tabSize);

  function indentedCode(eat, value, silent) {
    var index = -1;
    var length = value.length;
    var subvalue = '';
    var content = '';
    var subvalueQueue = '';
    var contentQueue = '';
    var character;
    var blankQueue;
    var indent;

    while (++index < length) {
      character = value.charAt(index);

      if (indent) {
        indent = false;

        subvalue += subvalueQueue;
        content += contentQueue;
        subvalueQueue = '';
        contentQueue = '';

        if (character === lineFeed$2) {
          subvalueQueue = character;
          contentQueue = character;
        } else {
          subvalue += character;
          content += character;

          while (++index < length) {
            character = value.charAt(index);

            if (!character || character === lineFeed$2) {
              contentQueue = character;
              subvalueQueue = character;
              break
            }

            subvalue += character;
            content += character;
          }
        }
      } else if (
        character === space$1 &&
        value.charAt(index + 1) === character &&
        value.charAt(index + 2) === character &&
        value.charAt(index + 3) === character
      ) {
        subvalueQueue += codeIndent;
        index += 3;
        indent = true;
      } else if (character === tab$1) {
        subvalueQueue += character;
        indent = true;
      } else {
        blankQueue = '';

        while (character === tab$1 || character === space$1) {
          blankQueue += character;
          character = value.charAt(++index);
        }

        if (character !== lineFeed$2) {
          break
        }

        subvalueQueue += blankQueue + character;
        contentQueue += character;
      }
    }

    if (content) {
      if (silent) {
        return true
      }

      return eat(subvalue)({
        type: 'code',
        lang: null,
        meta: null,
        value: trimTrailingLines_1(content)
      })
    }
  }

  var codeFenced = fencedCode;

  var lineFeed$3 = '\n';
  var tab$2 = '\t';
  var space$2 = ' ';
  var tilde$1 = '~';
  var graveAccent = '`';

  var minFenceCount = 3;
  var tabSize$1 = 4;

  function fencedCode(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var length = value.length + 1;
    var index = 0;
    var subvalue = '';
    var fenceCount;
    var marker;
    var character;
    var flag;
    var lang;
    var meta;
    var queue;
    var content;
    var exdentedContent;
    var closing;
    var exdentedClosing;
    var indent;
    var now;

    if (!gfm) {
      return
    }

    // Eat initial spacing.
    while (index < length) {
      character = value.charAt(index);

      if (character !== space$2 && character !== tab$2) {
        break
      }

      subvalue += character;
      index++;
    }

    indent = index;

    // Eat the fence.
    character = value.charAt(index);

    if (character !== tilde$1 && character !== graveAccent) {
      return
    }

    index++;
    marker = character;
    fenceCount = 1;
    subvalue += character;

    while (index < length) {
      character = value.charAt(index);

      if (character !== marker) {
        break
      }

      subvalue += character;
      fenceCount++;
      index++;
    }

    if (fenceCount < minFenceCount) {
      return
    }

    // Eat spacing before flag.
    while (index < length) {
      character = value.charAt(index);

      if (character !== space$2 && character !== tab$2) {
        break
      }

      subvalue += character;
      index++;
    }

    // Eat flag.
    flag = '';
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (
        character === lineFeed$3 ||
        (marker === graveAccent && character === marker)
      ) {
        break
      }

      if (character === space$2 || character === tab$2) {
        queue += character;
      } else {
        flag += queue + character;
        queue = '';
      }

      index++;
    }

    character = value.charAt(index);

    if (character && character !== lineFeed$3) {
      return
    }

    if (silent) {
      return true
    }

    now = eat.now();
    now.column += subvalue.length;
    now.offset += subvalue.length;

    subvalue += flag;
    flag = self.decode.raw(self.unescape(flag), now);

    if (queue) {
      subvalue += queue;
    }

    queue = '';
    closing = '';
    exdentedClosing = '';
    content = '';
    exdentedContent = '';
    var skip = true;

    // Eat content.
    while (index < length) {
      character = value.charAt(index);
      content += closing;
      exdentedContent += exdentedClosing;
      closing = '';
      exdentedClosing = '';

      if (character !== lineFeed$3) {
        content += character;
        exdentedClosing += character;
        index++;
        continue
      }

      // The first line feed is ignored. Others aren’t.
      if (skip) {
        subvalue += character;
        skip = false;
      } else {
        closing += character;
        exdentedClosing += character;
      }

      queue = '';
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$2) {
          break
        }

        queue += character;
        index++;
      }

      closing += queue;
      exdentedClosing += queue.slice(indent);

      if (queue.length >= tabSize$1) {
        continue
      }

      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character !== marker) {
          break
        }

        queue += character;
        index++;
      }

      closing += queue;
      exdentedClosing += queue;

      if (queue.length < fenceCount) {
        continue
      }

      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$2 && character !== tab$2) {
          break
        }

        closing += character;
        exdentedClosing += character;
        index++;
      }

      if (!character || character === lineFeed$3) {
        break
      }
    }

    subvalue += content + closing;

    // Get lang and meta from the flag.
    index = -1;
    length = flag.length;

    while (++index < length) {
      character = flag.charAt(index);

      if (character === space$2 || character === tab$2) {
        if (!lang) {
          lang = flag.slice(0, index);
        }
      } else if (lang) {
        meta = flag.slice(index);
        break
      }
    }

    return eat(subvalue)({
      type: 'code',
      lang: lang || flag || null,
      meta: meta || null,
      value: exdentedContent
    })
  }

  var trim_1 = createCommonjsModule(function (module, exports) {
  exports = module.exports = trim;

  function trim(str){
    return str.replace(/^\s*|\s*$/g, '');
  }

  exports.left = function(str){
    return str.replace(/^\s*/, '');
  };

  exports.right = function(str){
    return str.replace(/\s*$/, '');
  };
  });

  var interrupt_1 = interrupt;

  function interrupt(interruptors, tokenizers, ctx, parameters) {
    var length = interruptors.length;
    var index = -1;
    var interruptor;
    var config;

    while (++index < length) {
      interruptor = interruptors[index];
      config = interruptor[1] || {};

      if (
        config.pedantic !== undefined &&
        config.pedantic !== ctx.options.pedantic
      ) {
        continue
      }

      if (
        config.commonmark !== undefined &&
        config.commonmark !== ctx.options.commonmark
      ) {
        continue
      }

      if (tokenizers[interruptor[0]].apply(ctx, parameters)) {
        return true
      }
    }

    return false
  }

  var blockquote_1 = blockquote;

  var lineFeed$4 = '\n';
  var tab$3 = '\t';
  var space$3 = ' ';
  var greaterThan = '>';

  function blockquote(eat, value, silent) {
    var self = this;
    var offsets = self.offset;
    var tokenizers = self.blockTokenizers;
    var interruptors = self.interruptBlockquote;
    var now = eat.now();
    var currentLine = now.line;
    var length = value.length;
    var values = [];
    var contents = [];
    var indents = [];
    var add;
    var index = 0;
    var character;
    var rest;
    var nextIndex;
    var content;
    var line;
    var startIndex;
    var prefixed;
    var exit;

    while (index < length) {
      character = value.charAt(index);

      if (character !== space$3 && character !== tab$3) {
        break
      }

      index++;
    }

    if (value.charAt(index) !== greaterThan) {
      return
    }

    if (silent) {
      return true
    }

    index = 0;

    while (index < length) {
      nextIndex = value.indexOf(lineFeed$4, index);
      startIndex = index;
      prefixed = false;

      if (nextIndex === -1) {
        nextIndex = length;
      }

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$3 && character !== tab$3) {
          break
        }

        index++;
      }

      if (value.charAt(index) === greaterThan) {
        index++;
        prefixed = true;

        if (value.charAt(index) === space$3) {
          index++;
        }
      } else {
        index = startIndex;
      }

      content = value.slice(index, nextIndex);

      if (!prefixed && !trim_1(content)) {
        index = startIndex;
        break
      }

      if (!prefixed) {
        rest = value.slice(index);

        // Check if the following code contains a possible block.
        if (interrupt_1(interruptors, tokenizers, self, [eat, rest, true])) {
          break
        }
      }

      line = startIndex === index ? content : value.slice(startIndex, nextIndex);

      indents.push(index - startIndex);
      values.push(line);
      contents.push(content);

      index = nextIndex + 1;
    }

    index = -1;
    length = indents.length;
    add = eat(values.join(lineFeed$4));

    while (++index < length) {
      offsets[currentLine] = (offsets[currentLine] || 0) + indents[index];
      currentLine++;
    }

    exit = self.enterBlock();
    contents = self.tokenizeBlock(contents.join(lineFeed$4), now);
    exit();

    return add({type: 'blockquote', children: contents})
  }

  var headingAtx = atxHeading;

  var lineFeed$5 = '\n';
  var tab$4 = '\t';
  var space$4 = ' ';
  var numberSign$1 = '#';

  var maxFenceCount = 6;

  function atxHeading(eat, value, silent) {
    var self = this;
    var pedantic = self.options.pedantic;
    var length = value.length + 1;
    var index = -1;
    var now = eat.now();
    var subvalue = '';
    var content = '';
    var character;
    var queue;
    var depth;

    // Eat initial spacing.
    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$4 && character !== tab$4) {
        index--;
        break
      }

      subvalue += character;
    }

    // Eat hashes.
    depth = 0;

    while (++index <= length) {
      character = value.charAt(index);

      if (character !== numberSign$1) {
        index--;
        break
      }

      subvalue += character;
      depth++;
    }

    if (depth > maxFenceCount) {
      return
    }

    if (!depth || (!pedantic && value.charAt(index + 1) === numberSign$1)) {
      return
    }

    length = value.length + 1;

    // Eat intermediate white-space.
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$4 && character !== tab$4) {
        index--;
        break
      }

      queue += character;
    }

    // Exit when not in pedantic mode without spacing.
    if (!pedantic && queue.length === 0 && character && character !== lineFeed$5) {
      return
    }

    if (silent) {
      return true
    }

    // Eat content.
    subvalue += queue;
    queue = '';
    content = '';

    while (++index < length) {
      character = value.charAt(index);

      if (!character || character === lineFeed$5) {
        break
      }

      if (character !== space$4 && character !== tab$4 && character !== numberSign$1) {
        content += queue + character;
        queue = '';
        continue
      }

      while (character === space$4 || character === tab$4) {
        queue += character;
        character = value.charAt(++index);
      }

      // `#` without a queue is part of the content.
      if (!pedantic && content && !queue && character === numberSign$1) {
        content += character;
        continue
      }

      while (character === numberSign$1) {
        queue += character;
        character = value.charAt(++index);
      }

      while (character === space$4 || character === tab$4) {
        queue += character;
        character = value.charAt(++index);
      }

      index--;
    }

    now.column += subvalue.length;
    now.offset += subvalue.length;
    subvalue += content + queue;

    return eat(subvalue)({
      type: 'heading',
      depth: depth,
      children: self.tokenizeInline(content, now)
    })
  }

  var thematicBreak_1 = thematicBreak;

  var tab$5 = '\t';
  var lineFeed$6 = '\n';
  var space$5 = ' ';
  var asterisk = '*';
  var dash$1 = '-';
  var underscore = '_';

  var maxCount = 3;

  function thematicBreak(eat, value, silent) {
    var index = -1;
    var length = value.length + 1;
    var subvalue = '';
    var character;
    var marker;
    var markerCount;
    var queue;

    while (++index < length) {
      character = value.charAt(index);

      if (character !== tab$5 && character !== space$5) {
        break
      }

      subvalue += character;
    }

    if (
      character !== asterisk &&
      character !== dash$1 &&
      character !== underscore
    ) {
      return
    }

    marker = character;
    subvalue += character;
    markerCount = 1;
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character === marker) {
        markerCount++;
        subvalue += queue + marker;
        queue = '';
      } else if (character === space$5) {
        queue += character;
      } else if (
        markerCount >= maxCount &&
        (!character || character === lineFeed$6)
      ) {
        subvalue += queue;

        if (silent) {
          return true
        }

        return eat(subvalue)({type: 'thematicBreak'})
      } else {
        return
      }
    }
  }

  var getIndentation = indentation;

  var tab$6 = '\t';
  var space$6 = ' ';

  var spaceSize = 1;
  var tabSize$2 = 4;

  // Gets indentation information for a line.
  function indentation(value) {
    var index = 0;
    var indent = 0;
    var character = value.charAt(index);
    var stops = {};
    var size;
    var lastIndent = 0;

    while (character === tab$6 || character === space$6) {
      size = character === tab$6 ? tabSize$2 : spaceSize;

      indent += size;

      if (size > 1) {
        indent = Math.floor(indent / size) * size;
      }

      while (lastIndent < indent) {
        stops[++lastIndent] = index;
      }

      character = value.charAt(++index);
    }

    return {indent: indent, stops: stops}
  }

  var removeIndentation = indentation$1;

  var lineFeed$7 = '\n';
  var space$7 = ' ';
  var exclamationMark = '!';

  // Remove the minimum indent from every line in `value`.  Supports both tab,
  // spaced, and mixed indentation (as well as possible).
  function indentation$1(value, maximum) {
    var values = value.split(lineFeed$7);
    var position = values.length + 1;
    var minIndent = Infinity;
    var matrix = [];
    var index;
    var indentation;
    var stops;

    values.unshift(repeatString(space$7, maximum) + exclamationMark);

    while (position--) {
      indentation = getIndentation(values[position]);

      matrix[position] = indentation.stops;

      if (trim_1(values[position]).length === 0) {
        continue
      }

      if (indentation.indent) {
        if (indentation.indent > 0 && indentation.indent < minIndent) {
          minIndent = indentation.indent;
        }
      } else {
        minIndent = Infinity;

        break
      }
    }

    if (minIndent !== Infinity) {
      position = values.length;

      while (position--) {
        stops = matrix[position];
        index = minIndent;

        while (index && !(index in stops)) {
          index--;
        }

        values[position] = values[position].slice(stops[index] + 1);
      }
    }

    values.shift();

    return values.join(lineFeed$7)
  }

  var list_1 = list;

  var asterisk$1 = '*';
  var underscore$1 = '_';
  var plusSign = '+';
  var dash$2 = '-';
  var dot$1 = '.';
  var space$8 = ' ';
  var lineFeed$8 = '\n';
  var tab$7 = '\t';
  var rightParenthesis = ')';
  var lowercaseX$1 = 'x';

  var tabSize$3 = 4;
  var looseListItemExpression = /\n\n(?!\s*$)/;
  var taskItemExpression = /^\[([ X\tx])][ \t]/;
  var bulletExpression = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/;
  var pedanticBulletExpression = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
  var initialIndentExpression = /^( {1,4}|\t)?/gm;

  function list(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var pedantic = self.options.pedantic;
    var tokenizers = self.blockTokenizers;
    var interuptors = self.interruptList;
    var index = 0;
    var length = value.length;
    var start = null;
    var size;
    var queue;
    var ordered;
    var character;
    var marker;
    var nextIndex;
    var startIndex;
    var prefixed;
    var currentMarker;
    var content;
    var line;
    var previousEmpty;
    var empty;
    var items;
    var allLines;
    var emptyLines;
    var item;
    var enterTop;
    var exitBlockquote;
    var spread = false;
    var node;
    var now;
    var end;
    var indented;

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$7 && character !== space$8) {
        break
      }

      index++;
    }

    character = value.charAt(index);

    if (character === asterisk$1 || character === plusSign || character === dash$2) {
      marker = character;
      ordered = false;
    } else {
      ordered = true;
      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (!isDecimal(character)) {
          break
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (
        !queue ||
        !(character === dot$1 || (commonmark && character === rightParenthesis))
      ) {
        return
      }

      /* Slightly abusing `silent` mode, whose goal is to make interrupting
       * paragraphs work.
       * Well, that’s exactly what we want to do here: don’t interrupt:
       * 2. here, because the “list” doesn’t start with `1`. */
      if (silent && queue !== '1') {
        return
      }

      start = parseInt(queue, 10);
      marker = character;
    }

    character = value.charAt(++index);

    if (
      character !== space$8 &&
      character !== tab$7 &&
      (pedantic || (character !== lineFeed$8 && character !== ''))
    ) {
      return
    }

    if (silent) {
      return true
    }

    index = 0;
    items = [];
    allLines = [];
    emptyLines = [];

    while (index < length) {
      nextIndex = value.indexOf(lineFeed$8, index);
      startIndex = index;
      prefixed = false;
      indented = false;

      if (nextIndex === -1) {
        nextIndex = length;
      }

      size = 0;

      while (index < length) {
        character = value.charAt(index);

        if (character === tab$7) {
          size += tabSize$3 - (size % tabSize$3);
        } else if (character === space$8) {
          size++;
        } else {
          break
        }

        index++;
      }

      if (item && size >= item.indent) {
        indented = true;
      }

      character = value.charAt(index);
      currentMarker = null;

      if (!indented) {
        if (
          character === asterisk$1 ||
          character === plusSign ||
          character === dash$2
        ) {
          currentMarker = character;
          index++;
          size++;
        } else {
          queue = '';

          while (index < length) {
            character = value.charAt(index);

            if (!isDecimal(character)) {
              break
            }

            queue += character;
            index++;
          }

          character = value.charAt(index);
          index++;

          if (
            queue &&
            (character === dot$1 || (commonmark && character === rightParenthesis))
          ) {
            currentMarker = character;
            size += queue.length + 1;
          }
        }

        if (currentMarker) {
          character = value.charAt(index);

          if (character === tab$7) {
            size += tabSize$3 - (size % tabSize$3);
            index++;
          } else if (character === space$8) {
            end = index + tabSize$3;

            while (index < end) {
              if (value.charAt(index) !== space$8) {
                break
              }

              index++;
              size++;
            }

            if (index === end && value.charAt(index) === space$8) {
              index -= tabSize$3 - 1;
              size -= tabSize$3 - 1;
            }
          } else if (character !== lineFeed$8 && character !== '') {
            currentMarker = null;
          }
        }
      }

      if (currentMarker) {
        if (!pedantic && marker !== currentMarker) {
          break
        }

        prefixed = true;
      } else {
        if (!commonmark && !indented && value.charAt(startIndex) === space$8) {
          indented = true;
        } else if (commonmark && item) {
          indented = size >= item.indent || size > tabSize$3;
        }

        prefixed = false;
        index = startIndex;
      }

      line = value.slice(startIndex, nextIndex);
      content = startIndex === index ? line : value.slice(index, nextIndex);

      if (
        currentMarker === asterisk$1 ||
        currentMarker === underscore$1 ||
        currentMarker === dash$2
      ) {
        if (tokenizers.thematicBreak.call(self, eat, line, true)) {
          break
        }
      }

      previousEmpty = empty;
      empty = !prefixed && !trim_1(content).length;

      if (indented && item) {
        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (prefixed) {
        if (emptyLines.length !== 0) {
          spread = true;
          item.value.push('');
          item.trail = emptyLines.concat();
        }

        item = {
          value: [line],
          indent: size,
          trail: []
        };

        items.push(item);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (empty) {
        if (previousEmpty && !commonmark) {
          break
        }

        emptyLines.push(line);
      } else {
        if (previousEmpty) {
          break
        }

        if (interrupt_1(interuptors, tokenizers, self, [eat, line, true])) {
          break
        }

        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      }

      index = nextIndex + 1;
    }

    node = eat(allLines.join(lineFeed$8)).reset({
      type: 'list',
      ordered: ordered,
      start: start,
      spread: spread,
      children: []
    });

    enterTop = self.enterList();
    exitBlockquote = self.enterBlock();
    index = -1;
    length = items.length;

    while (++index < length) {
      item = items[index].value.join(lineFeed$8);
      now = eat.now();

      eat(item)(listItem(self, item, now), node);

      item = items[index].trail.join(lineFeed$8);

      if (index !== length - 1) {
        item += lineFeed$8;
      }

      eat(item);
    }

    enterTop();
    exitBlockquote();

    return node
  }

  function listItem(ctx, value, position) {
    var offsets = ctx.offset;
    var fn = ctx.options.pedantic ? pedanticListItem : normalListItem;
    var checked = null;
    var task;
    var indent;

    value = fn.apply(null, arguments);

    if (ctx.options.gfm) {
      task = value.match(taskItemExpression);

      if (task) {
        indent = task[0].length;
        checked = task[1].toLowerCase() === lowercaseX$1;
        offsets[position.line] += indent;
        value = value.slice(indent);
      }
    }

    return {
      type: 'listItem',
      spread: looseListItemExpression.test(value),
      checked: checked,
      children: ctx.tokenizeBlock(value, position)
    }
  }

  // Create a list-item using overly simple mechanics.
  function pedanticListItem(ctx, value, position) {
    var offsets = ctx.offset;
    var line = position.line;

    // Remove the list-item’s bullet.
    value = value.replace(pedanticBulletExpression, replacer);

    // The initial line was also matched by the below, so we reset the `line`.
    line = position.line;

    return value.replace(initialIndentExpression, replacer)

    // A simple replacer which removed all matches, and adds their length to
    // `offset`.
    function replacer($0) {
      offsets[line] = (offsets[line] || 0) + $0.length;
      line++;

      return ''
    }
  }

  // Create a list-item using sane mechanics.
  function normalListItem(ctx, value, position) {
    var offsets = ctx.offset;
    var line = position.line;
    var max;
    var bullet;
    var rest;
    var lines;
    var trimmedLines;
    var index;
    var length;

    // Remove the list-item’s bullet.
    value = value.replace(bulletExpression, replacer);

    lines = value.split(lineFeed$8);

    trimmedLines = removeIndentation(value, getIndentation(max).indent).split(lineFeed$8);

    // We replaced the initial bullet with something else above, which was used
    // to trick `removeIndentation` into removing some more characters when
    // possible.  However, that could result in the initial line to be stripped
    // more than it should be.
    trimmedLines[0] = rest;

    offsets[line] = (offsets[line] || 0) + bullet.length;
    line++;

    index = 0;
    length = lines.length;

    while (++index < length) {
      offsets[line] =
        (offsets[line] || 0) + lines[index].length - trimmedLines[index].length;
      line++;
    }

    return trimmedLines.join(lineFeed$8)

    /* eslint-disable-next-line max-params */
    function replacer($0, $1, $2, $3, $4) {
      bullet = $1 + $2 + $3;
      rest = $4;

      // Make sure that the first nine numbered list items can indent with an
      // extra space.  That is, when the bullet did not receive an extra final
      // space.
      if (Number($2) < 10 && bullet.length % 2 === 1) {
        $2 = space$8 + $2;
      }

      max = $1 + repeatString(space$8, $2.length) + $3;

      return max + rest
    }
  }

  var headingSetext = setextHeading;

  var lineFeed$9 = '\n';
  var tab$8 = '\t';
  var space$9 = ' ';
  var equalsTo$1 = '=';
  var dash$3 = '-';

  var maxIndent = 3;

  var equalsToDepth = 1;
  var dashDepth = 2;

  function setextHeading(eat, value, silent) {
    var self = this;
    var now = eat.now();
    var length = value.length;
    var index = -1;
    var subvalue = '';
    var content;
    var queue;
    var character;
    var marker;
    var depth;

    // Eat initial indentation.
    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$9 || index >= maxIndent) {
        index--;
        break
      }

      subvalue += character;
    }

    // Eat content.
    content = '';
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character === lineFeed$9) {
        index--;
        break
      }

      if (character === space$9 || character === tab$8) {
        queue += character;
      } else {
        content += queue + character;
        queue = '';
      }
    }

    now.column += subvalue.length;
    now.offset += subvalue.length;
    subvalue += content + queue;

    // Ensure the content is followed by a newline and a valid marker.
    character = value.charAt(++index);
    marker = value.charAt(++index);

    if (character !== lineFeed$9 || (marker !== equalsTo$1 && marker !== dash$3)) {
      return
    }

    subvalue += character;

    // Eat Setext-line.
    queue = marker;
    depth = marker === equalsTo$1 ? equalsToDepth : dashDepth;

    while (++index < length) {
      character = value.charAt(index);

      if (character !== marker) {
        if (character !== lineFeed$9) {
          return
        }

        index--;
        break
      }

      queue += character;
    }

    if (silent) {
      return true
    }

    return eat(subvalue + queue)({
      type: 'heading',
      depth: depth,
      children: self.tokenizeInline(content, now)
    })
  }

  var attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  var unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
  var singleQuoted = "'[^']*'";
  var doubleQuoted = '"[^"]*"';
  var attributeValue =
    '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
  var attribute =
    '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';
  var openTag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';
  var closeTag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
  var comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
  var processing = '<[?].*?[?]>';
  var declaration = '<![A-Za-z]+\\s+[^>]*>';
  var cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

  var openCloseTag = new RegExp('^(?:' + openTag + '|' + closeTag + ')');

  var tag = new RegExp(
    '^(?:' +
      openTag +
      '|' +
      closeTag +
      '|' +
      comment +
      '|' +
      processing +
      '|' +
      declaration +
      '|' +
      cdata +
      ')'
  );

  var html = {
  	openCloseTag: openCloseTag,
  	tag: tag
  };

  var openCloseTag$1 = html.openCloseTag;

  var htmlBlock = blockHtml;

  var tab$9 = '\t';
  var space$a = ' ';
  var lineFeed$a = '\n';
  var lessThan$1 = '<';

  var rawOpenExpression = /^<(script|pre|style)(?=(\s|>|$))/i;
  var rawCloseExpression = /<\/(script|pre|style)>/i;
  var commentOpenExpression = /^<!--/;
  var commentCloseExpression = /-->/;
  var instructionOpenExpression = /^<\?/;
  var instructionCloseExpression = /\?>/;
  var directiveOpenExpression = /^<![A-Za-z]/;
  var directiveCloseExpression = />/;
  var cdataOpenExpression = /^<!\[CDATA\[/;
  var cdataCloseExpression = /]]>/;
  var elementCloseExpression = /^$/;
  var otherElementOpenExpression = new RegExp(openCloseTag$1.source + '\\s*$');

  function blockHtml(eat, value, silent) {
    var self = this;
    var blocks = self.options.blocks.join('|');
    var elementOpenExpression = new RegExp(
      '^</?(' + blocks + ')(?=(\\s|/?>|$))',
      'i'
    );
    var length = value.length;
    var index = 0;
    var next;
    var line;
    var offset;
    var character;
    var count;
    var sequence;
    var subvalue;

    var sequences = [
      [rawOpenExpression, rawCloseExpression, true],
      [commentOpenExpression, commentCloseExpression, true],
      [instructionOpenExpression, instructionCloseExpression, true],
      [directiveOpenExpression, directiveCloseExpression, true],
      [cdataOpenExpression, cdataCloseExpression, true],
      [elementOpenExpression, elementCloseExpression, true],
      [otherElementOpenExpression, elementCloseExpression, false]
    ];

    // Eat initial spacing.
    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$9 && character !== space$a) {
        break
      }

      index++;
    }

    if (value.charAt(index) !== lessThan$1) {
      return
    }

    next = value.indexOf(lineFeed$a, index + 1);
    next = next === -1 ? length : next;
    line = value.slice(index, next);
    offset = -1;
    count = sequences.length;

    while (++offset < count) {
      if (sequences[offset][0].test(line)) {
        sequence = sequences[offset];
        break
      }
    }

    if (!sequence) {
      return
    }

    if (silent) {
      return sequence[2]
    }

    index = next;

    if (!sequence[1].test(line)) {
      while (index < length) {
        next = value.indexOf(lineFeed$a, index + 1);
        next = next === -1 ? length : next;
        line = value.slice(index + 1, next);

        if (sequence[1].test(line)) {
          if (line) {
            index = next;
          }

          break
        }

        index = next;
      }
    }

    subvalue = value.slice(0, index);

    return eat(subvalue)({type: 'html', value: subvalue})
  }

  var isWhitespaceCharacter = whitespace;

  var fromCode = String.fromCharCode;
  var re$1 = /\s/;

  // Check if the given character code, or the character code at the first
  // character, is a whitespace character.
  function whitespace(character) {
    return re$1.test(
      typeof character === 'number' ? fromCode(character) : character.charAt(0)
    )
  }

  var collapseWhiteSpace = collapse;

  // `collapse(' \t\nbar \nbaz\t') // ' bar baz '`
  function collapse(value) {
    return String(value).replace(/\s+/g, ' ')
  }

  var normalize_1 = normalize;

  // Normalize an identifier.  Collapses multiple white space characters into a
  // single space, and removes casing.
  function normalize(value) {
    return collapseWhiteSpace(value).toLowerCase()
  }

  var definition_1 = definition;

  var quotationMark = '"';
  var apostrophe = "'";
  var backslash$1 = '\\';
  var lineFeed$b = '\n';
  var tab$a = '\t';
  var space$b = ' ';
  var leftSquareBracket = '[';
  var rightSquareBracket = ']';
  var leftParenthesis = '(';
  var rightParenthesis$1 = ')';
  var colon$1 = ':';
  var lessThan$2 = '<';
  var greaterThan$1 = '>';

  function definition(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var index = 0;
    var length = value.length;
    var subvalue = '';
    var beforeURL;
    var beforeTitle;
    var queue;
    var character;
    var test;
    var identifier;
    var url;
    var title;

    while (index < length) {
      character = value.charAt(index);

      if (character !== space$b && character !== tab$a) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);

    if (character !== leftSquareBracket) {
      return
    }

    index++;
    subvalue += character;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character === rightSquareBracket) {
        break
      } else if (character === backslash$1) {
        queue += character;
        index++;
        character = value.charAt(index);
      }

      queue += character;
      index++;
    }

    if (
      !queue ||
      value.charAt(index) !== rightSquareBracket ||
      value.charAt(index + 1) !== colon$1
    ) {
      return
    }

    identifier = queue;
    subvalue += queue + rightSquareBracket + colon$1;
    index = subvalue.length;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$a && character !== space$b && character !== lineFeed$b) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);
    queue = '';
    beforeURL = subvalue;

    if (character === lessThan$2) {
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (!isEnclosedURLCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (character === isEnclosedURLCharacter.delimiter) {
        subvalue += lessThan$2 + queue + character;
        index++;
      } else {
        if (commonmark) {
          return
        }

        index -= queue.length + 1;
        queue = '';
      }
    }

    if (!queue) {
      while (index < length) {
        character = value.charAt(index);

        if (!isUnclosedURLCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }

      subvalue += queue;
    }

    if (!queue) {
      return
    }

    url = queue;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$a && character !== space$b && character !== lineFeed$b) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);
    test = null;

    if (character === quotationMark) {
      test = quotationMark;
    } else if (character === apostrophe) {
      test = apostrophe;
    } else if (character === leftParenthesis) {
      test = rightParenthesis$1;
    }

    if (!test) {
      queue = '';
      index = subvalue.length;
    } else if (queue) {
      subvalue += queue + character;
      index = subvalue.length;
      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character === test) {
          break
        }

        if (character === lineFeed$b) {
          index++;
          character = value.charAt(index);

          if (character === lineFeed$b || character === test) {
            return
          }

          queue += lineFeed$b;
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (character !== test) {
        return
      }

      beforeTitle = subvalue;
      subvalue += queue + character;
      index++;
      title = queue;
      queue = '';
    } else {
      return
    }

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$a && character !== space$b) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);

    if (!character || character === lineFeed$b) {
      if (silent) {
        return true
      }

      beforeURL = eat(beforeURL).test().end;
      url = self.decode.raw(self.unescape(url), beforeURL, {nonTerminated: false});

      if (title) {
        beforeTitle = eat(beforeTitle).test().end;
        title = self.decode.raw(self.unescape(title), beforeTitle);
      }

      return eat(subvalue)({
        type: 'definition',
        identifier: normalize_1(identifier),
        label: identifier,
        title: title || null,
        url: url
      })
    }
  }

  // Check if `character` can be inside an enclosed URI.
  function isEnclosedURLCharacter(character) {
    return (
      character !== greaterThan$1 &&
      character !== leftSquareBracket &&
      character !== rightSquareBracket
    )
  }

  isEnclosedURLCharacter.delimiter = greaterThan$1;

  // Check if `character` can be inside an unclosed URI.
  function isUnclosedURLCharacter(character) {
    return (
      character !== leftSquareBracket &&
      character !== rightSquareBracket &&
      !isWhitespaceCharacter(character)
    )
  }

  var table_1 = table;

  var tab$b = '\t';
  var lineFeed$c = '\n';
  var space$c = ' ';
  var dash$4 = '-';
  var colon$2 = ':';
  var backslash$2 = '\\';
  var verticalBar = '|';

  var minColumns = 1;
  var minRows = 2;

  var left = 'left';
  var center = 'center';
  var right = 'right';

  function table(eat, value, silent) {
    var self = this;
    var index;
    var alignments;
    var alignment;
    var subvalue;
    var row;
    var length;
    var lines;
    var queue;
    var character;
    var hasDash;
    var align;
    var cell;
    var preamble;
    var now;
    var position;
    var lineCount;
    var line;
    var rows;
    var table;
    var lineIndex;
    var pipeIndex;
    var first;

    // Exit when not in gfm-mode.
    if (!self.options.gfm) {
      return
    }

    // Get the rows.
    // Detecting tables soon is hard, so there are some checks for performance
    // here, such as the minimum number of rows, and allowed characters in the
    // alignment row.
    index = 0;
    lineCount = 0;
    length = value.length + 1;
    lines = [];

    while (index < length) {
      lineIndex = value.indexOf(lineFeed$c, index);
      pipeIndex = value.indexOf(verticalBar, index + 1);

      if (lineIndex === -1) {
        lineIndex = value.length;
      }

      if (pipeIndex === -1 || pipeIndex > lineIndex) {
        if (lineCount < minRows) {
          return
        }

        break
      }

      lines.push(value.slice(index, lineIndex));
      lineCount++;
      index = lineIndex + 1;
    }

    // Parse the alignment row.
    subvalue = lines.join(lineFeed$c);
    alignments = lines.splice(1, 1)[0] || [];
    index = 0;
    length = alignments.length;
    lineCount--;
    alignment = false;
    align = [];

    while (index < length) {
      character = alignments.charAt(index);

      if (character === verticalBar) {
        hasDash = null;

        if (alignment === false) {
          if (first === false) {
            return
          }
        } else {
          align.push(alignment);
          alignment = false;
        }

        first = false;
      } else if (character === dash$4) {
        hasDash = true;
        alignment = alignment || null;
      } else if (character === colon$2) {
        if (alignment === left) {
          alignment = center;
        } else if (hasDash && alignment === null) {
          alignment = right;
        } else {
          alignment = left;
        }
      } else if (!isWhitespaceCharacter(character)) {
        return
      }

      index++;
    }

    if (alignment !== false) {
      align.push(alignment);
    }

    // Exit when without enough columns.
    if (align.length < minColumns) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    // Parse the rows.
    position = -1;
    rows = [];

    table = eat(subvalue).reset({type: 'table', align: align, children: rows});

    while (++position < lineCount) {
      line = lines[position];
      row = {type: 'tableRow', children: []};

      // Eat a newline character when this is not the first row.
      if (position) {
        eat(lineFeed$c);
      }

      // Eat the row.
      eat(line).reset(row, table);

      length = line.length + 1;
      index = 0;
      queue = '';
      cell = '';
      preamble = true;

      while (index < length) {
        character = line.charAt(index);

        if (character === tab$b || character === space$c) {
          if (cell) {
            queue += character;
          } else {
            eat(character);
          }

          index++;
          continue
        }

        if (character === '' || character === verticalBar) {
          if (preamble) {
            eat(character);
          } else {
            if ((cell || character) && !preamble) {
              subvalue = cell;

              if (queue.length > 1) {
                if (character) {
                  subvalue += queue.slice(0, -1);
                  queue = queue.charAt(queue.length - 1);
                } else {
                  subvalue += queue;
                  queue = '';
                }
              }

              now = eat.now();

              eat(subvalue)(
                {type: 'tableCell', children: self.tokenizeInline(cell, now)},
                row
              );
            }

            eat(queue + character);

            queue = '';
            cell = '';
          }
        } else {
          if (queue) {
            cell += queue;
            queue = '';
          }

          cell += character;

          if (character === backslash$2 && index !== length - 2) {
            cell += line.charAt(index + 1);
            index++;
          }
        }

        preamble = false;
        index++;
      }

      // Eat the alignment row.
      if (!position) {
        eat(lineFeed$c + alignments);
      }
    }

    return table
  }

  var paragraph_1 = paragraph;

  var tab$c = '\t';
  var lineFeed$d = '\n';
  var space$d = ' ';

  var tabSize$4 = 4;

  // Tokenise paragraph.
  function paragraph(eat, value, silent) {
    var self = this;
    var settings = self.options;
    var commonmark = settings.commonmark;
    var tokenizers = self.blockTokenizers;
    var interruptors = self.interruptParagraph;
    var index = value.indexOf(lineFeed$d);
    var length = value.length;
    var position;
    var subvalue;
    var character;
    var size;
    var now;

    while (index < length) {
      // Eat everything if there’s no following newline.
      if (index === -1) {
        index = length;
        break
      }

      // Stop if the next character is NEWLINE.
      if (value.charAt(index + 1) === lineFeed$d) {
        break
      }

      // In commonmark-mode, following indented lines are part of the paragraph.
      if (commonmark) {
        size = 0;
        position = index + 1;

        while (position < length) {
          character = value.charAt(position);

          if (character === tab$c) {
            size = tabSize$4;
            break
          } else if (character === space$d) {
            size++;
          } else {
            break
          }

          position++;
        }

        if (size >= tabSize$4 && character !== lineFeed$d) {
          index = value.indexOf(lineFeed$d, index + 1);
          continue
        }
      }

      subvalue = value.slice(index + 1);

      // Check if the following code contains a possible block.
      if (interrupt_1(interruptors, tokenizers, self, [eat, subvalue, true])) {
        break
      }

      position = index;
      index = value.indexOf(lineFeed$d, index + 1);

      if (index !== -1 && trim_1(value.slice(position, index)) === '') {
        index = position;
        break
      }
    }

    subvalue = value.slice(0, index);

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    now = eat.now();
    subvalue = trimTrailingLines_1(subvalue);

    return eat(subvalue)({
      type: 'paragraph',
      children: self.tokenizeInline(subvalue, now)
    })
  }

  var _escape = locate;

  function locate(value, fromIndex) {
    return value.indexOf('\\', fromIndex)
  }

  var _escape$1 = escape;
  escape.locator = _escape;

  var lineFeed$e = '\n';
  var backslash$3 = '\\';

  function escape(eat, value, silent) {
    var self = this;
    var character;
    var node;

    if (value.charAt(0) === backslash$3) {
      character = value.charAt(1);

      if (self.escape.indexOf(character) !== -1) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        if (character === lineFeed$e) {
          node = {type: 'break'};
        } else {
          node = {type: 'text', value: character};
        }

        return eat(backslash$3 + character)(node)
      }
    }
  }

  var tag$1 = locate$1;

  function locate$1(value, fromIndex) {
    return value.indexOf('<', fromIndex)
  }

  var autoLink_1 = autoLink;
  autoLink.locator = tag$1;
  autoLink.notInLink = true;

  var lessThan$3 = '<';
  var greaterThan$2 = '>';
  var atSign = '@';
  var slash = '/';
  var mailto = 'mailto:';
  var mailtoLength = mailto.length;

  function autoLink(eat, value, silent) {
    var self = this;
    var subvalue = '';
    var length = value.length;
    var index = 0;
    var queue = '';
    var hasAtCharacter = false;
    var link = '';
    var character;
    var now;
    var content;
    var tokenizers;
    var exit;

    if (value.charAt(0) !== lessThan$3) {
      return
    }

    index++;
    subvalue = lessThan$3;

    while (index < length) {
      character = value.charAt(index);

      if (
        isWhitespaceCharacter(character) ||
        character === greaterThan$2 ||
        character === atSign ||
        (character === ':' && value.charAt(index + 1) === slash)
      ) {
        break
      }

      queue += character;
      index++;
    }

    if (!queue) {
      return
    }

    link += queue;
    queue = '';

    character = value.charAt(index);
    link += character;
    index++;

    if (character === atSign) {
      hasAtCharacter = true;
    } else {
      if (character !== ':' || value.charAt(index + 1) !== slash) {
        return
      }

      link += slash;
      index++;
    }

    while (index < length) {
      character = value.charAt(index);

      if (isWhitespaceCharacter(character) || character === greaterThan$2) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);

    if (!queue || character !== greaterThan$2) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    link += queue;
    content = link;
    subvalue += link + character;
    now = eat.now();
    now.column++;
    now.offset++;

    if (hasAtCharacter) {
      if (link.slice(0, mailtoLength).toLowerCase() === mailto) {
        content = content.slice(mailtoLength);
        now.column += mailtoLength;
        now.offset += mailtoLength;
      } else {
        link = mailto + link;
      }
    }

    // Temporarily remove all tokenizers except text in autolinks.
    tokenizers = self.inlineTokenizers;
    self.inlineTokenizers = {text: tokenizers.text};

    exit = self.enterLink();

    content = self.tokenizeInline(content, now);

    self.inlineTokenizers = tokenizers;
    exit();

    return eat(subvalue)({
      type: 'link',
      title: null,
      url: parseEntities_1(link, {nonTerminated: false}),
      children: content
    })
  }

  var ccount_1 = ccount;

  function ccount(value, character) {
    var val = String(value);
    var count = 0;
    var index;

    if (typeof character !== 'string' || character.length !== 1) {
      throw new Error('Expected character')
    }

    index = val.indexOf(character);

    while (index !== -1) {
      count++;
      index = val.indexOf(character, index + 1);
    }

    return count
  }

  var url = locate$2;

  var values = ['www.', 'http://', 'https://'];

  function locate$2(value, fromIndex) {
    var min = -1;
    var index;
    var length;
    var position;

    if (!this.options.gfm) {
      return min
    }

    length = values.length;
    index = -1;

    while (++index < length) {
      position = value.indexOf(values[index], fromIndex);

      if (position !== -1 && (min === -1 || position < min)) {
        min = position;
      }
    }

    return min
  }

  var url_1 = url$1;
  url$1.locator = url;
  url$1.notInLink = true;

  var exclamationMark$1 = 33; // '!'
  var ampersand$1 = 38; // '&'
  var rightParenthesis$2 = 41; // ')'
  var asterisk$2 = 42; // '*'
  var comma$1 = 44; // ','
  var dash$5 = 45; // '-'
  var dot$2 = 46; // '.'
  var colon$3 = 58; // ':'
  var semicolon$1 = 59; // ';'
  var questionMark = 63; // '?'
  var lessThan$4 = 60; // '<'
  var underscore$2 = 95; // '_'
  var tilde$2 = 126; // '~'

  var leftParenthesisCharacter = '(';
  var rightParenthesisCharacter = ')';

  function url$1(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var tokenizers = self.inlineTokenizers;
    var length = value.length;
    var previousDot = -1;
    var protocolless = false;
    var dots;
    var lastTwoPartsStart;
    var start;
    var index;
    var pathStart;
    var path;
    var code;
    var end;
    var leftCount;
    var rightCount;
    var content;
    var children;
    var url;
    var exit;

    if (!gfm) {
      return
    }

    // `WWW.` doesn’t work.
    if (value.slice(0, 4) === 'www.') {
      protocolless = true;
      index = 4;
    } else if (value.slice(0, 7).toLowerCase() === 'http://') {
      index = 7;
    } else if (value.slice(0, 8).toLowerCase() === 'https://') {
      index = 8;
    } else {
      return
    }

    // Act as if the starting boundary is a dot.
    previousDot = index - 1;

    // Parse a valid domain.
    start = index;
    dots = [];

    while (index < length) {
      code = value.charCodeAt(index);

      if (code === dot$2) {
        // Dots may not appear after each other.
        if (previousDot === index - 1) {
          break
        }

        dots.push(index);
        previousDot = index;
        index++;
        continue
      }

      if (
        isDecimal(code) ||
        isAlphabetical(code) ||
        code === dash$5 ||
        code === underscore$2
      ) {
        index++;
        continue
      }

      break
    }

    // Ignore a final dot:
    if (code === dot$2) {
      dots.pop();
      index--;
    }

    // If there are not dots, exit.
    if (dots[0] === undefined) {
      return
    }

    // If there is an underscore in the last two domain parts, exit:
    // `www.example.c_m` and `www.ex_ample.com` are not OK, but
    // `www.sub_domain.example.com` is.
    lastTwoPartsStart = dots.length < 2 ? start : dots[dots.length - 2] + 1;

    if (value.slice(lastTwoPartsStart, index).indexOf('_') !== -1) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    end = index;
    pathStart = index;

    // Parse a path.
    while (index < length) {
      code = value.charCodeAt(index);

      if (isWhitespaceCharacter(code) || code === lessThan$4) {
        break
      }

      index++;

      if (
        code === exclamationMark$1 ||
        code === asterisk$2 ||
        code === comma$1 ||
        code === dot$2 ||
        code === colon$3 ||
        code === questionMark ||
        code === underscore$2 ||
        code === tilde$2
      ) ; else {
        end = index;
      }
    }

    index = end;

    // If the path ends in a closing paren, and the count of closing parens is
    // higher than the opening count, then remove the supefluous closing parens.
    if (value.charCodeAt(index - 1) === rightParenthesis$2) {
      path = value.slice(pathStart, index);
      leftCount = ccount_1(path, leftParenthesisCharacter);
      rightCount = ccount_1(path, rightParenthesisCharacter);

      while (rightCount > leftCount) {
        index = pathStart + path.lastIndexOf(rightParenthesisCharacter);
        path = value.slice(pathStart, index);
        rightCount--;
      }
    }

    if (value.charCodeAt(index - 1) === semicolon$1) {
      // GitHub doesn’t document this, but final semicolons aren’t paret of the
      // URL either.
      index--;

      // // If the path ends in what looks like an entity, it’s not part of the path.
      if (isAlphabetical(value.charCodeAt(index - 1))) {
        end = index - 2;

        while (isAlphabetical(value.charCodeAt(end))) {
          end--;
        }

        if (value.charCodeAt(end) === ampersand$1) {
          index = end;
        }
      }
    }

    content = value.slice(0, index);
    url = parseEntities_1(content, {nonTerminated: false});

    if (protocolless) {
      url = 'http://' + url;
    }

    exit = self.enterLink();

    // Temporarily remove all tokenizers except text in url.
    self.inlineTokenizers = {text: tokenizers.text};
    children = self.tokenizeInline(content, eat.now());
    self.inlineTokenizers = tokenizers;

    exit();

    return eat(content)({type: 'link', title: null, url: url, children: children})
  }

  var plusSign$1 = 43; // '+'
  var dash$6 = 45; // '-'
  var dot$3 = 46; // '.'
  var underscore$3 = 95; // '_'

  var email = locate$3;

  // See: <https://github.github.com/gfm/#extended-email-autolink>
  function locate$3(value, fromIndex) {
    var self = this;
    var at;
    var position;

    if (!this.options.gfm) {
      return -1
    }

    at = value.indexOf('@', fromIndex);

    if (at === -1) {
      return -1
    }

    position = at;

    if (position === fromIndex || !isGfmAtext(value.charCodeAt(position - 1))) {
      return locate$3.call(self, value, at + 1)
    }

    while (position > fromIndex && isGfmAtext(value.charCodeAt(position - 1))) {
      position--;
    }

    return position
  }

  function isGfmAtext(code) {
    return (
      isDecimal(code) ||
      isAlphabetical(code) ||
      code === plusSign$1 ||
      code === dash$6 ||
      code === dot$3 ||
      code === underscore$3
    )
  }

  var email_1 = email$1;
  email$1.locator = email;
  email$1.notInLink = true;

  var plusSign$2 = 43; // '+'
  var dash$7 = 45; // '-'
  var dot$4 = 46; // '.'
  var atSign$1 = 64; // '@'
  var underscore$4 = 95; // '_'

  function email$1(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var tokenizers = self.inlineTokenizers;
    var index = 0;
    var length = value.length;
    var firstDot = -1;
    var code;
    var content;
    var children;
    var exit;

    if (!gfm) {
      return
    }

    code = value.charCodeAt(index);

    while (
      isDecimal(code) ||
      isAlphabetical(code) ||
      code === plusSign$2 ||
      code === dash$7 ||
      code === dot$4 ||
      code === underscore$4
    ) {
      code = value.charCodeAt(++index);
    }

    if (index === 0) {
      return
    }

    if (code !== atSign$1) {
      return
    }

    index++;

    while (index < length) {
      code = value.charCodeAt(index);

      if (
        isDecimal(code) ||
        isAlphabetical(code) ||
        code === dash$7 ||
        code === dot$4 ||
        code === underscore$4
      ) {
        index++;

        if (firstDot === -1 && code === dot$4) {
          firstDot = index;
        }

        continue
      }

      break
    }

    if (
      firstDot === -1 ||
      firstDot === index ||
      code === dash$7 ||
      code === underscore$4
    ) {
      return
    }

    if (code === dot$4) {
      index--;
    }

    content = value.slice(0, index);

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    exit = self.enterLink();

    // Temporarily remove all tokenizers except text in url.
    self.inlineTokenizers = {text: tokenizers.text};
    children = self.tokenizeInline(content, eat.now());
    self.inlineTokenizers = tokenizers;

    exit();

    return eat(content)({
      type: 'link',
      title: null,
      url: 'mailto:' + parseEntities_1(content, {nonTerminated: false}),
      children: children
    })
  }

  var tag$2 = html.tag;

  var htmlInline = inlineHTML;
  inlineHTML.locator = tag$1;

  var lessThan$5 = '<';
  var questionMark$1 = '?';
  var exclamationMark$2 = '!';
  var slash$1 = '/';

  var htmlLinkOpenExpression = /^<a /i;
  var htmlLinkCloseExpression = /^<\/a>/i;

  function inlineHTML(eat, value, silent) {
    var self = this;
    var length = value.length;
    var character;
    var subvalue;

    if (value.charAt(0) !== lessThan$5 || length < 3) {
      return
    }

    character = value.charAt(1);

    if (
      !isAlphabetical(character) &&
      character !== questionMark$1 &&
      character !== exclamationMark$2 &&
      character !== slash$1
    ) {
      return
    }

    subvalue = value.match(tag$2);

    if (!subvalue) {
      return
    }

    /* istanbul ignore if - not used yet. */
    if (silent) {
      return true
    }

    subvalue = subvalue[0];

    if (!self.inLink && htmlLinkOpenExpression.test(subvalue)) {
      self.inLink = true;
    } else if (self.inLink && htmlLinkCloseExpression.test(subvalue)) {
      self.inLink = false;
    }

    return eat(subvalue)({type: 'html', value: subvalue})
  }

  var link = locate$4;

  function locate$4(value, fromIndex) {
    var link = value.indexOf('[', fromIndex);
    var image = value.indexOf('![', fromIndex);

    if (image === -1) {
      return link
    }

    // Link can never be `-1` if an image is found, so we don’t need to check
    // for that :)
    return link < image ? link : image
  }

  var link_1 = link$1;
  link$1.locator = link;

  var lineFeed$f = '\n';
  var exclamationMark$3 = '!';
  var quotationMark$1 = '"';
  var apostrophe$1 = "'";
  var leftParenthesis$1 = '(';
  var rightParenthesis$3 = ')';
  var lessThan$6 = '<';
  var greaterThan$3 = '>';
  var leftSquareBracket$1 = '[';
  var backslash$4 = '\\';
  var rightSquareBracket$1 = ']';
  var graveAccent$1 = '`';

  function link$1(eat, value, silent) {
    var self = this;
    var subvalue = '';
    var index = 0;
    var character = value.charAt(0);
    var pedantic = self.options.pedantic;
    var commonmark = self.options.commonmark;
    var gfm = self.options.gfm;
    var closed;
    var count;
    var opening;
    var beforeURL;
    var beforeTitle;
    var subqueue;
    var hasMarker;
    var isImage;
    var content;
    var marker;
    var length;
    var title;
    var depth;
    var queue;
    var url;
    var now;
    var exit;
    var node;

    // Detect whether this is an image.
    if (character === exclamationMark$3) {
      isImage = true;
      subvalue = character;
      character = value.charAt(++index);
    }

    // Eat the opening.
    if (character !== leftSquareBracket$1) {
      return
    }

    // Exit when this is a link and we’re already inside a link.
    if (!isImage && self.inLink) {
      return
    }

    subvalue += character;
    queue = '';
    index++;

    // Eat the content.
    length = value.length;
    now = eat.now();
    depth = 0;

    now.column += index;
    now.offset += index;

    while (index < length) {
      character = value.charAt(index);
      subqueue = character;

      if (character === graveAccent$1) {
        // Inline-code in link content.
        count = 1;

        while (value.charAt(index + 1) === graveAccent$1) {
          subqueue += character;
          index++;
          count++;
        }

        if (!opening) {
          opening = count;
        } else if (count >= opening) {
          opening = 0;
        }
      } else if (character === backslash$4) {
        // Allow brackets to be escaped.
        index++;
        subqueue += value.charAt(index);
      } else if ((!opening || gfm) && character === leftSquareBracket$1) {
        // In GFM mode, brackets in code still count.  In all other modes,
        // they don’t.
        depth++;
      } else if ((!opening || gfm) && character === rightSquareBracket$1) {
        if (depth) {
          depth--;
        } else {
          if (value.charAt(index + 1) !== leftParenthesis$1) {
            return
          }

          subqueue += leftParenthesis$1;
          closed = true;
          index++;

          break
        }
      }

      queue += subqueue;
      subqueue = '';
      index++;
    }

    // Eat the content closing.
    if (!closed) {
      return
    }

    content = queue;
    subvalue += queue + subqueue;
    index++;

    // Eat white-space.
    while (index < length) {
      character = value.charAt(index);

      if (!isWhitespaceCharacter(character)) {
        break
      }

      subvalue += character;
      index++;
    }

    // Eat the URL.
    character = value.charAt(index);
    queue = '';
    beforeURL = subvalue;

    if (character === lessThan$6) {
      index++;
      beforeURL += lessThan$6;

      while (index < length) {
        character = value.charAt(index);

        if (character === greaterThan$3) {
          break
        }

        if (commonmark && character === lineFeed$f) {
          return
        }

        queue += character;
        index++;
      }

      if (value.charAt(index) !== greaterThan$3) {
        return
      }

      subvalue += lessThan$6 + queue + greaterThan$3;
      url = queue;
      index++;
    } else {
      character = null;
      subqueue = '';

      while (index < length) {
        character = value.charAt(index);

        if (
          subqueue &&
          (character === quotationMark$1 ||
            character === apostrophe$1 ||
            (commonmark && character === leftParenthesis$1))
        ) {
          break
        }

        if (isWhitespaceCharacter(character)) {
          if (!pedantic) {
            break
          }

          subqueue += character;
        } else {
          if (character === leftParenthesis$1) {
            depth++;
          } else if (character === rightParenthesis$3) {
            if (depth === 0) {
              break
            }

            depth--;
          }

          queue += subqueue;
          subqueue = '';

          if (character === backslash$4) {
            queue += backslash$4;
            character = value.charAt(++index);
          }

          queue += character;
        }

        index++;
      }

      subvalue += queue;
      url = queue;
      index = subvalue.length;
    }

    // Eat white-space.
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (!isWhitespaceCharacter(character)) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);
    subvalue += queue;

    // Eat the title.
    if (
      queue &&
      (character === quotationMark$1 ||
        character === apostrophe$1 ||
        (commonmark && character === leftParenthesis$1))
    ) {
      index++;
      subvalue += character;
      queue = '';
      marker = character === leftParenthesis$1 ? rightParenthesis$3 : character;
      beforeTitle = subvalue;

      // In commonmark-mode, things are pretty easy: the marker cannot occur
      // inside the title.  Non-commonmark does, however, support nested
      // delimiters.
      if (commonmark) {
        while (index < length) {
          character = value.charAt(index);

          if (character === marker) {
            break
          }

          if (character === backslash$4) {
            queue += backslash$4;
            character = value.charAt(++index);
          }

          index++;
          queue += character;
        }

        character = value.charAt(index);

        if (character !== marker) {
          return
        }

        title = queue;
        subvalue += queue + character;
        index++;

        while (index < length) {
          character = value.charAt(index);

          if (!isWhitespaceCharacter(character)) {
            break
          }

          subvalue += character;
          index++;
        }
      } else {
        subqueue = '';

        while (index < length) {
          character = value.charAt(index);

          if (character === marker) {
            if (hasMarker) {
              queue += marker + subqueue;
              subqueue = '';
            }

            hasMarker = true;
          } else if (!hasMarker) {
            queue += character;
          } else if (character === rightParenthesis$3) {
            subvalue += queue + marker + subqueue;
            title = queue;
            break
          } else if (isWhitespaceCharacter(character)) {
            subqueue += character;
          } else {
            queue += marker + subqueue + character;
            subqueue = '';
            hasMarker = false;
          }

          index++;
        }
      }
    }

    if (value.charAt(index) !== rightParenthesis$3) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    subvalue += rightParenthesis$3;

    url = self.decode.raw(self.unescape(url), eat(beforeURL).test().end, {
      nonTerminated: false
    });

    if (title) {
      beforeTitle = eat(beforeTitle).test().end;
      title = self.decode.raw(self.unescape(title), beforeTitle);
    }

    node = {
      type: isImage ? 'image' : 'link',
      title: title || null,
      url: url
    };

    if (isImage) {
      node.alt = self.decode.raw(self.unescape(content), now) || null;
    } else {
      exit = self.enterLink();
      node.children = self.tokenizeInline(content, now);
      exit();
    }

    return eat(subvalue)(node)
  }

  var reference_1 = reference;
  reference.locator = link;

  var link$2 = 'link';
  var image$1 = 'image';
  var shortcut = 'shortcut';
  var collapsed = 'collapsed';
  var full = 'full';
  var exclamationMark$4 = '!';
  var leftSquareBracket$2 = '[';
  var backslash$5 = '\\';
  var rightSquareBracket$2 = ']';

  function reference(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var character = value.charAt(0);
    var index = 0;
    var length = value.length;
    var subvalue = '';
    var intro = '';
    var type = link$2;
    var referenceType = shortcut;
    var content;
    var identifier;
    var now;
    var node;
    var exit;
    var queue;
    var bracketed;
    var depth;

    // Check whether we’re eating an image.
    if (character === exclamationMark$4) {
      type = image$1;
      intro = character;
      character = value.charAt(++index);
    }

    if (character !== leftSquareBracket$2) {
      return
    }

    index++;
    intro += character;
    queue = '';

    // Eat the text.
    depth = 0;

    while (index < length) {
      character = value.charAt(index);

      if (character === leftSquareBracket$2) {
        bracketed = true;
        depth++;
      } else if (character === rightSquareBracket$2) {
        if (!depth) {
          break
        }

        depth--;
      }

      if (character === backslash$5) {
        queue += backslash$5;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }

    subvalue = queue;
    content = queue;
    character = value.charAt(index);

    if (character !== rightSquareBracket$2) {
      return
    }

    index++;
    subvalue += character;
    queue = '';

    if (!commonmark) {
      // The original markdown syntax definition explicitly allows for whitespace
      // between the link text and link label; commonmark departs from this, in
      // part to improve support for shortcut reference links
      while (index < length) {
        character = value.charAt(index);

        if (!isWhitespaceCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }
    }

    character = value.charAt(index);

    if (character === leftSquareBracket$2) {
      identifier = '';
      queue += character;
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (character === leftSquareBracket$2 || character === rightSquareBracket$2) {
          break
        }

        if (character === backslash$5) {
          identifier += backslash$5;
          character = value.charAt(++index);
        }

        identifier += character;
        index++;
      }

      character = value.charAt(index);

      if (character === rightSquareBracket$2) {
        referenceType = identifier ? full : collapsed;
        queue += identifier + character;
        index++;
      } else {
        identifier = '';
      }

      subvalue += queue;
      queue = '';
    } else {
      if (!content) {
        return
      }

      identifier = content;
    }

    // Brackets cannot be inside the identifier.
    if (referenceType !== full && bracketed) {
      return
    }

    subvalue = intro + subvalue;

    if (type === link$2 && self.inLink) {
      return null
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    now = eat.now();
    now.column += intro.length;
    now.offset += intro.length;
    identifier = referenceType === full ? identifier : content;

    node = {
      type: type + 'Reference',
      identifier: normalize_1(identifier),
      label: identifier,
      referenceType: referenceType
    };

    if (type === link$2) {
      exit = self.enterLink();
      node.children = self.tokenizeInline(content, now);
      exit();
    } else {
      node.alt = self.decode.raw(self.unescape(content), now) || null;
    }

    return eat(subvalue)(node)
  }

  var strong = locate$5;

  function locate$5(value, fromIndex) {
    var asterisk = value.indexOf('**', fromIndex);
    var underscore = value.indexOf('__', fromIndex);

    if (underscore === -1) {
      return asterisk
    }

    if (asterisk === -1) {
      return underscore
    }

    return underscore < asterisk ? underscore : asterisk
  }

  var strong_1 = strong$1;
  strong$1.locator = strong;

  var backslash$6 = '\\';
  var asterisk$3 = '*';
  var underscore$5 = '_';

  function strong$1(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var previous;

    if (
      (character !== asterisk$3 && character !== underscore$5) ||
      value.charAt(++index) !== character
    ) {
      return
    }

    pedantic = self.options.pedantic;
    marker = character;
    subvalue = marker + marker;
    length = value.length;
    index++;
    queue = '';
    character = '';

    if (pedantic && isWhitespaceCharacter(value.charAt(index))) {
      return
    }

    while (index < length) {
      previous = character;
      character = value.charAt(index);

      if (
        character === marker &&
        value.charAt(index + 1) === marker &&
        (!pedantic || !isWhitespaceCharacter(previous))
      ) {
        character = value.charAt(index + 2);

        if (character !== marker) {
          if (!trim_1(queue)) {
            return
          }

          /* istanbul ignore if - never used (yet) */
          if (silent) {
            return true
          }

          now = eat.now();
          now.column += 2;
          now.offset += 2;

          return eat(subvalue + queue + subvalue)({
            type: 'strong',
            children: self.tokenizeInline(queue, now)
          })
        }
      }

      if (!pedantic && character === backslash$6) {
        queue += character;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }
  }

  var isWordCharacter = wordCharacter;

  var fromCode$1 = String.fromCharCode;
  var re$2 = /\w/;

  // Check if the given character code, or the character code at the first
  // character, is a word character.
  function wordCharacter(character) {
    return re$2.test(
      typeof character === 'number' ? fromCode$1(character) : character.charAt(0)
    )
  }

  var emphasis = locate$6;

  function locate$6(value, fromIndex) {
    var asterisk = value.indexOf('*', fromIndex);
    var underscore = value.indexOf('_', fromIndex);

    if (underscore === -1) {
      return asterisk
    }

    if (asterisk === -1) {
      return underscore
    }

    return underscore < asterisk ? underscore : asterisk
  }

  var emphasis_1 = emphasis$1;
  emphasis$1.locator = emphasis;

  var asterisk$4 = '*';
  var underscore$6 = '_';
  var backslash$7 = '\\';

  function emphasis$1(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var previous;

    if (character !== asterisk$4 && character !== underscore$6) {
      return
    }

    pedantic = self.options.pedantic;
    subvalue = character;
    marker = character;
    length = value.length;
    index++;
    queue = '';
    character = '';

    if (pedantic && isWhitespaceCharacter(value.charAt(index))) {
      return
    }

    while (index < length) {
      previous = character;
      character = value.charAt(index);

      if (character === marker && (!pedantic || !isWhitespaceCharacter(previous))) {
        character = value.charAt(++index);

        if (character !== marker) {
          if (!trim_1(queue) || previous === marker) {
            return
          }

          if (!pedantic && marker === underscore$6 && isWordCharacter(character)) {
            queue += marker;
            continue
          }

          /* istanbul ignore if - never used (yet) */
          if (silent) {
            return true
          }

          now = eat.now();
          now.column++;
          now.offset++;

          return eat(subvalue + queue + marker)({
            type: 'emphasis',
            children: self.tokenizeInline(queue, now)
          })
        }

        queue += marker;
      }

      if (!pedantic && character === backslash$7) {
        queue += character;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }
  }

  var _delete = locate$7;

  function locate$7(value, fromIndex) {
    return value.indexOf('~~', fromIndex)
  }

  var _delete$1 = strikethrough;
  strikethrough.locator = _delete;

  var tilde$3 = '~';
  var fence = '~~';

  function strikethrough(eat, value, silent) {
    var self = this;
    var character = '';
    var previous = '';
    var preceding = '';
    var subvalue = '';
    var index;
    var length;
    var now;

    if (
      !self.options.gfm ||
      value.charAt(0) !== tilde$3 ||
      value.charAt(1) !== tilde$3 ||
      isWhitespaceCharacter(value.charAt(2))
    ) {
      return
    }

    index = 1;
    length = value.length;
    now = eat.now();
    now.column += 2;
    now.offset += 2;

    while (++index < length) {
      character = value.charAt(index);

      if (
        character === tilde$3 &&
        previous === tilde$3 &&
        (!preceding || !isWhitespaceCharacter(preceding))
      ) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        return eat(fence + subvalue + fence)({
          type: 'delete',
          children: self.tokenizeInline(subvalue, now)
        })
      }

      subvalue += previous;
      preceding = previous;
      previous = character;
    }
  }

  var codeInline = locate$8;

  function locate$8(value, fromIndex) {
    return value.indexOf('`', fromIndex)
  }

  var codeInline$1 = inlineCode;
  inlineCode.locator = codeInline;

  var lineFeed$g = 10; //  '\n'
  var space$e = 32; // ' '
  var graveAccent$2 = 96; //  '`'

  function inlineCode(eat, value, silent) {
    var length = value.length;
    var index = 0;
    var openingFenceEnd;
    var closingFenceStart;
    var closingFenceEnd;
    var code;
    var next;
    var found;

    while (index < length) {
      if (value.charCodeAt(index) !== graveAccent$2) {
        break
      }

      index++;
    }

    if (index === 0 || index === length) {
      return
    }

    openingFenceEnd = index;
    next = value.charCodeAt(index);

    while (index < length) {
      code = next;
      next = value.charCodeAt(index + 1);

      if (code === graveAccent$2) {
        if (closingFenceStart === undefined) {
          closingFenceStart = index;
        }

        closingFenceEnd = index + 1;

        if (
          next !== graveAccent$2 &&
          closingFenceEnd - closingFenceStart === openingFenceEnd
        ) {
          found = true;
          break
        }
      } else if (closingFenceStart !== undefined) {
        closingFenceStart = undefined;
        closingFenceEnd = undefined;
      }

      index++;
    }

    if (!found) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    // Remove the initial and final space (or line feed), iff they exist and there
    // are non-space characters in the content.
    index = openingFenceEnd;
    length = closingFenceStart;
    code = value.charCodeAt(index);
    next = value.charCodeAt(length - 1);
    found = false;

    if (
      length - index > 2 &&
      (code === space$e || code === lineFeed$g) &&
      (next === space$e || next === lineFeed$g)
    ) {
      index++;
      length--;

      while (index < length) {
        code = value.charCodeAt(index);

        if (code !== space$e && code !== lineFeed$g) {
          found = true;
          break
        }

        index++;
      }

      if (found === true) {
        openingFenceEnd++;
        closingFenceStart--;
      }
    }

    return eat(value.slice(0, closingFenceEnd))({
      type: 'inlineCode',
      value: value.slice(openingFenceEnd, closingFenceStart)
    })
  }

  var _break = locate$9;

  function locate$9(value, fromIndex) {
    var index = value.indexOf('\n', fromIndex);

    while (index > fromIndex) {
      if (value.charAt(index - 1) !== ' ') {
        break
      }

      index--;
    }

    return index
  }

  var _break$1 = hardBreak;
  hardBreak.locator = _break;

  var space$f = ' ';
  var lineFeed$h = '\n';
  var minBreakLength = 2;

  function hardBreak(eat, value, silent) {
    var length = value.length;
    var index = -1;
    var queue = '';
    var character;

    while (++index < length) {
      character = value.charAt(index);

      if (character === lineFeed$h) {
        if (index < minBreakLength) {
          return
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        queue += character;

        return eat(queue)({type: 'break'})
      }

      if (character !== space$f) {
        return
      }

      queue += character;
    }
  }

  var text_1 = text;

  function text(eat, value, silent) {
    var self = this;
    var methods;
    var tokenizers;
    var index;
    var length;
    var subvalue;
    var position;
    var tokenizer;
    var name;
    var min;
    var now;

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    methods = self.inlineMethods;
    length = methods.length;
    tokenizers = self.inlineTokenizers;
    index = -1;
    min = value.length;

    while (++index < length) {
      name = methods[index];

      if (name === 'text' || !tokenizers[name]) {
        continue
      }

      tokenizer = tokenizers[name].locator;

      if (!tokenizer) {
        eat.file.fail('Missing locator: `' + name + '`');
      }

      position = tokenizer.call(self, value, 1);

      if (position !== -1 && position < min) {
        min = position;
      }
    }

    subvalue = value.slice(0, min);
    now = eat.now();

    self.decode(subvalue, now, handler);

    function handler(content, position, source) {
      eat(source || content)({type: 'text', value: content});
    }
  }

  var parser = Parser;

  function Parser(doc, file) {
    this.file = file;
    this.offset = {};
    this.options = immutable(this.options);
    this.setOptions({});

    this.inList = false;
    this.inBlock = false;
    this.inLink = false;
    this.atStart = true;

    this.toOffset = vfileLocation(file).toOffset;
    this.unescape = _unescape(this, 'escape');
    this.decode = decode(this);
  }

  var proto$3 = Parser.prototype;

  // Expose core.
  proto$3.setOptions = setOptions_1;
  proto$3.parse = parse_1;

  // Expose `defaults`.
  proto$3.options = defaults$2;

  // Enter and exit helpers.
  proto$3.exitStart = stateToggle('atStart', true);
  proto$3.enterList = stateToggle('inList', false);
  proto$3.enterLink = stateToggle('inLink', false);
  proto$3.enterBlock = stateToggle('inBlock', false);

  // Nodes that can interupt a paragraph:
  //
  // ```markdown
  // A paragraph, followed by a thematic break.
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the paragraph.
  proto$3.interruptParagraph = [
    ['thematicBreak'],
    ['list'],
    ['atxHeading'],
    ['fencedCode'],
    ['blockquote'],
    ['html'],
    ['setextHeading', {commonmark: false}],
    ['definition', {commonmark: false}]
  ];

  // Nodes that can interupt a list:
  //
  // ```markdown
  // - One
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the list.
  proto$3.interruptList = [
    ['atxHeading', {pedantic: false}],
    ['fencedCode', {pedantic: false}],
    ['thematicBreak', {pedantic: false}],
    ['definition', {commonmark: false}]
  ];

  // Nodes that can interupt a blockquote:
  //
  // ```markdown
  // > A paragraph.
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the blockquote.
  proto$3.interruptBlockquote = [
    ['indentedCode', {commonmark: true}],
    ['fencedCode', {commonmark: true}],
    ['atxHeading', {commonmark: true}],
    ['setextHeading', {commonmark: true}],
    ['thematicBreak', {commonmark: true}],
    ['html', {commonmark: true}],
    ['list', {commonmark: true}],
    ['definition', {commonmark: false}]
  ];

  // Handlers.
  proto$3.blockTokenizers = {
    blankLine: blankLine_1,
    indentedCode: codeIndented,
    fencedCode: codeFenced,
    blockquote: blockquote_1,
    atxHeading: headingAtx,
    thematicBreak: thematicBreak_1,
    list: list_1,
    setextHeading: headingSetext,
    html: htmlBlock,
    definition: definition_1,
    table: table_1,
    paragraph: paragraph_1
  };

  proto$3.inlineTokenizers = {
    escape: _escape$1,
    autoLink: autoLink_1,
    url: url_1,
    email: email_1,
    html: htmlInline,
    link: link_1,
    reference: reference_1,
    strong: strong_1,
    emphasis: emphasis_1,
    deletion: _delete$1,
    code: codeInline$1,
    break: _break$1,
    text: text_1
  };

  // Expose precedence.
  proto$3.blockMethods = keys$1(proto$3.blockTokenizers);
  proto$3.inlineMethods = keys$1(proto$3.inlineTokenizers);

  // Tokenizers.
  proto$3.tokenizeBlock = tokenizer('block');
  proto$3.tokenizeInline = tokenizer('inline');
  proto$3.tokenizeFactory = tokenizer;

  // Get all keys in `value`.
  function keys$1(value) {
    var result = [];
    var key;

    for (key in value) {
      result.push(key);
    }

    return result
  }

  var remarkParse = parse$2;
  parse$2.Parser = parser;

  function parse$2(options) {
    var settings = this.data('settings');
    var Local = unherit_1(parser);

    Local.prototype.options = immutable(Local.prototype.options, settings, options);

    this.Parser = Local;
  }

  var identity_1 = identity;

  function identity(value) {
    return value
  }

  var enterLinkReference = enter;

  // Shortcut and collapsed link references need no escaping and encoding during
  // the processing of child nodes (it must be implied from identifier).
  //
  // This toggler turns encoding and escaping off for shortcut and collapsed
  // references.
  //
  // Implies `enterLink`.
  function enter(compiler, node) {
    var encode = compiler.encode;
    var escape = compiler.escape;
    var exitLink = compiler.enterLink();

    if (node.referenceType !== 'shortcut' && node.referenceType !== 'collapsed') {
      return exitLink
    }

    compiler.escape = identity_1;
    compiler.encode = identity_1;

    return exit

    function exit() {
      compiler.encode = encode;
      compiler.escape = escape;
      exitLink();
    }
  }

  var defaults$3 = {
    gfm: true,
    commonmark: false,
    pedantic: false,
    entities: 'false',
    setext: false,
    closeAtx: false,
    tableCellPadding: true,
    tablePipeAlign: true,
    stringLength: stringLength,
    incrementListMarker: true,
    tightDefinitions: false,
    fences: false,
    fence: '`',
    bullet: '-',
    listItemIndent: 'tab',
    rule: '*',
    ruleSpaces: true,
    ruleRepetition: 3,
    strong: '*',
    emphasis: '_'
  };

  function stringLength(value) {
    return value.length
  }

  var nbsp$2 = " ";
  var iexcl$2 = "¡";
  var cent$2 = "¢";
  var pound$2 = "£";
  var curren$2 = "¤";
  var yen$2 = "¥";
  var brvbar$2 = "¦";
  var sect$2 = "§";
  var uml$2 = "¨";
  var copy$2 = "©";
  var ordf$2 = "ª";
  var laquo$2 = "«";
  var not$2 = "¬";
  var shy$2 = "­";
  var reg$2 = "®";
  var macr$2 = "¯";
  var deg$2 = "°";
  var plusmn$2 = "±";
  var sup2$2 = "²";
  var sup3$2 = "³";
  var acute$2 = "´";
  var micro$2 = "µ";
  var para$2 = "¶";
  var middot$2 = "·";
  var cedil$2 = "¸";
  var sup1$2 = "¹";
  var ordm$2 = "º";
  var raquo$2 = "»";
  var frac14$2 = "¼";
  var frac12$2 = "½";
  var frac34$2 = "¾";
  var iquest$2 = "¿";
  var Agrave$2 = "À";
  var Aacute$2 = "Á";
  var Acirc$2 = "Â";
  var Atilde$2 = "Ã";
  var Auml$2 = "Ä";
  var Aring$2 = "Å";
  var AElig$2 = "Æ";
  var Ccedil$2 = "Ç";
  var Egrave$2 = "È";
  var Eacute$2 = "É";
  var Ecirc$2 = "Ê";
  var Euml$2 = "Ë";
  var Igrave$2 = "Ì";
  var Iacute$2 = "Í";
  var Icirc$2 = "Î";
  var Iuml$2 = "Ï";
  var ETH$2 = "Ð";
  var Ntilde$2 = "Ñ";
  var Ograve$2 = "Ò";
  var Oacute$2 = "Ó";
  var Ocirc$2 = "Ô";
  var Otilde$2 = "Õ";
  var Ouml$2 = "Ö";
  var times$2 = "×";
  var Oslash$2 = "Ø";
  var Ugrave$2 = "Ù";
  var Uacute$2 = "Ú";
  var Ucirc$2 = "Û";
  var Uuml$2 = "Ü";
  var Yacute$2 = "Ý";
  var THORN$2 = "Þ";
  var szlig$2 = "ß";
  var agrave$2 = "à";
  var aacute$2 = "á";
  var acirc$2 = "â";
  var atilde$2 = "ã";
  var auml$2 = "ä";
  var aring$2 = "å";
  var aelig$2 = "æ";
  var ccedil$2 = "ç";
  var egrave$2 = "è";
  var eacute$2 = "é";
  var ecirc$2 = "ê";
  var euml$2 = "ë";
  var igrave$2 = "ì";
  var iacute$2 = "í";
  var icirc$2 = "î";
  var iuml$2 = "ï";
  var eth$2 = "ð";
  var ntilde$2 = "ñ";
  var ograve$2 = "ò";
  var oacute$2 = "ó";
  var ocirc$2 = "ô";
  var otilde$2 = "õ";
  var ouml$2 = "ö";
  var divide$2 = "÷";
  var oslash$2 = "ø";
  var ugrave$2 = "ù";
  var uacute$2 = "ú";
  var ucirc$2 = "û";
  var uuml$2 = "ü";
  var yacute$2 = "ý";
  var thorn$2 = "þ";
  var yuml$2 = "ÿ";
  var fnof$1 = "ƒ";
  var Alpha$1 = "Α";
  var Beta$1 = "Β";
  var Gamma$1 = "Γ";
  var Delta$1 = "Δ";
  var Epsilon$1 = "Ε";
  var Zeta$1 = "Ζ";
  var Eta$1 = "Η";
  var Theta$1 = "Θ";
  var Iota$1 = "Ι";
  var Kappa$1 = "Κ";
  var Lambda$1 = "Λ";
  var Mu$1 = "Μ";
  var Nu$1 = "Ν";
  var Xi$1 = "Ξ";
  var Omicron$1 = "Ο";
  var Pi$1 = "Π";
  var Rho$1 = "Ρ";
  var Sigma$1 = "Σ";
  var Tau$1 = "Τ";
  var Upsilon$1 = "Υ";
  var Phi$1 = "Φ";
  var Chi$1 = "Χ";
  var Psi$1 = "Ψ";
  var Omega$1 = "Ω";
  var alpha$1 = "α";
  var beta$1 = "β";
  var gamma$1 = "γ";
  var delta$1 = "δ";
  var epsilon$1 = "ε";
  var zeta$1 = "ζ";
  var eta$1 = "η";
  var theta$1 = "θ";
  var iota$1 = "ι";
  var kappa$1 = "κ";
  var lambda$1 = "λ";
  var mu$1 = "μ";
  var nu$1 = "ν";
  var xi$1 = "ξ";
  var omicron$1 = "ο";
  var pi$1 = "π";
  var rho$1 = "ρ";
  var sigmaf$1 = "ς";
  var sigma$1 = "σ";
  var tau$1 = "τ";
  var upsilon$1 = "υ";
  var phi$1 = "φ";
  var chi$1 = "χ";
  var psi$1 = "ψ";
  var omega$1 = "ω";
  var thetasym$1 = "ϑ";
  var upsih$1 = "ϒ";
  var piv$1 = "ϖ";
  var bull$1 = "•";
  var hellip$1 = "…";
  var prime$1 = "′";
  var Prime$1 = "″";
  var oline$1 = "‾";
  var frasl$1 = "⁄";
  var weierp$1 = "℘";
  var image$2 = "ℑ";
  var real$1 = "ℜ";
  var trade$1 = "™";
  var alefsym$1 = "ℵ";
  var larr$1 = "←";
  var uarr$1 = "↑";
  var rarr$1 = "→";
  var darr$1 = "↓";
  var harr$1 = "↔";
  var crarr$1 = "↵";
  var lArr$1 = "⇐";
  var uArr$1 = "⇑";
  var rArr$1 = "⇒";
  var dArr$1 = "⇓";
  var hArr$1 = "⇔";
  var forall$1 = "∀";
  var part$1 = "∂";
  var exist$1 = "∃";
  var empty$1 = "∅";
  var nabla$1 = "∇";
  var isin$1 = "∈";
  var notin$1 = "∉";
  var ni$1 = "∋";
  var prod$1 = "∏";
  var sum$1 = "∑";
  var minus$1 = "−";
  var lowast$1 = "∗";
  var radic$1 = "√";
  var prop$1 = "∝";
  var infin$1 = "∞";
  var ang$1 = "∠";
  var and$1 = "∧";
  var or$1 = "∨";
  var cap$1 = "∩";
  var cup$1 = "∪";
  var int$1 = "∫";
  var there4$1 = "∴";
  var sim$1 = "∼";
  var cong$1 = "≅";
  var asymp$1 = "≈";
  var ne$1 = "≠";
  var equiv$1 = "≡";
  var le$1 = "≤";
  var ge$1 = "≥";
  var sub$1 = "⊂";
  var sup$1 = "⊃";
  var nsub$1 = "⊄";
  var sube$1 = "⊆";
  var supe$1 = "⊇";
  var oplus$1 = "⊕";
  var otimes$1 = "⊗";
  var perp$1 = "⊥";
  var sdot$1 = "⋅";
  var lceil$1 = "⌈";
  var rceil$1 = "⌉";
  var lfloor$1 = "⌊";
  var rfloor$1 = "⌋";
  var lang$1 = "〈";
  var rang$1 = "〉";
  var loz$1 = "◊";
  var spades$1 = "♠";
  var clubs$1 = "♣";
  var hearts$1 = "♥";
  var diams$1 = "♦";
  var quot$2 = "\"";
  var amp$2 = "&";
  var lt$2 = "<";
  var gt$2 = ">";
  var OElig$1 = "Œ";
  var oelig$1 = "œ";
  var Scaron$1 = "Š";
  var scaron$1 = "š";
  var Yuml$1 = "Ÿ";
  var circ$1 = "ˆ";
  var tilde$4 = "˜";
  var ensp$1 = " ";
  var emsp$1 = " ";
  var thinsp$1 = " ";
  var zwnj$1 = "‌";
  var zwj$1 = "‍";
  var lrm$1 = "‎";
  var rlm$1 = "‏";
  var ndash$1 = "–";
  var mdash$1 = "—";
  var lsquo$1 = "‘";
  var rsquo$1 = "’";
  var sbquo$1 = "‚";
  var ldquo$1 = "“";
  var rdquo$1 = "”";
  var bdquo$1 = "„";
  var dagger$1 = "†";
  var Dagger$1 = "‡";
  var permil$1 = "‰";
  var lsaquo$1 = "‹";
  var rsaquo$1 = "›";
  var euro$1 = "€";
  var index$4 = {
  	nbsp: nbsp$2,
  	iexcl: iexcl$2,
  	cent: cent$2,
  	pound: pound$2,
  	curren: curren$2,
  	yen: yen$2,
  	brvbar: brvbar$2,
  	sect: sect$2,
  	uml: uml$2,
  	copy: copy$2,
  	ordf: ordf$2,
  	laquo: laquo$2,
  	not: not$2,
  	shy: shy$2,
  	reg: reg$2,
  	macr: macr$2,
  	deg: deg$2,
  	plusmn: plusmn$2,
  	sup2: sup2$2,
  	sup3: sup3$2,
  	acute: acute$2,
  	micro: micro$2,
  	para: para$2,
  	middot: middot$2,
  	cedil: cedil$2,
  	sup1: sup1$2,
  	ordm: ordm$2,
  	raquo: raquo$2,
  	frac14: frac14$2,
  	frac12: frac12$2,
  	frac34: frac34$2,
  	iquest: iquest$2,
  	Agrave: Agrave$2,
  	Aacute: Aacute$2,
  	Acirc: Acirc$2,
  	Atilde: Atilde$2,
  	Auml: Auml$2,
  	Aring: Aring$2,
  	AElig: AElig$2,
  	Ccedil: Ccedil$2,
  	Egrave: Egrave$2,
  	Eacute: Eacute$2,
  	Ecirc: Ecirc$2,
  	Euml: Euml$2,
  	Igrave: Igrave$2,
  	Iacute: Iacute$2,
  	Icirc: Icirc$2,
  	Iuml: Iuml$2,
  	ETH: ETH$2,
  	Ntilde: Ntilde$2,
  	Ograve: Ograve$2,
  	Oacute: Oacute$2,
  	Ocirc: Ocirc$2,
  	Otilde: Otilde$2,
  	Ouml: Ouml$2,
  	times: times$2,
  	Oslash: Oslash$2,
  	Ugrave: Ugrave$2,
  	Uacute: Uacute$2,
  	Ucirc: Ucirc$2,
  	Uuml: Uuml$2,
  	Yacute: Yacute$2,
  	THORN: THORN$2,
  	szlig: szlig$2,
  	agrave: agrave$2,
  	aacute: aacute$2,
  	acirc: acirc$2,
  	atilde: atilde$2,
  	auml: auml$2,
  	aring: aring$2,
  	aelig: aelig$2,
  	ccedil: ccedil$2,
  	egrave: egrave$2,
  	eacute: eacute$2,
  	ecirc: ecirc$2,
  	euml: euml$2,
  	igrave: igrave$2,
  	iacute: iacute$2,
  	icirc: icirc$2,
  	iuml: iuml$2,
  	eth: eth$2,
  	ntilde: ntilde$2,
  	ograve: ograve$2,
  	oacute: oacute$2,
  	ocirc: ocirc$2,
  	otilde: otilde$2,
  	ouml: ouml$2,
  	divide: divide$2,
  	oslash: oslash$2,
  	ugrave: ugrave$2,
  	uacute: uacute$2,
  	ucirc: ucirc$2,
  	uuml: uuml$2,
  	yacute: yacute$2,
  	thorn: thorn$2,
  	yuml: yuml$2,
  	fnof: fnof$1,
  	Alpha: Alpha$1,
  	Beta: Beta$1,
  	Gamma: Gamma$1,
  	Delta: Delta$1,
  	Epsilon: Epsilon$1,
  	Zeta: Zeta$1,
  	Eta: Eta$1,
  	Theta: Theta$1,
  	Iota: Iota$1,
  	Kappa: Kappa$1,
  	Lambda: Lambda$1,
  	Mu: Mu$1,
  	Nu: Nu$1,
  	Xi: Xi$1,
  	Omicron: Omicron$1,
  	Pi: Pi$1,
  	Rho: Rho$1,
  	Sigma: Sigma$1,
  	Tau: Tau$1,
  	Upsilon: Upsilon$1,
  	Phi: Phi$1,
  	Chi: Chi$1,
  	Psi: Psi$1,
  	Omega: Omega$1,
  	alpha: alpha$1,
  	beta: beta$1,
  	gamma: gamma$1,
  	delta: delta$1,
  	epsilon: epsilon$1,
  	zeta: zeta$1,
  	eta: eta$1,
  	theta: theta$1,
  	iota: iota$1,
  	kappa: kappa$1,
  	lambda: lambda$1,
  	mu: mu$1,
  	nu: nu$1,
  	xi: xi$1,
  	omicron: omicron$1,
  	pi: pi$1,
  	rho: rho$1,
  	sigmaf: sigmaf$1,
  	sigma: sigma$1,
  	tau: tau$1,
  	upsilon: upsilon$1,
  	phi: phi$1,
  	chi: chi$1,
  	psi: psi$1,
  	omega: omega$1,
  	thetasym: thetasym$1,
  	upsih: upsih$1,
  	piv: piv$1,
  	bull: bull$1,
  	hellip: hellip$1,
  	prime: prime$1,
  	Prime: Prime$1,
  	oline: oline$1,
  	frasl: frasl$1,
  	weierp: weierp$1,
  	image: image$2,
  	real: real$1,
  	trade: trade$1,
  	alefsym: alefsym$1,
  	larr: larr$1,
  	uarr: uarr$1,
  	rarr: rarr$1,
  	darr: darr$1,
  	harr: harr$1,
  	crarr: crarr$1,
  	lArr: lArr$1,
  	uArr: uArr$1,
  	rArr: rArr$1,
  	dArr: dArr$1,
  	hArr: hArr$1,
  	forall: forall$1,
  	part: part$1,
  	exist: exist$1,
  	empty: empty$1,
  	nabla: nabla$1,
  	isin: isin$1,
  	notin: notin$1,
  	ni: ni$1,
  	prod: prod$1,
  	sum: sum$1,
  	minus: minus$1,
  	lowast: lowast$1,
  	radic: radic$1,
  	prop: prop$1,
  	infin: infin$1,
  	ang: ang$1,
  	and: and$1,
  	or: or$1,
  	cap: cap$1,
  	cup: cup$1,
  	int: int$1,
  	there4: there4$1,
  	sim: sim$1,
  	cong: cong$1,
  	asymp: asymp$1,
  	ne: ne$1,
  	equiv: equiv$1,
  	le: le$1,
  	ge: ge$1,
  	sub: sub$1,
  	sup: sup$1,
  	nsub: nsub$1,
  	sube: sube$1,
  	supe: supe$1,
  	oplus: oplus$1,
  	otimes: otimes$1,
  	perp: perp$1,
  	sdot: sdot$1,
  	lceil: lceil$1,
  	rceil: rceil$1,
  	lfloor: lfloor$1,
  	rfloor: rfloor$1,
  	lang: lang$1,
  	rang: rang$1,
  	loz: loz$1,
  	spades: spades$1,
  	clubs: clubs$1,
  	hearts: hearts$1,
  	diams: diams$1,
  	quot: quot$2,
  	amp: amp$2,
  	lt: lt$2,
  	gt: gt$2,
  	OElig: OElig$1,
  	oelig: oelig$1,
  	Scaron: Scaron$1,
  	scaron: scaron$1,
  	Yuml: Yuml$1,
  	circ: circ$1,
  	tilde: tilde$4,
  	ensp: ensp$1,
  	emsp: emsp$1,
  	thinsp: thinsp$1,
  	zwnj: zwnj$1,
  	zwj: zwj$1,
  	lrm: lrm$1,
  	rlm: rlm$1,
  	ndash: ndash$1,
  	mdash: mdash$1,
  	lsquo: lsquo$1,
  	rsquo: rsquo$1,
  	sbquo: sbquo$1,
  	ldquo: ldquo$1,
  	rdquo: rdquo$1,
  	bdquo: bdquo$1,
  	dagger: dagger$1,
  	Dagger: Dagger$1,
  	permil: permil$1,
  	lsaquo: lsaquo$1,
  	rsaquo: rsaquo$1,
  	euro: euro$1
  };

  var characterEntitiesHtml4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    nbsp: nbsp$2,
    iexcl: iexcl$2,
    cent: cent$2,
    pound: pound$2,
    curren: curren$2,
    yen: yen$2,
    brvbar: brvbar$2,
    sect: sect$2,
    uml: uml$2,
    copy: copy$2,
    ordf: ordf$2,
    laquo: laquo$2,
    not: not$2,
    shy: shy$2,
    reg: reg$2,
    macr: macr$2,
    deg: deg$2,
    plusmn: plusmn$2,
    sup2: sup2$2,
    sup3: sup3$2,
    acute: acute$2,
    micro: micro$2,
    para: para$2,
    middot: middot$2,
    cedil: cedil$2,
    sup1: sup1$2,
    ordm: ordm$2,
    raquo: raquo$2,
    frac14: frac14$2,
    frac12: frac12$2,
    frac34: frac34$2,
    iquest: iquest$2,
    Agrave: Agrave$2,
    Aacute: Aacute$2,
    Acirc: Acirc$2,
    Atilde: Atilde$2,
    Auml: Auml$2,
    Aring: Aring$2,
    AElig: AElig$2,
    Ccedil: Ccedil$2,
    Egrave: Egrave$2,
    Eacute: Eacute$2,
    Ecirc: Ecirc$2,
    Euml: Euml$2,
    Igrave: Igrave$2,
    Iacute: Iacute$2,
    Icirc: Icirc$2,
    Iuml: Iuml$2,
    ETH: ETH$2,
    Ntilde: Ntilde$2,
    Ograve: Ograve$2,
    Oacute: Oacute$2,
    Ocirc: Ocirc$2,
    Otilde: Otilde$2,
    Ouml: Ouml$2,
    times: times$2,
    Oslash: Oslash$2,
    Ugrave: Ugrave$2,
    Uacute: Uacute$2,
    Ucirc: Ucirc$2,
    Uuml: Uuml$2,
    Yacute: Yacute$2,
    THORN: THORN$2,
    szlig: szlig$2,
    agrave: agrave$2,
    aacute: aacute$2,
    acirc: acirc$2,
    atilde: atilde$2,
    auml: auml$2,
    aring: aring$2,
    aelig: aelig$2,
    ccedil: ccedil$2,
    egrave: egrave$2,
    eacute: eacute$2,
    ecirc: ecirc$2,
    euml: euml$2,
    igrave: igrave$2,
    iacute: iacute$2,
    icirc: icirc$2,
    iuml: iuml$2,
    eth: eth$2,
    ntilde: ntilde$2,
    ograve: ograve$2,
    oacute: oacute$2,
    ocirc: ocirc$2,
    otilde: otilde$2,
    ouml: ouml$2,
    divide: divide$2,
    oslash: oslash$2,
    ugrave: ugrave$2,
    uacute: uacute$2,
    ucirc: ucirc$2,
    uuml: uuml$2,
    yacute: yacute$2,
    thorn: thorn$2,
    yuml: yuml$2,
    fnof: fnof$1,
    Alpha: Alpha$1,
    Beta: Beta$1,
    Gamma: Gamma$1,
    Delta: Delta$1,
    Epsilon: Epsilon$1,
    Zeta: Zeta$1,
    Eta: Eta$1,
    Theta: Theta$1,
    Iota: Iota$1,
    Kappa: Kappa$1,
    Lambda: Lambda$1,
    Mu: Mu$1,
    Nu: Nu$1,
    Xi: Xi$1,
    Omicron: Omicron$1,
    Pi: Pi$1,
    Rho: Rho$1,
    Sigma: Sigma$1,
    Tau: Tau$1,
    Upsilon: Upsilon$1,
    Phi: Phi$1,
    Chi: Chi$1,
    Psi: Psi$1,
    Omega: Omega$1,
    alpha: alpha$1,
    beta: beta$1,
    gamma: gamma$1,
    delta: delta$1,
    epsilon: epsilon$1,
    zeta: zeta$1,
    eta: eta$1,
    theta: theta$1,
    iota: iota$1,
    kappa: kappa$1,
    lambda: lambda$1,
    mu: mu$1,
    nu: nu$1,
    xi: xi$1,
    omicron: omicron$1,
    pi: pi$1,
    rho: rho$1,
    sigmaf: sigmaf$1,
    sigma: sigma$1,
    tau: tau$1,
    upsilon: upsilon$1,
    phi: phi$1,
    chi: chi$1,
    psi: psi$1,
    omega: omega$1,
    thetasym: thetasym$1,
    upsih: upsih$1,
    piv: piv$1,
    bull: bull$1,
    hellip: hellip$1,
    prime: prime$1,
    Prime: Prime$1,
    oline: oline$1,
    frasl: frasl$1,
    weierp: weierp$1,
    image: image$2,
    real: real$1,
    trade: trade$1,
    alefsym: alefsym$1,
    larr: larr$1,
    uarr: uarr$1,
    rarr: rarr$1,
    darr: darr$1,
    harr: harr$1,
    crarr: crarr$1,
    lArr: lArr$1,
    uArr: uArr$1,
    rArr: rArr$1,
    dArr: dArr$1,
    hArr: hArr$1,
    forall: forall$1,
    part: part$1,
    exist: exist$1,
    empty: empty$1,
    nabla: nabla$1,
    isin: isin$1,
    notin: notin$1,
    ni: ni$1,
    prod: prod$1,
    sum: sum$1,
    minus: minus$1,
    lowast: lowast$1,
    radic: radic$1,
    prop: prop$1,
    infin: infin$1,
    ang: ang$1,
    and: and$1,
    or: or$1,
    cap: cap$1,
    cup: cup$1,
    int: int$1,
    there4: there4$1,
    sim: sim$1,
    cong: cong$1,
    asymp: asymp$1,
    ne: ne$1,
    equiv: equiv$1,
    le: le$1,
    ge: ge$1,
    sub: sub$1,
    sup: sup$1,
    nsub: nsub$1,
    sube: sube$1,
    supe: supe$1,
    oplus: oplus$1,
    otimes: otimes$1,
    perp: perp$1,
    sdot: sdot$1,
    lceil: lceil$1,
    rceil: rceil$1,
    lfloor: lfloor$1,
    rfloor: rfloor$1,
    lang: lang$1,
    rang: rang$1,
    loz: loz$1,
    spades: spades$1,
    clubs: clubs$1,
    hearts: hearts$1,
    diams: diams$1,
    quot: quot$2,
    amp: amp$2,
    lt: lt$2,
    gt: gt$2,
    OElig: OElig$1,
    oelig: oelig$1,
    Scaron: Scaron$1,
    scaron: scaron$1,
    Yuml: Yuml$1,
    circ: circ$1,
    tilde: tilde$4,
    ensp: ensp$1,
    emsp: emsp$1,
    thinsp: thinsp$1,
    zwnj: zwnj$1,
    zwj: zwj$1,
    lrm: lrm$1,
    rlm: rlm$1,
    ndash: ndash$1,
    mdash: mdash$1,
    lsquo: lsquo$1,
    rsquo: rsquo$1,
    sbquo: sbquo$1,
    ldquo: ldquo$1,
    rdquo: rdquo$1,
    bdquo: bdquo$1,
    dagger: dagger$1,
    Dagger: Dagger$1,
    permil: permil$1,
    lsaquo: lsaquo$1,
    rsaquo: rsaquo$1,
    euro: euro$1,
    'default': index$4
  });

  var dangerous = [
  	"cent",
  	"copy",
  	"divide",
  	"gt",
  	"lt",
  	"not",
  	"para",
  	"times"
  ];

  var dangerous$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': dangerous
  });

  var entities = getCjsExportFromNamespace(characterEntitiesHtml4);

  var dangerous$2 = getCjsExportFromNamespace(dangerous$1);

  var decimal$1 = isDecimal;



  var stringifyEntities = encode;
  encode.escape = escape$1;

  var own$5 = {}.hasOwnProperty;

  // Characters
  var equalsTo$2 = 61;

  // List of enforced escapes.
  var escapes$1 = ['"', "'", '<', '>', '&', '`'];

  // Map of characters to names.
  var characters = construct();

  // Default escapes.
  var defaultEscapes = toExpression(escapes$1);

  // Surrogate pairs.
  var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  // Non-ASCII characters.
  // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
  var bmp = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

  // Encode special characters in `value`.
  function encode(value, options) {
    var settings = options || {};
    var subset = settings.subset;
    var set = subset ? toExpression(subset) : defaultEscapes;
    var escapeOnly = settings.escapeOnly;
    var omit = settings.omitOptionalSemicolons;

    value = value.replace(set, replace);

    if (subset || escapeOnly) {
      return value
    }

    return value
      .replace(surrogatePair, replaceSurrogatePair)
      .replace(bmp, replace)

    function replaceSurrogatePair(pair, pos, slice) {
      return toHexReference(
        (pair.charCodeAt(0) - 0xd800) * 0x400 +
          pair.charCodeAt(1) -
          0xdc00 +
          0x10000,
        slice.charCodeAt(pos + 2),
        omit
      )
    }

    function replace(char, pos, slice) {
      return one(char, slice.charCodeAt(pos + 1), settings)
    }
  }

  // Shortcut to escape special characters in HTML.
  function escape$1(value) {
    return encode(value, {escapeOnly: true, useNamedReferences: true})
  }

  // Encode `char` according to `options`.
  function one(char, next, options) {
    var shortest = options.useShortestReferences;
    var omit = options.omitOptionalSemicolons;
    var named;
    var code;
    var numeric;
    var decimal;

    if ((shortest || options.useNamedReferences) && own$5.call(characters, char)) {
      named = toNamed(characters[char], next, omit, options.attribute);
    }

    if (shortest || !named) {
      code = char.charCodeAt(0);
      numeric = toHexReference(code, next, omit);

      // Use the shortest numeric reference when requested.
      // A simple algorithm would use decimal for all code points under 100, as
      // those are shorter than hexadecimal:
      //
      // * `&#99;` vs `&#x63;` (decimal shorter)
      // * `&#100;` vs `&#x64;` (equal)
      //
      // However, because we take `next` into consideration when `omit` is used,
      // And it would be possible that decimals are shorter on bigger values as
      // well if `next` is hexadecimal but not decimal, we instead compare both.
      if (shortest) {
        decimal = toDecimalReference(code, next, omit);

        if (decimal.length < numeric.length) {
          numeric = decimal;
        }
      }
    }

    if (named && (!shortest || named.length < numeric.length)) {
      return named
    }

    return numeric
  }

  // Transform `code` into an entity.
  function toNamed(name, next, omit, attribute) {
    var value = '&' + name;

    if (
      omit &&
      own$5.call(legacy, name) &&
      dangerous$2.indexOf(name) === -1 &&
      (!attribute || (next && next !== equalsTo$2 && !isAlphanumerical(next)))
    ) {
      return value
    }

    return value + ';'
  }

  // Transform `code` into a hexadecimal character reference.
  function toHexReference(code, next, omit) {
    var value = '&#x' + code.toString(16).toUpperCase();
    return omit && next && !isHexadecimal(next) ? value : value + ';'
  }

  // Transform `code` into a decimal character reference.
  function toDecimalReference(code, next, omit) {
    var value = '&#' + String(code);
    return omit && next && !decimal$1(next) ? value : value + ';'
  }

  // Create an expression for `characters`.
  function toExpression(characters) {
    return new RegExp('[' + characters.join('') + ']', 'g')
  }

  // Construct the map.
  function construct() {
    var chars = {};
    var name;

    for (name in entities) {
      chars[entities[name]] = name;
    }

    return chars
  }

  var isAlphanumeric = function (str) {
  	if (typeof str !== 'string') {
  		throw new TypeError('Expected a string');
  	}

  	return !/[^0-9a-z\xDF-\xFF]/.test(str.toLowerCase());
  };

  var entityPrefixLength = length;

  var ampersand$2 = '&';

  // Returns the length of HTML entity that is a prefix of the given string
  // (excluding the ampersand), 0 if it does not start with an entity.
  function length(value) {
    var prefix;

    /* istanbul ignore if - Currently also tested for at implemention, but we
     * keep it here because that’s proper. */
    if (value.charAt(0) !== ampersand$2) {
      return 0
    }

    prefix = value.split(ampersand$2, 2).join(ampersand$2);

    return prefix.length - parseEntities_1(prefix).length
  }

  var _escape$2 = factory$5;

  var tab$d = '\t';
  var lineFeed$i = '\n';
  var space$g = ' ';
  var numberSign$2 = '#';
  var ampersand$3 = '&';
  var leftParenthesis$2 = '(';
  var rightParenthesis$4 = ')';
  var asterisk$5 = '*';
  var plusSign$3 = '+';
  var dash$8 = '-';
  var dot$5 = '.';
  var colon$4 = ':';
  var lessThan$7 = '<';
  var greaterThan$4 = '>';
  var leftSquareBracket$3 = '[';
  var backslash$8 = '\\';
  var rightSquareBracket$3 = ']';
  var underscore$7 = '_';
  var graveAccent$3 = '`';
  var verticalBar$1 = '|';
  var tilde$5 = '~';
  var exclamationMark$5 = '!';

  var entities$1 = {
    '<': '&lt;',
    ':': '&#x3A;',
    '&': '&amp;',
    '|': '&#x7C;',
    '~': '&#x7E;'
  };

  var shortcut$1 = 'shortcut';
  var mailto$1 = 'mailto';
  var https = 'https';
  var http = 'http';

  var blankExpression = /\n\s*$/;

  // Factory to escape characters.
  function factory$5(options) {
    return escape

    // Escape punctuation characters in a node’s value.
    function escape(value, node, parent) {
      var self = this;
      var gfm = options.gfm;
      var commonmark = options.commonmark;
      var pedantic = options.pedantic;
      var markers = commonmark ? [dot$5, rightParenthesis$4] : [dot$5];
      var siblings = parent && parent.children;
      var index = siblings && siblings.indexOf(node);
      var previous = siblings && siblings[index - 1];
      var next = siblings && siblings[index + 1];
      var length = value.length;
      var escapable = markdownEscapes(options);
      var position = -1;
      var queue = [];
      var escaped = queue;
      var afterNewLine;
      var character;
      var wordCharBefore;
      var wordCharAfter;
      var offset;
      var replace;

      if (previous) {
        afterNewLine = text$1(previous) && blankExpression.test(previous.value);
      } else {
        afterNewLine =
          !parent || parent.type === 'root' || parent.type === 'paragraph';
      }

      while (++position < length) {
        character = value.charAt(position);
        replace = false;

        if (character === '\n') {
          afterNewLine = true;
        } else if (
          character === backslash$8 ||
          character === graveAccent$3 ||
          character === asterisk$5 ||
          character === leftSquareBracket$3 ||
          character === lessThan$7 ||
          (character === ampersand$3 && entityPrefixLength(value.slice(position)) > 0) ||
          (character === rightSquareBracket$3 && self.inLink) ||
          (gfm && character === tilde$5 && value.charAt(position + 1) === tilde$5) ||
          (gfm &&
            character === verticalBar$1 &&
            (self.inTable || alignment(value, position))) ||
          (character === underscore$7 &&
            // Delegate leading/trailing underscores to the multinode version below.
            position > 0 &&
            position < length - 1 &&
            (pedantic ||
              !isAlphanumeric(value.charAt(position - 1)) ||
              !isAlphanumeric(value.charAt(position + 1)))) ||
          (gfm && !self.inLink && character === colon$4 && protocol(queue.join('')))
        ) {
          replace = true;
        } else if (afterNewLine) {
          if (
            character === greaterThan$4 ||
            character === numberSign$2 ||
            character === asterisk$5 ||
            character === dash$8 ||
            character === plusSign$3
          ) {
            replace = true;
          } else if (isDecimal(character)) {
            offset = position + 1;

            while (offset < length) {
              if (!isDecimal(value.charAt(offset))) {
                break
              }

              offset++;
            }

            if (markers.indexOf(value.charAt(offset)) !== -1) {
              next = value.charAt(offset + 1);

              if (!next || next === space$g || next === tab$d || next === lineFeed$i) {
                queue.push(value.slice(position, offset));
                position = offset;
                character = value.charAt(position);
                replace = true;
              }
            }
          }
        }

        if (afterNewLine && !isWhitespaceCharacter(character)) {
          afterNewLine = false;
        }

        queue.push(replace ? one(character) : character);
      }

      // Multi-node versions.
      if (siblings && text$1(node)) {
        // Check for an opening parentheses after a link-reference (which can be
        // joined by white-space).
        if (previous && previous.referenceType === shortcut$1) {
          position = -1;
          length = escaped.length;

          while (++position < length) {
            character = escaped[position];

            if (character === space$g || character === tab$d) {
              continue
            }

            if (character === leftParenthesis$2 || character === colon$4) {
              escaped[position] = one(character);
            }

            break
          }

          // If the current node is all spaces / tabs, preceded by a shortcut,
          // and followed by a text starting with `(`, escape it.
          if (
            text$1(next) &&
            position === length &&
            next.value.charAt(0) === leftParenthesis$2
          ) {
            escaped.push(backslash$8);
          }
        }

        // Ensure non-auto-links are not seen as links.  This pattern needs to
        // check the preceding nodes too.
        if (
          gfm &&
          !self.inLink &&
          text$1(previous) &&
          value.charAt(0) === colon$4 &&
          protocol(previous.value.slice(-6))
        ) {
          escaped[0] = one(colon$4);
        }

        // Escape ampersand if it would otherwise start an entity.
        if (
          text$1(next) &&
          value.charAt(length - 1) === ampersand$3 &&
          entityPrefixLength(ampersand$3 + next.value) !== 0
        ) {
          escaped[escaped.length - 1] = one(ampersand$3);
        }

        // Escape exclamation marks immediately followed by links.
        if (
          next &&
          next.type === 'link' &&
          value.charAt(length - 1) === exclamationMark$5
        ) {
          escaped[escaped.length - 1] = one(exclamationMark$5);
        }

        // Escape double tildes in GFM.
        if (
          gfm &&
          text$1(next) &&
          value.charAt(length - 1) === tilde$5 &&
          next.value.charAt(0) === tilde$5
        ) {
          escaped.splice(-1, 0, backslash$8);
        }

        // Escape underscores, but not mid-word (unless in pedantic mode).
        wordCharBefore = text$1(previous) && isAlphanumeric(previous.value.slice(-1));
        wordCharAfter = text$1(next) && isAlphanumeric(next.value.charAt(0));

        if (length === 1) {
          if (
            value === underscore$7 &&
            (pedantic || !wordCharBefore || !wordCharAfter)
          ) {
            escaped.unshift(backslash$8);
          }
        } else {
          if (
            value.charAt(0) === underscore$7 &&
            (pedantic || !wordCharBefore || !isAlphanumeric(value.charAt(1)))
          ) {
            escaped.unshift(backslash$8);
          }

          if (
            value.charAt(length - 1) === underscore$7 &&
            (pedantic ||
              !wordCharAfter ||
              !isAlphanumeric(value.charAt(length - 2)))
          ) {
            escaped.splice(-1, 0, backslash$8);
          }
        }
      }

      return escaped.join('')

      function one(character) {
        return escapable.indexOf(character) === -1
          ? entities$1[character]
          : backslash$8 + character
      }
    }
  }

  // Check if `index` in `value` is inside an alignment row.
  function alignment(value, index) {
    var start = value.lastIndexOf(lineFeed$i, index);
    var end = value.indexOf(lineFeed$i, index);
    var char;

    end = end === -1 ? value.length : end;

    while (++start < end) {
      char = value.charAt(start);

      if (
        char !== colon$4 &&
        char !== dash$8 &&
        char !== space$g &&
        char !== verticalBar$1
      ) {
        return false
      }
    }

    return true
  }

  // Check if `node` is a text node.
  function text$1(node) {
    return node && node.type === 'text'
  }

  // Check if `value` ends in a protocol.
  function protocol(value) {
    var tail = value.slice(-6).toLowerCase();
    return tail === mailto$1 || tail.slice(-5) === https || tail.slice(-4) === http
  }

  var setOptions_1$1 = setOptions$1;

  // Map of applicable enums.
  var maps = {
    entities: {true: true, false: true, numbers: true, escape: true},
    bullet: {'*': true, '-': true, '+': true},
    rule: {'-': true, _: true, '*': true},
    listItemIndent: {tab: true, mixed: true, 1: true},
    emphasis: {_: true, '*': true},
    strong: {_: true, '*': true},
    fence: {'`': true, '~': true}
  };

  // Expose `validate`.
  var validate = {
    boolean: validateBoolean,
    string: validateString,
    number: validateNumber,
    function: validateFunction
  };

  // Set options.  Does not overwrite previously set options.
  function setOptions$1(options) {
    var self = this;
    var current = self.options;
    var ruleRepetition;
    var key;

    if (options == null) {
      options = {};
    } else if (typeof options === 'object') {
      options = immutable(options);
    } else {
      throw new Error('Invalid value `' + options + '` for setting `options`')
    }

    for (key in defaults$3) {
      validate[typeof defaults$3[key]](options, key, current[key], maps[key]);
    }

    ruleRepetition = options.ruleRepetition;

    if (ruleRepetition && ruleRepetition < 3) {
      raise(ruleRepetition, 'options.ruleRepetition');
    }

    self.encode = encodeFactory(String(options.entities));
    self.escape = _escape$2(options);

    self.options = options;

    return self
  }

  // Validate a value to be boolean. Defaults to `def`.  Raises an exception with
  // `context[name]` when not a boolean.
  function validateBoolean(context, name, def) {
    var value = context[name];

    if (value == null) {
      value = def;
    }

    if (typeof value !== 'boolean') {
      raise(value, 'options.' + name);
    }

    context[name] = value;
  }

  // Validate a value to be boolean. Defaults to `def`.  Raises an exception with
  // `context[name]` when not a boolean.
  function validateNumber(context, name, def) {
    var value = context[name];

    if (value == null) {
      value = def;
    }

    if (isNaN(value)) {
      raise(value, 'options.' + name);
    }

    context[name] = value;
  }

  // Validate a value to be in `map`. Defaults to `def`.  Raises an exception
  // with `context[name]` when not in `map`.
  function validateString(context, name, def, map) {
    var value = context[name];

    if (value == null) {
      value = def;
    }

    value = String(value);

    if (!(value in map)) {
      raise(value, 'options.' + name);
    }

    context[name] = value;
  }

  // Validate a value to be function. Defaults to `def`.  Raises an exception
  // with `context[name]` when not a function.
  function validateFunction(context, name, def) {
    var value = context[name];

    if (value == null) {
      value = def;
    }

    if (typeof value !== 'function') {
      raise(value, 'options.' + name);
    }

    context[name] = value;
  }

  // Factory to encode HTML entities.  Creates a no-operation function when
  // `type` is `'false'`, a function which encodes using named references when
  // `type` is `'true'`, and a function which encodes using numbered references
  // when `type` is `'numbers'`.
  function encodeFactory(type) {
    var options = {};

    if (type === 'false') {
      return identity_1
    }

    if (type === 'true') {
      options.useNamedReferences = true;
    }

    if (type === 'escape') {
      options.escapeOnly = true;
      options.useNamedReferences = true;
    }

    return wrapped

    // Encode HTML entities using the bound options.
    function wrapped(value) {
      return stringifyEntities(value, options)
    }
  }

  // Throw an exception with in its `message` `value` and `name`.
  function raise(value, name) {
    throw new Error('Invalid value `' + value + '` for setting `' + name + '`')
  }

  var mdastUtilCompact = compact;

  // Make an mdast tree compact by merging adjacent text nodes.
  function compact(tree, commonmark) {
    unistUtilVisit(tree, visitor);

    return tree

    function visitor(child, index, parent) {
      var siblings = parent ? parent.children : [];
      var prev = index && siblings[index - 1];

      if (
        prev &&
        child.type === prev.type &&
        mergeable$1(prev, commonmark) &&
        mergeable$1(child, commonmark)
      ) {
        if (child.value) {
          prev.value += child.value;
        }

        if (child.children) {
          prev.children = prev.children.concat(child.children);
        }

        siblings.splice(index, 1);

        if (prev.position && child.position) {
          prev.position.end = child.position.end;
        }

        return index
      }
    }
  }

  function mergeable$1(node, commonmark) {
    var start;
    var end;

    if (node.type === 'text') {
      if (!node.position) {
        return true
      }

      start = node.position.start;
      end = node.position.end;

      // Only merge nodes which occupy the same size as their `value`.
      return (
        start.line !== end.line || end.column - start.column === node.value.length
      )
    }

    return commonmark && node.type === 'blockquote'
  }

  var compile_1 = compile;

  // Stringify the given tree.
  function compile() {
    return this.visit(mdastUtilCompact(this.tree, this.options.commonmark))
  }

  var one_1 = one$1;

  function one$1(node, parent) {
    var self = this;
    var visitors = self.visitors;

    // Fail on unknown nodes.
    if (typeof visitors[node.type] !== 'function') {
      self.file.fail(
        new Error(
          'Missing compiler for node of type `' + node.type + '`: `' + node + '`'
        ),
        node
      );
    }

    return visitors[node.type].call(self, node, parent)
  }

  var all_1 = all;

  // Visit all children of `parent`.
  function all(parent) {
    var self = this;
    var children = parent.children;
    var length = children.length;
    var results = [];
    var index = -1;

    while (++index < length) {
      results[index] = self.visit(children[index], parent);
    }

    return results
  }

  var block_1 = block$1;

  var lineFeed$j = '\n';

  var blank$1 = lineFeed$j + lineFeed$j;
  var triple = blank$1 + lineFeed$j;
  var comment$1 = blank$1 + '<!---->' + blank$1;

  // Stringify a block node with block children (e.g., `root` or `blockquote`).
  // Knows about code following a list, or adjacent lists with similar bullets,
  // and places an extra line feed between them.
  function block$1(node) {
    var self = this;
    var options = self.options;
    var fences = options.fences;
    var gap = options.commonmark ? comment$1 : triple;
    var definitionGap = options.tightDefinitions ? lineFeed$j : blank$1;
    var values = [];
    var children = node.children;
    var length = children.length;
    var index = -1;
    var previous;
    var child;

    while (++index < length) {
      previous = child;
      child = children[index];

      if (previous) {
        // A list preceding another list that are equally ordered, or a
        // list preceding an indented code block, need a gap between them,
        // so as not to see them as one list, or content of the list,
        // respectively.
        //
        // In commonmark, only something that breaks both up can do that,
        // so we opt for an empty, invisible comment.  In other flavours,
        // two blank lines are fine.
        if (
          previous.type === 'list' &&
          ((child.type === 'list' && previous.ordered === child.ordered) ||
            (child.type === 'code' && !child.lang && !fences))
        ) {
          values.push(gap);
        } else if (
          previous.type === 'definition' &&
          child.type === 'definition'
        ) {
          values.push(definitionGap);
        } else {
          values.push(blank$1);
        }
      }

      values.push(self.visit(child, node));
    }

    return values.join('')
  }

  var orderedItems_1 = orderedItems;

  var lineFeed$k = '\n';
  var dot$6 = '.';

  var blank$2 = lineFeed$k + lineFeed$k;

  // Visit ordered list items.
  //
  // Starts the list with
  // `node.start` and increments each following list item
  // bullet by one:
  //
  //     2. foo
  //     3. bar
  //
  // In `incrementListMarker: false` mode, does not increment
  // each marker and stays on `node.start`:
  //
  //     1. foo
  //     1. bar
  function orderedItems(node) {
    var self = this;
    var fn = self.visitors.listItem;
    var increment = self.options.incrementListMarker;
    var values = [];
    var start = node.start;
    var children = node.children;
    var length = children.length;
    var index = -1;
    var bullet;

    start = start == null ? 1 : start;

    while (++index < length) {
      bullet = (increment ? start + index : start) + dot$6;
      values[index] = fn.call(self, children[index], node, index, bullet);
    }

    return values.join(node.spread ? blank$2 : lineFeed$k)
  }

  var unorderedItems_1 = unorderedItems;

  var lineFeed$l = '\n';

  var blank$3 = lineFeed$l + lineFeed$l;

  // Visit unordered list items.  Uses `options.bullet` as each item’s bullet.
  function unorderedItems(node) {
    var self = this;
    var bullet = self.options.bullet;
    var fn = self.visitors.listItem;
    var children = node.children;
    var length = children.length;
    var index = -1;
    var values = [];

    while (++index < length) {
      values[index] = fn.call(self, children[index], node, index, bullet);
    }

    return values.join(node.spread ? blank$3 : lineFeed$l)
  }

  var root_1 = root;

  var lineFeed$m = '\n';

  // Stringify a root.
  // Adds a final newline to ensure valid POSIX files. */
  function root(node) {
    var doc = this.block(node);

    if (doc.charAt(doc.length - 1) !== lineFeed$m) {
      doc += lineFeed$m;
    }

    return doc
  }

  var text_1$1 = text$2;

  // Stringify text.
  // Supports named entities in `settings.encode: true` mode:
  //
  // ```markdown
  // AT&amp;T
  // ```
  //
  // Supports numbered entities in `settings.encode: numbers` mode:
  //
  // ```markdown
  // AT&#x26;T
  // ```
  function text$2(node, parent) {
    return this.encode(this.escape(node.value, node, parent), node)
  }

  var heading_1 = heading;

  var lineFeed$n = '\n';
  var space$h = ' ';
  var numberSign$3 = '#';
  var dash$9 = '-';
  var equalsTo$3 = '=';

  // Stringify a heading.
  //
  // In `setext: true` mode and when `depth` is smaller than three, creates a
  // setext header:
  //
  // ```markdown
  // Foo
  // ===
  // ```
  //
  // Otherwise, an ATX header is generated:
  //
  // ```markdown
  // ### Foo
  // ```
  //
  // In `closeAtx: true` mode, the header is closed with hashes:
  //
  // ```markdown
  // ### Foo ###
  // ```
  function heading(node) {
    var self = this;
    var depth = node.depth;
    var setext = self.options.setext;
    var closeAtx = self.options.closeAtx;
    var content = self.all(node).join('');
    var prefix;

    if (setext && depth < 3) {
      return (
        content + lineFeed$n + repeatString(depth === 1 ? equalsTo$3 : dash$9, content.length)
      )
    }

    prefix = repeatString(numberSign$3, node.depth);

    return prefix + space$h + content + (closeAtx ? space$h + prefix : '')
  }

  var paragraph_1$1 = paragraph$1;

  function paragraph$1(node) {
    return this.all(node).join('')
  }

  var blockquote_1$1 = blockquote$1;

  var lineFeed$o = '\n';
  var space$i = ' ';
  var greaterThan$5 = '>';

  function blockquote$1(node) {
    var values = this.block(node).split(lineFeed$o);
    var result = [];
    var length = values.length;
    var index = -1;
    var value;

    while (++index < length) {
      value = values[index];
      result[index] = (value ? space$i : '') + value;
    }

    return greaterThan$5 + result.join(lineFeed$o + greaterThan$5)
  }

  var list_1$1 = list$1;

  function list$1(node) {
    var fn = node.ordered ? this.visitOrderedItems : this.visitUnorderedItems;
    return fn.call(this, node)
  }

  var pad_1 = pad;

  var lineFeed$p = '\n';
  var space$j = ' ';

  var tabSize$5 = 4;

  // Pad `value` with `level * tabSize` spaces.  Respects lines.  Ignores empty
  // lines.
  function pad(value, level) {
    var values = value.split(lineFeed$p);
    var index = values.length;
    var padding = repeatString(space$j, level * tabSize$5);

    while (index--) {
      if (values[index].length !== 0) {
        values[index] = padding + values[index];
      }
    }

    return values.join(lineFeed$p)
  }

  var listItem_1 = listItem$1;

  var lineFeed$q = '\n';
  var space$k = ' ';
  var leftSquareBracket$4 = '[';
  var rightSquareBracket$4 = ']';
  var lowercaseX$2 = 'x';

  var ceil = Math.ceil;
  var blank$4 = lineFeed$q + lineFeed$q;

  var tabSize$6 = 4;

  // Stringify a list item.
  //
  // Prefixes the content with a checked checkbox when `checked: true`:
  //
  // ```markdown
  // [x] foo
  // ```
  //
  // Prefixes the content with an unchecked checkbox when `checked: false`:
  //
  // ```markdown
  // [ ] foo
  // ```
  function listItem$1(node, parent, position, bullet) {
    var self = this;
    var style = self.options.listItemIndent;
    var marker = bullet || self.options.bullet;
    var spread = node.spread == null ? true : node.spread;
    var checked = node.checked;
    var children = node.children;
    var length = children.length;
    var values = [];
    var index = -1;
    var value;
    var indent;
    var spacing;

    while (++index < length) {
      values[index] = self.visit(children[index], node);
    }

    value = values.join(spread ? blank$4 : lineFeed$q);

    if (typeof checked === 'boolean') {
      // Note: I’d like to be able to only add the space between the check and
      // the value, but unfortunately github does not support empty list-items
      // with a checkbox :(
      value =
        leftSquareBracket$4 +
        (checked ? lowercaseX$2 : space$k) +
        rightSquareBracket$4 +
        space$k +
        value;
    }

    if (style === '1' || (style === 'mixed' && value.indexOf(lineFeed$q) === -1)) {
      indent = marker.length + 1;
      spacing = space$k;
    } else {
      indent = ceil((marker.length + 1) / tabSize$6) * tabSize$6;
      spacing = repeatString(space$k, indent - marker.length);
    }

    return value
      ? marker + spacing + pad_1(value, indent / tabSize$6).slice(indent)
      : marker
  }

  var longestStreak_1 = longestStreak;

  // Get the count of the longest repeating streak of `character` in `value`.
  function longestStreak(value, character) {
    var count = 0;
    var maximum = 0;
    var expected;
    var index;

    if (typeof character !== 'string' || character.length !== 1) {
      throw new Error('Expected character')
    }

    value = String(value);
    index = value.indexOf(character);
    expected = index;

    while (index !== -1) {
      count++;

      if (index === expected) {
        if (count > maximum) {
          maximum = count;
        }
      } else {
        count = 1;
      }

      expected = index + 1;
      index = value.indexOf(character, expected);
    }

    return maximum
  }

  var inlineCode_1 = inlineCode$1;

  var graveAccentChar = '`';
  var lineFeed$r = 10; //  '\n'
  var space$l = 32; // ' '
  var graveAccent$4 = 96; //  '`'

  // Stringify inline code.
  //
  // Knows about internal ticks (`\``), and ensures one more tick is used to
  // enclose the inline code:
  //
  // ````markdown
  // ```foo ``bar`` baz```
  // ````
  //
  // Even knows about inital and final ticks:
  //
  // ``markdown
  // `` `foo ``
  // `` foo` ``
  // ```
  function inlineCode$1(node) {
    var value = node.value;
    var ticks = repeatString(graveAccentChar, longestStreak_1(value, graveAccentChar) + 1);
    var start = ticks;
    var end = ticks;
    var head = value.charCodeAt(0);
    var tail = value.charCodeAt(value.length - 1);
    var wrap = false;
    var index;
    var length;

    if (head === graveAccent$4 || tail === graveAccent$4) {
      wrap = true;
    } else if (value.length > 2 && ws(head) && ws(tail)) {
      index = 1;
      length = value.length - 1;

      while (++index < length) {
        if (!ws(value.charCodeAt(index))) {
          wrap = true;
          break
        }
      }
    }

    if (wrap) {
      start += ' ';
      end = ' ' + end;
    }

    return start + value + end
  }

  function ws(code) {
    return code === lineFeed$r || code === space$l
  }

  var code_1 = code;

  var lineFeed$s = '\n';
  var space$m = ' ';
  var tilde$6 = '~';
  var graveAccent$5 = '`';

  // Stringify code.
  // Creates indented code when:
  //
  // - No language tag exists
  // - Not in `fences: true` mode
  // - A non-empty value exists
  //
  // Otherwise, GFM fenced code is created:
  //
  // ````markdown
  // ```js
  // foo();
  // ```
  // ````
  //
  // When in ``fence: `~` `` mode, uses tildes as fences:
  //
  // ```markdown
  // ~~~js
  // foo();
  // ~~~
  // ```
  //
  // Knows about internal fences:
  //
  // `````markdown
  // ````markdown
  // ```javascript
  // foo();
  // ```
  // ````
  // `````
  function code(node, parent) {
    var self = this;
    var value = node.value;
    var options = self.options;
    var marker = options.fence;
    var info = node.lang || '';
    var fence;

    if (info && node.meta) {
      info += space$m + node.meta;
    }

    info = self.encode(self.escape(info, node));

    // Without (needed) fences.
    if (
      !info &&
      !options.fences &&
      value &&
      value.charAt(0) !== lineFeed$s &&
      value.charAt(value.length - 1) !== lineFeed$s
    ) {
      // Throw when pedantic, in a list item which isn’t compiled using a tab.
      if (
        parent &&
        parent.type === 'listItem' &&
        options.listItemIndent !== 'tab' &&
        options.pedantic
      ) {
        self.file.fail(
          'Cannot indent code properly. See https://git.io/fxKR8',
          node.position
        );
      }

      return pad_1(value, 1)
    }

    // Backticks in the info string don’t work with backtick fenced code.
    // Backticks (and tildes) are fine in tilde fenced code.
    if (marker === graveAccent$5 && info.indexOf(graveAccent$5) !== -1) {
      marker = tilde$6;
    }

    fence = repeatString(marker, Math.max(longestStreak_1(value, marker) + 1, 3));

    return fence + info + lineFeed$s + value + lineFeed$s + fence
  }

  var html_1 = html$1;

  function html$1(node) {
    return node.value
  }

  var thematicBreak$1 = thematic;

  var space$n = ' ';

  // Stringify a `thematic-break`.
  // The character used is configurable through `rule`: (`'_'`):
  //
  // ```markdown
  // ___
  // ```
  //
  // The number of repititions is defined through `ruleRepetition` (`6`):
  //
  // ```markdown
  // ******
  // ```
  //
  // Whether spaces delimit each character, is configured through `ruleSpaces`
  // (`true`):
  // ```markdown
  // * * *
  // ```
  function thematic() {
    var options = this.options;
    var rule = repeatString(options.rule, options.ruleRepetition);
    return options.ruleSpaces ? rule.split('').join(space$n) : rule
  }

  var strong_1$1 = strong$2;

  // Stringify a `strong`.
  //
  // The marker used is configurable by `strong`, which defaults to an asterisk
  // (`'*'`) but also accepts an underscore (`'_'`):
  //
  // ```markdown
  // __foo__
  // ```
  function strong$2(node) {
    var marker = repeatString(this.options.strong, 2);
    return marker + this.all(node).join('') + marker
  }

  var emphasis_1$1 = emphasis$2;

  var underscore$8 = '_';
  var asterisk$6 = '*';

  // Stringify an `emphasis`.
  //
  // The marker used is configurable through `emphasis`, which defaults to an
  // underscore (`'_'`) but also accepts an asterisk (`'*'`):
  //
  // ```markdown
  // *foo*
  // ```
  //
  // In `pedantic` mode, text which itself contains an underscore will cause the
  // marker to default to an asterisk instead:
  //
  // ```markdown
  // *foo_bar*
  // ```
  function emphasis$2(node) {
    var marker = this.options.emphasis;
    var content = this.all(node).join('');

    // When in pedantic mode, prevent using underscore as the marker when there
    // are underscores in the content.
    if (
      this.options.pedantic &&
      marker === underscore$8 &&
      content.indexOf(marker) !== -1
    ) {
      marker = asterisk$6;
    }

    return marker + content + marker
  }

  var _break$2 = lineBreak;

  var backslash$9 = '\\';
  var lineFeed$t = '\n';
  var space$o = ' ';

  var commonmark$1 = backslash$9 + lineFeed$t;
  var normal = space$o + space$o + lineFeed$t;

  function lineBreak() {
    return this.options.commonmark ? commonmark$1 : normal
  }

  var _delete$2 = strikethrough$1;

  var tilde$7 = '~';

  var fence$1 = tilde$7 + tilde$7;

  function strikethrough$1(node) {
    return fence$1 + this.all(node).join('') + fence$1
  }

  var encloseUri = enclose;

  var leftParenthesis$3 = '(';
  var rightParenthesis$5 = ')';
  var lessThan$8 = '<';
  var greaterThan$6 = '>';

  var expression = /\s/;

  // Wrap `url` in angle brackets when needed, or when
  // forced.
  // In links, images, and definitions, the URL part needs
  // to be enclosed when it:
  //
  // - has a length of `0`
  // - contains white-space
  // - has more or less opening than closing parentheses
  function enclose(uri, always) {
    if (
      always ||
      uri.length === 0 ||
      expression.test(uri) ||
      ccount_1(uri, leftParenthesis$3) !== ccount_1(uri, rightParenthesis$5)
    ) {
      return lessThan$8 + uri + greaterThan$6
    }

    return uri
  }

  var encloseTitle = enclose$1;

  var quotationMark$2 = '"';
  var apostrophe$2 = "'";

  // There is currently no way to support nested delimiters across Markdown.pl,
  // CommonMark, and GitHub (RedCarpet).  The following code supports Markdown.pl
  // and GitHub.
  // CommonMark is not supported when mixing double- and single quotes inside a
  // title.
  function enclose$1(title) {
    var delimiter =
      title.indexOf(quotationMark$2) === -1 ? quotationMark$2 : apostrophe$2;
    return delimiter + title + delimiter
  }

  var link_1$1 = link$3;

  var space$p = ' ';
  var leftSquareBracket$5 = '[';
  var rightSquareBracket$5 = ']';
  var leftParenthesis$4 = '(';
  var rightParenthesis$6 = ')';

  // Expression for a protocol:
  // See <https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Generic_syntax>.
  var protocol$1 = /^[a-z][a-z+.-]+:\/?/i;

  // Stringify a link.
  //
  // When no title exists, the compiled `children` equal `url`, and `url` starts
  // with a protocol, an auto link is created:
  //
  // ```markdown
  // <http://example.com>
  // ```
  //
  // Otherwise, is smart about enclosing `url` (see `encloseURI()`) and `title`
  // (see `encloseTitle()`).
  // ```
  //
  // ```markdown
  // [foo](<foo at bar dot com> 'An "example" e-mail')
  // ```
  //
  // Supports named entities in the `url` and `title` when in `settings.encode`
  // mode.
  function link$3(node) {
    var self = this;
    var content = self.encode(node.url || '', node);
    var exit = self.enterLink();
    var escaped = self.encode(self.escape(node.url || '', node));
    var value = self.all(node).join('');

    exit();

    if (node.title == null && protocol$1.test(content) && escaped === value) {
      // Backslash escapes do not work in autolinks, so we do not escape.
      return encloseUri(self.encode(node.url), true)
    }

    content = encloseUri(content);

    if (node.title) {
      content += space$p + encloseTitle(self.encode(self.escape(node.title, node), node));
    }

    return (
      leftSquareBracket$5 +
      value +
      rightSquareBracket$5 +
      leftParenthesis$4 +
      content +
      rightParenthesis$6
    )
  }

  var copyIdentifierEncoding = copy$3;

  var ampersand$4 = '&';

  var punctuationExppresion = /[-!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~_]/;

  // For shortcut and collapsed reference links, the contents is also an
  // identifier, so we need to restore the original encoding and escaping
  // that were present in the source string.
  //
  // This function takes the unescaped & unencoded value from shortcut’s
  // child nodes and the identifier and encodes the former according to
  // the latter.
  function copy$3(value, identifier) {
    var length = value.length;
    var count = identifier.length;
    var result = [];
    var position = 0;
    var index = 0;
    var start;

    while (index < length) {
      // Take next non-punctuation characters from `value`.
      start = index;

      while (index < length && !punctuationExppresion.test(value.charAt(index))) {
        index += 1;
      }

      result.push(value.slice(start, index));

      // Advance `position` to the next punctuation character.
      while (
        position < count &&
        !punctuationExppresion.test(identifier.charAt(position))
      ) {
        position += 1;
      }

      // Take next punctuation characters from `identifier`.
      start = position;

      while (
        position < count &&
        punctuationExppresion.test(identifier.charAt(position))
      ) {
        if (identifier.charAt(position) === ampersand$4) {
          position += entityPrefixLength(identifier.slice(position));
        }

        position += 1;
      }

      result.push(identifier.slice(start, position));

      // Advance `index` to the next non-punctuation character.
      while (index < length && punctuationExppresion.test(value.charAt(index))) {
        index += 1;
      }
    }

    return result.join('')
  }

  var label_1 = label;

  var leftSquareBracket$6 = '[';
  var rightSquareBracket$6 = ']';

  var shortcut$2 = 'shortcut';
  var collapsed$1 = 'collapsed';

  // Stringify a reference label.
  // Because link references are easily, mistakingly, created (for example,
  // `[foo]`), reference nodes have an extra property depicting how it looked in
  // the original document, so stringification can cause minimal changes.
  function label(node) {
    var type = node.referenceType;

    if (type === shortcut$2) {
      return ''
    }

    return (
      leftSquareBracket$6 +
      (type === collapsed$1 ? '' : node.label || node.identifier) +
      rightSquareBracket$6
    )
  }

  var linkReference_1 = linkReference;

  var leftSquareBracket$7 = '[';
  var rightSquareBracket$7 = ']';

  var shortcut$3 = 'shortcut';
  var collapsed$2 = 'collapsed';

  function linkReference(node) {
    var self = this;
    var type = node.referenceType;
    var exit = self.enterLinkReference(self, node);
    var value = self.all(node).join('');

    exit();

    if (type === shortcut$3 || type === collapsed$2) {
      value = copyIdentifierEncoding(value, node.label || node.identifier);
    }

    return leftSquareBracket$7 + value + rightSquareBracket$7 + label_1(node)
  }

  var imageReference_1 = imageReference;

  var leftSquareBracket$8 = '[';
  var rightSquareBracket$8 = ']';
  var exclamationMark$6 = '!';

  function imageReference(node) {
    return (
      exclamationMark$6 +
      leftSquareBracket$8 +
      (this.encode(node.alt, node) || '') +
      rightSquareBracket$8 +
      label_1(node)
    )
  }

  var definition_1$1 = definition$1;

  var space$q = ' ';
  var colon$5 = ':';
  var leftSquareBracket$9 = '[';
  var rightSquareBracket$9 = ']';

  // Stringify an URL definition.
  //
  // Is smart about enclosing `url` (see `encloseURI()`) and `title` (see
  // `encloseTitle()`).
  //
  // ```markdown
  // [foo]: <foo at bar dot com> 'An "example" e-mail'
  // ```
  function definition$1(node) {
    var content = encloseUri(node.url);

    if (node.title) {
      content += space$q + encloseTitle(node.title);
    }

    return (
      leftSquareBracket$9 +
      (node.label || node.identifier) +
      rightSquareBracket$9 +
      colon$5 +
      space$q +
      content
    )
  }

  var image_1 = image$3;

  var space$r = ' ';
  var leftParenthesis$5 = '(';
  var rightParenthesis$7 = ')';
  var leftSquareBracket$a = '[';
  var rightSquareBracket$a = ']';
  var exclamationMark$7 = '!';

  // Stringify an image.
  //
  // Is smart about enclosing `url` (see `encloseURI()`) and `title` (see
  // `encloseTitle()`).
  //
  // ```markdown
  // ![foo](</fav icon.png> 'My "favourite" icon')
  // ```
  //
  // Supports named entities in `url`, `alt`, and `title` when in
  // `settings.encode` mode.
  function image$3(node) {
    var self = this;
    var content = encloseUri(self.encode(node.url || '', node));
    var exit = self.enterLink();
    var alt = self.encode(self.escape(node.alt || '', node));

    exit();

    if (node.title) {
      content += space$r + encloseTitle(self.encode(node.title, node));
    }

    return (
      exclamationMark$7 +
      leftSquareBracket$a +
      alt +
      rightSquareBracket$a +
      leftParenthesis$5 +
      content +
      rightParenthesis$7
    )
  }

  var markdownTable_1 = markdownTable;

  var trailingWhitespace = / +$/;

  // Characters.
  var space$s = ' ';
  var lineFeed$u = '\n';
  var dash$a = '-';
  var colon$6 = ':';
  var verticalBar$2 = '|';

  var x = 0;
  var C = 67;
  var L$1 = 76;
  var R = 82;
  var c = 99;
  var l$1 = 108;
  var r = 114;

  // Create a table from a matrix of strings.
  function markdownTable(table, options) {
    var settings = options || {};
    var padding = settings.padding !== false;
    var start = settings.delimiterStart !== false;
    var end = settings.delimiterEnd !== false;
    var align = (settings.align || []).concat();
    var alignDelimiters = settings.alignDelimiters !== false;
    var alignments = [];
    var stringLength = settings.stringLength || defaultStringLength;
    var rowIndex = -1;
    var rowLength = table.length;
    var cellMatrix = [];
    var sizeMatrix = [];
    var row = [];
    var sizes = [];
    var longestCellByColumn = [];
    var mostCellsPerRow = 0;
    var cells;
    var columnIndex;
    var columnLength;
    var largest;
    var size;
    var cell;
    var lines;
    var line;
    var before;
    var after;
    var code;

    // This is a superfluous loop if we don’t align delimiters, but otherwise we’d
    // do superfluous work when aligning, so optimize for aligning.
    while (++rowIndex < rowLength) {
      cells = table[rowIndex];
      columnIndex = -1;
      columnLength = cells.length;
      row = [];
      sizes = [];

      if (columnLength > mostCellsPerRow) {
        mostCellsPerRow = columnLength;
      }

      while (++columnIndex < columnLength) {
        cell = serialize(cells[columnIndex]);

        if (alignDelimiters === true) {
          size = stringLength(cell);
          sizes[columnIndex] = size;

          largest = longestCellByColumn[columnIndex];

          if (largest === undefined || size > largest) {
            longestCellByColumn[columnIndex] = size;
          }
        }

        row.push(cell);
      }

      cellMatrix[rowIndex] = row;
      sizeMatrix[rowIndex] = sizes;
    }

    // Figure out which alignments to use.
    columnIndex = -1;
    columnLength = mostCellsPerRow;

    if (typeof align === 'object' && 'length' in align) {
      while (++columnIndex < columnLength) {
        alignments[columnIndex] = toAlignment(align[columnIndex]);
      }
    } else {
      code = toAlignment(align);

      while (++columnIndex < columnLength) {
        alignments[columnIndex] = code;
      }
    }

    // Inject the alignment row.
    columnIndex = -1;
    columnLength = mostCellsPerRow;
    row = [];
    sizes = [];

    while (++columnIndex < columnLength) {
      code = alignments[columnIndex];
      before = '';
      after = '';

      if (code === l$1) {
        before = colon$6;
      } else if (code === r) {
        after = colon$6;
      } else if (code === c) {
        before = colon$6;
        after = colon$6;
      }

      // There *must* be at least one hyphen-minus in each alignment cell.
      size = alignDelimiters
        ? Math.max(
            1,
            longestCellByColumn[columnIndex] - before.length - after.length
          )
        : 1;

      cell = before + repeatString(dash$a, size) + after;

      if (alignDelimiters === true) {
        size = before.length + size + after.length;

        if (size > longestCellByColumn[columnIndex]) {
          longestCellByColumn[columnIndex] = size;
        }

        sizes[columnIndex] = size;
      }

      row[columnIndex] = cell;
    }

    // Inject the alignment row.
    cellMatrix.splice(1, 0, row);
    sizeMatrix.splice(1, 0, sizes);

    rowIndex = -1;
    rowLength = cellMatrix.length;
    lines = [];

    while (++rowIndex < rowLength) {
      row = cellMatrix[rowIndex];
      sizes = sizeMatrix[rowIndex];
      columnIndex = -1;
      columnLength = mostCellsPerRow;
      line = [];

      while (++columnIndex < columnLength) {
        cell = row[columnIndex] || '';
        before = '';
        after = '';

        if (alignDelimiters === true) {
          size = longestCellByColumn[columnIndex] - (sizes[columnIndex] || 0);
          code = alignments[columnIndex];

          if (code === r) {
            before = repeatString(space$s, size);
          } else if (code === c) {
            if (size % 2 === 0) {
              before = repeatString(space$s, size / 2);
              after = before;
            } else {
              before = repeatString(space$s, size / 2 + 0.5);
              after = repeatString(space$s, size / 2 - 0.5);
            }
          } else {
            after = repeatString(space$s, size);
          }
        }

        if (start === true && columnIndex === 0) {
          line.push(verticalBar$2);
        }

        if (
          padding === true &&
          // Don’t add the opening space if we’re not aligning and the cell is
          // empty: there will be a closing space.
          !(alignDelimiters === false && cell === '') &&
          (start === true || columnIndex !== 0)
        ) {
          line.push(space$s);
        }

        if (alignDelimiters === true) {
          line.push(before);
        }

        line.push(cell);

        if (alignDelimiters === true) {
          line.push(after);
        }

        if (padding === true) {
          line.push(space$s);
        }

        if (end === true || columnIndex !== columnLength - 1) {
          line.push(verticalBar$2);
        }
      }

      line = line.join('');

      if (end === false) {
        line = line.replace(trailingWhitespace, '');
      }

      lines.push(line);
    }

    return lines.join(lineFeed$u)
  }

  function serialize(value) {
    return value === null || value === undefined ? '' : String(value)
  }

  function defaultStringLength(value) {
    return value.length
  }

  function toAlignment(value) {
    var code = typeof value === 'string' ? value.charCodeAt(0) : x;

    return code === L$1 || code === l$1
      ? l$1
      : code === R || code === r
      ? r
      : code === C || code === c
      ? c
      : x
  }

  var table_1$1 = table$1;

  // Stringify table.
  //
  // Creates a fenced table.
  // The table has aligned delimiters by default, but not in
  // `tablePipeAlign: false`:
  //
  // ```markdown
  // | Header 1 | Header 2 |
  // | :-: | - |
  // | Alpha | Bravo |
  // ```
  //
  // The table is spaced by default, but not in `tableCellPadding: false`:
  //
  // ```markdown
  // |Foo|Bar|
  // |:-:|---|
  // |Baz|Qux|
  // ```
  function table$1(node) {
    var self = this;
    var options = self.options;
    var padding = options.tableCellPadding;
    var alignDelimiters = options.tablePipeAlign;
    var stringLength = options.stringLength;
    var rows = node.children;
    var index = rows.length;
    var exit = self.enterTable();
    var result = [];

    while (index--) {
      result[index] = self.all(rows[index]);
    }

    exit();

    return markdownTable_1(result, {
      align: node.align,
      alignDelimiters: alignDelimiters,
      padding: padding,
      stringLength: stringLength
    })
  }

  var tableCell_1 = tableCell;

  var lineFeed$v = /\r?\n/g;

  function tableCell(node) {
    return this.all(node).join('').replace(lineFeed$v, ' ')
  }

  var compiler = Compiler;

  // Construct a new compiler.
  function Compiler(tree, file) {
    this.inLink = false;
    this.inTable = false;
    this.tree = tree;
    this.file = file;
    this.options = immutable(this.options);
    this.setOptions({});
  }

  var proto$4 = Compiler.prototype;

  // Enter and exit helpers. */
  proto$4.enterLink = stateToggle('inLink', false);
  proto$4.enterTable = stateToggle('inTable', false);
  proto$4.enterLinkReference = enterLinkReference;

  // Configuration.
  proto$4.options = defaults$3;
  proto$4.setOptions = setOptions_1$1;

  proto$4.compile = compile_1;
  proto$4.visit = one_1;
  proto$4.all = all_1;
  proto$4.block = block_1;
  proto$4.visitOrderedItems = orderedItems_1;
  proto$4.visitUnorderedItems = unorderedItems_1;

  // Expose visitors.
  proto$4.visitors = {
    root: root_1,
    text: text_1$1,
    heading: heading_1,
    paragraph: paragraph_1$1,
    blockquote: blockquote_1$1,
    list: list_1$1,
    listItem: listItem_1,
    inlineCode: inlineCode_1,
    code: code_1,
    html: html_1,
    thematicBreak: thematicBreak$1,
    strong: strong_1$1,
    emphasis: emphasis_1$1,
    break: _break$2,
    delete: _delete$2,
    link: link_1$1,
    linkReference: linkReference_1,
    imageReference: imageReference_1,
    definition: definition_1$1,
    image: image_1,
    table: table_1$1,
    tableCell: tableCell_1
  };

  var remarkStringify = stringify$1;
  stringify$1.Compiler = compiler;

  function stringify$1(options) {
    var Local = unherit_1(compiler);
    Local.prototype.options = immutable(
      Local.prototype.options,
      this.data('settings'),
      options
    );
    this.Compiler = Local;
  }

  const linkify = (team, client) => () => async (ast) => {
    const urlRegex = new RegExp(String.raw`https:\/\/${team}\.esa\.io\/posts\/(?<id>\d+)(?<hash>#[a-zA-Z\d%]+)?`);
    let bareLinkIds = new Set();
    unistUtilVisit(ast, 'link', findLinks);
    const { posts: linkedPosts } = await client.search([...bareLinkIds]);
    unistUtilVisit(ast, 'link', replaceLink);

    function replaceLink(node) {
      const id = getOurBareLinkId(node);
      if (id) {
        const post = linkedPosts.find(post => post.number === id);
        node.children[0].value = post.full_name;
      }
    }

    // 検索するURLを探す
    function findLinks(node) {
      const id = getOurBareLinkId(node);
      if (id) {
        bareLinkIds.add(id);
      }
    }

    // [xx](http://xxx) 形式になっていないteamのlinkの記事id
    function getOurBareLinkId(node) {
      const notLinkFormat = node.url === node.children[0].value;
      const hit = node.url.match(urlRegex);
      if (notLinkFormat && hit?.groups?.id) {
        return parseInt(hit.groups.id, 10)
      }
    }
  };

  const getCurrentPostId = () => {
    return new Promise((resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        resolve(tabs[0].url.match(/\/posts\/(?<id>\d+)/).groups.id);
      });
    }))
  };

  const getConfig = () => {
    return new Promise(resolve => {
      chrome.storage.sync.get(['team', 'token'], function(data) {
        const { team = '', token = '' } = data;
        resolve({team, token});
      });
    })
  };

  class Message {
    #message
    constructor() {
      this.#message = document.getElementById('message');
      const options = document.getElementById('options');
      options.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }

    show(message) {
      this.#message.textContent = message;
    }
  }

  const request = async (url, token, options = {}) => {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    const res = await fetch(url, {...defaultOptions, ...options});
    if (!res.ok) {
      throw new ClientError(res.status)
    }
    return res.json()
  };

  class ClientError extends Error {
    get messageForHuman() {
      const message = {
        [Client.STATUS_OVER_LIMIT]: '仕事しすぎです。少しコーヒー休憩を。',
        [Client.STATUS_INSUFFICIENT_PERMISSION]: 'TOKENの権限足りないみたい。'
      };
      return message[this.message] || 'APIで、なんかエラーになった。'
    }
  }

  class Client {
    #team
    #token
    #baseUrl = 'https://api.esa.io/v1/teams'
    static STATUS_OVER_LIMIT = 429
    static STATUS_INSUFFICIENT_PERMISSION = 403

    constructor(team, token) {
      this.#team = team;
      this.#token = token;
    }

    getPost(id) {
      const url = new URL(`${this.#baseUrl}/${this.#team}/posts/${id}`);
      return request(url, this.#token)
    }

    updatePost(id, md) {
      const options = {
        method: 'PATCH',
        body: JSON.stringify({ post: { body_md: md, message: "Updated by esa-auto-linkify-extension."} })
      };
      const url = new URL(`${this.#baseUrl}/${this.#team}/posts/${id}`);
      return request(url, this.#token, options)
    }

    search(ids) {
      const url = new URL(`${this.#baseUrl}/${this.#team}/posts`);
      const query = ids.map(id => `number:${id}`).join(' or ');
      url.searchParams.append('q', query);
      url.searchParams.append('per_page', 100);
      return request(url, this.#token)
    }
  }

  (async() => {
    const message = new Message();
    const config = await getConfig();
    if (!config.team || !config.token) {
      message.show('設定を行ってください');
      return
    }
    const currentPostId = await getCurrentPostId();
    const client = new Client(config.team, config.token);
    const { body_md: contents } = await client.getPost(currentPostId);

    message.show('更新中...');
    unified_1()
      .use(remarkParse)
      .use(linkify(config.team, client))
      .use(remarkStringify)
      .process(contents, function (err, file) {
        if (err) {
          console.error(err);
          message.show('Markdownの解析に失敗しました。');
          return
        }
        requestUpdatePostMd({
          ...config,
          id: currentPostId,
          contents: String(file)
        });
      });

    function requestUpdatePostMd(config) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, config, function(errorMessage) {
          if (errorMessage) {
            message.show(errorMessage);
          } else {
            message.show('完了');
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        });
      });
    }
  })();

})));
