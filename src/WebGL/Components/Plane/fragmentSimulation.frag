#define THRESHOLD 0.3 // Threshold value for determining color change

uniform float uIteration; // A uniform variable for iteration control

// Function to calculate grayscale from an RGB color
float gscale (vec3 c) {
	return (c.r + c.g + c.b) / 3.0;
}

void main() {
	vec2 coord = gl_FragCoord.xy;
	vec2 direction = vec2(0., 1.); // Direction for comparing with adjacent pixel
	float coordAxis = direction.x == 0. ? coord.y : coord.x;
	bool checkPrevious = mod(coordAxis + uIteration, 2.0) < 1.0; // Check whether to compare with the previous frame

	vec2 pixelOffset = direction / resolution.xy; // Offset for sampling adjacent pixel

	vec2 uv = coord / resolution.xy;
	vec4 currentTexture = texture2D(uTexture, uv); // Color of the current pixel
	vec4 referenceTexture = texture2D(uTexture, checkPrevious ? uv - pixelOffset : uv + pixelOffset); // Color of the adjacent pixel

	float gCurrent = gscale(currentTexture.rgb);
	float gReference = gscale(referenceTexture.rgb);

	if (checkPrevious) {
		// If the grayscale value of the current pixel is above the threshold and the grayscale value of the adjacent pixel is higher,
		if (gCurrent > THRESHOLD && gReference > gCurrent) {
			gl_FragColor = referenceTexture; // Set the current pixel color to the adjacent pixel's color
			return;
		}
	} else {
		// If the grayscale value of the adjacent pixel is above the threshold and the grayscale value of the current pixel is higher or equal,
		if (gReference > THRESHOLD && gCurrent >= gReference) {
			gl_FragColor = referenceTexture; // Set the current pixel color to the adjacent pixel's color
			return;
		}
	}

	gl_FragColor = currentTexture; // If no change occurs, keep the current pixel color
}
