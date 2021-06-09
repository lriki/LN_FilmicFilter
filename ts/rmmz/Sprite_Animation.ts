import { FilmicFilter } from "../core/FilmicFilter";
import { FilterFileManager } from "../core/FilterFileManager";
import { paramAnimationFlushHookValue } from "./PluginParameters";

const _Sprite_Animation_prototype_processFlashTimings = Sprite_Animation.prototype.processFlashTimings;
Sprite_Animation.prototype.processFlashTimings = function() {
    for (const timing of this._animation.flashTimings) {
        if (timing.frame === this._frameIndex) {
            const flushColor = timing.color.clone();
            if (flushColor[3] == paramAnimationFlushHookValue) {
                const params = FilterFileManager.getData(flushColor[0]);
                FilmicFilter.startFlush($gameScreen._lnFilmicFilter, params, timing.duration);
            }
            else {
                this._flashColor = flushColor;
                this._flashDuration = timing.duration;
            }
        }
    }
}
