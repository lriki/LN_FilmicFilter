import { FilmicFilter } from "../core/FilmicFilter";
import { FilterFileManager } from "../core/FilterFileManager";
import { pluginName } from "./PluginParameters";

PluginManager.registerCommand(pluginName, "SetFilmicFilter", function(this: Game_Interpreter, args: any) {
    const id = args.filterId;
    const duration = args.duration;
    const wait = args.wait;

    const target = FilterFileManager.getData(id);
    FilmicFilter.start($gameScreen._lnFilmicFilter, target, duration);

    if (wait) {
        this.wait(duration);
    }
});
