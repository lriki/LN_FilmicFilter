import { BlurFilter } from "../filters/BlurFilter";

// Spriteset_Base 自体に Filter を追加しても効かなかった。
// そのため _baseSprite へ追加する。
const _Spriteset_Map_prototype_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_prototype_createLowerLayer.call(this);
    this._baseSprite.filters.push(new BlurFilter());
}
