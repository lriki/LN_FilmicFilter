import { FilmicFilter } from "../core/FilmicFilter";
import { FilterFileManager } from "../core/FilterFileManager";

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
    _Game_Map_setup.call(this, mapId);

    FilterFileManager.setDefaultParams(undefined);
    if ($dataMap.meta) {
        const id: number | undefined = Number($dataMap.meta["FilmicFilter"]);
        if (id) {
            FilterFileManager.setDefaultParams(FilterFileManager.getData(id));
            FilmicFilter.start($gameScreen._lnFilmicFilter, FilterFileManager.defaultParams(), 0);
        }
    }
}
