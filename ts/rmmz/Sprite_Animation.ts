import { FilmicFilter } from "../core/FilmicFilter";
import { FilterFileManager } from "../core/FilterFileManager";
import { paramAnimationFlushHookValue } from "./PluginParameters";

const _Sprite_Animation_prototype_processFlashTimings = Sprite_Animation.prototype.processFlashTimings;
Sprite_Animation.prototype.processFlashTimings = function() {
    for (const timing of this._animation.flashTimings) {
        if (timing.frame === this._frameIndex) {
            const flushColor = timing.color.clone();
            if (flushColor[0] == paramAnimationFlushHookValue) {
                const params = FilterFileManager.getData(flushColor[1]);
                FilmicFilter.start($gameScreen._lnFilmicFilter, params, timing.duration);
            }
            else {
                this._flashColor = flushColor;
                this._flashDuration = timing.duration;
            }
        }
    }
}
