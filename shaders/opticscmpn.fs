#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
const float PI = 3.14159265358979323846264;
void main(void) {
  if (arg == 0.5) {
    gl_FragColor = texture2D(texture, vTexCoord);
  } else if (arg == 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else if (arg > 0.5) {
    vec2 coordOffset = size*0.5;
    float fd = 500.0 / tan((arg-0.5) * PI);

    vec2 v = gl_FragCoord.xy - coordOffset;
    float d = length(v);
    vec2 xy = v/d * fd*tan(clamp(d/fd, -0.5*PI, 0.5*PI)) + coordOffset;
    vec2 tc = xy/size;
    if (all(greaterThanEqual(tc, vec2(0.0))) && all(lessThanEqual(tc, vec2(1.0)))) {
      gl_FragColor = texture2D(texture, xy/size);
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  } else {
    vec2 coordOffset = size*0.5;
    float fd = 500.0 / tan((0.5-arg) * PI);

    vec2 v = gl_FragCoord.xy - coordOffset;
    float d = length(v);
    vec2 xy = v/d * fd*atan(d/fd) + coordOffset;
    gl_FragColor = texture2D(texture, xy/size);
  }
}