'use strict';

System.register(['./canvas-metric', './points', 'app/core/config', 'app/core/app_events', 'app/core/utils/kbn', 'lodash', 'moment', 'angular'], function (_export, _context) {
  "use strict";

  var CanvasPanelCtrl, DistinctPoints, config, appEvents, kbn, _, moment, angular, _createClass, DiscretePanelCtrl;

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
    setters: [function (_canvasMetric) {
      CanvasPanelCtrl = _canvasMetric.CanvasPanelCtrl;
    }, function (_points) {
      DistinctPoints = _points.DistinctPoints;
    }, function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_appCoreApp_events) {
      appEvents = _appCoreApp_events.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
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
            rowHeight: 50,
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
          key: 'onRender',
          value: function onRender() {
            var _this2 = this;

            if (this.data == null || !this.context) {
              return;
            }

            var rect = this.wrap.getBoundingClientRect();

            var rows = this.data.length;
            var rowHeight = this.panel.rowHeight;

            var height = rowHeight * rows;
            var width = rect.width;
            this.canvas.width = width;
            this.canvas.height = height;

            var ctx = this.context;
            ctx.lineWidth = 1;
            ctx.textBaseline = 'middle';
            ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';

            // ctx.shadowOffsetX = 1;
            // ctx.shadowOffsetY = 1;
            // ctx.shadowColor = "rgba(0,0,0,0.3)";
            // ctx.shadowBlur = 3;

            var top = 0;

            var elapsed = this.range.to - this.range.from;

            _.forEach(this.data, function (metric) {
              var centerV = top + rowHeight / 2;

              // The no-data line
              ctx.fillStyle = _this2.panel.backgroundColor;
              ctx.fillRect(0, top, width, rowHeight);

              /*if(!this.panel.writeMetricNames) {
                ctx.fillStyle = "#111111";
                ctx.textAlign = 'left';
                ctx.fillText("No Data", 10, centerV);
              }*/
              if (_this2.isTimeline) {
                var lastBS = 0;
                var point = metric.changes[0];
                for (var i = 0; i < metric.changes.length; i++) {
                  point = metric.changes[i];
                  if (point.start <= _this2.range.to) {
                    var xt = Math.max(point.start - _this2.range.from, 0);
                    point.x = xt / elapsed * width;
                    ctx.fillStyle = _this2.getColor(point.val);
                    ctx.fillRect(point.x, top, width, rowHeight);

                    if (_this2.panel.writeAllValues) {
                      ctx.fillStyle = _this2.panel.valueTextColor;
                      ctx.textAlign = 'left';
                      ctx.fillText(point.val, point.x + 7, centerV);
                    }
                    lastBS = point.x;
                  }
                }
              } else if (_this2.panel.display == 'stacked') {
                var point = null;
                var start = _this2.range.from;
                for (var i = 0; i < metric.legendInfo.length; i++) {
                  point = metric.legendInfo[i];

                  var xt = Math.max(start - _this2.range.from, 0);
                  point.x = xt / elapsed * width;
                  ctx.fillStyle = _this2.getColor(point.val);
                  ctx.fillRect(point.x, top, width, rowHeight);

                  if (_this2.panel.writeAllValues) {
                    ctx.fillStyle = _this2.panel.valueTextColor;
                    ctx.textAlign = 'left';
                    ctx.fillText(point.val, point.x + 7, centerV);
                  }

                  start += point.ms;
                }
              } else {
                console.log("Not supported yet...", _this2);
              }

              if (top > 0) {
                ctx.strokeStyle = _this2.panel.lineColor;
                ctx.beginPath();
                ctx.moveTo(0, top);
                ctx.lineTo(width, top);
                ctx.stroke();
              }

              ctx.fillStyle = "#000000";

              if (_this2.panel.writeMetricNames && _this2.mouse.position == null) {
                ctx.fillStyle = _this2.panel.metricNameColor;
                ctx.textAlign = 'left';
                ctx.fillText(metric.name, 10, centerV);
              }

              ctx.textAlign = 'right';

              if (_this2.mouse.down == null) {
                if (_this2.panel.tooltip.highlightOnMouseover && _this2.mouse.position != null) {
                  var next = null;

                  if (_this2.isTimeline) {
                    point = metric.changes[0];
                    for (var i = 0; i < metric.changes.length; i++) {
                      if (metric.changes[i].start > _this2.mouse.position.ts) {
                        next = metric.changes[i];
                        break;
                      }
                      point = metric.changes[i];
                    }
                  } else if (_this2.panel.display == 'stacked') {
                    point = metric.legendInfo[0];
                    for (var i = 0; i < metric.legendInfo.length; i++) {
                      if (metric.legendInfo[i].x > _this2.mouse.position.x) {
                        next = metric.legendInfo[i];
                        break;
                      }
                      point = metric.legendInfo[i];
                    }
                  }

                  // Fill canvas using 'destination-out' and alpha at 0.05
                  ctx.globalCompositeOperation = 'destination-out';
                  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                  ctx.beginPath();
                  ctx.fillRect(0, top, point.x, rowHeight);
                  ctx.fill();

                  if (next != null) {
                    ctx.beginPath();
                    ctx.fillRect(next.x, top, width, rowHeight);
                    ctx.fill();
                  }
                  ctx.globalCompositeOperation = 'source-over';

                  // Now Draw the value
                  ctx.fillStyle = "#000000";
                  ctx.textAlign = 'left';
                  ctx.fillText(point.val, point.x + 7, centerV);
                } else if (_this2.panel.writeLastValue) {
                  ctx.fillText(point.val, width - 7, centerV);
                }
              }

              top += rowHeight;
            });

            if (this.isTimeline && this.mouse.position != null) {
              if (this.mouse.down != null) {
                var xmin = Math.min(this.mouse.position.x, this.mouse.down.x);
                var xmax = Math.max(this.mouse.position.x, this.mouse.down.x);

                // Fill canvas using 'destination-out' and alpha at 0.05
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.beginPath();
                ctx.fillRect(0, 0, xmin, height);
                ctx.fill();

                ctx.beginPath();
                ctx.fillRect(xmax, 0, width, height);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
              } else {
                ctx.strokeStyle = '#111';
                ctx.beginPath();
                ctx.moveTo(this.mouse.position.x, 0);
                ctx.lineTo(this.mouse.position.x, height);
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.mouse.position.x, 0);
                ctx.lineTo(this.mouse.position.x, height);
                ctx.strokeStyle = '#e22c14';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (this.externalPT && rows > 1) {
                  ctx.beginPath();
                  ctx.arc(this.mouse.position.x, this.mouse.position.y, 3, 0, 2 * Math.PI, false);
                  ctx.fillStyle = '#e22c14';
                  ctx.fill();
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = '#111';
                  ctx.stroke();
                }
              }
            }
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

            body += '<div class="graph-tooltip-time">' + val + '</div>';

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
            var _this3 = this;

            if (!Number.isInteger(selectedIndex)) {
              throw new Error('selectedIndex must integer');
            }

            var body = '<div class="graph-tooltip-time"> ' + this._getCurrentTimeFormatted() + ' </div>';

            _.each(infos, function (info, i) {

              var color = _this3.getColor(info.val);
              var seriesName = _this3.data[i].name;

              body += '\n      <div \n        class="\n          graph-tooltip-list-item \n          ' + (i == selectedIndex ? 'graph-tooltip-list-item--highlight' : '') + '\n        "\n      >\n        <div class="graph-tooltip-series-name">\n          <i class="fa fa-minus" style="color:' + color + '"></i>\n          ' + seriesName + ': ' + info.val + '\n          (' + info.count + ')\n        </div>\n        <div class="graph-tooltip-value">\n          \n          ' + moment.duration(info.ms).humanize() + '\n        </div>\n      </div>\n      ';
            });

            this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
          }
        }, {
          key: '_showTimelineTooltips',
          value: function _showTimelineTooltips(evt, points, selectedIndex, isExternal) {
            var _this4 = this;

            if (!Array.isArray(points)) {
              throw new Error('Not array provided');
            }

            if (!Number.isInteger(selectedIndex)) {
              throw new Error('selectedIndex must be integer');
            }

            var body = '<div class="graph-tooltip-time"> ' + this._getCurrentTimeFormatted() + ' </div>';

            _.each(points, function (point, i) {

              var from = point.start;
              var to = point.start + point.ms;
              var time = point.ms;
              var val = point.val;
              var seriesName = _this4.data[i].name;

              var color = _this4.getColor(val);

              body += '\n      <div \n        class="\n          graph-tooltip-list-item \n          ' + (i == selectedIndex ? 'graph-tooltip-list-item--highlight' : '') + '\n        "\n      >\n        <div class="graph-tooltip-series-name">\n          <i class="fa fa-minus" style="color:' + color + '"></i>\n          ' + seriesName + ': ' + val + '\n        </div>\n        <div class="graph-tooltip-value">\n          ' + _this4.dashboard.formatDate(moment(from)) + '\n          to\n          ' + _this4.dashboard.formatDate(moment(to)) + '\n          (' + moment.duration(time).humanize() + ');\n        </div>\n      </div>\n      ';
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

            var palet = ['#FF4444', '#9933CC', '#32D1DF', '#ed2e18', '#CC3900', '#F79520', '#33B5E5'];

            return palet[Math.abs(this.hashCode(val + '')) % palet.length];
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
          key: 'hashCode',
          value: function hashCode(str) {
            var hash = 0;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
              var char = str.charCodeAt(i);
              hash = (hash << 5) - hash + char;
              hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
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
            var _this5 = this;

            $(this.canvas).css('cursor', 'pointer');

            var data = [];
            _.forEach(dataList, function (metric) {
              if ('table' === metric.type) {
                if ('time' != metric.columns[0].type) {
                  throw 'Expected a time column from the table format';
                }

                var last = null;
                for (var i = 1; i < metric.columns.length; i++) {
                  var res = new DistinctPoints(metric.columns[i].text);
                  for (var j = 0; j < metric.rows.length; j++) {
                    var row = metric.rows[j];
                    res.add(row[0], _this5.formatValue(row[i]));
                  }
                  res.finish(_this5);
                  data.push(res);
                }
              } else {
                var res = new DistinctPoints(metric.target);
                _.forEach(metric.datapoints, function (point) {
                  res.add(point[1], _this5.formatValue(point[0]));
                });
                res.finish(_this5);
                data.push(res);
              }
            });
            this.data = data;

            this.onRender();

            //console.log( 'data', dataList, this.data);
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
            this.render();
          }
        }, {
          key: 'addColorMap',
          value: function addColorMap(what) {
            var _this6 = this;

            if (what == 'curent') {
              _.forEach(this.data, function (metric) {
                if (metric.legendInfo) {
                  _.forEach(metric.legendInfo, function (info) {
                    if (!_.has(info.val)) {
                      _this6.panel.colorMaps.push({ text: info.val, color: _this6.getColor(info.val) });
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
            //console.log( "Config changed...");
            this.isTimeline = this.panel.display == 'timeline';
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
          key: '_getRowsToHover',
          value: function _getRowsToHover() {
            var j = Math.floor(this.mouse.position.y / this.panel.rowHeight);
            j = _.clamp(j, 0, this.data.length - 1);
            var items = undefined;

            if (this.panel.tooltip.shared) {
              items = _.range(0, this.data.length);
            } else {
              items = [j];
            }

            return {
              items: items,
              selected: j
            };
          }
        }, {
          key: 'onGraphHover',
          value: function onGraphHover(evt, showTT, isExternal) {
            var _this7 = this;

            this.externalPT = isExternal;
            if (!this.data) {
              this.clearTT(); // make sure it is hidden
              this.onRender(); // refresh the view
              return;
            }

            if (this.mouse.down != null) {
              var from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
              var to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
              var time = to - from;

              var point = {
                start: from,
                ms: time,
                val: "Zoom To:"
              };

              this._showSelectionTooltip(evt, point, isExternal);
              this.onRender(); // refresh the view
              return;
            }

            if (!showTT) {
              this.onRender();
              return;
            }

            var _getRowsToHover2 = this._getRowsToHover(),
                js = _getRowsToHover2.items,
                selected = _getRowsToHover2.selected;

            if (this.isTimeline) {
              var hovers = [];
              _.each(js, function (j) {
                var hover = _this7.data[j].changes[0];
                for (var i = 0; i < _this7.data[j].changes.length; i++) {
                  if (_this7.data[j].changes[i].start > _this7.mouse.position.ts) {
                    break;
                  }
                  hover = _this7.data[j].changes[i];
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
                var hover = _this7.data[j].legendInfo[0];
                for (var i = 0; i < _this7.data[j].legendInfo.length; i++) {
                  if (_this7.data[j].legendInfo[i].x > _this7.mouse.position.x) {
                    break;
                  }
                  hover = _this7.data[j].legendInfo[i];
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
            this.mouse.position = null;
            this.mouse.down = null;
            $(this.canvas).css('cursor', 'wait');
            appEvents.emit('graph-hover-clear');
            this.render();
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
