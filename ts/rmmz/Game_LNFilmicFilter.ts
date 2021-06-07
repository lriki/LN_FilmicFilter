
export interface Game_LNFilmicFilterParams {
    luminosityThreshold: number;
    luminositySmoothWidth: number;
    bloomStrength: number;
    bloomRadius: number;

    linearWhite: number;
    shoulderStrength: number;
    linearStrength: number;
    linearAngle: number;
    toeStrength: number;
    toeNumerator: number;
    toeDenominator: number;
    exposure: number;

    toneColorR: number;
    toneColorG: number;
    toneColorB: number;
    toneGray: number;

    vignetteSize: number;
    vignetteAmount: number;
}

export function Game_LNFilmicFilterParams_copy(src: Game_LNFilmicFilterParams, dst: Game_LNFilmicFilterParams) {

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

export function Game_LNFilmicFilterParams_Default(): Game_LNFilmicFilterParams {
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

export function Game_LNFilmicFilterParams_guiDefaults(): Game_LNFilmicFilterParams {
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
