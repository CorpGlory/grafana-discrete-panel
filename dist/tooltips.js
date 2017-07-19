'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var _createClass, Tooltips;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('Tooltips', Tooltips = function () {
        function Tooltips($holder) {
          _classCallCheck(this, Tooltips);

          if ($holder === undefined) {
            throw new Error('Holder for tooltips is undefined');
          }
          this._$holder = $holder.append('<div class=""></div>');
          //this.
        }

        // expects array of { html, x, y }


        _createClass(Tooltips, [{
          key: 'setTooltips',
          value: function setTooltips(objs) {
            var _this = this;

            objs.each(function (o) {
              var tooltip = _this._$holder.append();
            });
          }
        }, {
          key: 'detach',
          value: function detach() {}
        }]);

        return Tooltips;
      }());

      _export('Tooltips', Tooltips);

      ;
    }
  };
});
//# sourceMappingURL=tooltips.js.map
