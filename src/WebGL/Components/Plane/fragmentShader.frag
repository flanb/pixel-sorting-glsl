varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;

// grayscale average of the colors
float gscale(vec3 color) {
	return (color.r+color.g+color.b)/3.;
}

//-1 is odd 1 is even
float isEven(float number) {
	return mod(number, 2.) * 2. - 1.;
}
//pixel sorting
void main() {
	vec2 uv = vUv;


	// we differentiate every 1/2 pixel on the horizontal axis, will be -1 or 1
	float pixelDifference = mod(floor(uv.x * gl_FragCoord.x), 2.) * 2. - 1.;

	float fParity = mod(float(uTime), 2.) * 2. - 1.;


	vec2 direction = vec2(1, 0);
	direction *= fParity * pixelDifference;
	direction /= gl_FragCoord.xy;

	vec4 texColor = texture2D(uTexture, uv);
	vec4 texColor2 = texture2D(uTexture, uv +direction);


	if (gscale(texColor2.rgb) > gscale(texColor.rgb)) {
		vec3 color = vec3(1.);
		gl_FragColor = vec4(texColor.rgb, 1.);
	} else {
		vec3 color = vec3(0.);
		gl_FragColor = vec4(texColor2.rgb, 1.);
	}
}
