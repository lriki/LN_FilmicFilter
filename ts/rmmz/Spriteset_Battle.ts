import { BlurFilter } from "../filters/BlurFilter";

// Spriteset_Base 自体に Filter を追加しても効かなかった。
// そのため _baseSprite へ追加する。
const _Spriteset_Battle_prototype_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
Spriteset_Battle.prototype.createLowerLayer = function() {
    _Spriteset_Battle_prototype_createLowerLayer.call(this);
    this._baseSprite.filters.push(new BlurFilter());
}

