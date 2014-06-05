#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
void main(void) {
  vec4 color = texture2D(texture, vTexCoord);
  if (arg > 0.0) {
    float level = (1.0-arg)*9.0+1.0;
    color.rgb = floor(color.rgb * level + 0.5) / level;
  }
  gl_FragColor = color;
}