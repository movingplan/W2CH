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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbW9kdWxlcy9Cb290L0Jvb3QuanMiLCJzcmMvdGVzdC9tb2R1bGVzL0Jvb3RTcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFLSSxzQkFBYztBQUFBOztBQUNWLFdBQU8sS0FBSyxLQUFMLEVBQVA7QUFDSDs7Ozs0QkFFTztBQUNKLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBTTtBQUVoRDtBQUNBLGNBQUksS0FBSyxJQUFMLENBQVUsUUFBUSxDQUFDLElBQW5CLENBQUosRUFBOEI7QUFDMUIsWUFBQSxPQUFPO0FBQ1YsV0FGRCxNQUdLLE1BQU0sQ0FBQyxPQUFELENBQU47QUFDUixTQVBEO0FBUUgsT0FUTSxDQUFQO0FBVUg7Ozs7Ozs7QUFHSjs7Ozs7QUN2QkQ7Ozs7QUFFQSxRQUFRLENBQUMsYUFBRCxFQUFnQixZQUFVO0FBRTlCLEVBQUEsRUFBRSxDQUFDLG1CQUFELEVBQXNCLFlBQVU7QUFDOUIsUUFBSSxJQUFJLEdBQUcsSUFBSSxhQUFKLEVBQVg7QUFDQSxJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBTixDQUFOLENBQWtCLFdBQWxCO0FBQ0gsR0FIQyxDQUFGO0FBS0gsQ0FQTyxDQUFSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuICBCb290IG9wZXJhdGlvbnNcclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGEgZHVtbXkgY29uZGl0aW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoL1xcdy8udGVzdChsb2NhdGlvbi5ocmVmKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgcmVqZWN0KCdFcnJvcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG5cclxufTtcclxuIiwiaW1wb3J0IEJvb3QgZnJvbSBcIi4uLy4uL2pzL21vZHVsZXMvQm9vdC9Cb290XCI7XHJcblxyXG5kZXNjcmliZShcIkJvb3QgbW9kdWxlXCIsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgaXQoXCJzaG91bGQgYmUgZGVmaW5lZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGxldCBib290ID0gbmV3IEJvb3QoKTtcclxuICAgICAgICBleHBlY3QoYm9vdC50aGVuKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIl19
