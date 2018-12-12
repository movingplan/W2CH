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

var app = _interopRequireWildcard(require("../../js/lib/app"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

describe("Object util tests", function () {
  describe("setNode", function () {
    var setNode = app.setNode;
    it("Should add a new property", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "h", 77);
      expect(tree).toEqual({
        a: 1,
        b: 2,
        h: 77
      });
    });
    it("Should add a property at a new path", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "h.j", 77);
      expect(tree).toEqual({
        a: 1,
        b: 2,
        h: {
          j: 77
        }
      });
    });
    it("Should add a property at a new deep path", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "h.j.k.l", 77);
      expect(tree).toEqual({
        a: 1,
        b: 2,
        h: {
          j: {
            k: {
              l: 77
            }
          }
        }
      });
    });
    it("Should add a property at a partial deep path", function () {
      var tree = {
        a: {
          b: {
            c: {
              d: 77
            }
          }
        }
      };
      setNode(tree, "a.b", 77);
      expect(tree).toEqual({
        a: {
          b: 77
        }
      });
    });
    it("Should add a new numerical property at root", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "2", 77);
      expect(tree).toEqual({
        a: 1,
        b: 2,
        "2": 77
      });
    });
    it("Should add an array at a numerical path", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "c.2", 77); //Stringify to allow child object comparison

      expect(JSON.stringify(tree)).toEqual(JSON.stringify({
        a: 1,
        b: 2,
        c: [undefined, undefined, 77]
      }));
    });
    it("Should add an array at a deep numerical path", function () {
      var tree = {
        a: 1,
        b: 2
      };
      setNode(tree, "c.2.a.1.2", 77); //Stringify to allow child object comparison

      expect(JSON.stringify(tree)).toEqual(JSON.stringify({
        a: 1,
        b: 2,
        c: [undefined, undefined, {
          a: [undefined, [undefined, undefined, 77]]
        }]
      }));
    });
  });
  describe("getNode", function () {
    var getNode = app.getNode;
    it("Should get a property value", function () {
      var tree = {
        a: 1,
        b: 2
      };
      expect(getNode(tree, "a")).toBe(1);
    });
    it("Should get a deep property value", function () {
      var tree = {
        a: {
          b: {
            c: 77
          }
        },
        b: 2
      };
      expect(getNode(tree, "a.b.c")).toBe(77);
    });
    it("Should get a property containing a numerical index", function () {
      var tree = {
        a: {
          b: [{
            c: 77
          }]
        },
        b: 2
      };
      expect(getNode(tree, "a.b.0.c")).toBe(77);
    });
    it("Should return undefined for an invalid path", function () {
      var tree = {
        a: {
          b: [{
            c: 77
          }]
        },
        b: 2
      };
      expect(getNode(tree, "a.b.7.c.5.6")).toBe(undefined);
    });
    it("Should allow falsy values in path", function () {
      var tree = {
        0: {
          0: [{
            0: 0
          }]
        }
      };
      expect(getNode(tree, "0.0.0.0")).toBe(0);
    });
  });
  describe("merge", function () {
    var merge = app.merge;
    it("Should add object properties", function () {
      var tree = {
        a: 1,
        b: [2, 3]
      },
          tree2 = {
        c: 3,
        d: 4
      },
          tree3 = {
        e: 5,
        f: 6
      };
      expect(merge(tree, tree2, tree3)).toEqual({
        a: 1,
        b: [2, 3],
        c: 3,
        d: 4,
        e: 5,
        f: 6
      }); //Edge cases

      expect(merge()).toEqual({});
      expect(merge(tree)).toBe(tree);
      expect(merge("23")).toEqual({});
      expect(merge("23", "34")).toEqual({});
      expect(merge({
        2: "5"
      }, "34")).toEqual({
        0: "3",
        1: "4",
        2: "5"
      });
    });
    it("Should overwrite properties right to left", function () {
      var tree = {
        a: 1,
        b: [2, 3]
      },
          tree2 = {
        c: 3,
        b: [4]
      },
          tree3 = {
        a: 5,
        d: 6
      };
      expect(merge(tree, tree2, tree3)).toEqual({
        a: 5,
        b: [4],
        c: 3,
        d: 6
      });
    });
    it("Should merge child objects right to left", function () {
      var tree = {
        a: {
          a: 1,
          b: [2, 3]
        }
      },
          tree2 = {
        a: {
          c: 3,
          b: [4]
        }
      },
          tree3 = {
        a: {
          a: 5,
          d: 6
        }
      };
      expect(merge(tree, tree2, tree3)).toEqual({
        a: {
          a: 5,
          b: [4],
          c: 3,
          d: 6
        }
      });
    });
    it("Should merge deep child objects right to left", function () {
      var tree = {
        a: {
          a: [7, 8],
          b: {
            c: {
              d: {
                e: 77
              }
            }
          }
        }
      },
          tree2 = {
        a: {
          a: 1,
          b: {
            c: {
              d: {
                e: 88
              }
            }
          }
        }
      },
          tree3 = {
        a: {
          a: [6]
        }
      };
      expect(merge(tree, tree2, tree3)).toEqual({
        a: {
          a: [6],
          b: {
            c: {
              d: {
                e: 88
              }
            }
          }
        }
      });
    });
    it("Should not merge child objects when boolean false is passed in", function () {
      var refOb = {
        aa: 1,
        bb: 2
      },
          tree = {
        a: 1,
        b: 2,
        c: {}
      },
          tree2 = {
        c: refOb
      }; // Boolean is `mergeChildObs`

      var result = merge(false, tree, tree2);
      expect(result.c).toBe(refOb);
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: {
          aa: 1,
          bb: 2
        }
      });
    });
    it("Should switch on and off merging child objects when booleans are passed in", function (done) {
      var refOb = {
        aa: 1,
        bb: 2
      },
          tree = {
        a: 1,
        b: 2,
        c: {}
      },
          tree2 = {
        c: refOb
      },
          tree3 = {
        d: refOb
      },
          tree4 = {
        e: refOb
      }; // Boolean switches `mergeChildObs` (also test multiple unused arguments, and callback argument)

      var result = merge(true, true, false, false, tree, tree2, true, false, done, true, tree3, false, tree4, true);
      expect(result.c).toBe(refOb);
      expect(result.d).not.toBe(refOb);
      expect(result.e).toBe(refOb);
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: {
          aa: 1,
          bb: 2
        },
        d: {
          aa: 1,
          bb: 2
        },
        e: {
          aa: 1,
          bb: 2
        }
      });
    });
    it("Should ignore arguments of wrong type", function () {
      var tree = {
        a: {
          a: 1,
          b: [2, 3]
        }
      },
          tree2 = {
        a: {
          b: 6
        }
      };
      expect(merge("", "", "", "", tree, tree2)).toEqual({
        a: {
          a: 1,
          b: 6
        }
      });
      tree = {
        a: 1,
        b: [2, 3]
      };
      expect(merge("", 99, tree, "", 88)).toEqual(tree);
      expect(merge(tree, 99, "", "", "")).toEqual(tree);
      expect(merge(99, tree, "", 88, 77)).toEqual(tree);
    });
    it("Should report changes", function () {
      var tree = {
        a: {
          a: 1,
          b: [2, 3]
        }
      },
          tree2 = {
        a: {
          c: 3,
          b: [4]
        }
      },
          tree3 = {
        a: {
          a: [6]
        }
      };
      merge(tree, tree2, function (isChanged) {
        expect(isChanged).toBe(true);
      });
      merge(tree, tree, function (isChanged) {
        expect(isChanged).toBe(false);
      });
      merge(tree, function () {}, function (isChanged) {
        expect(isChanged).toBe(false);
      });
      merge("", tree, tree3, function (isChanged) {
        expect(isChanged).toBe(true);
      });
      merge({
        z: 88
      }, tree, function (isChanged) {
        expect(isChanged).toBe(true);
      });
      merge({
        z: {
          y: {
            x: 55
          }
        }
      }, {
        z: {
          y: {
            x: 56
          }
        }
      }, function (isChanged) {
        expect(isChanged).toBe(true);
      });
    });
  });
});

},{"../../js/lib/app":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGliL2FwcC5qcyIsInNyYy90ZXN0L2xpYi9VdGlsc1NwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFJLFFBQUosRUFBYyxTQUFkOztBQUVPLFNBQVMsR0FBVCxDQUFhLFVBQWIsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0IsQ0FBL0IsRUFBa0M7QUFDckMsTUFBTSxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBSixFQUF4QjtBQUNBLE1BQU0sS0FBSyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUosRUFBMUI7QUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUosRUFBbkI7QUFDQSxFQUFBLEtBQUssQ0FBQyxJQUFOO0FBRUEsU0FBUSxPQUFPLENBQUMsVUFBRCxDQUFQLEdBQXNCO0FBQzFCLElBQUEsS0FBSyxFQUFFLEtBRG1CO0FBRTFCLElBQUEsSUFBSSxFQUFFLElBRm9CO0FBRzFCLElBQUEsVUFBVSxFQUFFO0FBSGMsR0FBOUI7QUFLSDs7QUFFTSxTQUFTLEdBQVQsQ0FBYSxVQUFiLEVBQXlCO0FBQzVCLFNBQU8sT0FBTyxDQUFDLFVBQUQsQ0FBZDtBQUNIO0FBRUQ7Ozs7O0lBR2EsSzs7O0FBRVQsbUJBQWM7QUFBQTs7QUFDVixTQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsU0FBSyxTQUFMLEdBQWlCO0FBQ2IsTUFBQSxNQUFNLEVBQUUsRUFESztBQUViLE1BQUEsT0FBTyxFQUFFLEVBRkk7QUFHYixNQUFBLE1BQU0sRUFBRTtBQUhLLEtBQWpCO0FBS0g7Ozs7MkJBRU07QUFDSDtBQUNBLFdBQUssSUFBSSxDQUFULElBQWMsS0FBSyxTQUFuQixFQUE4QjtBQUMxQixZQUFJLEtBQUssU0FBTCxDQUFlLGNBQWYsQ0FBOEIs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LEVBQXFCLFVBQVMsU0FBVCxFQUFtQjtBQUN6QyxRQUFBLE1BQU0sQ0FBQyxTQUFELENBQU4sQ0FBa0IsSUFBbEIsQ0FBdUIsS0FBdkI7QUFDSCxPQUZJLENBQUw7QUFJQSxNQUFBLEtBQUssQ0FBQyxFQUFELEVBQUssSUFBTCxFQUFXLEtBQVgsRUFBa0IsVUFBUyxTQUFULEVBQW1CO0FBQ3RDLFFBQUEsTUFBTSxDQUFDLFNBQUQsQ0FBTixDQUFrQixJQUFsQixDQUF1QixJQUF2QjtBQUNILE9BRkksQ0FBTDtBQUlBLE1BQUEsS0FBSyxDQUFDO0FBQUMsUUFBQSxDQUFDLEVBQUU7QUFBSixPQUFELEVBQVUsSUFBVixFQUFnQixVQUFTLFNBQVQsRUFBbUI7QUFDcEMsUUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOLENBQWtCLElBQWxCLENBQXVCLElBQXZCO0FBQ0gsT0FGSSxDQUFMO0FBSUEsTUFBQSxLQUFLLENBQUM7QUFBQyxRQUFBLENBQUMsRUFBRTtBQUFDLFVBQUEsQ0FBQyxFQUFFO0FBQUMsWUFBQSxDQUFDLEVBQUU7QUFBSjtBQUFKO0FBQUosT0FBRCxFQUFvQjtBQUFDLFFBQUEsQ0FBQyxFQUFFO0FBQUMsVUFBQSxDQUFDLEVBQUU7QUFBQyxZQUFBLENBQUMsRUFBRTtBQUFKO0FBQUo7QUFBSixPQUFwQixFQUF1QyxVQUFTLFNBQVQsRUFBbUI7QUFDM0QsUUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOLENBQWtCLElBQWxCLENBQXVCLElBQXZCO0FBQ0gsT0FGSSxDQUFMO0FBR0gsS0E1QkMsQ0FBRjtBQThCSCxHQXhHTyxDQUFSO0FBMEdILENBeE1PLENBQVIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qXHJcbiAgQXBwXHJcbiovXHJcbmNvbnN0IG1vZHVsZXMgPSBbXTtcclxubGV0IGN1cnJWaWV3LCBjdXJyTW9kZWw7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG1vZHVsZU5hbWUsIE0sIFYsIEMpIHtcclxuICAgIGNvbnN0IHZpZXcgPSBjdXJyVmlldyA9IG5ldyBWKCk7XHJcbiAgICBjb25zdCBtb2RlbCA9IGN1cnJNb2RlbCA9IG5ldyBNKCk7XHJcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEMoKTtcclxuICAgIG1vZGVsLmluaXQoKTtcclxuXHJcbiAgICByZXR1cm4gKG1vZHVsZXNbbW9kdWxlTmFtZV0gPSB7XHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIHZpZXc6IHZpZXcsXHJcbiAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlclxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXQobW9kdWxlTmFtZSkge1xyXG4gICAgcmV0dXJuIG1vZHVsZXNbbW9kdWxlTmFtZV07XHJcbn1cclxuXHJcbi8qXHJcbiAgTW9kZWxcclxuKi9cclxuZXhwb3J0IGNsYXNzIE1vZGVsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRyZWUgPSB7fTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHtcclxuICAgICAgICAgICAgc2V0UHJlOiBbXSxcclxuICAgICAgICAgICAgc2V0UG9zdDogW10sXHJcbiAgICAgICAgICAgIGNoYW5nZTogW11cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgLy8gUnVuIGFueSBjYWxsYmFja3MgcmVnaXN0ZXJlZCBkdXJpbmcgaW5zdGFudGlhdGlvblxyXG4gICAgICAgIGZvciAodmFyIHAgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLmhhc093blByb3BlcnR5KHApKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkNhbGxiYWNrcyhwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRQcmUocHJvcHMpIHtcclxuICAgICAgICAvLyBBbGxvd3MgdmFsaWRhdGlvbiBldGMuIGJlZm9yZSBzZXR0aW5nIHByb3BzXHJcbiAgICAgICAgLy8gYHByb3BzYCBpcyBhIGNvcHkgdGhhdCBjYW4gYmUgc2FmZWx5IG11dGF0ZWRcclxuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrc1tcInNldFByZVwiXTtcclxuICAgICAgICBsZXQgaSA9IGNhbGxiYWNrcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICBwcm9wcyA9IGNhbGxiYWNrc1tpXS5jYWxsKHRoaXMsIHByb3BzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByb3BzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc3QocHJvcHMpIHtcclxuICAgICAgICAvLyBSdW5zIGNhbGxiYWNrcyBhZnRlciBgc2V0KClgIHdoZXRoZXIgbW9kZWwgY2hhbmdlZCBvciBub3RcclxuICAgICAgICB0aGlzLnJ1bkNhbGxiYWNrcyhcInNldFBvc3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhbmdlKCkge1xyXG4gICAgICAgIC8vIFJ1bnMgY2FsbGJhY2tzIGFmdGVyIGBzZXQoKWAgaWYgbW9kZWwgY2hhbmdlZFxyXG4gICAgICAgIHRoaXMucnVuQ2FsbGJhY2tzKFwiY2hhbmdlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldChwcm9wc09yUGF0aCwgdmFsdWUpIHtcclxuICAgICAgICAvLyBBY2NlcHRzIHByb3BzIG9iamVjdCBgey4uLn1gIE9SICdwYXRoJywgJ3ZhbHVlJ1xyXG4gICAgICAgIGxldCBjaGFuZ2VFdmVudDtcclxuXHJcbiAgICAgICAgaWYgKGlzT2JqZWN0KHByb3BzT3JQYXRoKSkge1xyXG4gICAgICAgICAgICAvLyBSdW4gYW55IFwic2V0UHJlXCIgY2FsbGJhY2tzIG9uIGEgY29weSBvZiBgcHJvcHNgXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5zZXRQcmUobWVyZ2Uoe30sIHByb3BzT3JQYXRoKSk7XHJcbiAgICAgICAgICAgIG1lcmdlKHRoaXMudHJlZSwgcHJvcHMsIGlzQ2hhbmdlZCA9PiBjaGFuZ2VFdmVudCA9IGlzQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoID0gcHJvcHNPclBhdGg7XHJcbiAgICAgICAgICAgIC8vIFJ1biBhbnkgXCJzZXRQcmVcIiBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnNldFByZSh7IFtwYXRoXTogdmFsdWUgfSlbcGF0aF07XHJcbiAgICAgICAgICAgIGNoYW5nZUV2ZW50ID0gc2V0Tm9kZSh0aGlzLnRyZWUsIHBhdGgsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0UG9zdCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzOyAvLyBGb3IgY2hhaW5pbmdcclxuICAgIH1cclxuXHJcbiAgICBnZXQocGF0aCkge1xyXG4gICAgICAgIHJldHVybiBnZXROb2RlKHRoaXMudHJlZSwgcGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgb24obGFiZWwsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3NbbGFiZWxdO1xyXG4gICAgICAgIGlmIChjYWxsYmFja3MpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2tzLnVuc2hpZnQoY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpczsgLy8gRm9yIGNoYWluaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ2FsbGJhY2tzKGxhYmVsKSB7XHJcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3NbbGFiZWxdO1xyXG4gICAgICAgIGxldCBpID0gY2FsbGJhY2tzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrc1tpXS5jYWxsKHRoaXMsIHRoaXMudHJlZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRvSlNPTigpIHtcclxuICAgICAgICAvLyBSZXR1cm4gdHJlZSBmb3IgSlNPTi5zdHJpbmdpZnkoKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnRyZWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qXHJcbiAgVmlld1xyXG4qL1xyXG5leHBvcnQgY2xhc3MgVmlldyB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gRGVyaXZlZCBjbGFzcyBtdXN0IGFzc2lnbiBgZWxgIHByb3BlcnR5XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWxsKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qXHJcbiAgQ29udHJvbGxlclxyXG4qL1xyXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IGN1cnJNb2RlbDtcclxuICAgICAgICBpZiAoY3VyclZpZXcuZWwpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3ID0gY3VyclZpZXc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAobmV3IEVycm9yKCdWaWV3LmVsIHJlcXVpcmVkIScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3Vyck1vZGVsID0gbnVsbDtcclxuICAgICAgICBjdXJyVmlldyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZChiaW5kaW5ncykge1xyXG4gICAgICAgIC8vIFJ1biBiaW5kaW5nIGZ1bmN0aW9ucyBmb3Igc2VsZWN0b3JzICh3aXRoaW4gdmlldy5lbClcclxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIGluIGJpbmRpbmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChiaW5kaW5ncy5oYXNPd25Qcm9wZXJ0eShzZWxlY3RvcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRvbUVscyA9IHRoaXMudmlldy5lbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gZG9tRWxzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nc1tzZWxlY3Rvcl0uY2FsbCh0aGlzLCBkb21FbHNbaV0sIHRoaXMubW9kZWwsIHRoaXMudmlldywgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7IC8vIEZvciBjaGFpbmluZ1xyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG4gIFV0aWxzXHJcbiovXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcclxuICAgIHJldHVybiBvID09PSBPYmplY3QobykgJiZcclxuICAgICAgICAhby5ub2RlVHlwZSAmJlxyXG4gICAgICAgICFBcnJheS5pc0FycmF5KG8pICYmXHJcbiAgICAgICAgISh0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJykgJiZcclxuICAgICAgICAhKG8gaW5zdGFuY2VvZiBSZWdFeHApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc051bWVyaWModmFsKSB7XHJcbiAgICByZXR1cm4gTnVtYmVyKHBhcnNlRmxvYXQodmFsKSkgPT0gdmFsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Tm9kZSh0cmVlLCBwYXRoU3RyLCB2YWx1ZSkge1xyXG4gICAgLy8gU2V0IG5vZGUgYXQgcGF0aCBzdHJpbmcgdG8gdmFsdWVcclxuICAgIC8vIEFueSBtaXNzaW5nIG5vZGVzIGFyZSBjcmVhdGVkXHJcbiAgICAvLyBOT1RFOiBhbGwgbnVtZXJpYyBub2RlcyBiZWxvdyByb290IGFyZSBhc3N1bWVkIHRvIGJlIGFycmF5IGluZGV4ZXNcclxuICAgIC8vIFJldHVybnMgYm9vbGVhbiBgdHJ1ZWAgaWYgdmFsdWUgd2FzIGNoYW5nZWRcclxuICAgIGxldCBpc0NoYW5nZWQgPSBmYWxzZTtcclxuXHJcbiAgICBnZXROb2RlKHRyZWUsIHBhdGhTdHIsIChjdXJyTm9kZSwgcHJvcCwgbmV4dFByb3ApID0+IHtcclxuICAgICAgICAvLyBMYXN0IHNlZ21lbnQgb2YgcGF0aCBzdHJpbmcsIHNldCB2YWx1ZSBpZiBkaWZmZXJlbnRcclxuICAgICAgICBpZiAobmV4dFByb3AgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyVmFsID0gY3Vyck5vZGVbcHJvcF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gY3VyclZhbCkge1xyXG4gICAgICAgICAgICAgICAgY3Vyck5vZGVbcHJvcF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRWxzZSBjcmVhdGUgYW55IG1pc3Npbmcgbm9kZXMgaW4gcGF0aFxyXG4gICAgICAgIGVsc2UgaWYgKGN1cnJOb2RlW3Byb3BdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IGlmIG5leHRQcm9wIGlzIG51bWVyaWMsIG90aGVyd2lzZSBhbiBvYmplY3RcclxuICAgICAgICAgICAgY3Vyck5vZGVbcHJvcF0gPSBpc051bWVyaWMobmV4dFByb3ApID8gW10gOiB7fTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBpc0NoYW5nZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXROb2RlKHRyZWUsIHBhdGhTdHIsIGVhY2hDYWxsYmFjaykge1xyXG4gICAgLy8gR2V0IG5vZGUgZnJvbSBwYXRoIHN0cmluZ1xyXG4gICAgLy8gT3B0aW9uYWwgYGVhY2hDYWxsYmFja2AgaXMgcGFzc2VkIChjdXJyTm9kZSwgcHJvcCwgbmV4dFByb3ApXHJcbiAgICAvLyBUaGlzIGFsbG93cyB0aGUgbmV4dCBub2RlIHRvIGJlIGNyZWF0ZWQgb3IgY2hhbmdlZCBiZWZvcmUgZWFjaCB0cmF2ZXJzYWxcclxuICAgIGNvbnN0IHBhdGhBcnIgPSBwYXRoU3RyLnNwbGl0KFwiLlwiKTtcclxuICAgIGxldCBjdXJyTm9kZSA9IHRyZWU7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhdGhBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcGF0aEFycltpXTtcclxuICAgICAgICBpZiAoZWFjaENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGVhY2hDYWxsYmFjayhjdXJyTm9kZSwgcHJvcCwgcGF0aEFycltpICsgMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3Vyck5vZGUgPT09IHVuZGVmaW5lZCkgYnJlYWs7XHJcbiAgICAgICAgZWxzZSBjdXJyTm9kZSA9IGN1cnJOb2RlW3Byb3BdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGN1cnJOb2RlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2UoIC8qIFttZXJnZUNoaWxkT2JzLF0ge30sIHt9IFssIC4uLl0gWywgY2FsbGJhY2tdICovKSB7XHJcbiAgICAvLyBBZGQgb3Igb3ZlcndyaXRlIGFsbCBwcm9wZXJ0aWVzIHJpZ2h0IHRvIGxlZnRcclxuICAgIC8vIEJ5IGRlZmF1bHQgY2hpbGQgb2JqZWN0cyBhcmUgbWVyZ2VkIHJlY3Vyc2l2ZWx5IChidXQgbm90IGFycmF5cylcclxuICAgIC8vIElmIGEgYm9vbGVhbiBpcyBzdXBwbGllZCwgaXQgYmVjb21lcyBgbWVyZ2VDaGlsZE9ic2AgdmFsdWUgdW50aWwgYW5vdGhlciBib29sZWFuIGlzIGZvdW5kXHJcbiAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHN1cHBsaWVkLCBpdCB3aWxsIHJlY2VpdmUgYSBib29sZWFuIGFyZ3VtZW50IGBpc0NoYW5nZWRgXHJcbiAgICBsZXQgbGV2ZWwgPSAwLFxyXG4gICAgICAgIGNoYW5nZUNvdW50ID0gMCxcclxuICAgICAgICBtZXJnZUNoaWxkT2JzID0gdHJ1ZSxcclxuICAgICAgICBjYWxsYmFjayxcclxuICAgICAgICByZXN1bHQgPSBydW4uYXBwbHkodGhpcywgWzAsIGFyZ3VtZW50c10pO1xyXG5cclxuICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soISFjaGFuZ2VDb3VudCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bihsZXZlbCwgcGFyYW1zKSB7XHJcbiAgICAgICAgbGV0IHBhcmFtLFxyXG4gICAgICAgICAgICByZXRPYixcclxuICAgICAgICAgICAgcGFyYW1zQ291bnQgPSBwYXJhbXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBDaGlsZCBvYmplY3RzXHJcbiAgICAgICAgLy8gTWVyZ2UgaW50byBsZWZ0bW9zdCBwYXJhbSBpZiBhbiBvYmplY3QsIG9yIGNyZWF0ZSBvYmplY3QgdG8gbWVyZ2UgaW50b1xyXG4gICAgICAgIGlmIChsZXZlbCkge1xyXG4gICAgICAgICAgICByZXRPYiA9IGlzT2JqZWN0KHBhcmFtc1swXSkgPyBwYXJhbXNbMF0gOiB7fVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbXNDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHBhcmFtID0gcGFyYW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgLy8gVG9wIGxldmVsIHBhcmFtcyBtYXkgY29udGFpbiBvdGhlciBhcmd1bWVudHNcclxuICAgICAgICAgICAgaWYgKCFsZXZlbCAmJiBwYXJhbSAhPSBudWxsKSB7IC8vIGB1bmRlZmluZWRgIG9yIGBudWxsYFxyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgb2JqZWN0IGJlY29tZXMgcmV0dXJuZWQgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAvLyBBbHNvIGFsbG93IGEgRE9NIG5vZGUgZm9yIG1lcmdpbmcgaW50b1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXRPYiAmJiBpc09iamVjdChwYXJhbSkgfHwgcGFyYW0ubm9kZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXRPYiA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gYG1lcmdlQ2hpbGRPYnNgIGJvb2xlYW4gYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlQ2hpbGRPYnMgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIExhc3QgcGFzc2VkIGluIGZ1bmN0aW9uIGJlY29tZXMgY2FsbGJhY2tcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJldE9iKSBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHAgaW4gcGFyYW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJhbS5oYXNPd25Qcm9wZXJ0eShwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IHBhcmFtW3BdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBNZXJnZSBjaGlsZCBvYmplY3RzIChyZWN1cnNpdmUpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lcmdlQ2hpbGRPYnMgJiYgaXNPYmplY3QodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXRPYltwXSA9IHJ1bihsZXZlbCArIDEsIFtyZXRPYltwXSwgdmFsXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbCAhPT0gcmV0T2JbcF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0T2JbcF0gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXRPYiB8fCB7fTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBhcHAgZnJvbSBcIi4uLy4uL2pzL2xpYi9hcHBcIjtcclxuXHJcbmRlc2NyaWJlKFwiT2JqZWN0IHV0aWwgdGVzdHNcIiwgZnVuY3Rpb24oKXtcclxuXHJcbiAgICBkZXNjcmliZShcInNldE5vZGVcIiwgZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIHNldE5vZGUgPSBhcHAuc2V0Tm9kZTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgYWRkIGEgbmV3IHByb3BlcnR5XCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciB0cmVlID0ge2E6MSwgYjoyfTtcclxuICAgICAgICAgICAgc2V0Tm9kZSh0cmVlLCBcImhcIiwgNzcpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHRyZWUpLnRvRXF1YWwoe2E6MSwgYjoyLCBoOjc3fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIGFkZCBhIHByb3BlcnR5IGF0IGEgbmV3IHBhdGhcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToxLCBiOjJ9O1xyXG4gICAgICAgICAgICBzZXROb2RlKHRyZWUsIFwiaC5qXCIsIDc3KTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdCh0cmVlKS50b0VxdWFsKHthOjEsIGI6MiwgaDoge2o6IDc3fX0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcIlNob3VsZCBhZGQgYSBwcm9wZXJ0eSBhdCBhIG5ldyBkZWVwIHBhdGhcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToxLCBiOjJ9O1xyXG4gICAgICAgICAgICBzZXROb2RlKHRyZWUsIFwiaC5qLmsubFwiLCA3Nyk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodHJlZSkudG9FcXVhbCh7YToxLCBiOjIsIGg6IHtqOiB7azoge2w6IDc3fX19fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIGFkZCBhIHByb3BlcnR5IGF0IGEgcGFydGlhbCBkZWVwIHBhdGhcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToge2I6IHtjOiB7ZDogNzd9fX19O1xyXG4gICAgICAgICAgICBzZXROb2RlKHRyZWUsIFwiYS5iXCIsIDc3KTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdCh0cmVlKS50b0VxdWFsKHthOiB7Yjo3N319KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgYWRkIGEgbmV3IG51bWVyaWNhbCBwcm9wZXJ0eSBhdCByb290XCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciB0cmVlID0ge2E6MSwgYjoyfTtcclxuICAgICAgICAgICAgc2V0Tm9kZSh0cmVlLCBcIjJcIiwgNzcpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHRyZWUpLnRvRXF1YWwoe2E6MSwgYjoyLCBcIjJcIjo3N30pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcIlNob3VsZCBhZGQgYW4gYXJyYXkgYXQgYSBudW1lcmljYWwgcGF0aFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOjEsIGI6Mn07XHJcbiAgICAgICAgICAgIHNldE5vZGUodHJlZSwgXCJjLjJcIiwgNzcpO1xyXG5cclxuICAgICAgICAgICAgLy9TdHJpbmdpZnkgdG8gYWxsb3cgY2hpbGQgb2JqZWN0IGNvbXBhcmlzb25cclxuICAgICAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHRyZWUpKS50b0VxdWFsKFxyXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe2E6MSwgYjoyLCBjOlt1bmRlZmluZWQsIHVuZGVmaW5lZCwgNzddfSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgYWRkIGFuIGFycmF5IGF0IGEgZGVlcCBudW1lcmljYWwgcGF0aFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOjEsIGI6Mn07XHJcbiAgICAgICAgICAgIHNldE5vZGUodHJlZSwgXCJjLjIuYS4xLjJcIiwgNzcpO1xyXG5cclxuICAgICAgICAgICAgLy9TdHJpbmdpZnkgdG8gYWxsb3cgY2hpbGQgb2JqZWN0IGNvbXBhcmlzb25cclxuICAgICAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHRyZWUpKS50b0VxdWFsKFxyXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe2E6MSwgYjoyLCBjOlt1bmRlZmluZWQsIHVuZGVmaW5lZCwge2E6IFt1bmRlZmluZWQsIFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgNzddXX1dfSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZShcImdldE5vZGVcIiwgZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIGdldE5vZGUgPSBhcHAuZ2V0Tm9kZTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgZ2V0IGEgcHJvcGVydHkgdmFsdWVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToxLCBiOjJ9O1xyXG4gICAgICAgICAgICBleHBlY3QoZ2V0Tm9kZSh0cmVlLCBcImFcIikpLnRvQmUoMSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIGdldCBhIGRlZXAgcHJvcGVydHkgdmFsdWVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YTp7Yjp7Yzo3N319LCBiOjJ9O1xyXG4gICAgICAgICAgICBleHBlY3QoZ2V0Tm9kZSh0cmVlLCBcImEuYi5jXCIpKS50b0JlKDc3KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgZ2V0IGEgcHJvcGVydHkgY29udGFpbmluZyBhIG51bWVyaWNhbCBpbmRleFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOntiOlt7YzogNzd9XX0sIGI6Mn07XHJcbiAgICAgICAgICAgIGV4cGVjdChnZXROb2RlKHRyZWUsIFwiYS5iLjAuY1wiKSkudG9CZSg3Nyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIHJldHVybiB1bmRlZmluZWQgZm9yIGFuIGludmFsaWQgcGF0aFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOntiOlt7YzogNzd9XX0sIGI6Mn07XHJcbiAgICAgICAgICAgIGV4cGVjdChnZXROb2RlKHRyZWUsIFwiYS5iLjcuYy41LjZcIikpLnRvQmUodW5kZWZpbmVkKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgYWxsb3cgZmFsc3kgdmFsdWVzIGluIHBhdGhcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7MDp7MDpbezA6IDB9XX19O1xyXG4gICAgICAgICAgICBleHBlY3QoZ2V0Tm9kZSh0cmVlLCBcIjAuMC4wLjBcIikpLnRvQmUoMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoXCJtZXJnZVwiLCBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2YXIgbWVyZ2UgPSBhcHAubWVyZ2U7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIGFkZCBvYmplY3QgcHJvcGVydGllc1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOjEsIGI6WzIsIDNdfSxcclxuICAgICAgICAgICAgICAgIHRyZWUyID0ge2M6MywgZDo0fSxcclxuICAgICAgICAgICAgICAgIHRyZWUzID0ge2U6NSwgZjo2fTtcclxuICAgICAgICAgICAgZXhwZWN0KG1lcmdlKHRyZWUsIHRyZWUyLCB0cmVlMykpLnRvRXF1YWwoe2E6MSwgYjpbMiwgM10sIGM6MywgZDo0LCBlOjUsIGY6Nn0pO1xyXG5cclxuICAgICAgICAgICAgLy9FZGdlIGNhc2VzXHJcbiAgICAgICAgICAgIGV4cGVjdChtZXJnZSgpKS50b0VxdWFsKHt9KTtcclxuICAgICAgICAgICAgZXhwZWN0KG1lcmdlKHRyZWUpKS50b0JlKHRyZWUpO1xyXG4gICAgICAgICAgICBleHBlY3QobWVyZ2UoXCIyM1wiKSkudG9FcXVhbCh7fSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChtZXJnZShcIjIzXCIsIFwiMzRcIikpLnRvRXF1YWwoe30pO1xyXG4gICAgICAgICAgICBleHBlY3QobWVyZ2UoezI6IFwiNVwifSwgXCIzNFwiKSkudG9FcXVhbCh7MDogXCIzXCIsIDE6IFwiNFwiLCAyOlwiNVwifSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIG92ZXJ3cml0ZSBwcm9wZXJ0aWVzIHJpZ2h0IHRvIGxlZnRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToxLCBiOlsyLCAzXX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMiA9IHtjOjMsIGI6WzRdfSxcclxuICAgICAgICAgICAgICAgIHRyZWUzID0ge2E6NSwgZDo2fTtcclxuICAgICAgICAgICAgZXhwZWN0KG1lcmdlKHRyZWUsIHRyZWUyLCB0cmVlMykpLnRvRXF1YWwoe2E6NSwgYjpbNF0sIGM6MywgZDo2fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIG1lcmdlIGNoaWxkIG9iamVjdHMgcmlnaHQgdG8gbGVmdFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOiB7YToxLCBiOlsyLCAzXX19LFxyXG4gICAgICAgICAgICAgICAgdHJlZTIgPSB7YToge2M6MywgYjpbNF19fSxcclxuICAgICAgICAgICAgICAgIHRyZWUzID0ge2E6IHthOjUsIGQ6Nn19O1xyXG4gICAgICAgICAgICBleHBlY3QobWVyZ2UodHJlZSwgdHJlZTIsIHRyZWUzKSkudG9FcXVhbCh7YToge2E6NSwgYjpbNF0sIGM6MywgZDo2fX0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcIlNob3VsZCBtZXJnZSBkZWVwIGNoaWxkIG9iamVjdHMgcmlnaHQgdG8gbGVmdFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJlZSA9IHthOiB7YTogWzcsIDhdLCBiOntjOntkOntlOjc3fX19fX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMiA9IHthOiB7YToxLCBiOntjOntkOntlOjg4fX19fX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMyA9IHthOiB7YTogWzZdfX07XHJcbiAgICAgICAgICAgIGV4cGVjdChtZXJnZSh0cmVlLCB0cmVlMiwgdHJlZTMpKS50b0VxdWFsKHthOiB7YTpbNl0sIGI6e2M6e2Q6e2U6ODh9fX19fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIG5vdCBtZXJnZSBjaGlsZCBvYmplY3RzIHdoZW4gYm9vbGVhbiBmYWxzZSBpcyBwYXNzZWQgaW5cIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHJlZk9iID0ge2FhOjEsIGJiOjJ9LFxyXG4gICAgICAgICAgICAgICAgdHJlZSA9IHthOjEsIGI6MiwgYzp7fX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMiA9IHtjOiByZWZPYn07XHJcbiAgICAgICAgICAgIC8vIEJvb2xlYW4gaXMgYG1lcmdlQ2hpbGRPYnNgXHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBtZXJnZShmYWxzZSwgdHJlZSwgdHJlZTIpO1xyXG4gICAgICAgICAgICBleHBlY3QocmVzdWx0LmMpLnRvQmUocmVmT2IpO1xyXG4gICAgICAgICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHthOiAxLCBiOjIsIGM6e2FhOjEsIGJiOjJ9fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwiU2hvdWxkIHN3aXRjaCBvbiBhbmQgb2ZmIG1lcmdpbmcgY2hpbGQgb2JqZWN0cyB3aGVuIGJvb2xlYW5zIGFyZSBwYXNzZWQgaW5cIiwgZnVuY3Rpb24oZG9uZSl7XHJcbiAgICAgICAgICAgIHZhciByZWZPYiA9IHthYToxLCBiYjoyfSxcclxuICAgICAgICAgICAgICAgIHRyZWUgPSB7YToxLCBiOjIsIGM6e319LFxyXG4gICAgICAgICAgICAgICAgdHJlZTIgPSB7YzogcmVmT2J9LFxyXG4gICAgICAgICAgICAgICAgdHJlZTMgPSB7ZDogcmVmT2J9LFxyXG4gICAgICAgICAgICAgICAgdHJlZTQgPSB7ZTogcmVmT2J9O1xyXG4gICAgICAgICAgICAvLyBCb29sZWFuIHN3aXRjaGVzIGBtZXJnZUNoaWxkT2JzYCAoYWxzbyB0ZXN0IG11bHRpcGxlIHVudXNlZCBhcmd1bWVudHMsIGFuZCBjYWxsYmFjayBhcmd1bWVudClcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1lcmdlKHRydWUsIHRydWUsIGZhbHNlLCBmYWxzZSwgdHJlZSwgdHJlZTIsIHRydWUsIGZhbHNlLCBkb25lLCB0cnVlLCB0cmVlMywgZmFsc2UsIHRyZWU0LCB0cnVlKTtcclxuICAgICAgICAgICAgZXhwZWN0KHJlc3VsdC5jKS50b0JlKHJlZk9iKTtcclxuICAgICAgICAgICAgZXhwZWN0KHJlc3VsdC5kKS5ub3QudG9CZShyZWZPYik7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXN1bHQuZSkudG9CZShyZWZPYik7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoe2E6IDEsIGI6MiwgYzp7YWE6MSwgYmI6Mn0sIGQ6e2FhOjEsIGJiOjJ9LCBlOnthYToxLCBiYjoyfX0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcIlNob3VsZCBpZ25vcmUgYXJndW1lbnRzIG9mIHdyb25nIHR5cGVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToge2E6IDEsIGI6WzIsIDNdfX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMiA9IHthOiB7YjogNn19O1xyXG4gICAgICAgICAgICBleHBlY3QobWVyZ2UoXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgdHJlZSwgdHJlZTIpKS50b0VxdWFsKHthOiB7YTogMSwgYjo2fX0pO1xyXG5cclxuICAgICAgICAgICAgdHJlZSA9IHthOjEsIGI6WzIsIDNdfTtcclxuICAgICAgICAgICAgZXhwZWN0KG1lcmdlKFwiXCIsIDk5LCB0cmVlLCBcIlwiLCA4OCkpLnRvRXF1YWwodHJlZSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChtZXJnZSh0cmVlLCA5OSwgXCJcIiwgXCJcIiwgXCJcIikpLnRvRXF1YWwodHJlZSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChtZXJnZSg5OSwgdHJlZSwgXCJcIiwgODgsIDc3KSkudG9FcXVhbCh0cmVlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJTaG91bGQgcmVwb3J0IGNoYW5nZXNcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRyZWUgPSB7YToge2E6MSwgYjpbMiwgM119fSxcclxuICAgICAgICAgICAgICAgIHRyZWUyID0ge2E6IHtjOjMsIGI6WzRdfX0sXHJcbiAgICAgICAgICAgICAgICB0cmVlMyA9IHthOiB7YTogWzZdfX07XHJcblxyXG4gICAgICAgICAgICBtZXJnZSh0cmVlLCB0cmVlMiwgZnVuY3Rpb24oaXNDaGFuZ2VkKXtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChpc0NoYW5nZWQpLnRvQmUodHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbWVyZ2UodHJlZSwgdHJlZSwgZnVuY3Rpb24oaXNDaGFuZ2VkKXtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChpc0NoYW5nZWQpLnRvQmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1lcmdlKHRyZWUsIGZ1bmN0aW9uKCl7fSwgZnVuY3Rpb24oaXNDaGFuZ2VkKXtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChpc0NoYW5nZWQpLnRvQmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1lcmdlKFwiXCIsIHRyZWUsIHRyZWUzLCBmdW5jdGlvbihpc0NoYW5nZWQpe1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGlzQ2hhbmdlZCkudG9CZSh0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtZXJnZSh7ejogODh9LCB0cmVlLCBmdW5jdGlvbihpc0NoYW5nZWQpe1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGlzQ2hhbmdlZCkudG9CZSh0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtZXJnZSh7ejoge3k6IHt4OiA1NX19fSwge3o6IHt5OiB7eDogNTZ9fX0sIGZ1bmN0aW9uKGlzQ2hhbmdlZCl7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoaXNDaGFuZ2VkKS50b0JlKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIl19
