import vertex from './glsl/Basic.vert';
import fragment from './glsl/SeperableBlur.frag';

export class SeperableBlurPass extends PIXI.Filter {
    requiredWidth: number;
    requiredHeight: number;

    // NOTE: 今のところ FilmicFilter はゲーム全体でひとつのインスタンスを使うので、destroy 不要
    private _renderTarget: PIXI.RenderTexture | undefined;

    constructor(kernel: number, sigma: number, horizonal: boolean) {
        const dx = (horizonal) ? 1.0 : 0.0;
        const dy = (horizonal) ? 0.0 : 1.0;
        super(vertex, fragment, {
            KERNEL_RADIUS: kernel,
            SIGMA: sigma,
            _Direction: [dx, dy],
        });
        this.requiredWidth = 16;
        this.requiredHeight = 16;
    }

    // public destroy(): void {
    //     if (this._renderTarget) {
    //         this._renderTarget.destroy();
    //         this._renderTarget = undefined;
    //     }
    // }

    public renderTexture(): PIXI.RenderTexture {
        if (!this._renderTarget) throw new Error("!this._renderTarget");
        return this._renderTarget;
    }
    
    public prepare(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, resolution: number) {
        const requiredWidth = input.width * resolution;
        const requiredHeight = input.height * resolution;
        if (this.requiredWidth !== requiredWidth || this.requiredHeight !== requiredHeight) {
            this.requiredWidth = input.width * resolution;
            this.requiredHeight = input.height * resolution;

            if (this._renderTarget) {
                this._renderTarget.destroy();
            }

            const baseRenderTexture = new PIXI.BaseRenderTexture(Object.assign({
                width: this.requiredWidth,
                height: this.requiredHeight,
                resolution: 1,
            }, filterManager.texturePool.textureOptions));
            this._renderTarget =  new PIXI.RenderTexture(baseRenderTexture);
        }
        
        
        
        this.uniforms._TexSize = [input.width, input.height];
    }

    public retain(filterManager: PIXI.systems.FilterSystem): void {
        // if (this._renderTarget) {
        //     filterManager.returnFilterTexture(this._renderTarget);
        // }
    }

    public apply2(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture): void {
        
        this.state.blend = false;

        const renderer = filterManager.renderer;
        renderer.renderTexture.bind(output, output.filterFrame);

        this.uniforms.uSampler = input;

        renderer.shader.bind(this, false);
        renderer.geometry.draw(5);
        
        this.state.blend = true;
    }
}

