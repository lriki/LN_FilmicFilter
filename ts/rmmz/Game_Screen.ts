import { FilmicFilterState } from "../core/FilmicFilterData";
import { FilmicFilterControl } from "../core/FilmicFilterControl";

declare global {
    interface Game_Screen {
        _lnFilmicFilter: FilmicFilterState;
    }
}

const _Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    _Game_Screen_prototype_clear.call(this);
    if (this._lnFilmicFilter)
        FilmicFilterControl.clear(this._lnFilmicFilter);
    else
        this._lnFilmicFilter = FilmicFilterControl.makeDefault();
}

const _Game_Screen_prototype_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function() {
    _Game_Screen_prototype_update.call(this);
    FilmicFilterControl.update(this._lnFilmicFilter);
}
