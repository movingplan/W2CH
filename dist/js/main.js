(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/*
  App
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.get = get;
exports.setNode = setNode;
exports.getNode = getNode;
exports.merge = merge;
exports.Controller = exports.View = exports.Model = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var modules = [];
var currView, currModel;

function add(moduleName, M, V, C) {
  var view = currView = new V();
  var model = currModel = new M();
  var controller = new C();
  model.init();
  return modules[moduleName] = {
    model: model,
    view: view,
    controller: controller
  };
}

function get(moduleName) {
  return modules[moduleName];
}
/*
  Model
*/


var Model =
/*#__PURE__*/
function () {
  function Model() {
    _classCallCheck(this, Model);

    this.tree = {};
    this.callbacks = {
      setPre: [],
      setPost: [],
      change: []
    };
  }

  _createClass(Model, [{
    key: "init",
    value: function init() {
      // Run any callbacks registered during instantiation
      for (var p in this.callbacks) {
        if (this.callbacks.hasOwnProperty(p)) {
          this.runCallbacks(p);
        }
      }
    }
  }, {
    key: "setPre",
    value: function setPre(props) {
      // Allows validation etc. before setting props
      // `props` is a copy that can be safely mutated
      var callbacks = this.callbacks["setPre"];
      var i = callbacks.length;

      while (i--) {
        props = callbacks[i].call(this, props);
      }

      return props;
    }
  }, {
    key: "setPost",
    value: function setPost(props) {
      // Runs callbacks after `set()` whether model changed or not
      this.runCallbacks("setPost");
    }
  }, {
    key: "change",
    value: function change() {
      // Runs callbacks after `set()` if model changed
      this.runCallbacks("change");
    }
  }, {
    key: "set",
    value: function set(propsOrPath, value) {
      // Accepts props object `{...}` OR 'path', 'value'
      var changeEvent;

      if (isObject(propsOrPath)) {
        // Run any "setPre" callbacks on a copy of `props`
        var props = this.setPre(merge({}, propsOrPath));
        merge(this.tree, props, function (isChanged) {
          return changeEvent = isChanged;
        });
      } else {
        var path = propsOrPath; // Run any "setPre" callbacks

        value = this.setPre(_defineProperty({}, path, value))[path];
        changeEvent = setNode(this.tree, path, value);
      }

      if (changeEvent) {
        this.change();
      }

      this.setPost();
      return this; // For chaining
    }
  }, {
    key: "get",
    value: function get(path) {
      return getNode(this.tree, path);
    }
  }, {
    key: "on",
    value: function on(label, callback) {
      var callbacks = this.callbacks[label];

      if (callbacks) {
        callbacks.unshift(callback);
      }

      return this; // For chaining
    }
  }, {
    key: "runCallbacks",
    value: function runCallbacks(label) {
      var callbacks = this.callbacks[label];
      var i = callbacks.length;

      while (i--) {
        callbacks[i].call(this, this.tree);
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      // Return tree for JSON.stringify()
      return this.tree;
    }
  }]);

  return Model;
}();
/*
  View
*/


exports.Model = Model;

var View =
/*#__PURE__*/
function () {
  function View() {// Derived class must assign `el` property

    _classCallCheck(this, View);
  }

  _createClass(View, [{
    key: "get",
    value: function get(selector) {
      return this.el.querySelector(selector);
    }
  }, {
    key: "getAll",
    value: function getAll(selector) {
      return this.el.querySelectorAll(selector);
    }
  }]);

  return View;
}();
/*
  Controller
*/


exports.View = View;

var Controller =
/*#__PURE__*/
function () {
  function Controller() {
    _classCallCheck(this, Controller);

    this.model = currModel;

    if (currView.el) {
      this.view = currView;
    } else {
      throw new Error('View.el required!');
    }

    currModel = null;
    currView = null;
  }

  _createClass(Controller, [{
    key: "bind",
    value: function bind(bindings) {
      // Run binding functions for selectors (within view.el)
      for (var selector in bindings) {
        if (bindings.hasOwnProperty(selector)) {
          var domEls = this.view.el.querySelectorAll(selector);
          var i = domEls.length;

          while (i--) {
            bindings[selector].call(this, domEls[i], this.model, this.view, this);
          }
        }
      }

      return this; // For chaining
    }
  }]);

  return Controller;
}();
/*
  Utils
*/


exports.Controller = Controller;

function isObject(o) {
  return o === Object(o) && !o.nodeType && !Array.isArray(o) && !(typeof o === 'function') && !(o instanceof RegExp);
}

function isNumeric(val) {
  return Number(parseFloat(val)) == val;
}

function setNode(tree, pathStr, value) {
  // Set node at path string to value
  // Any missing nodes are created
  // NOTE: all numeric nodes below root are assumed to be array indexes
  // Returns boolean `true` if value was changed
  var isChanged = false;
  getNode(tree, pathStr, function (currNode, prop, nextProp) {
    // Last segment of path string, set value if different
    if (nextProp === undefined) {
      var currVal = currNode[prop];

      if (value !== currVal) {
        currNode[prop] = value;
        isChanged = true;
      }
    } // Else create any missing nodes in path
    else if (currNode[prop] === undefined) {
        // Create an array if nextProp is numeric, otherwise an object
        currNode[prop] = isNumeric(nextProp) ? [] : {};
      }
  });
  return isChanged;
}

function getNode(tree, pathStr, eachCallback) {
  // Get node from path string
  // Optional `eachCallback` is passed (currNode, prop, nextProp)
  // This allows the next node to be created or changed before each traversal
  var pathArr = pathStr.split(".");
  var currNode = tree;

  for (var i = 0, len = pathArr.length; i < len; i++) {
    var prop = pathArr[i];

    if (eachCallback) {
      eachCallback(currNode, prop, pathArr[i + 1]);
    }

    if (currNode === undefined) break;else currNode = currNode[prop];
  }

  return currNode;
}

function merge()
/* [mergeChildObs,] {}, {} [, ...] [, callback] */
{
  // Add or overwrite all properties right to left
  // By default child objects are merged recursively (but not arrays)
  // If a boolean is supplied, it becomes `mergeChildObs` value until another boolean is found
  // If a callback is supplied, it will receive a boolean argument `isChanged`
  var level = 0,
      changeCount = 0,
      mergeChildObs = true,
      callback,
      result = run.apply(this, [0, arguments]);
  if (callback) callback(!!changeCount);
  return result;

  function run(level, params) {
    var param,
        retOb,
        paramsCount = params.length; // Child objects
    // Merge into leftmost param if an object, or create object to merge into

    if (level) {
      retOb = isObject(params[0]) ? params[0] : {};
    }

    for (var i = 0; i < paramsCount; i++) {
      param = params[i]; // Top level params may contain other arguments

      if (!level && param != null) {
        // `undefined` or `null`
        // First object becomes returned object
        // Also allow a DOM node for merging into
        if (!retOb && isObject(param) || param.nodeName) {
          retOb = param;
          continue;
        } // `mergeChildObs` boolean arguments


        if (typeof param === "boolean") {
          mergeChildObs = param;
          continue;
        } // Last passed in function becomes callback


        if (typeof param === "function") {
          callback = param;
          continue;
        }

        if (!retOb) continue;
      }

      for (var p in param) {
        if (param.hasOwnProperty(p)) {
          var val = param[p]; // Merge child objects (recursive)

          if (mergeChildObs && isObject(val)) {
            retOb[p] = run(level + 1, [retOb[p], val]);
          } else if (val !== retOb[p]) {
            changeCount++;
            retOb[p] = val;
          }
        }
      }
    }

    return retOb || {};
  }
}

},{}],2:[function(require,module,exports){
"use strict";

var _Boot = _interopRequireDefault(require("./modules/Boot/Boot"));

var _ToDoForm = _interopRequireDefault(require("./modules/todoForm/ToDoForm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _Boot.default().then(function () {
  new _ToDoForm.default();
});

},{"./modules/Boot/Boot":3,"./modules/todoForm/ToDoForm":6}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var app = _interopRequireWildcard(require("../../lib/app"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

"use strict";
/*
  Extends `app.Controller`
      Properties: `model`, `view`
      Methods: `bind()` for DOM selectors
*/


var _default =
/*#__PURE__*/
function (_app$Controller) {
  _inherits(_default, _app$Controller);

  function _default() {
    var _this;

    _classCallCheck(this, _default);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this)); // Update view when model changes

    _this.model.on('change', function () {
      var todo = _this.model.get('todo');

      if (todo) {
        todo = "<div>".concat(todo, "</div>");
      }

      _this.view.get('.debugArea').innerHTML = todo;
    }); // Example 2 way bindings


    _this.bind({
      '#todo': function todo(el, model, view, controller) {
        el.onkeyup = function () {
          model.set('todo', el.value);
        };

        model.on('setPost', function () {
          el.value = model.get('todo');
        });
      }
    });

    return _this;
  }

  return _default;
}(app.Controller);

exports.default = _default;
;

},{"../../lib/app":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var app = _interopRequireWildcard(require("../../lib/app"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

"use strict";
/*
  Extends app.Model
      Methods: `set()`, `get()`, `on('setPre'|'setPost'|'change')`
*/


var _default =
/*#__PURE__*/
function (_app$Model) {
  _inherits(_default, _app$Model);

  function _default() {
    var _this;

    _classCallCheck(this, _default);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this)); // Arbitrary method

    _this.sanitize = function (props) {
      for (var p in props) {
        if (props.hasOwnProperty(p) && typeof props[p] === "string") {
          props[p] = props[p].replace(/[^\w\s'!.,;]/g, '');
        }
      }

      return props;
    }; // Set listener


    _this.on('setPre', function (props) {
      return _this.sanitize(props);
    }); // Populate model


    _this.set({
      todo: '',
      date: Date.now()
    }); // Set by path


    _this.set('user.name', 'Guest');

    return _this;
  }

  return _default;
}(app.Model);

exports.default = _default;
;

},{"../../lib/app":1}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var app = _interopRequireWildcard(require("../../lib/app"));

var _Model = _interopRequireDefault(require("./Model"));

var _View = _interopRequireDefault(require("./View"));

var _Controller = _interopRequireDefault(require("./Controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

"use strict";
/*
  Example module
*/


var _default = function _default() {
  _classCallCheck(this, _default);

  return app.add("ToDoForm", _Model.default, _View.default, _Controller.default);
};

exports.default = _default;
;

},{"../../lib/app":1,"./Controller":4,"./Model":5,"./View":7}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var app = _interopRequireWildcard(require("../../lib/app"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

"use strict";
/*
  Extends app.View
      Properties: `el`
      Methods: `get()`, `getAll()` for DOM selectors
*/


var _default =
/*#__PURE__*/
function (_app$View) {
  _inherits(_default, _app$View);

  function _default() {
    var _this;

    _classCallCheck(this, _default);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this)); // Set DOM ref

    _this.el = document.getElementById("todoform");
    return _this;
  }

  return _default;
}(app.View);

exports.default = _default;
;

},{"../../lib/app":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGliL2FwcC5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL21vZHVsZXMvQm9vdC9Cb290LmpzIiwic3JjL2pzL21vZHVsZXMvdG9kb0Zvcm0vQ29udHJvbGxlci5qcyIsInNyYy9qcy9tb2R1bGVzL3RvZG9Gb3JtL01vZGVsLmpzIiwic3JjL2pzL21vZHVsZXMvdG9kb0Zvcm0vVG9Eb0Zvcm0uanMiLCJzcmMvanMvbW9kdWxlcy90b2RvRm9ybS9WaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU0sT0FBTyxHQUFHLEVBQWhCO0FBQ0EsSUFBSSxRQUFKLEVBQWMsU0FBZDs7QUFFTyxTQUFTLEdBQVQsQ0FBYSxVQUFiLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUosRUFBeEI7QUFDQSxNQUFNLEtBQUssR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFKLEVBQTFCO0FBQ0EsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFKLEVBQW5CO0FBQ0EsRUFBQSxLQUFLLENBQUMsSUFBTjtBQUVBLFNBQVEsT0FBTyxDQUFDLFVBQUQsQ0FBUCxHQUFzQjtBQUMxQixJQUFBLEtBQUssRUFBRSxLQURtQjtBQUUxQixJQUFBLElBQUksRUFBRSxJQUZvQjtBQUcxQixJQUFBLFVBQVUsRUFBRTtBQUhjLEdBQTlCO0FBS0g7O0FBRU0sU0FBUyxHQUFULENBQWEsVUFBYixFQUF5QjtBQUM1QixTQUFPLE9BQU8sQ0FBQyxVQUFELENBQWQ7QUFDSDtBQUVEOzs7OztJQUdhLEs7OztBQUVULG1CQUFjO0FBQUE7O0FBQ1YsU0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBLFNBQUssU0FBTCxHQUFpQjtBQUNiLE1BQUEsTUFB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VUFBUixFQUFvQixjQUFwQixFQUEyQixhQUEzQixFQUFpQyxtQkFBakMsQ0FBUDtBQUNILEM7OztBQUVKOzs7Ozs7Ozs7O0FDaEJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7QUFPSSxzQkFBYztBQUFBOztBQUFBOztBQUNWLG1GQURVLENBR1Y7O0FBQ0EsVUFBSyxFQUFMLEdBQVUsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBVjtBQUpVO0FBS2I7OztFQVB3QixHQUFHLENBQUMsSTs7O0FBU2hDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKlxyXG4gIEFwcFxyXG4qL1xyXG5jb25zdCBtb2R1bGVzID0gW107XHJcbmxldCBjdXJyVmlldywgY3Vyck1vZGVsO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChtb2R1bGVOYW1lLCBNLCBWLCBDKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gY3VyclZpZXcgPSBuZXcgVigpO1xyXG4gICAgY29uc3QgbW9kZWwgPSBjdXJyTW9kZWwgPSBuZXcgTSgpO1xyXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBDKCk7XHJcbiAgICBtb2RlbC5pbml0KCk7XHJcblxyXG4gICAgcmV0dXJuIChtb2R1bGVzW21vZHVsZU5hbWVdID0ge1xyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICB2aWV3OiB2aWV3LFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG1vZHVsZU5hbWUpIHtcclxuICAgIHJldHVybiBtb2R1bGVzW21vZHVsZU5hbWVdO1xyXG59XHJcblxyXG4vKlxyXG4gIE1vZGVsXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBNb2RlbCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50cmVlID0ge307XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB7XHJcbiAgICAgICAgICAgIHNldFByZTogW10sXHJcbiAgICAgICAgICAgIHNldFBvc3Q6IFtdLFxyXG4gICAgICAgICAgICBjaGFuZ2U6IFtdXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIC8vIFJ1biBhbnkgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgZHVyaW5nIGluc3RhbnRpYXRpb25cclxuICAgICAgICBmb3IgKHZhciBwIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5oYXNPd25Qcm9wZXJ0eShwKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5DYWxsYmFja3MocCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UHJlKHByb3BzKSB7XHJcbiAgICAgICAgLy8gQWxsb3dzIHZhbGlkYXRpb24gZXRjLiBiZWZvcmUgc2V0dGluZyBwcm9wc1xyXG4gICAgICAgIC8vIGBwcm9wc2AgaXMgYSBjb3B5IHRoYXQgY2FuIGJlIHNhZmVseSBtdXRhdGVkXHJcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3NbXCJzZXRQcmVcIl07XHJcbiAgICAgICAgbGV0IGkgPSBjYWxsYmFja3MubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgcHJvcHMgPSBjYWxsYmFja3NbaV0uY2FsbCh0aGlzLCBwcm9wcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9wcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3N0KHByb3BzKSB7XHJcbiAgICAgICAgLy8gUnVucyBjYWxsYmFja3MgYWZ0ZXIgYHNldCgpYCB3aGV0aGVyIG1vZGVsIGNoYW5nZWQgb3Igbm90XHJcbiAgICAgICAgdGhpcy5ydW5DYWxsYmFja3MoXCJzZXRQb3N0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYW5nZSgpIHtcclxuICAgICAgICAvLyBSdW5zIGNhbGxiYWNrcyBhZnRlciBgc2V0KClgIGlmIG1vZGVsIGNoYW5nZWRcclxuICAgICAgICB0aGlzLnJ1bkNhbGxiYWNrcyhcImNoYW5nZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQocHJvcHNPclBhdGgsIHZhbHVlKSB7XHJcbiAgICAgICAgLy8gQWNjZXB0cyBwcm9wcyBvYmplY3QgYHsuLi59YCBPUiAncGF0aCcsICd2YWx1ZSdcclxuICAgICAgICBsZXQgY2hhbmdlRXZlbnQ7XHJcblxyXG4gICAgICAgIGlmIChpc09iamVjdChwcm9wc09yUGF0aCkpIHtcclxuICAgICAgICAgICAgLy8gUnVuIGFueSBcInNldFByZVwiIGNhbGxiYWNrcyBvbiBhIGNvcHkgb2YgYHByb3BzYFxyXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMuc2V0UHJlKG1lcmdlKHt9LCBwcm9wc09yUGF0aCkpO1xyXG4gICAgICAgICAgICBtZXJnZSh0aGlzLnRyZWUsIHByb3BzLCBpc0NoYW5nZWQgPT4gY2hhbmdlRXZlbnQgPSBpc0NoYW5nZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHByb3BzT3JQYXRoO1xyXG4gICAgICAgICAgICAvLyBSdW4gYW55IFwic2V0UHJlXCIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5zZXRQcmUoeyBbcGF0aF06IHZhbHVlIH0pW3BhdGhdO1xyXG4gICAgICAgICAgICBjaGFuZ2VFdmVudCA9IHNldE5vZGUodGhpcy50cmVlLCBwYXRoLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjaGFuZ2VFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldFBvc3QoKTtcclxuICAgICAgICByZXR1cm4gdGhpczsgLy8gRm9yIGNoYWluaW5nXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KHBhdGgpIHtcclxuICAgICAgICByZXR1cm4gZ2V0Tm9kZSh0aGlzLnRyZWUsIHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGxhYmVsLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzW2xhYmVsXTtcclxuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrcy51bnNoaWZ0KGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7IC8vIEZvciBjaGFpbmluZ1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bkNhbGxiYWNrcyhsYWJlbCkge1xyXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzW2xhYmVsXTtcclxuICAgICAgICBsZXQgaSA9IGNhbGxiYWNrcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICBjYWxsYmFja3NbaV0uY2FsbCh0aGlzLCB0aGlzLnRyZWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0b0pTT04oKSB7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRyZWUgZm9yIEpTT04uc3RyaW5naWZ5KClcclxuICAgICAgICByZXR1cm4gdGhpcy50cmVlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG4gIFZpZXdcclxuKi9cclxuZXhwb3J0IGNsYXNzIFZpZXcge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIERlcml2ZWQgY2xhc3MgbXVzdCBhc3NpZ24gYGVsYCBwcm9wZXJ0eVxyXG4gICAgfVxyXG5cclxuICAgIGdldChzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbChzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG4gIENvbnRyb2xsZXJcclxuKi9cclxuZXhwb3J0IGNsYXNzIENvbnRyb2xsZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBjdXJyTW9kZWw7XHJcbiAgICAgICAgaWYgKGN1cnJWaWV3LmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlldyA9IGN1cnJWaWV3O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgKG5ldyBFcnJvcignVmlldy5lbCByZXF1aXJlZCEnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJNb2RlbCA9IG51bGw7XHJcbiAgICAgICAgY3VyclZpZXcgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmQoYmluZGluZ3MpIHtcclxuICAgICAgICAvLyBSdW4gYmluZGluZyBmdW5jdGlvbnMgZm9yIHNlbGVjdG9ycyAod2l0aGluIHZpZXcuZWwpXHJcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBpbiBiaW5kaW5ncykge1xyXG4gICAgICAgICAgICBpZiAoYmluZGluZ3MuaGFzT3duUHJvcGVydHkoc2VsZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkb21FbHMgPSB0aGlzLnZpZXcuZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IGRvbUVscy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ3Nbc2VsZWN0b3JdLmNhbGwodGhpcywgZG9tRWxzW2ldLCB0aGlzLm1vZGVsLCB0aGlzLnZpZXcsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzOyAvLyBGb3IgY2hhaW5pbmdcclxuICAgIH1cclxufVxyXG5cclxuLypcclxuICBVdGlsc1xyXG4qL1xyXG5mdW5jdGlvbiBpc09iamVjdChvKSB7XHJcbiAgICByZXR1cm4gbyA9PT0gT2JqZWN0KG8pICYmXHJcbiAgICAgICAgIW8ubm9kZVR5cGUgJiZcclxuICAgICAgICAhQXJyYXkuaXNBcnJheShvKSAmJlxyXG4gICAgICAgICEodHlwZW9mIG8gPT09ICdmdW5jdGlvbicpICYmXHJcbiAgICAgICAgIShvIGluc3RhbmNlb2YgUmVnRXhwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNOdW1lcmljKHZhbCkge1xyXG4gICAgcmV0dXJuIE51bWJlcihwYXJzZUZsb2F0KHZhbCkpID09IHZhbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldE5vZGUodHJlZSwgcGF0aFN0ciwgdmFsdWUpIHtcclxuICAgIC8vIFNldCBub2RlIGF0IHBhdGggc3RyaW5nIHRvIHZhbHVlXHJcbiAgICAvLyBBbnkgbWlzc2luZyBub2RlcyBhcmUgY3JlYXRlZFxyXG4gICAgLy8gTk9URTogYWxsIG51bWVyaWMgbm9kZXMgYmVsb3cgcm9vdCBhcmUgYXNzdW1lZCB0byBiZSBhcnJheSBpbmRleGVzXHJcbiAgICAvLyBSZXR1cm5zIGJvb2xlYW4gYHRydWVgIGlmIHZhbHVlIHdhcyBjaGFuZ2VkXHJcbiAgICBsZXQgaXNDaGFuZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgZ2V0Tm9kZSh0cmVlLCBwYXRoU3RyLCAoY3Vyck5vZGUsIHByb3AsIG5leHRQcm9wKSA9PiB7XHJcbiAgICAgICAgLy8gTGFzdCBzZWdtZW50IG9mIHBhdGggc3RyaW5nLCBzZXQgdmFsdWUgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgaWYgKG5leHRQcm9wID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VyclZhbCA9IGN1cnJOb2RlW3Byb3BdO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IGN1cnJWYWwpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJOb2RlW3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpc0NoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEVsc2UgY3JlYXRlIGFueSBtaXNzaW5nIG5vZGVzIGluIHBhdGhcclxuICAgICAgICBlbHNlIGlmIChjdXJyTm9kZVtwcm9wXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBpZiBuZXh0UHJvcCBpcyBudW1lcmljLCBvdGhlcndpc2UgYW4gb2JqZWN0XHJcbiAgICAgICAgICAgIGN1cnJOb2RlW3Byb3BdID0gaXNOdW1lcmljKG5leHRQcm9wKSA/IFtdIDoge307XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gaXNDaGFuZ2VkO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZSh0cmVlLCBwYXRoU3RyLCBlYWNoQ2FsbGJhY2spIHtcclxuICAgIC8vIEdldCBub2RlIGZyb20gcGF0aCBzdHJpbmdcclxuICAgIC8vIE9wdGlvbmFsIGBlYWNoQ2FsbGJhY2tgIGlzIHBhc3NlZCAoY3Vyck5vZGUsIHByb3AsIG5leHRQcm9wKVxyXG4gICAgLy8gVGhpcyBhbGxvd3MgdGhlIG5leHQgbm9kZSB0byBiZSBjcmVhdGVkIG9yIGNoYW5nZWQgYmVmb3JlIGVhY2ggdHJhdmVyc2FsXHJcbiAgICBjb25zdCBwYXRoQXJyID0gcGF0aFN0ci5zcGxpdChcIi5cIik7XHJcbiAgICBsZXQgY3Vyck5vZGUgPSB0cmVlO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYXRoQXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHBhdGhBcnJbaV07XHJcbiAgICAgICAgaWYgKGVhY2hDYWxsYmFjaykge1xyXG4gICAgICAgICAgICBlYWNoQ2FsbGJhY2soY3Vyck5vZGUsIHByb3AsIHBhdGhBcnJbaSArIDFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJOb2RlID09PSB1bmRlZmluZWQpIGJyZWFrO1xyXG4gICAgICAgIGVsc2UgY3Vyck5vZGUgPSBjdXJyTm9kZVtwcm9wXTtcclxuICAgIH1cclxuICAgIHJldHVybiBjdXJyTm9kZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKCAvKiBbbWVyZ2VDaGlsZE9icyxdIHt9LCB7fSBbLCAuLi5dIFssIGNhbGxiYWNrXSAqLykge1xyXG4gICAgLy8gQWRkIG9yIG92ZXJ3cml0ZSBhbGwgcHJvcGVydGllcyByaWdodCB0byBsZWZ0XHJcbiAgICAvLyBCeSBkZWZhdWx0IGNoaWxkIG9iamVjdHMgYXJlIG1lcmdlZCByZWN1cnNpdmVseSAoYnV0IG5vdCBhcnJheXMpXHJcbiAgICAvLyBJZiBhIGJvb2xlYW4gaXMgc3VwcGxpZWQsIGl0IGJlY29tZXMgYG1lcmdlQ2hpbGRPYnNgIHZhbHVlIHVudGlsIGFub3RoZXIgYm9vbGVhbiBpcyBmb3VuZFxyXG4gICAgLy8gSWYgYSBjYWxsYmFjayBpcyBzdXBwbGllZCwgaXQgd2lsbCByZWNlaXZlIGEgYm9vbGVhbiBhcmd1bWVudCBgaXNDaGFuZ2VkYFxyXG4gICAgbGV0IGxldmVsID0gMCxcclxuICAgICAgICBjaGFuZ2VDb3VudCA9IDAsXHJcbiAgICAgICAgbWVyZ2VDaGlsZE9icyA9IHRydWUsXHJcbiAgICAgICAgY2FsbGJhY2ssXHJcbiAgICAgICAgcmVzdWx0ID0gcnVuLmFwcGx5KHRoaXMsIFswLCBhcmd1bWVudHNdKTtcclxuXHJcbiAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCEhY2hhbmdlQ291bnQpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4obGV2ZWwsIHBhcmFtcykge1xyXG4gICAgICAgIGxldCBwYXJhbSxcclxuICAgICAgICAgICAgcmV0T2IsXHJcbiAgICAgICAgICAgIHBhcmFtc0NvdW50ID0gcGFyYW1zLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gQ2hpbGQgb2JqZWN0c1xyXG4gICAgICAgIC8vIE1lcmdlIGludG8gbGVmdG1vc3QgcGFyYW0gaWYgYW4gb2JqZWN0LCBvciBjcmVhdGUgb2JqZWN0IHRvIG1lcmdlIGludG9cclxuICAgICAgICBpZiAobGV2ZWwpIHtcclxuICAgICAgICAgICAgcmV0T2IgPSBpc09iamVjdChwYXJhbXNbMF0pID8gcGFyYW1zWzBdIDoge31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyYW1zQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBwYXJhbSA9IHBhcmFtc1tpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRvcCBsZXZlbCBwYXJhbXMgbWF5IGNvbnRhaW4gb3RoZXIgYXJndW1lbnRzXHJcbiAgICAgICAgICAgIGlmICghbGV2ZWwgJiYgcGFyYW0gIT0gbnVsbCkgeyAvLyBgdW5kZWZpbmVkYCBvciBgbnVsbGBcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IG9iamVjdCBiZWNvbWVzIHJldHVybmVkIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgLy8gQWxzbyBhbGxvdyBhIERPTSBub2RlIGZvciBtZXJnaW5nIGludG9cclxuICAgICAgICAgICAgICAgIGlmICghcmV0T2IgJiYgaXNPYmplY3QocGFyYW0pIHx8IHBhcmFtLm5vZGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0T2IgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGBtZXJnZUNoaWxkT2JzYCBib29sZWFuIGFyZ3VtZW50c1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXJnZUNoaWxkT2JzID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBMYXN0IHBhc3NlZCBpbiBmdW5jdGlvbiBiZWNvbWVzIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXRPYikgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChjb25zdCBwIGluIHBhcmFtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyYW0uaGFzT3duUHJvcGVydHkocCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSBwYXJhbVtwXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWVyZ2UgY2hpbGQgb2JqZWN0cyAocmVjdXJzaXZlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXJnZUNoaWxkT2JzICYmIGlzT2JqZWN0KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0T2JbcF0gPSBydW4obGV2ZWwgKyAxLCBbcmV0T2JbcF0sIHZhbF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWwgIT09IHJldE9iW3BdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldE9iW3BdID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0T2IgfHwge307XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEJvb3QgZnJvbSBcIi4vbW9kdWxlcy9Cb290L0Jvb3RcIjtcclxuaW1wb3J0IFRvRG9Gb3JtIGZyb20gXCIuL21vZHVsZXMvdG9kb0Zvcm0vVG9Eb0Zvcm1cIjtcclxuXHJcbm5ldyBCb290KClcclxuICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBuZXcgVG9Eb0Zvcm0oKTtcclxuICAgIH0pO1xyXG4iLCIvKlxyXG4gIEJvb3Qgb3BlcmF0aW9uc1xyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWFkeSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGEgZHVtbXkgY29uZGl0aW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoL1xcdy8udGVzdChsb2NhdGlvbi5ocmVmKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgcmVqZWN0KCdFcnJvcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn07XHJcbiIsImltcG9ydCAqIGFzIGFwcCBmcm9tIFwiLi4vLi4vbGliL2FwcFwiO1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbi8qXHJcbiAgRXh0ZW5kcyBgYXBwLkNvbnRyb2xsZXJgXHJcbiAgICAgIFByb3BlcnRpZXM6IGBtb2RlbGAsIGB2aWV3YFxyXG4gICAgICBNZXRob2RzOiBgYmluZCgpYCBmb3IgRE9NIHNlbGVjdG9yc1xyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBleHRlbmRzIGFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdmlldyB3aGVuIG1vZGVsIGNoYW5nZXNcclxuICAgICAgICB0aGlzLm1vZGVsLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0b2RvID0gdGhpcy5tb2RlbC5nZXQoJ3RvZG8nKTtcclxuICAgICAgICAgICAgaWYgKHRvZG8pIHtcclxuICAgICAgICAgICAgICAgIHRvZG8gPSBgPGRpdj4ke3RvZG99PC9kaXY+YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZpZXcuZ2V0KCcuZGVidWdBcmVhJykuaW5uZXJIVE1MID0gdG9kbztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRXhhbXBsZSAyIHdheSBiaW5kaW5nc1xyXG4gICAgICAgIHRoaXMuYmluZCh7XHJcbiAgICAgICAgICAgICcjdG9kbyc6IChlbCwgbW9kZWwsIHZpZXcsIGNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsLm9ua2V5dXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KCd0b2RvJywgZWwudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kZWwub24oJ3NldFBvc3QnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwudmFsdWUgPSBtb2RlbC5nZXQoJ3RvZG8nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufTtcclxuIiwiaW1wb3J0ICogYXMgYXBwIGZyb20gXCIuLi8uLi9saWIvYXBwXCI7XHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5cclxuLypcclxuICBFeHRlbmRzIGFwcC5Nb2RlbFxyXG4gICAgICBNZXRob2RzOiBgc2V0KClgLCBgZ2V0KClgLCBgb24oJ3NldFByZSd8J3NldFBvc3QnfCdjaGFuZ2UnKWBcclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgZXh0ZW5kcyBhcHAuTW9kZWwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIC8vIEFyYml0cmFyeSBtZXRob2RcclxuICAgICAgICB0aGlzLnNhbml0aXplID0gcHJvcHMgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHAgaW4gcHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwKSAmJiB0eXBlb2YgcHJvcHNbcF0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wc1twXSA9IHByb3BzW3BdLnJlcGxhY2UoL1teXFx3XFxzJyEuLDtdL2csICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcHJvcHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZXQgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLm9uKCdzZXRQcmUnLCBwcm9wcyA9PiB0aGlzLnNhbml0aXplKHByb3BzKSk7XHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIG1vZGVsXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICB0b2RvOiAnJyxcclxuICAgICAgICAgICAgZGF0ZTogRGF0ZS5ub3coKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTZXQgYnkgcGF0aFxyXG4gICAgICAgIHRoaXMuc2V0KCd1c2VyLm5hbWUnLCAnR3Vlc3QnKTtcclxuICAgIH1cclxuXHJcbn07XHJcbiIsImltcG9ydCAqIGFzIGFwcCBmcm9tIFwiLi4vLi4vbGliL2FwcFwiO1xyXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vTW9kZWxcIlxyXG5pbXBvcnQgVmlldyBmcm9tIFwiLi9WaWV3XCJcclxuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSBcIi4vQ29udHJvbGxlclwiXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5cclxuLypcclxuICBFeGFtcGxlIG1vZHVsZVxyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIGFwcC5hZGQoXCJUb0RvRm9ybVwiLCBNb2RlbCwgVmlldywgQ29udHJvbGxlcik7XHJcbiAgICB9XHJcblxyXG59O1xyXG4iLCJpbXBvcnQgKiBhcyBhcHAgZnJvbSBcIi4uLy4uL2xpYi9hcHBcIjtcclxuXHJcblwidXNlIHN0cmljdFwiXHJcblxyXG4vKlxyXG4gIEV4dGVuZHMgYXBwLlZpZXdcclxuICAgICAgUHJvcGVydGllczogYGVsYFxyXG4gICAgICBNZXRob2RzOiBgZ2V0KClgLCBgZ2V0QWxsKClgIGZvciBET00gc2VsZWN0b3JzXHJcbiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgYXBwLlZpZXcge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIC8vIFNldCBET00gcmVmXHJcbiAgICAgICAgdGhpcy5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9kb2Zvcm1cIik7XHJcbiAgICB9XHJcblxyXG59O1xyXG4iXX0=
