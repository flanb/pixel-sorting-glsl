uniform float uIteration;
uniform float uThreshold;
uniform vec2 uDirection;
uniform float uHue;
uniform sampler2D uMaskTexture;

// Function to calculate grayscale from an RGB color
float gscale(vec3 c) {
    return dot(c, vec3(0.3333));
}

void main() {
    vec2 coord = gl_FragCoord.xy;
    vec2 uv = coord / resolution.xy;
    vec4 maskColor = texture2D(uMaskTexture, uv);

    vec2 direction = uDirection;
    // If the mask color is white, direction is horizontal, x is y and y is x
    vec2 swapped = vec2(direction.y, direction.x);
    direction = mix(direction, swapped, step(0.5, gscale(maskColor.rgb)));

    float coordAxis = direction.x == 0. ? coord.y : coord.x;
    bool checkPrevious = mod(coordAxis + uIteration, 2.0) < 1.0;// Check whether to compare with the previous frame
    vec2 pixelOffset = direction / resolution.xy;// Offset for sampling adjacent pixel

    vec4 currentTexture = texture2D(uTexture, uv);// Color of the current pixel
    vec4 referenceTexture = texture2D(uTexture, checkPrevious ? uv - pixelOffset : uv + pixelOffset);// Color of the adjacent pixel

    float gCurrent = gscale(currentTexture.rgb);
    float gReference = gscale(referenceTexture.rgb);

    float floorThreshold = floor(uThreshold * 100.) / 100.;

    if (checkPrevious) {
        // If the grayscale value of the current pixel is above the uThreshold and the grayscale value of the adjacent pixel is higher,
        if (gCurrent >= floorThreshold && gReference > gCurrent) {
            gl_FragColor = referenceTexture;// Set the current pixel color to the adjacent pixel's color
        } else {
            gl_FragColor = currentTexture;// If no change occurs, keep the current pixel color
        }
    } else {
        // If the grayscale value of the adjacent pixel is above the uThreshold and the grayscale value of the current pixel is higher or equal,
        if (gReference >= floorThreshold && gCurrent >= gReference) {
            gl_FragColor = referenceTexture;// Set the current pixel color to the adjacent pixel's color
        } else {
            gl_FragColor = currentTexture;// If no change occurs, keep the current pixel color
        }
    }
}
