#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
void main(void) {
  vec2 xy = gl_FragCoord.xy;
  vec2 center = size * 0.5;
  float radius = 0.5 * max(size.x, size.y);
  float d = distance(xy, center);
  float a = (arg-0.5) * 4.0 * 3.14159265358979323846264 * pow(max(0.0, radius-d)/radius, 2.0);
  float cos = cos(a);
  float sin = sin(a);
  vec2 tc = (mat2(cos,-sin,sin,cos)*(xy-center)+center) / size;
  gl_FragColor = texture2D(texture, tc);
}