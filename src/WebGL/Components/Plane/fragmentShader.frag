varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;

void main() {
	vec2 uv = vUv;

	gl_FragColor = texture2D(uTexture, uv);
}
