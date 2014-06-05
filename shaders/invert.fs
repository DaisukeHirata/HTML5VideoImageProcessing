#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  vec4 color = texture2D(texture, vTexCoord);
  gl_FragColor = vec4(mix(color.rgb, 1.0-color.rgb, arg), color.a);
}