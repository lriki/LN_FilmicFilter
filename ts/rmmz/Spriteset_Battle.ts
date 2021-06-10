import { FilmicFilter } from "../filters/FilmicFilter";

// Spriteset_Base 自体に Filter を追加しても効かなかった。
// そのため _baseSprite へ追加する。
const _Spriteset_Battle_prototype_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
Spriteset_Battle.prototype.createLowerLayer = function() {
    _Spriteset_Battle_prototype_createLowerLayer.call(this);

    if (!FilmicFilter.instance) FilmicFilter.instance = new FilmicFilter();
    this._baseSprite.filters.push(FilmicFilter.instance);
}

const _Spriteset_Battle_prototype_update = Spriteset_Battle.prototype.update;
Spriteset_Battle.prototype.update = function() {
    _Spriteset_Battle_prototype_update.call(this);
    FilmicFilter.instance.enabled = $gameScreen._lnFilmicFilter.enabled;
}

