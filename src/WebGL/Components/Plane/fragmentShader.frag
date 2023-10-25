varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTextureRatio;

float planeRatio = 3. / 2.;

void main() {
    vec2 uv = vUv;

    uv.x /= uTextureRatio / planeRatio;
    uv.x += (1. - planeRatio / uTextureRatio) / 2.;

    gl_FragColor = texture2D(uTexture, uv);
}
