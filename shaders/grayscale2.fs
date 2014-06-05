#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  vec4 color = texture2D(texture, vTexCoord);
  float y = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(mix(color.rgb, vec3(y), arg), color.a);
}