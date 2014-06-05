#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
void main(void) {
  vec2 coordRect = vTexCoord * size;
  vec2 center = size * 0.5;
  vec2 fromCenter = coordRect - center;

  vec2 coordPolar = vec2(
          atan(fromCenter.x, fromCenter.y) * size.x / (2.0*3.14159265358979323846264) + center.x,
          length(fromCenter) * 2.0);

  vec2 tc = mix(coordRect, coordPolar, arg) / size;
  if (all(greaterThanEqual(tc, vec2(0.0))) && all(lessThanEqual(tc, vec2(1.0)))) {
    gl_FragColor = texture2D(texture, tc);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}