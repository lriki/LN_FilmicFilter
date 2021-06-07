import { Game_LNFilmicFilterParams } from "./Game_LNFilmicFilter";

declare global {
    interface Game_Screen {
        _lnFilmicFilterParams: Game_LNFilmicFilterParams;
    }
}

const _Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    _Game_Screen_prototype_clear.call(this);
    this._lnFilmicFilterParams = {
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
