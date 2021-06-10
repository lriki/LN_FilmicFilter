
export interface FilmicFilterParams {
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

export interface FilmicFilterState {
    enabled: boolean;
    params: FilmicFilterParams;
    targetParams: FilmicFilterParams;
    paramsDuration: number;
}


