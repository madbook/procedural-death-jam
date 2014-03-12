(function() {
  var CannedVas, TAU,
    __slice = [].slice;

  window.CannedVas = CannedVas = (function() {
    CannedVas.extend = function(extendObj) {
      var key, val, _results;
      _results = [];
      for (key in extendObj) {
        val = extendObj[key];
        _results.push(CannedVas.prototype[key] = val);
      }
      return _results;
    };

    CannedVas.alias = function(alias, key) {
      if (CannedVas.prototype[key] == null) {
        throw 'Cannod alias #{alias} to #{key}';
      }
      return CannedVas.prototype[alias] = CannedVas.prototype[key];
    };

    CannedVas.registerGetProperty = function(key) {
      return CannedVas.prototype[key] = function() {
        return this.ctx[key];
      };
    };

    CannedVas.registerSetProperty = function(key) {
      return CannedVas.prototype[key] = function(val) {
        this.ctx[key] = val;
        return this;
      };
    };

    CannedVas.registerGetSetProperty = function(key) {
      return CannedVas.prototype[key] = function(val) {
        if (val == null) {
          return this.ctx[key];
        } else {
          this.ctx[key] = val;
          return this;
        }
      };
    };

    CannedVas.registerGetMethod = function(key) {
      return CannedVas.prototype[key] = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = this.ctx)[key].apply(_ref, args);
      };
    };

    CannedVas.registerSetMethod = function(key) {
      return CannedVas.prototype[key] = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref = this.ctx)[key].apply(_ref, args);
        return this;
      };
    };

    CannedVas.registerGetSetMethod = function(key) {
      return CannedVas.prototype[key] = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!args.length) {
          return this.ctx[key]();
        } else {
          (_ref = this.ctx)[key].apply(_ref, args);
          return this;
        }
      };
    };

    CannedVas.create = function() {
      return new CannedVas(document.createElement('canvas'));
    };

    function CannedVas(ctx) {
      this.ctx = ctx instanceof HTMLCanvasElement ? ctx.getContext('2d') : ctx;
      this.vas = this.ctx.canvas;
    }

    return CannedVas;

  })();

  CannedVas.eraser = {
    alpha: 1,
    composite: 'destination-out'
  };

  CannedVas.extend({
    fillStyle: function(val) {
      if (val == null) {
        return this.ctx.fillStyle;
      }
      this.ctx.fillStyle = val;
      return this;
    },
    strokeStyle: function(val, width) {
      if (val == null) {
        return this.ctx.strokeStyle;
      }
      this.ctx.strokeStyle = val;
      if (width != null) {
        this.ctx.lineWidth = width;
      }
      return this;
    },
    lineWidth: function(val) {
      if (val == null) {
        return this.ctx.lineWidth;
      }
      this.ctx.lineWidth = val;
      return this;
    },
    lineDash: function(sequence) {
      if (sequence == null) {
        return this.ctx.getLineDash();
      }
      this.ctx.setLineDash(sequence);
      return this;
    },
    paintStyle: function(fill, stroke, width, dash) {
      if (fill == null) {
        return {
          fill: this.fillStyle(),
          stroke: this.strokeStyle(),
          lineWidth: this.lineWidth(),
          lineDash: this.lineDash()
        };
      }
      this.ctx.fillStyle = fill;
      this.ctx.strokeStyle = stroke != null ? stroke : fill;
      if (width != null) {
        this.ctx.lineWidth = width;
      }
      if (dash != null) {
        this.ctx.setLineDash(dash);
      }
      return this;
    }
  });

  CannedVas.extend({
    alpha: function(val) {
      if (val == null) {
        return this.ctx.globalAlpha;
      }
      this.ctx.globalAlpha = val;
      return this;
    },
    compositeOperation: function(val) {
      if (val == null) {
        return this.ctx.globalCompositeOperation;
      }
      this.ctx.globalCompositeOperation = val;
      return this;
    },
    globals: function(alpha, compositeOperation) {
      if (alpha == null) {
        return {
          alpha: this.alpha(),
          compositeOperation: this.compositeOperation()
        };
      }
      if (alpha != null) {
        this.ctx.globalAlpha = alpha;
      }
      if (compositeOperation) {
        this.ctx.globalCompositeOperation = compositeOperation;
      }
      return this;
    }
  });

  CannedVas.extend({
    path: function() {
      this.ctx.beginPath();
      return this;
    },
    close: function() {
      this.ctx.closePath();
      return this;
    },
    clear: function() {
      var globals;
      globals = this.globals();
      return this.globals(CannedVas.eraser).fill().globals(globals);
    },
    clip: function() {
      this.ctx.clip();
      return this;
    },
    fill: function() {
      this.ctx.fill();
      return this;
    },
    stroke: function() {
      this.ctx.stroke();
      return this;
    },
    paint: function() {
      return this.fill().stroke();
    },
    moveTo: function(x, y) {
      this.ctx.moveTo(x, y);
      return this;
    },
    lineTo: function(x, y) {
      this.ctx.lineTo(x, y);
      return this;
    },
    arcTo: function(x1, y1, x2, y2, radius) {
      this.ctx.arcTo(x1, y1, x2, y2, radius);
      return this;
    },
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      return this;
    },
    quadraticCurveTo: function(cpx, cpy, x, y) {
      this.ctx.quadraticCurveTo(cpx, cpy, x, y);
      return this;
    },
    save: function() {
      this.ctx.save();
      return this;
    },
    restore: function() {
      this.ctx.restore();
      return this;
    }
  });

  CannedVas.extend({
    rotate: function(angle) {
      this.ctx.rotate(angle);
      return this;
    },
    scale: function(x, y) {
      this.ctx.scale(x, y);
      return this;
    },
    translate: function(x, y) {
      this.ctx.translate(x, y);
      return this;
    },
    transform: function(m11, m12, m21, m22, dx, dy) {
      this.ctx.transform(m11, m12, m21, m22, dx, dy);
      return this;
    },
    setTransform: function(m11, m12, m21, m22, dx, dy) {
      this.ctx.setTransform(m11, m12, m21, m22, dx, dy);
      return this;
    },
    resetTransform: function() {
      this.ctx.resetTransform();
      return this;
    },
    translateTo: function(x, y) {
      return this.translate(x, y).moveTo(0, 0);
    }
  });

  CannedVas.registerGetSetProperty('imageSmoothingEnabled');

  CannedVas.alias('globalCompositeOperation', 'compositeOperation');

  CannedVas.alias('globalAlpha', 'alpha');

  CannedVas.alias('beginPath', 'path');

  CannedVas.alias('closePath', 'close');

  CannedVas.alias('imageSmoothing', 'imageSmoothingEnabled');

  CannedVas.extend({
    width: function(val) {
      if (val == null) {
        return this.vas.width;
      }
      this.vas.width = val;
      return this;
    },
    height: function(val) {
      if (val == null) {
        return this.vas.height;
      }
      this.vas.height = val;
      return this;
    },
    size: function(dimensionObj) {
      if (dimensionObj == null) {
        return {
          width: this.width(),
          height: this.height()
        };
      }
      if (dimensionObj.width != null) {
        this.width(dimensionObj.width);
      }
      if (dimensionObj.height != null) {
        this.height(dimensionObj.height);
      }
      return this;
    },
    createCanvas: function() {
      var can;
      can = new CannedVas(document.createElement('canvas'));
      return can.size(this.size());
    },
    copyStyle: function(can) {
      return this;
    },
    clone: function() {
      return this.createCanvas().image(this.vas, 0, 0).copyStyle(this);
    },
    open: function() {
      var args, fnc;
      fnc = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(fnc instanceof Function)) {
        throw 'Cannot open, expecting a function object';
      }
      fnc.bind(this).apply(null, args);
      return this;
    },
    cannery: function() {
      var args, fnc, item, list, _i, _len;
      fnc = arguments[0], list = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (!Array.isArray(list)) {
        throw 'Expecting a list';
      }
      fnc = fnc.bind(this);
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        item = list[_i];
        this.can(fnc.apply(null, [item].concat(__slice.call(args))));
      }
      return this;
    }
  });

  CannedVas.extend({
    toDataURL: function(type) {
      return this.vas.toDataURL(type);
    },
    toBlob: function(cb, type, jpegQuality) {
      return this.vas.toBlob(cb, type, jpegQuality);
    }
  });

  CannedVas.extend({
    style: function(property, val) {
      if (val == null) {
        return window.getComputedStyle(this.vas)[property];
      }
      this.vas.style[property] = val;
      return this;
    }
  });

  CannedVas.registerGetMethod('scrollPathIntoView');

  CannedVas.registerGetMethod('isPointInPath');

  CannedVas.registerGetMethod('isPointInStroke');

  CannedVas.registerGetMethod('drawCustomFocusRing');

  CannedVas.registerGetMethod('drawSystemFocusRing');

  CannedVas.registerGetMethod('currentPath');

  TAU = Math.PI * 2;

  CannedVas.extend({
    rect: function(x, y, w, h) {
      this.ctx.rect(x, y, w, h);
      return this;
    },
    clearRect: function(x, y, w, h) {
      this.ctx.clearRect(x, y, w, h);
      return this;
    },
    clipRect: function(x, y, w, h) {
      return this.path().rect(x, y, w, h).clip();
    },
    fillRect: function(x, y, w, h) {
      this.ctx.fillRect(x, y, w, h);
      return this;
    },
    strokeRect: function(x, y, w, h) {
      this.ctx.strokeRect(x, y, w, h);
      return this;
    },
    paintRect: function(x, y, w, h) {
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeRect(x, y, w, h);
      return this;
    },
    imageRect: function(image, x, y, w, h) {
      this.ctx.drawImage(image, x, y, w, h);
      return this;
    }
  });

  CannedVas.extend({
    box: function(x, y, w, h) {
      return this.rect(x - (w / 2), y - (h / 2), w, h);
    },
    clearBox: function(x, y, w, h) {
      return this.clearRect(x - (w / 2), y - (h / 2), w, h);
    },
    clipBox: function(x, y, w, h) {
      return this.path().box(x, y, w, h).clip();
    },
    fillBox: function(x, y, w, h) {
      return this.fillRect(x - (w / 2), y - (h / 2), w, h);
    },
    strokeBox: function(x, y, w, h) {
      return this.strokeRect(x - (w / 2), y - (h / 2), w, h);
    },
    paintBox: function(x, y, w, h) {
      return this.paintRect(x - (w / 2), y - (h / 2), w, h);
    },
    imageBox: function(image, x, y, w, h) {
      return this.imageRect(image, x - (w / 2), y - (h / 2), w, h);
    }
  });

  CannedVas.extend({
    circle: function(x, y, radius) {
      this.ctx.arc(x, y, radius, 0, TAU);
      return this;
    },
    clearCircle: function(x, y, radius) {
      return this.path().circle(x, y, radius).clear();
    },
    clipCircle: function(x, y, radius) {
      return this.beginPath().circle(x, y, radius).clip();
    },
    fillCircle: function(x, y, radius) {
      return this.beginPath().circle(x, y, radius).fill();
    },
    strokeCircle: function(x, y, radius) {
      return this.beginPath().circle(x, y, radius).stroke();
    },
    paintCircle: function(x, y, radius) {
      return this.beginPath().circle(x, y, radius).paint();
    },
    imageCircle: function(image, x, y, radius) {
      var w;
      w = radius * 2;
      this.save().clipCircle(x, y, radius).imageBox(image, x, y, w, w).restore();
      return this;
    }
  });

  CannedVas.extend({
    ellipse: function(x, y, w, h) {
      var h2, k, ox, oy, w2, x1, x2, y1, y2;
      k = 0.5522848;
      w2 = w / 2;
      h2 = h / 2;
      ox = w2 * k;
      oy = h2 * k;
      x1 = x + w2;
      y1 = y + h2;
      x2 = x - w2;
      y2 = y - h2;
      this.moveTo(x1, y).bezierCurveTo(x1, y - oy, x - ox, y1, x, y1).bezierCurveTo(x + ox, y1, x2, y - oy, x2, y).bezierCurveTo(x2, y + oy, x + ox, y2, x, y2).bezierCurveTo(x - ox, y2, x1, y + oy, x1, y);
      return this;
    },
    clearEllipse: function(x, y, w, h) {
      return this.path().ellipse(x, y, w, h).clear();
    },
    clipEllipse: function(x, y, w, h) {
      return this.path().ellipse(x, y, w, h).clip();
    },
    fillEllipse: function(x, y, w, h) {
      return this.path().ellipse(x, y, w, h).fill();
    },
    strokeEllipse: function(x, y, w, h) {
      return this.path().ellipse(x, y, w, h).stroke();
    },
    paintEllipse: function(x, y, w, h) {
      return this.path().ellipse(x, y, w, h).paint();
    },
    imageEllipse: function(img, x, y, w, h) {
      this.save().clipEllipse(x, y, w, h).imageBox(img, x, y, w, h).restore();
      return this;
    }
  });

  CannedVas.extend({
    canvas: function() {
      return this.rect(0, 0, this.vas.width, this.vas.height);
    },
    clearCanvas: function() {
      return this.clearRect(0, 0, this.vas.width, this.vas.height);
    },
    fillCanvas: function() {
      return this.fillRect(0, 0, this.vas.width, this.vas.height);
    },
    strokeCanvas: function() {
      return this.strokeRect(0, 0, this.vas.width, this.vas.height);
    },
    paintCanvas: function() {
      return this.paintRect(0, 0, this.vas.width, this.vas.height);
    },
    imageCanvas: function(img) {
      return this.imageRect(img, 0, 0, this.vas.width, this.vas.height);
    }
  });

  CannedVas.extend({
    line: function(x1, y1, x2, y2) {
      return this.moveTo(x1, y1).lineTo(x2, y2);
    },
    clearLine: function(x1, y1, x2, y2) {
      var globals;
      globals = this.globals();
      return this.globals(CannedVas.eraser).strokeLine(x1, y1, x2, y2).globals(globals);
    },
    strokeLine: function(x1, y1, x2, y2) {
      return this.path().line(x1, y1, x2, y2).stroke();
    },
    arc: function(x, y, radius, start, end, anticlockwise) {
      this.ctx.arc(x, y, radius, start, end, anticlockwise);
      return this;
    },
    clearArc: function(x, y, radius, start, end, anticlockwise) {
      var globals;
      globals = this.globals();
      this.globals(CannedVas.eraser).strokeLine(x, y, radius, start, end, anticlockwise);
      return this.globals(globals);
    },
    strokeArc: function(x, y, radius, start, end, anticlockwise) {
      return this.path().arc(x, y, radius, start, end, anticlockwise).stroke();
    }
  });

  CannedVas.extend({
    createLinearGradient: function(x1, y1, x2, y2) {
      return this.ctx.createLinearGradient(x1, y1, x2, y2);
    },
    createRadialGradient: function(x1, y1, r1, x2, y2, r2) {
      return this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    },
    createPattern: function(image, repitition) {
      return this.ctx.createPattern(image, repitition);
    },
    createRGB: function(r, g, b) {
      return 'rgb(#{r},#{g},#{b})';
    }
  });

  CannedVas.extend({
    image: function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.ctx).drawImage.apply(_ref, args);
      return this;
    },
    imageAt: function(image, x, y) {
      this.ctx.drawImage(image, x, y);
      return this;
    },
    imageIn: function(image, dx, dy, dw, dh) {
      this.ctx.drawImage(image, dx, dy, dw, dh);
      return this;
    },
    imageCrop: function(image, sx, sy, sw, sh, dx, dy) {
      this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
      return this;
    },
    imageCropIn: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
      this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
      return this;
    }
  });

  CannedVas.alias('drawImage', 'image');

  CannedVas.registerGetSetProperty('shadowBlur');

  CannedVas.registerGetSetProperty('shadowColor');

  CannedVas.registerGetSetProperty('shadowOffsetX');

  CannedVas.registerGetSetProperty('shadowOffsetY');

  CannedVas.extend({
    createImageData: function(width, height) {
      if ((height != null) && typeof width(!'number')) {
        return this.getImageData(width);
      }
      if (width == null) {
        width = this.width();
      }
      if (height == null) {
        height = this.height();
      }
      this.ctx.createImageData(width, height);
      return this;
    },
    getImageData: function(x, y, width, height) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (width == null) {
        width = this.width();
      }
      if (height == null) {
        height = this.height();
      }
      return this.ctx.getImageData(x, y, width, height);
    },
    putImageData: function(imageData, x, y, sx, sy, sw, sh) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (sx == null) {
        this.ctx.putImageData(imageData, x, y);
      } else {
        this.ctx.putImageData(imageData, x, y, sx, sy, sw, sh);
      }
      return this;
    },
    imageData: function(imageData) {
      if (imageData == null) {
        return this.getImageData();
      }
      this.putImageData(imageData);
      return this;
    }
  });

  CannedVas.extend({
    filter: function(fnc) {
      var newData, oldData;
      oldData = this.imageData();
      newData = this.createImageData(oldData);
      this.open(fnc, oldData, newData);
      this.imageData(newData);
      return this;
    },
    createMatrixFilter: function(matrix) {
      return function(input, output) {
        return applyMatrixFilter(input, output, matrix);
      };
    }
  });

  CannedVas.applyMatrixFilter = function(input, output, matrix) {
    var h, mh, mh2, mw, mw2, vals, w;
    w = input.width;
    h = input.height;
    mw = matrix[0].length;
    mh = matrix.length;
    mw2 = Math.floor(mw / 2);
    mh2 = Math.floor(mh / 2);
    vals = [0, 0, 0];
    input = input.data;
    output = output.data;

  var x, y, i, mx, my, nx, ny, ni, c
  // for each x/y value, for each neighbor, for each channel
  y = h
  while ((x = w), y--)
  while (x--, (i = (((y * w) + x) * 4)), (my = mh), x) {
      c = vals.length
      while (c--)
          vals[c] = 0

      while (my--)
      if ((ny = my - mh2 + y) && ny >= 0 && ny < h && (mx = mw))
      while (mx--)
      if ((nx = mx - mw2 + x) && nx >= 0 && nx < w && (ni = (((ny * w) + nx) * 4), c = 3))
      while (c--)
          vals[c] += input[ni + c] * matrix[my][mx]

      c = vals.length
      while (c--)
          output[i + c] = vals[c]
  }

  // straight copy alpha channel
  y = h
  while (x = w, y--)
  while (x--, i = (((y * w) + x) * 4), x)
      output[i + 3] = input[i + 3]
  ;
    return this;
  };

  CannedVas.extend({
    textWidth: function(text) {
      return this.ctx.measureText(text).width;
    },
    textHeight: function(text) {
      var d, h;
      d = document.createElement('div');
      document.body.appendChild(d);
      d.innerHTML = 'm';
      d.style.font = this.font();
      d.style.lineHeight = '1em';
      h = d.offsetHeight;
      document.body.removeChild(d);
      return h;
    },
    clearText: function(text, x, y) {
      var globals;
      globals = this.globals();
      return this.globals(eraser).fillText(text, x, y).globals(globals);
    },
    fillText: function(text, x, y) {
      this.ctx.fillText(text, x, y);
      return this;
    },
    strokeText: function(text, x, y) {
      this.ctx.strokeText(text, x, y);
      return this;
    },
    paintText: function(text, x, y) {
      return this.fillText(text, x, y).strokeText(text, x, y);
    }
  });

  CannedVas.registerGetMethod('measureText');

  CannedVas.registerGetSetProperty('font');

  CannedVas.registerGetSetProperty('textAlign');

  CannedVas.registerGetSetProperty('textBaseLine');

}).call(this);
