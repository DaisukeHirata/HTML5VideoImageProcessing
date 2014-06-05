#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
uniform float time;
void main(void) {
  vec2 coordOffset = -size*0.5;
  vec2 v = gl_FragCoord.xy + coordOffset;
  float d = length(v);
  float radius = 0.5 * max(size.x, size.y);

  v += max(0.0, (radius-d)/radius) * arg * 30.0 * cos(3.14159265358979323846264*(d/20.0 - 2.0*time));

  vec2 texCoord = (v - coordOffset) / size;
  gl_FragColor = texture2D(texture, texCoord);
}
