import { FilmicFilterState } from "../core/FilmicFilterData";
import { LNFilmicFilter } from "../core/FilmicFilter";

declare global {
    interface Game_Screen {
        _lnFilmicFilter: FilmicFilterState;
    }
}

const _Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    _Game_Screen_prototype_clear.call(this);
    if (this._lnFilmicFilter)
        LNFilmicFilter.clear(this._lnFilmicFilter);
    else
        this._lnFilmicFilter = LNFilmicFilter.makeDefault();
}

const _Game_Screen_prototype_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function() {
    _Game_Screen_prototype_update.call(this);
    LNFilmicFilter.update(this._lnFilmicFilter);
}
