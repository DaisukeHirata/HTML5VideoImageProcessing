#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  if (arg > 0.0) {
    float blockSize = arg*0.1;
    gl_FragColor = texture2D(texture, (floor((vTexCoord-0.5)/blockSize)+0.5)*blockSize+0.5);
  } else {
    gl_FragColor = texture2D(texture, vTexCoord);
  }
}