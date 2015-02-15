
/*!
sarine.viewer.resource.manager - v0.0.1 -  Sunday, February 15th, 2015, 4:00:25 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
 */

(function() {
  var ResourceManager;

  ResourceManager = (function() {
    var ImageManger, TimeoutManager, _imageManger, _instance, _timeoutManager;

    _instance = void 0;

    _timeoutManager = void 0;

    _imageManger = void 0;

    function ResourceManager() {
      console.log('new singleton122211');
      _timeoutManager = new TimeoutManager();
      _imageManger = new ImageManger();
    }

    ResourceManager.getInstance = function() {
      if (_instance === void 0) {
        _instance = new this();
      }
      return _instance;
    };

    ImageManger = (function() {
      function ImageManger() {}

      ImageManger.prototype.imageObj = {};

      ImageManger.prototype.loadImage = function(src, viewer) {
        var defer, img, _t;
        _t = this;
        if (this.imageObj[viewer.id] === void 0) {
          this.imageObj[viewer.id] = {
            capacity: viewer.downloadLimit || 2,
            bag: [],
            threshhold: []
          };
        }
        defer = $.Deferred();
        img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function(e) {
          var index, obj, popped;
          index = $.inArray(_t.imageObj[viewer.id].threshhold.filter((function(_this) {
            return function(v) {
              return v.src === e.target.src;
            };
          })(this))[0], _t.imageObj[viewer.id].threshhold);
          obj = _t.imageObj[viewer.id].threshhold[index];
          popped = _t.imageObj[viewer.id].bag.shift();
          if (popped) {
            popped.img.src = popped.src;
            _t.imageObj[viewer.id].threshhold.push(popped);
          }
          _t.imageObj[viewer.id].threshhold.splice(index, 1);
          return obj.defer.resolve(e.target);
        };
        if (this.imageObj[viewer.id].threshhold.length < this.imageObj[viewer.id].capacity) {
          this.imageObj[viewer.id].threshhold.push({
            defer: defer,
            src: src,
            img: img
          });
          img.src = src;
        } else {
          this.imageObj[viewer.id].bag.push({
            defer: defer,
            src: src,
            img: img
          });
        }
        return defer;
      };

      return ImageManger;

    })();

    ResourceManager.prototype.loadImage = function(src) {
      return _imageManger.loadImage(src, this);
    };

    TimeoutManager = (function() {
      var funcArr;

      function TimeoutManager() {}

      funcArr = {};

      TimeoutManager.add = function(delay, defer, item) {
        var obj;
        obj = {
          defer: defer,
          item: item
        };
        if (!funcArr[delay]) {
          setTimeout(function(delay) {
            var temp, unique;
            temp = funcArr[delay];
            funcArr[delay] = void 0;
            unique = $.unique(temp.map(function(v) {
              return v.item.id;
            }));
            return temp.forEach(function(i) {
              return i.defer.resolve.apply(i.item);
            });
          }, delay, delay);
          funcArr[delay] = [];
        }
        if ((funcArr[delay].filter(function(v) {
          return v.item.id === obj.item.id;
        })).length === 0) {
          return funcArr[delay].push(obj);
        }
      };

      return TimeoutManager;

    })();

    ResourceManager.prototype.setTimeout = function(delay) {
      var defer;
      defer = $.Deferred();
      TimeoutManager.add(delay, defer, this);
      return defer;
    };

    return ResourceManager;

  })();

  this.ResourceManager = ResourceManager;

}).call(this);