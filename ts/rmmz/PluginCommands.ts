import { FilmicFilter } from "../core/FilmicFilter";
import { FilterFileManager } from "../core/FilterFileManager";
import { pluginName } from "./PluginParameters";

PluginManager.registerCommand(pluginName, "SetFilmicFilter", function(interpreter: Game_Interpreter, params: any) {
    const id = params[0];
    const duration = params[1];
    const wait = params[2];

    const target = FilterFileManager.getData(id);
    FilmicFilter.start($gameScreen._lnFilmicFilter, target, duration);

    if (wait) {
        interpreter.wait(duration);
    }
});
