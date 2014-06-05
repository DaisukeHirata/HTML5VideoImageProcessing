#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
void main(void) {
  gl_FragColor = texture2D(texture, vTexCoord);
}