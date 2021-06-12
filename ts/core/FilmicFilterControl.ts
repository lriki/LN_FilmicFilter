import { FilmicFilterState, FilmicFilterParams } from "./FilmicFilterData";
import { FilterFileManager } from "./FilterFileManager";

export class FilmicFilterControl {
    public static makeDefault(): FilmicFilterState {
        return {
            enabled: true,
            params: this.makeDefaultParams(),
            targetParams: this.makeDefaultParams(),
            paramsDuration: 0.0,
        };
    }

    public static clear(filter: FilmicFilterState) {
        const d = this.makeDefaultParams();
        filter.enabled = true;
        this.copyParams(d, filter.params);
        this.copyParams(d, filter.targetParams);
        filter.paramsDuration = 0.0;
    }

    public static start(filter: FilmicFilterState, target: FilmicFilterParams, duration: number) {
        this.copyParams(target, filter.targetParams);
        filter.paramsDuration = duration;
        if (filter.paramsDuration === 0) {
            this.copyParams(target, filter.params);
        }
    }

    public static startFlush(filter: FilmicFilterState, source: FilmicFilterParams, duration: number) {
        this.copyParams(source, filter.params);
        this.start(filter, this.defaultParams(), duration);
    }

    public static defaultParams(): FilmicFilterParams {
        return FilterFileManager.getData(0);
    }
    
    public static update(filter: FilmicFilterState) {
        if (filter.paramsDuration > 0) {
            const d = filter.paramsDuration;
            const c = filter.params;
            const t = filter.targetParams;
            c.luminosityThreshold = this.mix(c.luminosityThreshold, t.luminosityThreshold, d);
            c.luminositySmoothWidth = this.mix(c.luminosityThreshold, t.luminosityThreshold, d);
            c.bloomStrength = this.mix(c.luminosityThreshold, t.luminosityThreshold, d);
            c.bloomRadius = this.mix(c.luminosityThreshold, t.luminosityThreshold, d);
    
            c.linearWhite = this.mix(c.linearWhite, t.linearWhite, d);
            c.shoulderStrength = this.mix(c.shoulderStrength, t.shoulderStrength, d);
            c.linearStrength = this.mix(c.linearStrength, t.linearStrength, d);
            c.linearAngle = this.mix(c.linearAngle, t.linearAngle, d);
            c.toeStrength = this.mix(c.toeStrength, t.toeStrength, d);
            c.toeNumerator = this.mix(c.toeNumerator, t.toeNumerator, d);
            c.toeDenominator = this.mix(c.toeDenominator, t.toeDenominator, d);
            c.exposure = this.mix(c.exposure, t.exposure, d);
    
            c.toneColorR = this.mix(c.toneColorR, t.toneColorR, d);
            c.toneColorG = this.mix(c.toneColorG, t.toneColorG, d);
            c.toneColorB = this.mix(c.toneColorB, t.toneColorB, d);
            c.toneGray = this.mix(c.toneGray, t.toneGray, d);
    
            c.vignetteSize = this.mix(c.vignetteSize, t.vignetteSize, d);
            c.vignetteAmount = this.mix(c.vignetteAmount, t.vignetteAmount, d);

            filter.paramsDuration--;
        }
    }

    public static mix(current: number, target: number, d: number): number {
        return (current * (d - 1) + target) / d;
    }

    public static clearParams(params: FilmicFilterParams) {
        this.copyParams(this.makeDefaultParams(), params);
    }

    public static makeDefaultParams(): FilmicFilterParams {
        return {
            luminosityThreshold: 0.9,
            luminositySmoothWidth: 0.01,
            
            linearWhite: 1.5,
            shoulderStrength: 0.2,
            linearStrength: 0.85,
            linearAngle: 0.01,
            toeStrength: 0.01,
            toeNumerator: 0.01,
            toeDenominator: 1.0,
            exposure: 0.5,
            toneColorR: 0.0,
            toneColorG: 0.0,
            toneColorB: 0.0,
            toneGray: 0.0,
    
            bloomStrength: 0.3,
            bloomRadius: 0.5,
    
            vignetteSize: 0.5,
            vignetteAmount: 0.75,
        };
    }
        
    public static makeGuiDefaultParams(): FilmicFilterParams {
        return {
            luminosityThreshold: 0.1,
            luminositySmoothWidth: 0.1,
            
            linearWhite: 0.1,
            shoulderStrength: 0.1,
            linearStrength: 0.1,
            linearAngle: 0.1,
            toeStrength: 0.1,
            toeNumerator: 0.1,
            toeDenominator: 0.1,
            exposure: 0.1,
            toneColorR: 0.1,
            toneColorG: 0.1,
            toneColorB: 0.1,
            toneGray: 0.1,

            bloomStrength: 0.1,
            bloomRadius: 0.1,

            vignetteSize: 0.1,
            vignetteAmount: 0.1,
        };
    }

    public static copyParams(src: FilmicFilterParams, dst: FilmicFilterParams): void {
        // ... のコピーなどでは GUI の更新がされなかったため個別代入。
        dst.luminosityThreshold = src.luminosityThreshold;
        dst.luminositySmoothWidth = src.luminositySmoothWidth;
        dst.bloomStrength = src.bloomStrength;
        dst.bloomRadius = src.bloomRadius;

        dst.linearWhite = src.linearWhite;
        dst.shoulderStrength = src.shoulderStrength;
        dst.linearStrength = src.linearStrength;
        dst.linearAngle = src.linearAngle;
        dst.toeStrength = src.toeStrength;
        dst.toeNumerator = src.toeNumerator;
        dst.toeDenominator = src.toeDenominator;
        dst.exposure = src.exposure;

        dst.toneColorR = src.toneColorR;
        dst.toneColorG = src.toneColorG;
        dst.toneColorB = src.toneColorB;
        dst.toneGray = src.toneGray;

        dst.vignetteSize = src.vignetteSize;
        dst.vignetteAmount = src.vignetteAmount;
    }
}

