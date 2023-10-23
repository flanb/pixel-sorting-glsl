#define THRESHOLD 0.8

uniform float uIteration;

float gscale(vec3 c) {
    return (c.r + c.g + c.b) / 3.;
}

const vec4  kRGBToYPrime = vec4(0.299, 0.587, 0.114, 0.0);
const vec4  kRGBToI = vec4(0.596, -0.275, -0.321, 0.0);
const vec4  kRGBToQ = vec4(0.212, -0.523, 0.311, 0.0);

vec4 getYIQC(vec4 color) {
    float YPrime = dot(color, kRGBToYPrime);
    float I = dot(color, kRGBToI);
    float Q = dot(color, kRGBToQ);

    float chroma = sqrt(I * I + Q * Q);

    return vec4(YPrime, I, Q, chroma);
}

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

vec4 findReplacement(vec2 uv, vec2 direction) {
    vec4 originalColor = texture2D(uTexture, uv);
    float gOriginal = gscale(originalColor.rgb);
    
    vec2 nextUV = uv + direction;

    // Ensure we stay within the texture bounds
    while(nextUV.x >= 0.0 && nextUV.x <= 1.0) {
        vec4 nextColor = texture2D(uTexture, nextUV);
        float gNext = gscale(nextColor.rgb);

        if(gNext <= THRESHOLD || !compareColor(originalColor, nextColor)) {
            return nextColor;
        }

        nextUV += direction;
    }

    return originalColor;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 curr = texture2D(uTexture, uv);

    if(gscale(curr.rgb) <= THRESHOLD) {
        gl_FragColor = curr;
        return;
    }

    bool checkPrevious = mod(gl_FragCoord.x + uIteration, 2.0) < 1.0;
    vec2 direction = checkPrevious ? vec2(-1.0, 0.0) / resolution.xy : vec2(1.0, 0.0) / resolution.xy;

    vec4 replacement = findReplacement(uv, direction);

    gl_FragColor = replacement;
}
