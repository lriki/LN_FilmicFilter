import fragment from './glsl/test.frag';
import dat from 'dat.gui';
//import { Window } from 'nw.gui';
import { LuminosityHighPassFilter } from "./BloomFilterPass";
import { SeperableBlurPass } from "./SeperableBlurPass";

interface HTMLElementEvent<T extends HTMLElement> extends Event {
    target: T;
}

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

/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
 export class BlurFilter extends PIXI.Filter
 {
    public blurXFilter: PIXI.filters.BlurFilterPass;
    public blurYFilter: PIXI.filters.BlurFilterPass;

    private _repeatEdgePixels: boolean;

    private _copyPass: CopyFilterPass;
    private _blendPass: BlurBlendFilterPass;

    private _luminosityHighPassFilter: LuminosityHighPassFilter;
    private _seperableBlurPassHList: SeperableBlurPass[];
    private _seperableBlurPassVList: SeperableBlurPass[];
    //private _bloomCompositePass: BloomCompositePass;

    gui: dat.GUI;

     /**
      * @param {number} [strength=8] - The strength of the blur filter.
      * @param {number} [quality=4] - The quality of the blur filter.
      * @param {number} [resolution] - The resolution of the blur filter.
      * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
      */
     constructor(strength?: number, quality?: number, resolution?: number, kernelSize?: number)
     {
        super();

        const element = document.getElementById("gameCanvas");
        if (!element) throw new Error("gameCanvas element not found.");

        this.gui = new dat.GUI({ autoPlace: true });
        //this.gui.domElement = element;
        //element.append(this.gui.domElement);
        const guiContainer = this.gui.domElement.parentElement;
        if (!guiContainer) throw new Error("guiContainer element not found.");

        //this.gui.domElement.addEventListener('mousedown', e => { e.stopImmediatePropagation(); }, true);

        guiContainer.style.zIndex = "2";

        const handlers = {
            save: () => { 
                const a = document.createElement('a');
                a.href = 'data:application/json,' + encodeURIComponent(JsonEx.stringify($gameScreen._lnFilmicFilterParams));
                a.download = '1-Filter.json';
                a.onchange = e => {
                    console.log("onchange", e);
                };
                a.addEventListener("change", function(evt) {
                    console.log("go", evt);
                }, false);

                a.click();
                /*
               console.log("cre s");
               //var nwWindow = require('nw.gui').Window.get();
               console.log("nwWindow", Window);

                const a = document.createElement('input');
                var attr = document.createAttribute('nwsaveas')
                a.attributes.setNamedItem(attr);
                a.id = "imgSaveDialog";
                a.accept = "text/plain";
                a.style.display = "none";

                a.addEventListener('change', function () {
                    var dist = this.value;
                    console.log("change");
                    /*
                    nwWindow.capturePage(function (buffer) {
                        fs.writeFile(dist, buffer, 'base64');
                    }, {
                        format: 'png',
                        datatype: 'buffer'
                    });
                });

                a.click();
                console.log("cre e");
                */
            },
            load: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json, application/json';
                /*
                element.addEventListener('click', function(event: any) {
                    alert(event.target.value); 
                }, false);
                */
                
                input.onchange = function(event: any) {
                        const reader = new FileReader();
                        reader.readAsText(event.target.files[0]);
                        reader.onload = () => {
                            const v = reader.result;
                            if (typeof(v) == "string") {
                                $gameScreen._lnFilmicFilterParams = JsonEx.parse(v);
                            }
                         };
                };
                input.click();
            }
        };
        this.gui.add(handlers, "save");
        this.gui.add(handlers, "load");

        const params = $gameScreen._lnFilmicFilterParams;
        const bloom = this.gui.addFolder("bloom");
        bloom.add(params, 'luminosityThreshold', 0.0, 1.0);
        bloom.add(params, 'luminositySmoothWidth', 0.0, 1.0);
        bloom.add(params, 'bloomStrength', 0.0, 1.0);
        bloom.add(params, 'bloomRadius', 0.0, 5.0);

        const tonemap = this.gui.addFolder("Tonemap");
        tonemap.add(params, 'linearWhite', 0, 10.0);
        tonemap.add(params, 'shoulderStrength', 0, 10.0);
        tonemap.add(params, 'linearStrength', 0, 10.0);
        tonemap.add(params, 'linearAngle', 0, 2.0);
        tonemap.add(params, 'toeStrength', 0, 1.0);
        tonemap.add(params, 'toeNumerator', 0, 1.0);
        tonemap.add(params, 'toeDenominator', 0, 2.0);
        tonemap.add(params, 'exposure', 0, 2.0);

        const tone = this.gui.addFolder("ColorTone");
        tone.add(params, 'toneColorR', -1.0, 1.0);
        tone.add(params, 'toneColorG', -1.0, 1.0);
        tone.add(params, 'toneColorB', -1.0, 1.0);
        tone.add(params, 'toneGray', 0.0, 1.0);

        const vignette = this.gui.addFolder("Vignette");
        vignette.add(params, 'vignetteSize', 0.0, 1.0);
        vignette.add(params, 'vignetteAmount', 0.0, 10.0);

        this.resolution = resolution || PIXI.settings.RESOLUTION;
        this.blurXFilter = new PIXI.filters.BlurFilterPass(true, strength || 8, quality || 4, this.resolution, kernelSize);
        this.blurYFilter = new PIXI.filters.BlurFilterPass(false, strength || 8, quality || 4, this.resolution, kernelSize);


        this._repeatEdgePixels = false;
        this.updatePadding();

        // ★ .d がプロパティになっていなかったので
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

         //this._bloomCompositePass = new BloomCompositePass();
     }
 
     /**
      * Applies the filter.
      *
      * @param {PIXI.systems.FilterSystem} filterManager - The manager.
      * @param {PIXI.RenderTexture} input - The input target.
      * @param {PIXI.RenderTexture} output - The output target.
      */
     //apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clear: boolean | PIXI.CLEAR_MODES)
     apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clear: boolean, currentState?: any): void
     {
         /* input は次のような状態で渡されてくる。
          * input.width: 816
          * input.height: 624
          * input.baseTexture.width: 816
          * input.baseTexture.height: 624
          * input.resolution: 1
          */

         const params = $gameScreen._lnFilmicFilterParams;


         const xStrength = Math.abs(this.blurXFilter.blur);
         const yStrength = Math.abs(this.blurYFilter.blur);

         //clear = true;
 
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

                //console.log("size", input.baseTexture.width, input.baseTexture.height);
                

                // 高輝度部分を抽出したテクスチャを作る
                this._luminosityHighPassFilter.prepare(params.luminosityThreshold, params.luminositySmoothWidth);
                this._luminosityHighPassFilter.apply(filterManager, input, brightTexture, clear);
                //this._luminosityHighPassFilter.apply(filterManager, input, output, clear);

                //console.log("brightTexture", brightTexture.baseTexture.width, brightTexture.baseTexture.height);

                // ブラー適用
                let inputRenderTarget = brightTexture;
                for (let i = 0; i < MIPS; i++) {
                    const rtH = this._seperableBlurPassHList[i].renderTexture();
                    const rtV = this._seperableBlurPassVList[i].renderTexture();
                    this._seperableBlurPassHList[i].apply(filterManager, inputRenderTarget, rtH, clear);
                    this._seperableBlurPassVList[i].apply(filterManager, rtH, rtV, clear);
                    //this._seperableBlurPassHList[i].apply2(filterManager, inputRenderTarget, rtH);
                    //this._seperableBlurPassVList[i].apply2(filterManager, rtH, rtV);
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


             //console.log("size", this._seperableBlurPassVList[0].renderTexture().width);
             //console.log("size", this._seperableBlurPassVList[1].renderTexture().width);
             //console.log("size", this._seperableBlurPassVList[2].renderTexture().width);
             //console.log("size", this._seperableBlurPassVList[3].renderTexture().width);
             //console.log("size", this._seperableBlurPassVList[4].renderTexture().width);

             const renderTarget1 = filterManager.getFilterTexture(input);
             const renderTarget2 = filterManager.getFilterTexture(input);
 
             // BlurFilterPass の実装は input を swap で再利用するので、
             // 元の画像が書き換わらないように退避する。
             this._copyPass.apply(filterManager, input, renderTarget2, true);

             this.blurXFilter.apply(filterManager, renderTarget2, renderTarget1, clear);//(true as any));
             this.blurYFilter.apply(filterManager, renderTarget1, renderTarget2, clear);//(true as any));
 
             
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



             //const tt = this._seperableBlurPassVList[0].renderTexture();
             //const tw = tt.width * tt.resolution;
             //const th = tt.height * tt.resolution;
             //this._blendPass.uniforms.uSamplerSize = [tw, th, 1.0 / tw, 1.0 / th];
            // console.log("input", input.width, input.height, input.baseTexture.width, input.baseTexture.height, input.resolution);
             // console.log("apply", tt.width, tt.height, tt.baseTexture.width, tt.baseTexture.height, tt.resolution, this.legacy);
             this._blendPass.apply(filterManager, renderTarget2, output, clear);
            // this._blendPass.apply(filterManager, tt, output, clear);
             


             filterManager.returnFilterTexture(renderTarget1);
             filterManager.returnFilterTexture(renderTarget2);


             /*
             // 高輝度部分を抽出したテクスチャを作る
             const brightTexture = filterManager.getFilterTexture(input);
             this._luminosityHighPassFilter.apply(filterManager, input, brightTexture, clear);
             //this._luminosityHighPassFilter.apply(filterManager, input, output, clear);

             {
                 let inputRenderTarget = brightTexture;
                for (let i = 0; i < MIPS; i++) {
                    const rtH = this._seperableBlurPassHList[i].renderTexture();
                    const rtV = this._seperableBlurPassVList[i].renderTexture();
                    this._seperableBlurPassHList[i].apply(filterManager, inputRenderTarget, rtH, clear);
                    this._seperableBlurPassVList[i].apply(filterManager, rtH, rtV, clear);
                    inputRenderTarget = rtV;
                }
             }

             this._bloomCompositePass.prepare(1.0, 1.0, [
                this._seperableBlurPassVList[0].renderTexture(),
                this._seperableBlurPassVList[1].renderTexture(),
                this._seperableBlurPassVList[2].renderTexture(),
                this._seperableBlurPassVList[3].renderTexture(),
                this._seperableBlurPassVList[4].renderTexture(),
             ]);
             this._bloomCompositePass.apply(filterManager, input, output, clear);
             
             */
             
             for (let i = 0; i < MIPS; i++) {
                this._seperableBlurPassHList[i].retain(filterManager);
                this._seperableBlurPassVList[i].retain(filterManager);
             }
         }
         else if (yStrength)
         {
             this.blurYFilter.apply(filterManager, input, output, clear);
         }
         else
         {
             this.blurXFilter.apply(filterManager, input, output, clear);
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
 
     updatePadding()
     {
         if (this._repeatEdgePixels)
         {
             this.padding = 0;
         }
         else
         {
             this.padding = Math.max(Math.abs(this.blurXFilter.blur), Math.abs(this.blurYFilter.blur)) * 2;
         }
     }
 }
 