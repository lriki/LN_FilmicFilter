import { FilterGUI } from "../core/FilterGUI";

const _Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event) {
    if (event.key == "F11") {
        FilterGUI.toggle();
    }
    else {
        _Input_onKeyDown.call(this, event);
    }
}
