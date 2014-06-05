#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
void main(void) {
  vec2 v = (0.5 - vTexCoord) * size;
  float d = length(v);
  float amount = arg * 0.5;

  vec4 color = texture2D(texture, vTexCoord);

  if (d > 0.0) {
    v /= size;
    int n = 0;
    int n1 = int(min(amount*d+1.0, 40.0));
    vec2 v1 = v*amount/float(n1);
    for (int i = 1; i <= 40; ++i) {
      if (i>n1) break;
      color += texture2D(texture, vTexCoord + v1*float(i));
    }
    n += n1;
    color /= float(n+1);
  }

  gl_FragColor = color;
}