
precision mediump float;
uniform sampler2D inputSampler;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

//--------------------------------------------------------------------------------
// Bloom

#define NUM_MIPS 5

uniform sampler2D _BlurTexture1;
uniform sampler2D _BlurTexture2;
uniform sampler2D _BlurTexture3;
uniform sampler2D _BlurTexture4;
uniform sampler2D _BlurTexture5;

uniform vec4 _BloomTintColorsAndFactors1;
uniform vec4 _BloomTintColorsAndFactors2;
uniform vec4 _BloomTintColorsAndFactors3;
uniform vec4 _BloomTintColorsAndFactors4;
uniform vec4 _BloomTintColorsAndFactors5;
uniform float _BloomStrength;
uniform float _BloomRadius;


float LerpBloomFactor(float factor)
{
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, _BloomRadius);
}

vec3 Bloom(vec2 uv)
{
    vec4 col = _BloomStrength * ( LerpBloomFactor(_BloomTintColorsAndFactors1.a) * vec4(_BloomTintColorsAndFactors1.rgb, 1.0) * texture2D(_BlurTexture1, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors2.a) * vec4(_BloomTintColorsAndFactors2.rgb, 1.0) * texture2D(_BlurTexture2, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors3.a) * vec4(_BloomTintColorsAndFactors3.rgb, 1.0) * texture2D(_BlurTexture3, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors4.a) * vec4(_BloomTintColorsAndFactors4.rgb, 1.0) * texture2D(_BlurTexture4, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors5.a) * vec4(_BloomTintColorsAndFactors5.rgb, 1.0) * texture2D(_BlurTexture5, uv) );
    return col.rgb * col.a;
}

//--------------------------------------------------------------------------------

uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;

uniform float size;
uniform float amount;
const float focalPointX = 0.5;
const float focalPointY = 0.5;

#define saturate(x) clamp(x, 0.0, 1.0)

// Tonemap Params
uniform float    paramA;  // shoulderStrength
uniform float    paramB;  // linearStrength
uniform float    paramCB;    // param.linearStrength * param.linearAngle
uniform float    paramDE;    // param.toeStrength * param.toeNumerator
uniform float    paramDF;    // param.toeStrength * param.toeDenominator
uniform float    paramEperF;  // param.toeNumerator / param.toeDenominator
uniform float    paramF_White;//
uniform float   Exposure;
uniform vec4 _Tone;

// TiltShift Params
uniform float _TiltOffset;  // = -0.2 // 中心をちょっと下に下げる
uniform float _TiltScale;   // = 2.0

const float epsilon = 0.00001;

vec3 CalcUncharted2FilmicPreParam( vec3 rgb,
    float paramA, float paramB, float paramCB,
    float paramDE, float paramDF, float paramEperF, float paramF_White )
{
    vec3 div = (rgb * (paramA * rgb + paramB) + paramDF);
    div = max(div, vec3(epsilon, epsilon, epsilon));

    vec3    ret = ((rgb * (paramA * rgb + paramCB) + paramDE) / div) - paramEperF;
    return ret / max(paramF_White, epsilon);
}

vec3 Tonemap(vec3 color)
{
    float expBias = exp2(Exposure);
    vec3 rgb = color.rgb * expBias;

    rgb = CalcUncharted2FilmicPreParam(rgb,
        paramA, paramB, paramCB, paramDE, paramDF, paramEperF, paramF_White);
    
    return rgb;
}


vec3 calculateToneColor(vec3 inColor, vec4 inToneColor)
{
    vec3 outColor = inColor;
    float y = (0.208012 * outColor.r + 0.586611 * inColor.g + 0.114478 * inColor.b) * inToneColor.w;
    outColor = (inColor * (1.0 - inToneColor.w)) + y + inToneColor.rgb;
    return saturate(outColor);
}

// https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#conversion-functions
// PIXI.js は RenderTarget も 2累乗で作る。それを、スクリーンのサイズに正規化するもの。
vec2 filterTextureCoord() {
    return vTextureCoord * inputSize.xy / outputFrame.zw;
}

vec3 vignette(vec3 color, vec2 uv) {
    float dist = distance(uv, vec2(focalPointX, focalPointY));
    color *= smoothstep(0.8, size * 0.799, dist * (0.5 * amount + size));
    return color;
}

void main (void) {
    vec2 uv = filterTextureCoord();
    vec4 color1 = texture2D(inputSampler, vTextureCoord);
    vec4 color2 = texture2D(uSampler, vTextureCoord);

    // Tilt
    float r = abs((uv.y * 2.0) - 1.0 + _TiltOffset) * _TiltScale;
    gl_FragColor = mix(color1, color2, saturate(r));
    
    gl_FragColor.rgb += Bloom(vTextureCoord);


    gl_FragColor.rgb = calculateToneColor(gl_FragColor.rgb, _Tone);

    gl_FragColor.rgb = Tonemap(gl_FragColor.rgb);
    

    gl_FragColor.rgb = vignette(gl_FragColor.rgb, uv);
}
