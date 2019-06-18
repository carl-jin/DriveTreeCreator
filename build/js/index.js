(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass")); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * --------------------------------------------------------------------------
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * DriveTreeCreator.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @description pretty easy way to create a ton of folder tree from google drive
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @version 0.0.1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @license WTFPL
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @author BUFF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * --------------------------------------------------------------------------
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */var
DriveTreeCreator = /*#__PURE__*/function () {
  function DriveTreeCreator(options) {(0, _classCallCheck2["default"])(this, DriveTreeCreator);
    //  default options
    this.options = {
      googleAPI: {
        clientId: "",
        apiKey: "",
        /**
                     which folder do you want to get from?
                     accept multiple folder Id
                     use , to segmentation
                     like
                     folderIdTest,folderIdTest2,folderIdTest3
                     */
        folderId: "",
        /*
                      the owner of the google folder
                      that's a point of DriveTreeCreator working
                      as we know , we cant get children folder or grandson folder
                      by google drive api, cuz google not provide it
                      but interestingly we can use the owner parameter to replace it!
                      */
        owner: "" },

      scope: 'https://www.googleapis.com/auth/drive',
      discovery_docs: ["https://script.googleapis.com/$discovery/rest?version=v1"],
      //  list files except trash file
      inTrash: false,
      //  google drive api list parameter ---- files
      //  https://developers.google.com/drive/api/v3/search-files
      files: "id,name,size,createdTime,webContentLink,webViewLink,mimeType,parents,fileExtension",
      //  google drive api list parameter
      //  https://developers.google.com/drive/api/v3/reference/files/list
      includeTeamDriveItems: false,
      //  sort file from dir view, accept a fn
      sort: null };

    this.options = Object.assign(this.options, options);

  }

  /**
     * a method from initialization google api environment
     * which mean u should call it after new DriveTreeCreator,immediately
     * and every method calling should after init finish
     * @returns {Promise<any>} when environment has been ready for roll
     */(0, _createClass2["default"])(DriveTreeCreator, [{ key: "init", value: function init()
    {var _this = this;
      return new Promise( /*#__PURE__*/function () {var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(res) {return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:if (!
                  window.gapi) {_context.next = 9;break;}if (!(
                  !window.gapi.client.script || !window.gapi.client.drive)) {_context.next = 5;break;}throw (
                    new Error('make sure gapi.client.script or gapi.client.drive has been set up, use gapi.load pls'));case 5:

                  _this._event();
                  res();case 7:_context.next = 13;break;case 9:_context.next = 11;return (


                    _this._loadGApi());case 11:
                  _this._event();
                  res();case 13:case "end":return _context.stop();}}}, _callee);}));return function (_x) {return _ref.apply(this, arguments);};}());


    }

    /**
       * subscribe event
       *
       * signInStateChange
       * loadProcess
       *
       * @private
       */ }, { key: "_event", value: function _event()
    {var _this2 = this;
      //  user sign in state change
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(function (isSignedIn) {return _this2._emitEvent('signInStateChange', { state: isSignedIn });});
    }

    /**
       * manually emit an event
       * @private
       */ }, { key: "_emitEvent", value: function _emitEvent(
    eventName) {var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!this.handlers) {
        return;
      }

      var handlers = this.handlers[eventName];
      handlers && handlers.forEach(function (handler) {return handler(payload);});
    }

    /**
       * get pop page to sign in google account
       */ }, { key: "signIn", value: function signIn()
    {
      return window.gapi.auth2.getAuthInstance().signIn({ prompt: 'select_account' });
    } }, { key: "signOut", value: function signOut()

    {
      return gapi.auth2.getAuthInstance().signOut();
    }

    /**
       * start to create tree view
       * @returns {Promise<any>}
       * steps:
       * 1. get all files by owners user
       * 2. createTree by files
       * 3. sort
       * 4. return specific folder from folderId parameter
       */ }, { key: "start", value: function start()
    {var _this3 = this;
      if (!this.isSignIn()) {
        throw new Error('cant run start method, should sign-in first');
      }

      return new Promise( /*#__PURE__*/function () {var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(res) {var files, cache, dir, result;return _regenerator["default"].wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                  //  step 1
                  //  get all files by owners user
                  _this3._emitEvent('loadProcess', { process: 'start', count: 0 });
                  files = [];if (!(
                  window.location.href.indexOf('localhost') && false)) {_context2.next = 14;break;}
                  cache = window.localStorage.getItem('filesCache');if (!
                  window.localStorage.getItem('filesCache')) {_context2.next = 8;break;}
                  files = JSON.parse(cache);_context2.next = 12;break;case 8:_context2.next = 10;return (

                    _this3._getAllFilesUnderRootFolder());case 10:files = _context2.sent;
                  window.localStorage.setItem('filesCache', JSON.stringify(files));case 12:_context2.next = 17;break;case 14:_context2.next = 16;return (


                    _this3._getAllFilesUnderRootFolder());case 16:files = _context2.sent;case 17:


                  //   step 2
                  //  createTree by files
                  dir = _this3._createTree(files);

                  //  step 3
                  //  sort
                  if (~_this3.options.files.indexOf('name')) {_context2.next = 20;break;}throw (
                    new Error('should include `name` field in options.files'));case 20:


                  Object.keys(dir).map(function (key) {
                    _this3._sort(dir[key]);
                  });

                  //  step 4
                  //  return specific folder from folderId parameter
                  dir = Object.values(dir);


                  result = [];
                  _this3.options.googleAPI.folderId.split(',').map(function (id) {return result.push(_this3._returnSpecificFolder(dir, id));});
                  res(result);case 25:case "end":return _context2.stop();}}}, _callee2);}));return function (_x2) {return _ref2.apply(this, arguments);};}());

    }

    /**
       * find specific folder from dir
       * @private
       */ }, { key: "_returnSpecificFolder", value: function _returnSpecificFolder(
    dir, id) {
      for (var i = 0; i < dir.length; i++) {
        if (dir[i].id === id) {
          return dir[i];
        } else {
          if (dir[i].children) {
            var res = this._returnSpecificFolder(dir[i].children, id);
            if (res) {
              return res;
            }
          }
        }
      }
    } }, { key: "_sort", value: function _sort(

    dir) {var _this4 = this;
      if (dir.children && dir.children.length > 0) {
        //  sort
        dir.children.sort(function (a, b) {return _this4.options.sort ? _this4.options.sort(a, b) : a.name.localeCompare(b.name, 'zh');});
        dir.children.map(function (item) {return _this4._sort(item);});
      }
    }

    /**
       * core !!!!!!!!!!!!!!!!!!!!!!!!!
       * generator three view by parents from each file
       * @param files
       * @private
       */ }, { key: "_createTree", value: function _createTree(
    files) {var _this5 = this;
      var relationKeyPath = {};
      var newData = {};

      files.map(function (item) {return newData[item.id] = item;});
      files = newData;
      newData = null;

      //  core
      Object.keys(files).map(function (key) {
        if (files[key].parents) {
          var parentId = files[key].parents[0];
          var item = files[key];

          if (files[parentId]) {
            if (files[parentId].children) {
              files[parentId].children.push(item);
            } else {
              files[parentId].children = [item];
            }

            relationKeyPath[key] = [parentId];
            delete files[key];
          } else {
            if (relationKeyPath[parentId]) {
              relationKeyPath[parentId] = _this5.__findKeyPath(parentId, relationKeyPath);
              var parentObj = null;
              relationKeyPath[parentId].map(function (_parentId) {
                if (Array.isArray(parentObj)) {
                  parentObj.map(function (__parentItem, __key) {
                    if (__parentItem.id === _parentId) {
                      parentObj = parentObj[__key].children;
                    }
                  });
                } else {
                  parentObj = files[_parentId].children;
                }
              });

              parentObj.map(function (___item) {
                if (___item.id === parentId) {
                  if (___item.children) {
                    ___item.children.push(item);
                  } else {
                    ___item.children = [item];
                  }
                }
              });
              relationKeyPath[key] = [parentId];
              delete files[key];
            }
          }
        }
      });

      return files;
    } }, { key: "__findKeyPath", value: function __findKeyPath(

    key, relationPath) {var arr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      if (relationPath[key]) {
        arr = relationPath[key].concat(arr);
        return this.__findKeyPath(arr[0], relationPath, arr);
      } else {
        return arr;
      }
    }

    /**
       * get all files by owners user
       * @param nextPageToken
       * @param data
       * @param count
       * @returns {Promise<any>}
       * @private
       */ }, { key: "_getAllFilesUnderRootFolder", value: function _getAllFilesUnderRootFolder()
    {var _this6 = this;var nextPageToken = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      return new Promise(function (res) {
        window.gapi.client.drive.files.list({
          pageSize: 1000,
          pageToken: nextPageToken,
          spaces: 'drive',
          q: "'".concat(_this6.options.googleAPI.owner, "' in owners and trashed = ").concat(_this6.options.inTrash.toString()),
          fields: "nextPageToken, files(".concat(_this6.options.files, ")"),
          includeTeamDriveItems: _this6.options.includeTeamDriveItems }).
        then(function (result) {
          data = data.concat(result.result.files);
          //  emit event
          _this6._emitEvent('loadProcess', { process: count, count: result.result.files.length });
          count++;
          if (result.result.nextPageToken) {
            res(_this6._getAllFilesUnderRootFolder(result.result.nextPageToken, data, count));
          } else {
            _this6._emitEvent('loadProcess', { process: 'down', count: data.length });
            res(data);
          }
        });
      });
    }

    /**
       * check user Sign In state
       */ }, { key: "isSignIn", value: function isSignIn()
    {
      return window.gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    /**
       * Attach a handler function for an event.
       * @param eventName
       * @param handler
       */ }, { key: "on", value: function on(
    eventName, handler) {
      var self = this;
      if (!this.handlers) {
        this.handlers = {};
      }

      var handlers = this.handlers[eventName];

      if (!handlers) {
        handlers = this.handlers[eventName] = [];
      }

      handlers.push(handler);

      // Return an event descriptor
      return {
        name: eventName,
        callback: handler,
        un: function un(e, fn) {return self.un(e, fn);} };

    }

    /**
       * Remove an event handler.
       * @param eventName
       * @param handle
       */ }, { key: "un", value: function un(
    eventName, handle) {
      if (!this.handlers) {
        return;
      }

      var handlers = this.handlers[eventName];
      var i;

      if (handlers) {
        if (handle) {
          for (i = handlers.length - 1; i >= 0; i--) {
            handlers[i] == handle && handlers.splice(i, 1);
          }
        } else {
          handlers.length = 0;
        }
      }
    }

    /**
       * get user information from current sign in
       */ }, { key: "getCurrentUser", value: function getCurrentUser()
    {
      var userProfile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
      return userProfile ? {
        email: userProfile.getEmail(),
        name: userProfile.getName(),
        image: userProfile.getImageUrl(),
        id: userProfile.getId(),
        token: window.gapi.auth.getToken().access_token } :
      {};
    }

    /**
       * load google sdk
       * @private
       */ }, { key: "_loadGApi", value: function _loadGApi()
    {var _this7 = this;
      return new Promise( /*#__PURE__*/function () {var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(res) {return _regenerator["default"].wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                    _this7._loadScript('https://apis.google.com/js/api.js'));case 2:
                  window.gapi.load('client:auth2', function () {
                    window.gapi.client.load('drive', 'v3', /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {return _regenerator["default"].wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
                                window.gapi.client.init({
                                  apiKey: _this7.options.googleAPI.apiKey,
                                  clientId: _this7.options.googleAPI.clientId,
                                  discoveryDocs: _this7.options.discovery_docs,
                                  scope: _this7.options.scope }));case 2:

                              res();case 3:case "end":return _context3.stop();}}}, _callee3);})));

                  });case 3:case "end":return _context4.stop();}}}, _callee4);}));return function (_x3) {return _ref3.apply(this, arguments);};}());

    }

    /**
       * same as $.loadScript()
       * @param src
       * @returns {Promise<any>}
       * @private
       */ }, { key: "_loadScript", value: function _loadScript(
    src) {
      return new Promise(function (res, rej) {
        var script = document.createElement('script');
        script.async = true;
        script.onerror = function () {return rej();};
        script.onload = function () {return res(src);};
        script.src = src;
        document.querySelector('body').appendChild(script);
      });
    } }]);return DriveTreeCreator;}();var _default =



DriveTreeCreator;exports["default"] = _default;

},{"@babel/runtime/helpers/asyncToGenerator":3,"@babel/runtime/helpers/classCallCheck":4,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":6,"@babel/runtime/regenerator":7}],2:[function(require,module,exports){
"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _DriveTreeCreator = _interopRequireDefault(require("./DriveTreeCreator"));

document.querySelector('#start').addEventListener('click', /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {var D, data;return _regenerator["default"].wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
          D = new _DriveTreeCreator["default"]({
            googleAPI: {
              clientId: clientId.value,
              apiKey: apiKey.value,
              folderId: folderId.value,
              owner: owner.value } });_context.next = 3;return (



            D.init());case 3:

          //  loading state change
          D.on('signInStateChange', function (payload) {
            console.log(payload);
          });

          //  loading process
          D.on('loadProcess', function (payload) {
            console.log(payload);
          });_context.t0 =

          !D.isSignIn();if (!_context.t0) {_context.next = 9;break;}_context.next = 9;return D.signIn();case 9:

          console.time('start');_context.next = 12;return (
            D.start());case 12:data = _context.sent;
          console.timeEnd('start');
          console.log(data);case 15:case "end":return _context.stop();}}}, _callee);})));

},{"./DriveTreeCreator":1,"@babel/runtime/helpers/asyncToGenerator":3,"@babel/runtime/helpers/interopRequireDefault":6,"@babel/runtime/regenerator":7}],3:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],4:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],5:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],6:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],7:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":8}],8:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[2])

//# sourceMappingURL=index.js.map
