#ifdef GL_ES
precision highp float;
precision highp int;
#endif

attribute vec2 vertex;
attribute vec2 texCoord;
varying vec2 vTexCoord;
void main(void) {
  gl_Position = vec4(vertex, 0.0, 1.0);
  vTexCoord = texCoord;
}