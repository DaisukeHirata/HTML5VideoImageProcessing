#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;

float rand1(vec2 coord, float seed) {
  return fract(sin(dot(coord, vec2(12.9898, 78.233)) + seed) * 43758.5453);
}

void main(void) {
  vec2 xy = gl_FragCoord.xy;
  float nh = rand1(xy, 0.0);
  float nv = rand1(xy, 100.0);
  vec2 tc = (xy + (vec2(nh, nv)-0.5)*arg*100.0) / size;
  gl_FragColor = texture2D(texture, tc);
}