import { FilmicFilterControl } from "../core/FilmicFilterControl";
import { FilterFileManager } from "../core/FilterFileManager";

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
    _Game_Map_setup.call(this, mapId);

    FilterFileManager.setUserDefaultParams(undefined);
    $gameScreen._lnFilmicFilter.enabled = true;
    if ($dataMap.meta) {
        const value = $dataMap.meta["FilmicFilter"];
        if (value == "none") {
            $gameScreen._lnFilmicFilter.enabled = false;
        }
        else {
            let id: number = (value === undefined) ? 0 : Number(value);

            if (id <= -1) {
                $gameScreen._lnFilmicFilter.enabled = false;
            }
            else if (id !== undefined) {
                FilterFileManager.setUserDefaultParams(FilterFileManager.getData(id));
                FilmicFilterControl.start($gameScreen._lnFilmicFilter, FilterFileManager.defaultParams(), 0);
            }
        }
    }
}
