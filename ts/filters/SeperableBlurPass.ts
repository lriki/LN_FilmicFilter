import vertex from './glsl/Basic.vert';
import fragment from './glsl/SeperableBlur.frag';

export class SeperableBlurPass extends PIXI.Filter {
    requiredWidth: number;
    requiredHeight: number;
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

    public renderTexture(): PIXI.RenderTexture {
        if (!this._renderTarget) throw new Error("!this._renderTarget");
        return this._renderTarget;
    }
    
    public prepare(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, resolution: number) {
        this.requiredWidth = input.width * resolution;
        this.requiredHeight = input.height * resolution;
        
        this._renderTarget = filterManager.getFilterTexture(input, resolution);
        
        this.uniforms._TexSize = [input.width, input.height];
    }

    public retain(filterManager: PIXI.systems.FilterSystem): void {
        if (this._renderTarget) {
            filterManager.returnFilterTexture(this._renderTarget);
        }
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

