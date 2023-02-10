import fragment from './glsl/FilmicFilter.frag';
import { LuminosityHighPassFilter } from "./BloomFilterPass";
import { SeperableBlurPass } from "./SeperableBlurPass";

class CopyFilterPass extends PIXI.Filter {
    constructor() {
        const fragmentSrc = [
            'precision mediump float;',
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            'void main (void) {',
            ' vec4 color1 = texture2D(uSampler, vTextureCoord);',
            ' gl_FragColor = color1;',
            '}'
        ];

        super(undefined, fragmentSrc.join('\n'), {});
    }
}

class BlurBlendFilterPass extends PIXI.Filter {
    constructor() {
        super(undefined, (fragment as string) + ('\n'), {});
    }
}

const MIPS = 5;
const kernelSizeArray: number[] = [3, 5, 8, 13, 21];

export class FilmicFilter extends PIXI.Filter
{
    public static instance: FilmicFilter;

    public blurXFilter: PIXI.filters.BlurFilterPass;
    public blurYFilter: PIXI.filters.BlurFilterPass;

    private _repeatEdgePixels: boolean;

    private _copyPass: CopyFilterPass;
    private _blendPass: BlurBlendFilterPass;

    private _luminosityHighPassFilter: LuminosityHighPassFilter;
    private _seperableBlurPassHList: SeperableBlurPass[];
    private _seperableBlurPassVList: SeperableBlurPass[];
    //private _bloomCompositePass: BloomCompositePass;

    constructor(strength?: number, quality?: number, resolution?: number, kernelSize?: number)
    {
    super();

    this.resolution = resolution || PIXI.settings.RESOLUTION;
    this.blurXFilter = new PIXI.filters.BlurFilterPass(true, strength || 8, quality || 4, this.resolution, kernelSize);
    this.blurYFilter = new PIXI.filters.BlurFilterPass(false, strength || 8, quality || 4, this.resolution, kernelSize);

    this._repeatEdgePixels = false;
    this.updatePadding();

    this.blendMode = this.blurYFilter.blendMode;
    this._copyPass = new CopyFilterPass();
    this._blendPass = new BlurBlendFilterPass();

    this._luminosityHighPassFilter = new LuminosityHighPassFilter();

    this._seperableBlurPassHList = [];
    this._seperableBlurPassVList = [];
    for (let i = 0; i < MIPS; i++) {
        this._seperableBlurPassHList.push(new SeperableBlurPass(kernelSizeArray[i], kernelSizeArray[i], true));
        this._seperableBlurPassVList.push(new SeperableBlurPass(kernelSizeArray[i], kernelSizeArray[i], false));
    }
    }

    apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clear: boolean, currentState?: any): void
    {
        /* input は次のような状態で渡されてくる。
        * input.width: 816
        * input.height: 624
        * input.baseTexture.width: 816
        * input.baseTexture.height: 624
        * input.resolution: 1
        */

        const params = $gameScreen._lnFilmicFilter.params;

        const xStrength = Math.abs(this.blurXFilter.blur);
        const yStrength = Math.abs(this.blurYFilter.blur);
        if (xStrength && yStrength)
        {
            // Prepare Bloom
            const brightTexture = filterManager.getFilterTexture(input);
            {
            let resolution = 0.5;
            for (let i = 0; i < MIPS; i++) {
                this._seperableBlurPassHList[i].prepare(filterManager, input, resolution);
                this._seperableBlurPassVList[i].prepare(filterManager, input, resolution);
                resolution *= 0.5;
            }

            // 高輝度部分を抽出したテクスチャを作る
            this._luminosityHighPassFilter.prepare(params.luminosityThreshold, params.luminositySmoothWidth);
            this._luminosityHighPassFilter.apply(filterManager, input, brightTexture, clear);
            //this._luminosityHighPassFilter.apply(filterManager, input, output, clear);

            // ブラー適用
            let inputRenderTarget = brightTexture;
            for (let i = 0; i < MIPS; i++) {
                const rtH = this._seperableBlurPassHList[i].renderTexture();
                const rtV = this._seperableBlurPassVList[i].renderTexture();
                this._seperableBlurPassHList[i].apply(filterManager, inputRenderTarget, rtH, clear);
                this._seperableBlurPassVList[i].apply(filterManager, rtH, rtV, clear);
                inputRenderTarget = rtV;
            }

            this.prepareBloomCompositeParams(params.bloomStrength, params.bloomRadius, [
                this._seperableBlurPassVList[0].renderTexture(),
                this._seperableBlurPassVList[1].renderTexture(),
                this._seperableBlurPassVList[2].renderTexture(),
                this._seperableBlurPassVList[3].renderTexture(),
                this._seperableBlurPassVList[4].renderTexture(),
            ]);
            }

            const renderTarget1 = filterManager.getFilterTexture(input);
            const renderTarget2 = filterManager.getFilterTexture(input);

            // BlurFilterPass の実装は input を swap で再利用するので、
            // 元の画像が書き換わらないように退避する。
            this._copyPass.apply(filterManager, input, renderTarget2, true);

            this.blurXFilter.apply(filterManager, renderTarget2, renderTarget1, clear);
            this.blurYFilter.apply(filterManager, renderTarget1, renderTarget2, clear);

            
            const paramA = params.shoulderStrength;  // shoulderStrength
            const paramB = params.linearStrength;  // linearStrength
            const paramCB = params.linearStrength * params.linearAngle;    // param.linearStrength * param.linearAngle
            const paramDE = params.toeStrength * params.toeNumerator;    // param.toeStrength * param.toeNumerator
            const paramDF = params.toeStrength * params.toeDenominator;    // param.toeStrength * param.toeDenominator
            const paramEperF = params.toeNumerator * params.toeDenominator;  // param.toeNumerator / param.toeDenominator

            this._blendPass.uniforms.inputSampler = input;
            this._blendPass.uniforms.paramA = paramA;
            this._blendPass.uniforms.paramB = paramB;
            this._blendPass.uniforms.paramCB = paramCB;
            this._blendPass.uniforms.paramDE = paramDE;
            this._blendPass.uniforms.paramDF = paramDF;
            this._blendPass.uniforms.paramEperF = paramEperF;
            const w = params.linearWhite;
            this._blendPass.uniforms.paramF_White = ((w * (paramA * w + paramCB) + paramDE)
            / (w * (paramA * w + paramB) + paramDF))
            - paramEperF;
            this._blendPass.uniforms.Exposure = params.exposure;
            this._blendPass.uniforms._Tone = [params.toneColorR, params.toneColorG, params.toneColorB, params.toneGray];

            
            this._blendPass.uniforms.size = params.vignetteSize;
            this._blendPass.uniforms.amount = params.vignetteAmount;

            this._blendPass.uniforms._TiltScale = params.tiltScale;
            this._blendPass.uniforms._TiltOffset = params.tiltOffset;

            this._blendPass.apply(filterManager, renderTarget2, output, clear);

            filterManager.returnFilterTexture(renderTarget1);
            filterManager.returnFilterTexture(renderTarget2);

            for (let i = 0; i < MIPS; i++) {
                this._seperableBlurPassHList[i].retain(filterManager);
                this._seperableBlurPassVList[i].retain(filterManager);
            }

            filterManager.returnFilterTexture(brightTexture);
        }
    }

     
    private prepareBloomCompositeParams(bloomStrength: number, bloomRadius: number, texturs: PIXI.RenderTexture[]): void {
        this._blendPass.uniforms._BloomStrength = bloomStrength;
        this._blendPass.uniforms._BloomRadius = bloomRadius;
        this._blendPass.uniforms._BlurTexture1 = texturs[0];
        this._blendPass.uniforms._BlurTexture2 = texturs[1];
        this._blendPass.uniforms._BlurTexture3 = texturs[2];
        this._blendPass.uniforms._BlurTexture4 = texturs[3];
        this._blendPass.uniforms._BlurTexture5 = texturs[4];
        this._blendPass.uniforms._BloomTintColorsAndFactors1 = [1.0, 1.0, 1.0, 1.0];
        this._blendPass.uniforms._BloomTintColorsAndFactors2 = [1.0, 1.0, 1.0, 0.8];
        this._blendPass.uniforms._BloomTintColorsAndFactors3 = [1.0, 1.0, 1.0, 0.6];
        this._blendPass.uniforms._BloomTintColorsAndFactors4 = [1.0, 1.0, 1.0, 0.4];
        this._blendPass.uniforms._BloomTintColorsAndFactors5 = [1.0, 1.0, 1.0, 0.2];
    }
 
    private updatePadding()
    {
        if (this._repeatEdgePixels) {
            this.padding = 0;
        }
        else {
            this.padding = Math.max(Math.abs(this.blurXFilter.blur), Math.abs(this.blurYFilter.blur)) * 2;
        }
    }
 }
 