#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  if (arg < 1.0) {
    gl_FragColor = texture2D(texture, fract((vTexCoord-0.5)/(1.0-arg) + 0.5));
  } else {
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
  }
}