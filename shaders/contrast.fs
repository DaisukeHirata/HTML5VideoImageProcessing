#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  vec4 color = texture2D(texture, vTexCoord);
  float slope = arg > 0.5 ? 1.0/(2.0-2.0*arg) : 2.0*arg;
  gl_FragColor = vec4((color.rgb-0.5)*slope+0.5, color.a);
}