(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _default = {
  loadFont: function loadFont() {
    var link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css?family=Raleway:100,300,400";
    link.rel = 'stylesheet';

    document.head.appendChild(link);
  } };exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _Font = _interopRequireDefault(require("./Modules/Font"));

_Font["default"].loadFont();

},{"./Modules/Font":1,"@babel/runtime/helpers/interopRequireDefault":3}],3:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}]},{},[2])

//# sourceMappingURL=about.js.map
