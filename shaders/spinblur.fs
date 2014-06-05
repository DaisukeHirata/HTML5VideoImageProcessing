#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
void main(void) {
  vec4 color = texture2D(texture, vTexCoord);
  vec2 v = size * (vTexCoord - 0.5);
  float r = length(v);
  float amount = arg * 3.14159265358979323846264 * 0.125;

  if (r > 0.0) {
    float arc = r*amount;
    int n = int(min(arc+1.0, 20.0));
    for (int i = 1; i < 20; ++i) {
      if (i == n) break;

      float t = amount*float(i)/float(n);

      mat2 m1 = mat2(cos(t), sin(t), -sin(t), cos(t));
      color += texture2D(texture, (v * m1) / size + 0.5);

      mat2 m2 = mat2(cos(t), -sin(t), sin(t), cos(t));
      color += texture2D(texture, (v * m2) / size + 0.5);
    }

    mat2 m1 = mat2(cos(amount), sin(amount), -sin(amount), cos(amount));
    color += texture2D(texture, (v * m1) / size + 0.5) * 0.5;

    mat2 m2 = mat2(cos(amount), -sin(amount), sin(amount), cos(amount));
    color += texture2D(texture, (v * m2) / size + 0.5) * 0.5;

    color /= float(2*n);
  }

  gl_FragColor = color;
}