import { FilmicFilterControl } from "../core/FilmicFilterControl";
import { FilterFileManager } from "../core/FilterFileManager";
import { pluginName } from "./PluginParameters";

PluginManager.registerCommand(pluginName, "SetFilmicFilter", function(this: Game_Interpreter, args: any) {
    const id = args.filterId;
    const duration = args.duration;
    const wait = args.wait;
    
    
    if (Number(id) <= -1) {
        $gameScreen._lnFilmicFilter.enabled = false;
    }
    else {
        const target = FilterFileManager.getData(id);
        FilmicFilterControl.start($gameScreen._lnFilmicFilter, target, duration);
    }

    if (wait) {
        this.wait(duration);
    }
});
