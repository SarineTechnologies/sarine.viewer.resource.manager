
/*!
sarine.viewer.resource.manager - v0.0.8 -  Monday, February 23rd, 2015, 1:06:02 PM 
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
      console.log('new singleton');
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

      ImageManger.prototype.viewerImagesObj = {};

      ImageManger.prototype.loadImage = function(src, viewer, defer) {
        var img, _t;
        _t = this;
        if (this.viewerImagesObj[viewer.id] === void 0) {
          this.viewerImagesObj[viewer.id] = {
            capacity: viewer.downloadLimit || 1000,
            bag: [],
            threshhold: [],
            order: parseInt(viewer.element.data("order"))
          };
        }
        defer = defer || $.Deferred();
        img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function(e) {
          var index, obj, popped;
          index = $.inArray(_t.viewerImagesObj[viewer.id].threshhold.filter((function(_this) {
            return function(v) {
              return v.src === e.target.src;
            };
          })(this))[0], _t.viewerImagesObj[viewer.id].threshhold);
          obj = _t.viewerImagesObj[viewer.id].threshhold[index];
          popped = _t.viewerImagesObj[viewer.id].bag.shift();
          if (popped) {
            popped.img.src = popped.src;
            _t.viewerImagesObj[viewer.id].threshhold.push(popped);
          }
          _t.viewerImagesObj[viewer.id].threshhold.splice(index, 1);
          return obj.defer.resolve(e.target);
        };
        if (this.viewerImagesObj[viewer.id].threshhold.length < this.viewerImagesObj[viewer.id].capacity) {
          this.viewerImagesObj[viewer.id].threshhold.push({
            defer: defer,
            src: src,
            img: img
          });
          img.src = src;
        } else {
          this.viewerImagesObj[viewer.id].bag.push({
            defer: defer,
            src: src,
            img: img
          });
        }
        img.onerror = function(e) {
          var index, obj;
          index = $.inArray(_t.viewerImagesObj[viewer.id].threshhold.filter((function(_this) {
            return function(v) {
              return v.src === e.target.src;
            };
          })(this))[0], _t.viewerImagesObj[viewer.id].threshhold);
          obj = _t.viewerImagesObj[viewer.id].threshhold[index];
          if (e.target.src !== viewer.callbackPic) {
            return _t.loadImage(viewer.callbackPic, viewer, defer);
          } else {
            throw new Error('callbackPic not exist');
          }
        };
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
