function WebGL () {
  this.gl = null;
  this.videoTexture = null;
  this.vertexBuffer = null;
  this.texCoordBuffer = null;
  this.programs = {};
}

WebGL.prototype.initGL = function (canvas, drawFrame) {

  try {
    this.gl = canvas.getContext("experimental-webgl");
  } catch (e) {
    console.log(e);
  }

  if (this.gl) {
    this.initBuffers();

    this.videoTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);  

    if (Object.keys(this.programs).length === 0) {
      // run drawFrame after create programs.
      this.createPrograms(drawFrame);
    } else {
      drawFrame();
    }

    return true;

  } else {

    alert("Unable to initialize WebGL. Your browser may not support it.");
    return false;

  }

};

WebGL.prototype.initBuffers = function () {
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, 1,1, -1,1]), this.gl.STATIC_DRAW);

  this.texCoordBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 1,1, 0,1]), this.gl.STATIC_DRAW);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
}


WebGL.prototype.createPrograms = function (drawFrame) {

  var shaders = ['shaders/default.vs',
                 'shaders/default.fs',
                 'shaders/grayscale.fs',
                 'shaders/invert.fs',
                 'shaders/monochrome.fs',
                 'shaders/sepia.fs',
                 'shaders/brightness.fs',
                 'shaders/contrast.fs',
                 'shaders/zoomblur.fs',
                 'shaders/spinblur.fs',
                 'shaders/mosaic.fs',
                 'shaders/tile.fs',
                 'shaders/posterize.fs',
                 'shaders/scatter.fs',
                 'shaders/scatter2.fs',
                 'shaders/sobel.fs',
                 'shaders/polarcoord.fs',
                 'shaders/twirl.fs',
                 'shaders/ripple.fs',
                 'shaders/opticscmpn.fs',
                 ],
      numShaders = shaders.length,
      numComplete = 0,
      fragmentShaders = {},
      vertexShaders = {};
      that = this;

  function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
  }

  this.loadShaders(
    shaders, 
    function (url, source) {
      var shaderBaseName = basename(url),
          shaderName = shaderBaseName.split('.')[0],
          shaderType = shaderBaseName.split('.')[1];

      if (shaderType === "vs") {
        vertexShaders[shaderName] = that.createShader(shaderType, source);
      } else if (shaderType === "fs") {
        fragmentShaders[shaderName] = that.createShader(shaderType, source);;
      }              

      numComplete++;

      // When all files have downloaded
      if (numComplete == numShaders) {
        // create program
        for (var fsname in fragmentShaders) {
          that.programs[fsname] = that.createProgram(vertexShaders['default'], fragmentShaders[fsname]);
        }
        // start draw
        drawFrame();
      }

    }, 
    function (url) {
      alert('Failed to download "' + url + '"');
    }
  );
}

WebGL.prototype.loadShaders = function (urls, success, error) {
  var numUrls = urls.length;
  var numComplete = 0;

  urls.forEach(function (url) {
    this.loadShader(url, success, error);
  }, this);  
}

WebGL.prototype.loadShader = function (url, success, error) {
  // Set up an asynchronous request
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  // Hook the event that gets called as the request progresses
  request.onreadystatechange = function () {
    // If the request is "DONE" (completed or failed)
    if (request.readyState == 4) {
      // If we got HTTP status 200 (OK)
      if (request.status == 200) {
        success(url, request.responseText)
      } else { // Failed
        error(url);
      }
    }
  };

  request.send(null);    
}


WebGL.prototype.createShader = function (shaderType, source) {

  var shader = null;

  if (shaderType === "vs") {
    shader = this.gl.createShader(this.gl.VERTEX_SHADER);
  } else if (shaderType === "fs") {
    shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  }

  if (shader) {
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(shader));
      shader = null;
    }
  }

  return shader;
}


WebGL.prototype.createProgram = function (vs, fs) {
  if (!vs || !fs) return null;

  var program = this.gl.createProgram();
  this.gl.attachShader(program, vs);
  this.gl.attachShader(program, fs);
  this.gl.linkProgram(program);

  if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
    return null;
  }
  return program;
}


WebGL.prototype.updateVideoTexture = function (mipmap, videoElement) {
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, videoElement);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, mipmap ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR);
  if (mipmap) this.gl.generateMipmap(this.gl.TEXTURE_2D);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

WebGL.prototype.isPowerOfTwo = function (x) {
  return (x & (x - 1)) == 0;
}

WebGL.prototype.drawScene = function (canvas, videoElement, effectElement, slider) {
  var effect = effectElement.value;
  var mipmap = this.isPowerOfTwo(videoElement.videoWidth)
            && this.isPowerOfTwo(videoElement.videoHeight)
            && (effect == "polarcoord"
             || effect == "twirl"
             || effect == "ripple"
             || effect == "opticscmpn"
             /*|| effect == "tile"*/);

  this.updateVideoTexture(mipmap, videoElement);

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  this.gl.viewport(0, 0, canvas.width, canvas.height);

  var program = this.programs[effect];
  this.gl.useProgram(program);
  var vertexLoc = this.gl.getAttribLocation(program, "vertex");
  var texCoordLoc = this.gl.getAttribLocation(program, "texCoord");
  var textureLoc = this.gl.getUniformLocation(program, "texture");
  var argLoc = this.gl.getUniformLocation(program, "arg");
  var sizeLoc = this.gl.getUniformLocation(program, "size");
  var timeLoc = this.gl.getUniformLocation(program, "time");
  this.gl.enableVertexAttribArray(vertexLoc);
  this.gl.enableVertexAttribArray(texCoordLoc);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.vertexAttribPointer(vertexLoc, 2, this.gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
  this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0);

  this.gl.activeTexture(this.gl.TEXTURE0);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
  this.gl.uniform1i(textureLoc, 0);
  if (argLoc) {
    this.gl.uniform1f(argLoc, slider/100);
  }
  if (sizeLoc) {
    this.gl.uniform2f(sizeLoc, canvas.width, canvas.height);
  }
  if (timeLoc) {
    this.gl.uniform1f(timeLoc, videoElement.currentTime);
  }

  this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);

  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  this.gl.disableVertexAttribArray(vertexLoc);
  this.gl.disableVertexAttribArray(texCoordLoc);

}
