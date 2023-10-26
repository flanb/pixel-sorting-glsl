varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTextureRatio;
uniform float uHue;

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

float planeRatio = 3. / 2.;

void main() {
    vec2 uv = vUv;

    uv.x /= uTextureRatio / planeRatio;
    uv.x += (1. - planeRatio / uTextureRatio) / 2.;

    gl_FragColor = texture2D(uTexture, uv);
    vec3 sortedColorHSL = rgb2hsl(gl_FragColor.rgb);
    sortedColorHSL.x = uHue;
//    gl_FragColor.rgb = hsl2rgb(sortedColorHSL);
}
