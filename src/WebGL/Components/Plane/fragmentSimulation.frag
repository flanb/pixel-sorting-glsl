uniform float uIteration; 
uniform float uThreshold; 
uniform vec2 uDirection; 

// Function to calculate grayscale from an RGB color
float gscale (vec3 c) {
    return (c.r + c.g + c.b) / 3.0;
}

// Convert RGB to HSL
vec3 rgb2hsl(vec3 color) {
    float minVal = min(min(color.r, color.g), color.b);
    float maxVal = max(max(color.r, color.g), color.b);
    float delta = maxVal - minVal;

    vec3 hsl = vec3(0.0, 0.0, (maxVal + minVal) / 2.0);

    if(delta > 0.00001) {
        if(hsl.z < 0.5) hsl.y = delta / (maxVal + minVal);
        else           hsl.y = delta / (2.0 - maxVal - minVal);

        vec3 deltaColor = (((maxVal - color) / 6.0) + (delta / 2.0)) / delta;

        if(color.r == maxVal) hsl.x = deltaColor.b - deltaColor.g;
        else if(color.g == maxVal) hsl.x = (1.0 / 3.0) + deltaColor.r - deltaColor.b;
        else if(color.b == maxVal) hsl.x = (2.0 / 3.0) + deltaColor.g - deltaColor.r;

        if(hsl.x < 0.0) hsl.x += 1.0;
        if(hsl.x > 1.0) hsl.x -= 1.0;
    }

    return hsl;
}

// Convert HSL to RGB
vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;

    if(hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
        float p = 2.0 * hsl.z - q;

        float h = hsl.x;
        float t[3];
        t[0] = h + 1.0 / 3.0;
        t[1] = h;
        t[2] = h - 1.0 / 3.0;

        for(int i = 0; i < 3; i++) {
            if(t[i] < 0.0) t[i] += 1.0;
            if(t[i] > 1.0) t[i] -= 1.0;

            if(t[i] < 1.0 / 6.0) rgb[i] = p + (q - p) * 6.0 * t[i];
            else if(t[i] < 0.5) rgb[i] = q;
            else if(t[i] < 2.0 / 3.0) rgb[i] = p + (q - p) * (2.0 / 3.0 - t[i]) * 6.0;
            else rgb[i] = p;
        }
    }

    return rgb;
}


void main() {
    vec2 coord = gl_FragCoord.xy;
    float coordAxis = uDirection.x == 0. ? coord.y : coord.x;
    bool checkPrevious = mod(coordAxis + uIteration, 2.0) < 1.0; // Check whether to compare with the previous frame

    vec2 pixelOffset = uDirection / resolution.xy; // Offset for sampling adjacent pixel

    vec2 uv = coord / resolution.xy;
    vec4 currentTexture = texture2D(uTexture, uv); // Color of the current pixel
    vec4 referenceTexture = texture2D(uTexture, checkPrevious ? uv - pixelOffset : uv + pixelOffset); // Color of the adjacent pixel

    float gCurrent = gscale(currentTexture.rgb);
    float gReference = gscale(referenceTexture.rgb);

    if (checkPrevious) {
        // If the grayscale value of the current pixel is above the uThreshold and the grayscale value of the adjacent pixel is higher,
        if (gCurrent > uThreshold && gReference > gCurrent) {
            gl_FragColor = referenceTexture; // Set the current pixel color to the adjacent pixel's color
        } else {
            gl_FragColor = currentTexture; // If no change occurs, keep the current pixel color
        }
    } else {
        // If the grayscale value of the adjacent pixel is above the uThreshold and the grayscale value of the current pixel is higher or equal,
        if (gReference > uThreshold && gCurrent >= gReference) {
            gl_FragColor = referenceTexture; // Set the current pixel color to the adjacent pixel's color
        } else {
            gl_FragColor = currentTexture; // If no change occurs, keep the current pixel color
        }
    }

    vec3 sortedColorHSL = rgb2hsl(gl_FragColor.rgb);
    sortedColorHSL.x = 1.0 / 2.0; // Set hue to green
    gl_FragColor.rgb = hsl2rgb(sortedColorHSL);
}
