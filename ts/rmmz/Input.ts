import { FilterGUI } from "../core/FilterGUI";
import { paramEditorKey } from "./PluginParameters";

const _Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event: any) {
    if (FilterGUI.isPlaytest() && event.key == paramEditorKey) {
        FilterGUI.toggle();
    }
    else {
        _Input_onKeyDown.call(this, event);
    }
}
