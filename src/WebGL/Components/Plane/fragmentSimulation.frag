
const vec4  kRGBToYPrime = vec4(0.299, 0.587, 0.114, 0.0);
const vec4  kRGBToI = vec4(0.596, -0.275, -0.321, 0.0);
const vec4  kRGBToQ = vec4(0.212, -0.523, 0.311, 0.0);

// Based on https://github.com/genekogan/Processing-Shader-Examples/blob/master/TextureShaders/data/hue.glsl
vec4 getYIQC(vec4 color) {
	float YPrime = dot(color, kRGBToYPrime);
	float I = dot(color, kRGBToI);
	float Q = dot(color, kRGBToQ);

	float chroma = sqrt(I * I + Q * Q);

	return vec4(YPrime, I, Q, chroma);
}

// Compare colors by light intensity and color intensity
bool compareColor(vec4 a, vec4 b) {
	vec4 aYIQC = getYIQC(a);
	vec4 bYIQC = getYIQC(b);

	if (aYIQC.x > bYIQC.x) {
		return true;
	}

	if (aYIQC.x == bYIQC.x && aYIQC.w > bYIQC.w) {
		return true;
	}

	return false;
}

uniform float uIteration;

void main() {
	vec2 coord = gl_FragCoord.xy;
	bool checkPrevious = mod(coord.x + uIteration, 2.0) < 1.0;
	vec2 pixel = vec2(-1.0, 0.) / resolution.xy;

	vec2 uv = coord / resolution.xy;
	vec4 current = texture2D(uTexture, uv);
	vec4 reference = texture2D(uTexture, checkPrevious ? uv - pixel : uv + pixel);

	if (checkPrevious) {
		if (compareColor(reference, current)) {
			gl_FragColor = reference;
			return;
		}
	} else {
		if (compareColor(current, reference)) {
			gl_FragColor = reference;
			return;
		}
	}

	gl_FragColor = current;
}
