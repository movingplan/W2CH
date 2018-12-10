(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
  Boot operations
*/
var _default =
/*#__PURE__*/
function () {
  function _default() {
    _classCallCheck(this, _default);

    return this.ready();
  }

  _createClass(_default, [{
    key: "ready",
    value: function ready() {
      return new Promise(function (resolve, reject) {
        document.addEventListener("DOMContentLoaded", function () {
          // Just a dummy condition
          if (/\w/.test(location.href)) {
            resolve();
          } else reject('Error');
        });
      });
    }
  }]);

  return _default;
}();

exports.default = _default;
;

},{}],2:[function(require,module,exports){
"use strict";

var _Boot = _interopRequireDefault(require("../../js/modules/Boot/Boot"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Boot module", function () {
  it("should be defined", function () {
    var boot = new _Boot.default();
    expect(boot.then).toBeDefined();
  });
});

},{"../../js/modules/Boot/Boot":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbW9kdWxlcy9Cb290L0Jvb3QuanMiLCJzcmMvdGVzdC9tb2R1bGVzL0Jvb3RTcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFLSSxzQkFBYztBQUFBOztBQUNWLFdBQU8sS0FBSyxLQUFMLEVBQVA7QUFDSDs7Ozs0QkFFTztBQUNKLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBTTtBQUNoRDtBQUNBLGNBQUksS0FBSyxJQUFMLENBQVUsUUFBUSxDQUFDLElBQW5CLENBQUosRUFBOEI7QUFDMUIsWUFBQSxPQUFPO0FBQ1YsV0FGRCxNQUdLLE1BQU0sQ0FBQyxPQUFELENBQU47QUFDUixTQU5EO0FBT0gsT0FSTSxDQUFQO0FBU0g7Ozs7Ozs7QUFFSjs7Ozs7QUNyQkQ7Ozs7QUFFQSxRQUFRLENBQUMsYUFBRCxFQUFnQixZQUFVO0FBRTlCLEVBQUEsRUFBRSxDQUFDLG1CQUFELEVBQXNCLFlBQVU7QUFDOUIsUUFBSSxJQUFJLEdBQUcsSUFBSSxhQUFKLEVBQVg7QUFDQSxJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBTixDQUFOLENBQWtCLFdBQWxCO0FBQ0gsR0FIQyxDQUFGO0FBS0gsQ0FQTyxDQUFSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuICBCb290IG9wZXJhdGlvbnNcclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gSnVzdCBhIGR1bW15IGNvbmRpdGlvblxyXG4gICAgICAgICAgICAgICAgaWYgKC9cXHcvLnRlc3QobG9jYXRpb24uaHJlZikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJlamVjdCgnRXJyb3InKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59O1xyXG4iLCJpbXBvcnQgQm9vdCBmcm9tIFwiLi4vLi4vanMvbW9kdWxlcy9Cb290L0Jvb3RcIjtcclxuXHJcbmRlc2NyaWJlKFwiQm9vdCBtb2R1bGVcIiwgZnVuY3Rpb24oKXtcclxuXHJcbiAgICBpdChcInNob3VsZCBiZSBkZWZpbmVkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IGJvb3QgPSBuZXcgQm9vdCgpO1xyXG4gICAgICAgIGV4cGVjdChib290LnRoZW4pLnRvQmVEZWZpbmVkKCk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iXX0=
