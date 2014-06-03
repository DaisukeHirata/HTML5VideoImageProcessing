window.Filters = {};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.grayscale = function(imageData) {
  var pixels = imageData.data;
  for (var i=0; i<pixels.length; i+=4) {
    var r = pixels[i];
    var g = pixels[i+1];
    var b = pixels[i+2];
    // CIE luminance for the RGB
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    pixels[i] = pixels[i+1] = pixels[i+2] = v
  }
  return imageData;
};

Filters.threshold = function (imageData, threshold) {
	var pixels = imageData.data;
	for (var i=0; i<pixels.length; i += 4) {
		var r = pixels[i];
		var g = pixels[i+1];
		var b = pixels[i+2];
		var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
		pixels[i] = pixels[i+1] = pixels[i+2] = v
	}
	return imageData;
}

Filters.brightness = function(imageData, adjustment) {
  var pixels = imageData.data;
  for (var i=0; i < pixels.length; i += 4) {
    pixels[i] += adjustment;
    pixels[i+1] += adjustment;
    pixels[i+2] += adjustment;
  }
  return imageData;
};

Filters.convolute = function(imageData, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = imageData.data;
  var sw = imageData.width;
  var sh = imageData.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};


if (!window.Float32Array)
  Float32Array = Array;

Filters.convoluteFloat32 = function(imageData, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);

  var src = imageData.data;
  var sw = imageData.width;
  var sh = imageData.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w, height: h, data: new Float32Array(w*h*4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy*sw+scx)*4;
          var wt = weights[cy*side+cx];
          r += src[srcOff] * wt;
          g += src[srcOff+1] * wt;
          b += src[srcOff+2] * wt;
          a += src[srcOff+3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};


Filters.edge	 = function (imageData, mono, invert, rWeightNumerator, gWeightNumerator, bWeightNumerator) {

  var src = imageData.data,
      h  = imageData.height,
      w  = imageData.width,
      c  = -1/8,
      rWeight = rWeightNumerator/c,
      gWeight = gWeightNumerator/c,
      bWeight = bWeightNumerator/c;

  var output = Filters.createImageData(w, h);
  var dst = output.data;

  for (var y = h; y > 0; y--) {

    var offsetY = (y-1)*w*4;

    var prevY = (y == 1) ? 0 : y-2;
    var nextY = (y == h) ? y - 1 : y;

    var offsetYPrev = prevY*w*4;
    var offsetYNext = nextY*w*4;

    for (var x = w; x > 0; x--) {

      var offset = offsetY + (x*4-4);
      var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
      var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;

      var r = ((src[offsetPrev-4]
        + src[offsetPrev]
        + src[offsetPrev+4]
        + src[offset-4]
        + src[offset+4]
        + src[offsetNext-4]
        + src[offsetNext]
        + src[offsetNext+4]) * c
        + src[offset]
        ) 
        * rWeight;

      var g = ((src[offsetPrev-3]
        + src[offsetPrev+1]
        + src[offsetPrev+5]
        + src[offset-3]
        + src[offset+5]
        + src[offsetNext-3]
        + src[offsetNext+1]
        + src[offsetNext+5]) * c
        + src[offset+1])
        * gWeight;

      var b = ((src[offsetPrev-2]
        + src[offsetPrev+2]
        + src[offsetPrev+6]
        + src[offset-2]
        + src[offset+6]
        + src[offsetNext-2]
        + src[offsetNext+2]
        + src[offsetNext+6]) * c
        + src[offset+2])
        * bWeight;

      if (mono) {
        var brightness = (r*0.3 + g*0.59 + b*0.11);
        if (invert) brightness = 255 - brightness;
        if (brightness < 0 ) brightness = 0;
        if (brightness > 255 ) brightness = 255;
        r = g = b = brightness;
      } else {
        if (invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }
        if (r < 0 ) r = 0;
        if (g < 0 ) g = 0;
        if (b < 0 ) b = 0;
        if (r > 255 ) r = 255;
        if (g > 255 ) g = 255;
        if (b > 255 ) b = 255;
      }

      dst[offset]   = r;
      dst[offset+1] = g;
      dst[offset+2] = b;
      dst[offset+3] = 255;
    }
  }
  return output;
};


Filters.edgeeee = function (imageData, copiedImageData, mono, invert, rWeightNumerator, gWeightNumerator, bWeightNumerator) {

  var pixels     = imageData.data,
      pixelsCopy = copiedImageData.data,
      //pixelsCopyBuffer = copiedImageData.data.buffer,
      //pixelsCopy = new Uint8ClampedArray(pixelsCopyBuffer), 
      h  = imageData.height,
      w  = imageData.width,
      w4 = w*4,
      c  = -1/8,
      rWeight = rWeightNumerator/c,
      gWeight = gWeightNumerator/c,
      bWeight = bWeightNumerator/c;


  for (var y = h; y > 0; y--) {

    var offsetY = (y-1)*w4;

    var prevY = (y == 1) ? 0 : y-2;
    var nextY = (y == h) ? y - 1 : y;

    var offsetYPrev = prevY*w4;
    var offsetYNext = nextY*w4;

    for (var x = w; x > 0; x--) {

      var offset = offsetY + (x*4-4);
      var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
      var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;

      var r = ((pixelsCopy[offsetPrev-4]
        + pixelsCopy[offsetPrev]
        + pixelsCopy[offsetPrev+4]
        + pixelsCopy[offset-4]
        + pixelsCopy[offset+4]
        + pixelsCopy[offsetNext-4]
        + pixelsCopy[offsetNext]
        + pixelsCopy[offsetNext+4]) * c
        + pixelsCopy[offset]
        ) 
        * rWeight;

      var g = ((pixelsCopy[offsetPrev-3]
        + pixelsCopy[offsetPrev+1]
        + pixelsCopy[offsetPrev+5]
        + pixelsCopy[offset-3]
        + pixelsCopy[offset+5]
        + pixelsCopy[offsetNext-3]
        + pixelsCopy[offsetNext+1]
        + pixelsCopy[offsetNext+5]) * c
        + pixelsCopy[offset+1])
        * gWeight;

      var b = ((pixelsCopy[offsetPrev-2]
        + pixelsCopy[offsetPrev+2]
        + pixelsCopy[offsetPrev+6]
        + pixelsCopy[offset-2]
        + pixelsCopy[offset+6]
        + pixelsCopy[offsetNext-2]
        + pixelsCopy[offsetNext+2]
        + pixelsCopy[offsetNext+6]) * c
        + pixelsCopy[offset+2])
        * bWeight;

      if (mono) {
        var brightness = (r*0.3 + g*0.59 + b*0.11)||0;
        if (invert) brightness = 255 - brightness;
        if (brightness < 0 ) brightness = 0;
        if (brightness > 255 ) brightness = 255;
        r = g = b = brightness;
      } else {
        if (invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }
        if (r < 0 ) r = 0;
        if (g < 0 ) g = 0;
        if (b < 0 ) b = 0;
        if (r > 255 ) r = 255;
        if (g > 255 ) g = 255;
        if (b > 255 ) b = 255;
      }

      pixels[offset]   = r;
      pixels[offset+1] = g;
      pixels[offset+2] = b;
    }
  }
};