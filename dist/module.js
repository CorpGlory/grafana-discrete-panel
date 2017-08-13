'use strict';

System.register(['./canvas-panel', './distinct-points', 'app/core/config', 'app/core/app_events', 'app/core/utils/kbn', 'app/core/utils/colors', 'lodash', 'moment', 'angular'], function (_export, _context) {
  "use strict";

  var CanvasPanelCtrl, DistinctPoints, config, appEvents, kbn, grafanaColors, _, moment, angular, _createClass, DiscretePanelCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_canvasPanel) {
      CanvasPanelCtrl = _canvasPanel.CanvasPanelCtrl;
    }, function (_distinctPoints) {
      DistinctPoints = _distinctPoints.DistinctPoints;
    }, function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_appCoreApp_events) {
      appEvents = _appCoreApp_events.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreUtilsColors) {
      grafanaColors = _appCoreUtilsColors.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_angular) {
      angular = _angular.default;
    }],
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

      _export('PanelCtrl', DiscretePanelCtrl = function (_CanvasPanelCtrl) {
        _inherits(DiscretePanelCtrl, _CanvasPanelCtrl);

        function DiscretePanelCtrl($scope, $injector, $q) {
          _classCallCheck(this, DiscretePanelCtrl);

          var _this = _possibleConstructorReturn(this, (DiscretePanelCtrl.__proto__ || Object.getPrototypeOf(DiscretePanelCtrl)).call(this, $scope, $injector, $q));

          _this.data = null;

          // Set and populate defaults
          var panelDefaults = {
            display: 'timeline',
            rowHeight: 40,
            rowMargin: 1,
            valueMaps: [{ value: 'null', op: '=', text: 'N/A' }],
            mappingTypes: [{ name: 'value to text', value: 1 }, { name: 'range to text', value: 2 }],
            rangeMaps: [{ from: 'null', to: 'null', text: 'N/A' }],
            colorMaps: [{ text: 'N/A', color: '#CCC' }],
            tooltip: {
              highlightOnMouseover: true,
              shared: true,
              sort: 0
            },
            metricNameColor: '#000000',
            valueTextColor: '#000000',
            backgroundColor: 'rgba(128, 128, 128, 0.1)',
            lineColor: 'rgba(128, 128, 128, 1.0)',
            crosshairColor: 'rgba(170, 0, 0, 0.80)', // see jquery.flot.crosshair.js
            textSize: 24,
            writeLastValue: true,
            writeAllValues: false,
            writeMetricNames: false,
            showLegend: true,
            showLegendNames: true,
            showLegendValues: true,
            showLegendPercent: true,
            legendSortBy: '-ms'
          };

          _.defaults(_this.panel, panelDefaults);
          _this.externalPT = false;

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('refresh', _this.onRefresh.bind(_this));

          _this.updateColorInfo();
          _this.onConfigChanged();
          return _this;
        }

        _createClass(DiscretePanelCtrl, [{
          key: 'onDataError',
          value: function onDataError(err) {
            console.log("onDataError", err);
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/natel-discrete-panel/editor.options.html', 1);
            this.addEditorTab('Legend', 'public/plugins/natel-discrete-panel/editor.legend.html', 3);
            this.addEditorTab('Colors', 'public/plugins/natel-discrete-panel/editor.colors.html', 4);
            this.addEditorTab('Mappings', 'public/plugins/natel-discrete-panel/editor.mappings.html', 5);
            this.editorTabIndex = 1;
            this.refresh();
          }
        }, {
          key: '_drawUnselectRect',
          value: function _drawUnselectRect(x, y, w, h) {
            var ctx = this.context;
            var tempComposition = ctx.globalCompositeOperation;
            var tempFillStyle = ctx.fillStyle;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.fillRect(x, y, w, h);
            ctx.fill();

            ctx.fillStyle = tempFillStyle;
            ctx.globalCompositeOperation = tempComposition;
          }
        }, {
          key: '_updateRenderDimensions',
          value: function _updateRenderDimensions() {
            var _this2 = this;

            this._renderDimenstions = {};

            var rect = this._renderDimenstions.rect = this.wrap.getBoundingClientRect();
            var rows = this._renderDimenstions.rows = this.data.length;
            var rowHeight = this._renderDimenstions.rowHeight = this.panel.rowHeight;
            var height = this._renderDimenstions.height = rowHeight * rows - this.panel.rowMargin;
            var width = this._renderDimenstions.width = rect.width;
            var rectHeight = this._renderDimenstions.rectHeight = rowHeight - this.panel.rowMargin;

            var top = 0;
            var elapsed = this.range.to - this.range.from;

            this._renderDimenstions.matrix = [];
            _.forEach(this.data, function (metric) {
              var positions = [];

              if (_this2.isTimeline) {
                var lastBS = 0;
                var point = metric.changes[0];
                for (var i = 0; i < metric.changes.length; i++) {
                  point = metric.changes[i];
                  if (point.start <= _this2.range.to) {
                    var xt = Math.max(point.start - _this2.range.from, 0);
                    var x = xt / elapsed * width;
                    positions.push(x);
                  }
                }
              }

              if (_this2.isStacked) {
                var point = null;
                var start = _this2.range.from;
                for (var i = 0; i < metric.legendInfo.length; i++) {
                  point = metric.legendInfo[i];
                  var xt = Math.max(start - _this2.range.from, 0);
                  var x = xt / elapsed * width;
                  positions.push(x);
                  start += point.ms;
                }
              }

              _this2._renderDimenstions.matrix.push({
                y: top,
                positions: positions
              });

              top += rowHeight;
            });
          }
        }, {
          key: '_updateSelectionMatrix',
          value: function _updateSelectionMatrix() {
            var selectionPredicates = {
              all: function all() {
                return true;
              },
              crosshairHover: function crosshairHover(i, j) {
                if (j + 1 === this.data[i].changes.length) {
                  return this.data[i].changes[j].start <= this.mouse.position.ts;
                }
                return this.data[i].changes[j].start <= this.mouse.position.ts && this.mouse.position.ts < this.data[i].changes[j + 1].start;
              },
              mouseX: function mouseX(i, j) {
                var row = this._renderDimenstions.matrix[i];
                if (j + 1 === row.positions.length) {
                  return row.positions[j] <= this.mouse.position.x;
                }
                return row.positions[j] <= this.mouse.position.x && this.mouse.position.x < row.positions[j + 1];
              },
              metric: function metric(i) {
                return this.data[i] === this._selectedMetric;
              },
              legendItem: function legendItem(i, j) {
                if (this.data[i] !== this._selectedMetric) {
                  return false;
                }
                return this._selectedLegendItem.val === this._getVal(i, j);
              }
            };

            function getPridicate() {
              if (this._selectedLegendItem !== undefined) {
                return 'legendItem';
              };
              if (this._selectedMetric !== undefined) {
                return 'metric';
              };
              if (this.mouse.down !== null) {
                return 'all';
              }
              if (this.panel.tooltip.highlightOnMouseover && this.mouse.position != null) {
                if (this.isTimeline) {
                  return 'crosshairHover';
                }
                if (this.isStacked) {
                  return 'mouseX';
                }
              }
              return 'all';
            }

            var pn = getPridicate.bind(this)();
            var predicate = selectionPredicates[pn].bind(this);
            this._selectionMatrix = [];
            for (var i = 0; i < this._renderDimenstions.matrix.length; i++) {
              var rs = [];
              var r = this._renderDimenstions.matrix[i];
              for (var j = 0; j < r.positions.length; j++) {
                rs.push(predicate(i, j));
              }
              this._selectionMatrix.push(rs);
            }
          }
        }, {
          key: '_getVal',
          value: function _getVal(metricIndex, rectIndex) {
            var point = undefined;
            if (this.isTimeline) {
              point = this.data[metricIndex].changes[rectIndex];
            }
            if (this.isStacked) {
              point = this.data[metricIndex].legendInfo[rectIndex];
            }
            return point.val;
          }
        }, {
          key: '_getWidth',
          value: function _getWidth(metricIndex, rectIndex) {
            var positions = this._renderDimenstions.matrix[metricIndex].positions;
            if (rectIndex + 1 === positions.length) {
              return this._renderDimenstions.width - positions[rectIndex];
            }
            return positions[rectIndex + 1] - positions[rectIndex];
          }
        }, {
          key: '_updateCanvasSize',
          value: function _updateCanvasSize() {
            this.canvas.width = this._renderDimenstions.width * this._devicePixelRatio;
            this.canvas.height = this._renderDimenstions.height * this._devicePixelRatio;

            $(this.canvas).css('width', this._renderDimenstions.width + 'px');
            $(this.canvas).css('height', this._renderDimenstions.height + 'px');

            this.context.scale(this._devicePixelRatio, this._devicePixelRatio);
          }
        }, {
          key: '_renderRects',
          value: function _renderRects() {
            var _this3 = this;

            var matrix = this._renderDimenstions.matrix;
            var ctx = this.context;
            _.forEach(this.data, function (metric, i) {
              var rowObj = matrix[i];
              for (var j = 0; j < rowObj.positions.length; j++) {
                var currentX = rowObj.positions[j];
                var nextX = _this3._renderDimenstions.width;
                if (j + 1 !== rowObj.positions.length) {
                  nextX = rowObj.positions[j + 1];
                }
                ctx.fillStyle = _this3.getColor(_this3._getVal(i, j));
                var globalAlphaTemp = ctx.globalAlpha;
                if (!_this3._selectionMatrix[i][j]) {
                  ctx.globalAlpha = 0.3;
                }
                ctx.fillRect(currentX, matrix[i].y, nextX - currentX, _this3._renderDimenstions.rectHeight);
                ctx.globalAlpha = globalAlphaTemp;
              }
            });
          }
        }, {
          key: '_renderLabels',
          value: function _renderLabels() {
            var _this4 = this;

            var LEBELS_PADDING = 8;
            var ctx = this.context;
            ctx.lineWidth = 1;
            ctx.textBaseline = 'middle';
            ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';

            function findLength(text, width) {
              var length = 1;
              for (; length < text.length + 1; length++) {
                var testLine = text.substr(0, length);
                var measure = ctx.measureText(testLine);
                if (measure.width > width) {
                  break;
                }
              }

              return text.substr(0, length - 1);
            }

            _.forEach(this.data, function (metric, i) {
              var _renderDimenstions$ma = _this4._renderDimenstions.matrix[i],
                  y = _renderDimenstions$ma.y,
                  positions = _renderDimenstions$ma.positions;

              var rectHeight = _this4._renderDimenstions.rectHeight;

              var centerV = y + rectHeight / 2;
              var labelPositionMetricName = y + rectHeight - _this4.panel.textSize / 2 - 3;
              var labelPositionLastValue = y + rectHeight - _this4.panel.textSize / 2 - 3;
              var labelPositionValue = y + _this4.panel.textSize / 2 + 3;

              if (_this4.mouse.position == null) {
                if (_this4.panel.writeMetricNames) {
                  ctx.fillStyle = _this4.panel.metricNameColor;
                  ctx.textAlign = 'left';
                  ctx.fillText(metric.name, LEBELS_PADDING, labelPositionMetricName);
                }
                if (_this4.panel.writeLastValue) {
                  var val = _this4._getVal(i, positions.length - 1);
                  ctx.fillStyle = _this4.panel.valueTextColor;
                  ctx.textAlign = 'right';
                  ctx.fillText(val, _this4._renderDimenstions.width - LEBELS_PADDING, labelPositionLastValue);
                }
              }

              ctx.fillStyle = _this4.panel.valueTextColor;
              ctx.textAlign = 'left';
              for (var j = 0; j < positions.length; j++) {
                var val = _this4._getVal(i, j);
                var width = _this4._getWidth(i, j);
                var cval = findLength(val, width - LEBELS_PADDING * 2);
                ctx.fillText(cval, positions[j] + LEBELS_PADDING, labelPositionValue);
              }
            });
          }
        }, {
          key: '_renderSelection',
          value: function _renderSelection() {
            if (this.mouse.down === null) {
              return;
            }
            if (this.mouse.position === null) {
              return;
            }
            if (!this.isTimeline) {
              return;
            }

            var ctx = this.context;
            var height = this._renderDimenstions.height;

            var xmin = Math.min(this.mouse.position.x, this.mouse.down.x);
            var xmax = Math.max(this.mouse.position.x, this.mouse.down.x);

            ctx.fillStyle = "rgba(110, 110, 110, 0.5)";
            ctx.strokeStyle = "rgba(110, 110, 110, 0.5)";
            ctx.beginPath();
            ctx.fillRect(xmin, 0, xmax - xmin, height);
            ctx.strokeRect(xmin, 0, xmax - xmin, height);
          }
        }, {
          key: '_renderCrosshair',
          value: function _renderCrosshair() {
            if (this.mouse.down != null) {
              return;
            }
            if (this.mouse.position === null) {
              return;
            }
            if (!this.isTimeline) {
              return;
            }

            var ctx = this.context;
            var rows = this.data.length;
            var rowHeight = this.panel.rowHeight;
            var height = this._renderDimenstions.height;

            ctx.beginPath();
            ctx.moveTo(this.mouse.position.x, 0);
            ctx.lineTo(this.mouse.position.x, height);
            ctx.strokeStyle = this.panel.crosshairColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (this.externalPT && rows > 1) {
              ctx.beginPath();
              ctx.arc(this.mouse.position.x, this.mouse.position.y, 3, 0, 2 * Math.PI, false);
              ctx.fillStyle = this.panel.crosshairColor;
              ctx.fill();
              ctx.lineWidth = 1;
            }
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            if (this.data == null || !this.context) {
              return;
            }
            this._updateRenderDimensions();
            this._updateSelectionMatrix();
            this._updateCanvasSize();
            this._renderRects();
            this._renderLabels();
            this._renderSelection();
            this._renderCrosshair();
          }
        }, {
          key: '_getCurrentTimeFormatted',
          value: function _getCurrentTimeFormatted() {
            // Format might be idfferent 
            // see https://github.com/grafana/grafana/blob/32f9a42d5e931be549ff9f169468b404af9a6b21/public/app/plugins/panel/graph/graph_tooltip.js#L212
            return this.dashboard.formatDate(moment(this.mouse.position.ts), 'YYYY-MM-DD HH:mm:ss.SSS');
          }
        }, {
          key: '_showSelectionTooltip',
          value: function _showSelectionTooltip(evt, point, isExternal) {

            var from = point.start;
            var to = point.start + point.ms;
            var time = point.ms;
            var val = point.val;

            var body = '<div class="graph-tooltip-time">' + val + '</div>';

            body += "<center>";
            body += this.dashboard.formatDate(moment(from));
            body += " to ";
            body += this.dashboard.formatDate(moment(to));
            body += " (" + moment.duration(time).humanize() + ")";
            body += "</center>";

            var pageX = 0;
            var pageY = 0;
            if (isExternal) {
              var rect = this.canvas.getBoundingClientRect();
              pageY = rect.top + evt.pos.panelRelY * rect.height;
              if (pageY < 0 || pageY > $(window).innerHeight()) {
                // Skip Hidden tooltip
                this.clearTT();
                return;
              }
              pageY += $(window).scrollTop();

              var elapsed = this.range.to - this.range.from;
              var pX = (evt.pos.x - this.range.from) / elapsed;
              pageX = rect.left + pX * rect.width;
            } else {
              pageX = evt.evt.pageX;
              pageY = evt.evt.pageY;
            }

            this.$tooltip.html(body).place_tt(pageX + 20, pageY + 5);
          }
        }, {
          key: '_showStackedTooltips',
          value: function _showStackedTooltips(pos, infos, selectedIndex) {
            var _this5 = this;

            if (!Number.isInteger(selectedIndex)) {
              throw new Error('selectedIndex must integer');
            }

            var body = '<div class="graph-tooltip-time"> ' + this._getCurrentTimeFormatted() + ' </div>';

            var items = infos;
            if (this._isTooltipOrderReversed) {
              _.reverse(items);
            }
            _.each(items, function (info, i) {

              var color = _this5.getColor(info.val);
              var seriesName = _this5.data[i].name;

              body += '\n      <div \n        class="\n          graph-tooltip-list-item \n          ' + (i == selectedIndex ? 'graph-tooltip-list-item--highlight' : '') + '\n        "\n      >\n        <div class="graph-tooltip-series-name">\n          <i class="fa fa-minus" style="color:' + color + '"></i>\n          ' + seriesName + ': ' + info.val + '\n          (' + info.count + ')\n        </div>\n        <div class="graph-tooltip-value">\n          ' + moment.duration(info.ms).humanize() + '\n        </div>\n      </div>\n      ';
            });

            this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
          }
        }, {
          key: '_showTimelineTooltips',
          value: function _showTimelineTooltips(evt, points, selectedIndex, isExternal) {
            var _this6 = this;

            if (!Array.isArray(points)) {
              throw new Error('Not array provided');
            }

            if (!Number.isInteger(selectedIndex)) {
              throw new Error('selectedIndex must be integer');
            }

            var body = '<div class="graph-tooltip-time"> ' + this._getCurrentTimeFormatted() + ' </div>';

            var items = points;
            if (this._isTooltipOrderReversed) {
              _.reverse(items);
            }

            _.each(items, function (point, i) {

              var from = point.start;
              var to = point.start + point.ms;
              var time = point.ms;
              var val = point.val;
              var seriesName = _this6.data[i].name;

              var color = _this6.getColor(val);

              body += '\n      <div \n        class="\n          graph-tooltip-list-item \n          ' + (i == selectedIndex ? 'graph-tooltip-list-item--highlight' : '') + '\n        "\n      >\n        <div class="graph-tooltip-series-name">\n          <i class="fa fa-minus" style="color:' + color + '"></i>\n          ' + seriesName + ': ' + val + '\n        </div>\n        <div class="graph-tooltip-value">\n          ' + _this6.dashboard.formatDate(moment(from)) + '\n          to\n          ' + _this6.dashboard.formatDate(moment(to)) + '\n          (' + moment.duration(time).humanize() + ');\n        </div>\n      </div>\n      ';
            });

            var pageX = 0;
            var pageY = 0;
            if (isExternal) {
              var rect = this.canvas.getBoundingClientRect();
              pageY = rect.top + evt.pos.panelRelY * rect.height;
              if (pageY < 0 || pageY > $(window).innerHeight()) {
                // Skip Hidden tooltip
                this.clearTT();
                return;
              }
              pageY += $(window).scrollTop();

              var elapsed = this.range.to - this.range.from;
              var pX = (evt.pos.x - this.range.from) / elapsed;
              pageX = rect.left + pX * rect.width;
            } else {
              pageX = evt.evt.pageX;
              pageY = evt.evt.pageY;
            }

            this.$tooltip.html(body).place_tt(pageX + 20, pageY + 5);
          }
        }, {
          key: 'showLegendTooltip',
          value: function showLegendTooltip(pos, info) {
            var body = '<div class="graph-tooltip-time">' + info.val + '</div>';

            body += "<center>";
            if (info.count > 1) {
              body += info.count + " times<br/>";
            }
            body += moment.duration(info.ms).humanize();
            if (info.count > 1) {
              body += "<br/>total";
            }
            body += "</center>";

            this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
          }
        }, {
          key: 'formatValue',
          value: function formatValue(val, stats) {

            if (_.isNumber(val) && this.panel.rangeMaps) {
              for (var i = 0; i < this.panel.rangeMaps.length; i++) {
                var map = this.panel.rangeMaps[i];

                // value/number to range mapping
                var from = parseFloat(map.from);
                var to = parseFloat(map.to);
                if (to >= val && from <= val) {
                  return map.text;
                }
              }
            }

            var isNull = _.isNil(val);
            if (!isNull && !_.isString(val)) {
              val = val.toString(); // convert everything to a string
            }

            for (var i = 0; i < this.panel.valueMaps.length; i++) {
              var map = this.panel.valueMaps[i];
              // special null case
              if (map.value === 'null') {
                if (isNull) {
                  return map.text;
                }
                continue;
              }

              if (val == map.value) {
                return map.text;
              }
            }

            if (isNull) {
              return "null";
            }
            return val;
          }
        }, {
          key: 'getColor',
          value: function getColor(val) {
            if (_.has(this.colorMap, val)) {
              return this.colorMap[val];
            }
            if (this._colorsPaleteCash[val] === undefined) {
              var c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
              this._colorsPaleteCash[val] = c;
              this._colorsPaleteCash.length++;
            }
            return this._colorsPaleteCash[val];
          }
        }, {
          key: 'randomColor',
          value: function randomColor() {
            var letters = 'ABCDE'.split('');
            var color = '#';
            for (var i = 0; i < 3; i++) {
              color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;
          }
        }, {
          key: 'issueQueries',
          value: function issueQueries(datasource) {
            this.datasource = datasource;

            if (!this.panel.targets || this.panel.targets.length === 0) {
              return this.$q.when([]);
            }

            // make shallow copy of scoped vars,
            // and add built in variables interval and interval_ms
            var scopedVars = Object.assign({}, this.panel.scopedVars, {
              "__interval": { text: this.interval, value: this.interval },
              "__interval_ms": { text: this.intervalMs, value: this.intervalMs }
            });

            var range = this.range;
            var rangeRaw = this.rangeRaw;
            if (this.panel.expandFromQueryS > 0) {
              range = {
                from: this.range.from.clone(),
                to: this.range.to
              };
              range.from.subtract(this.panel.expandFromQueryS, 's');

              rangeRaw = {
                from: range.from.format(),
                to: this.rangeRaw.to
              };
            }

            var metricsQuery = {
              panelId: this.panel.id,
              range: range,
              rangeRaw: rangeRaw,
              interval: this.interval,
              intervalMs: this.intervalMs,
              targets: this.panel.targets,
              format: this.panel.renderer === 'png' ? 'png' : 'json',
              maxDataPoints: this.resolution,
              scopedVars: scopedVars,
              cacheTimeout: this.panel.cacheTimeout
            };

            return datasource.query(metricsQuery);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var _this7 = this;

            $(this.canvas).css('cursor', 'pointer');

            var data = [];
            _.forEach(dataList, function (metric) {
              if (metric.type === 'table') {
                if (metric.columns[0].type !== 'time') {
                  throw 'Expected a time column from the table format';
                }

                var last = null;
                for (var i = 1; i < metric.columns.length; i++) {
                  var res = new DistinctPoints(metric.columns[i].text);
                  for (var j = 0; j < metric.rows.length; j++) {
                    var row = metric.rows[j];
                    res.add(row[0], _this7.formatValue(row[i]));
                  }
                  res.finish(_this7);
                  data.push(res);
                }
              } else {
                var res = new DistinctPoints(metric.target);
                _.forEach(metric.datapoints, function (point) {
                  res.add(point[1], _this7.formatValue(point[0]));
                });
                res.finish(_this7);
                data.push(res);
              }
            });
            this.data = data;

            this.onRender();
          }
        }, {
          key: 'removeColorMap',
          value: function removeColorMap(map) {
            var index = _.indexOf(this.panel.colorMaps, map);
            this.panel.colorMaps.splice(index, 1);
            this.updateColorInfo();
          }
        }, {
          key: 'updateColorInfo',
          value: function updateColorInfo() {
            var cm = {};
            for (var i = 0; i < this.panel.colorMaps.length; i++) {
              var m = this.panel.colorMaps[i];
              if (m.text) {
                cm[m.text] = m.color;
              }
            }
            this.colorMap = cm;

            this._colorsPaleteCash = {};
            this._colorsPaleteCash.length = 0;
            this.render();
          }
        }, {
          key: 'addColorMap',
          value: function addColorMap(what) {
            var _this8 = this;

            if (what == 'curent') {
              _.forEach(this.data, function (metric) {
                if (metric.legendInfo) {
                  _.forEach(metric.legendInfo, function (info) {
                    if (!_.has(info.val)) {
                      _this8.panel.colorMaps.push({ text: info.val, color: _this8.getColor(info.val) });
                    }
                  });
                }
              });
            } else {
              this.panel.colorMaps.push({ text: '???', color: this.randomColor() });
            }
            this.updateColorInfo();
          }
        }, {
          key: 'removeValueMap',
          value: function removeValueMap(map) {
            var index = _.indexOf(this.panel.valueMaps, map);
            this.panel.valueMaps.splice(index, 1);
            this.render();
          }
        }, {
          key: 'addValueMap',
          value: function addValueMap() {
            this.panel.valueMaps.push({ value: '', op: '=', text: '' });
          }
        }, {
          key: 'removeRangeMap',
          value: function removeRangeMap(rangeMap) {
            var index = _.indexOf(this.panel.rangeMaps, rangeMap);
            this.panel.rangeMaps.splice(index, 1);
            this.render();
          }
        }, {
          key: 'addRangeMap',
          value: function addRangeMap() {
            this.panel.rangeMaps.push({ from: '', to: '', text: '' });
          }
        }, {
          key: 'onConfigChanged',
          value: function onConfigChanged() {
            this.isTimeline = this.panel.display == 'timeline';
            this.isStacked = this.panel.display == 'stacked';
            this.render();
          }
        }, {
          key: 'getLegendDisplay',
          value: function getLegendDisplay(info, metric) {
            var disp = info.val;
            if (this.panel.showLegendPercent || this.panel.showLegendCounts || this.panel.showLegendTime) {
              disp += " (";
              var hassomething = false;
              if (this.panel.showLegendTime) {
                disp += moment.duration(info.ms).humanize();
                hassomething = true;
              }

              if (this.panel.showLegendPercent) {
                if (hassomething) {
                  disp += ", ";
                }

                var dec = this.panel.legendPercentDecimals;
                if (_.isNil(dec)) {
                  if (info.per > .98 && metric.changes.length > 1) {
                    dec = 2;
                  } else if (info.per < 0.02) {
                    dec = 2;
                  } else {
                    dec = 0;
                  }
                }
                disp += kbn.valueFormats.percentunit(info.per, dec);
                hassomething = true;
              }

              if (this.panel.showLegendCounts) {
                if (hassomething) {
                  disp += ", ";
                }
                disp += info.count + "x";
              }
              disp += ")";
            }
            return disp;
          }
        }, {
          key: 'selectLegendMetric',
          value: function selectLegendMetric(event, metric) {
            this._selectedMetric = metric;
            this.render();
          }
        }, {
          key: 'selectLegendItem',
          value: function selectLegendItem(event, item, metric) {
            this.showLegendTooltip(event, item);
            this._selectedMetric = metric;
            this._selectedLegendItem = item;
            this.render();
          }
        }, {
          key: 'deselectLegend',
          value: function deselectLegend() {
            this._selectedMetric = undefined;
            this._selectedLegendItem = undefined;
            this.clearTT();
            this.render();
          }
        }, {
          key: '_getRowsToHover',
          value: function _getRowsToHover() {
            var j = Math.floor(this.mouse.position.y / this.panel.rowHeight);
            j = _.clamp(j, 0, this.data.length - 1);
            var res = {
              items: undefined,
              selected: undefined
            };

            if (this.panel.tooltip.shared) {
              res.items = _.range(0, this.data.length);
              res.selected = j;
            } else {
              res.items = [j];
              res.selected = 0;
            }

            return res;
          }
        }, {
          key: 'onGraphHover',
          value: function onGraphHover(evt, showTT, isExternal) {
            var _this9 = this;

            this.externalPT = isExternal;
            if (!this.data) {
              this.clearTT();
              this.onRender();
              return;
            }

            if (this.mouse.down != null) {
              var from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
              var to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
              var time = to - from;
              this.hoverPoint = { start: from, ms: time, val: "Zoom To:" };

              this._showSelectionTooltip(evt, this.hoverPoint, isExternal);
              this.onRender();
              return;
            }

            if (!showTT) {
              this.onRender();
              return;
            }

            var _getRowsToHover2 = this._getRowsToHover(),
                js = _getRowsToHover2.items,
                selected = _getRowsToHover2.selected;

            // TODO: use this._renderDimenstions for optimozation
            if (this.isTimeline) {
              var hovers = [];
              _.each(js, function (j) {
                var hover = _this9.data[j].changes[0];
                for (var i = 0; i < _this9.data[j].changes.length; i++) {
                  if (_this9.data[j].changes[i].start > _this9.mouse.position.ts) {
                    break;
                  }
                  hover = _this9.data[j].changes[i];
                }
                hovers.push(hover);
              });

              this._showTimelineTooltips(evt, hovers, selected, isExternal);
              this.onRender();
              return;
            }

            if (!isExternal && this.panel.display == 'stacked') {
              var hovers = [];
              _.each(js, function (j) {
                var hover = _this9.data[j].legendInfo[0];
                for (var i = 0; i < _this9.data[j].legendInfo.length; i++) {
                  if (_this9.data[j].legendInfo[i].x > _this9.mouse.position.x) {
                    break;
                  }
                  hover = _this9.data[j].legendInfo[i];
                }
                hovers.push(hover);
              });

              this._showStackedTooltips(evt.evt, hovers, selected);
              this.onRender();
              return;
            }
          }
        }, {
          key: 'onMouseClicked',
          value: function onMouseClicked(where) {
            var pt = this.hoverPoint;
            if (pt && pt.start) {
              var range = { from: moment.utc(pt.start), to: moment.utc(pt.start + pt.ms) };
              this.timeSrv.setTime(range);
              this._clear();
            }
          }
        }, {
          key: 'onMouseSelectedRange',
          value: function onMouseSelectedRange(range) {
            this.timeSrv.setTime(range);
            this._clear();
          }
        }, {
          key: '_clear',
          value: function _clear() {
            this.hoverPoint = null;
            this.mouse.position = null;
            this.mouse.down = null;
            $(this.canvas).css('cursor', 'wait');
            appEvents.emit('graph-hover-clear');
            this.render();
          }
        }, {
          key: '_isTooltipOrderReversed',
          get: function get() {
            return this.panel.tooltip.sort === 2;
          }
        }]);

        return DiscretePanelCtrl;
      }(CanvasPanelCtrl));

      DiscretePanelCtrl.templateUrl = 'module.html';

      _export('PanelCtrl', DiscretePanelCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
