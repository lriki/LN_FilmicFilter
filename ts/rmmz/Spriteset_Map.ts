import { FilmicFilter } from "../filters/FilmicFilter";

// Spriteset_Base 自体に Filter を追加しても効かなかった。
// そのため _baseSprite へ追加する。
const _Spriteset_Map_prototype_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_prototype_createLowerLayer.call(this);

    if (!FilmicFilter.instance) FilmicFilter.instance = new FilmicFilter();
    this._baseSprite.filters.push(FilmicFilter.instance);
}

// 天候にもエフェクトをかけるには、Weather を _baseSprite の child にする必要がある。
const _Spriteset_Map_prototype_createWeather = Spriteset_Map.prototype.createWeather;
Spriteset_Map.prototype.createWeather = function() {
    this._weather = new Weather();
    this._baseSprite.addChild(this._weather);
};

const _Spriteset_Map_prototype_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_prototype_update.call(this);
    if (FilmicFilter.instance) {
        FilmicFilter.instance.enabled = $gameScreen._lnFilmicFilter.enabled;
    }
}

