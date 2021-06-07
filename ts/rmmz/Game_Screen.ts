import { Game_LNFilmicFilterParams, Game_LNFilmicFilterParams_Default } from "./Game_LNFilmicFilter";

declare global {
    interface Game_Screen {
        _lnFilmicFilterParams: Game_LNFilmicFilterParams;
    }
}

const _Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    _Game_Screen_prototype_clear.call(this);
    this._lnFilmicFilterParams = Game_LNFilmicFilterParams_Default();
}
