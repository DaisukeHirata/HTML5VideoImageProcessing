#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float arg;
uniform vec2 size;
void main(void) {
  float dx = 1.0/size.x;
  float dy = 1.0/size.y;

  vec3 c1 = texture2D(texture, vTexCoord + vec2( dx, -dy)).rgb
          + texture2D(texture, vTexCoord + vec2( dx, 0.0)).rgb * 2.0
          + texture2D(texture, vTexCoord + vec2( dx,  dy)).rgb
          - texture2D(texture, vTexCoord + vec2(-dx, -dy)).rgb
          - texture2D(texture, vTexCoord + vec2(-dx, 0.0)).rgb * 2.0
          - texture2D(texture, vTexCoord + vec2(-dx,  dy)).rgb;

  vec3 c2 = texture2D(texture, vTexCoord + vec2(-dx,  dy)).rgb
          + texture2D(texture, vTexCoord + vec2(0.0,  dy)).rgb * 2.0
          + texture2D(texture, vTexCoord + vec2( dx,  dy)).rgb
          - texture2D(texture, vTexCoord + vec2(-dx, -dy)).rgb
          - texture2D(texture, vTexCoord + vec2(0.0, -dy)).rgb * 2.0
          - texture2D(texture, vTexCoord + vec2( dx, -dy)).rgb;

  float a = texture2D(texture, vTexCoord).a;
  gl_FragColor = vec4(max(vec3(0.0), sqrt(c1*c1+c2*c2)-(1.0-arg))/arg, a);
}