import { FilterGUI } from "../FilterGUI";

const _Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event) {
    if (event.key == "F11") {
        FilterGUI.toggle();
    }
    else {
        _Input_onKeyDown.call(this, event);
    }
}

const _TouchInput_onMouseDown = TouchInput._onMouseDown;
TouchInput._onMouseDown = function(event) {
    // GUI 表示中は MouseEvent を封印する。
    // こうしないと GUI クリックしたつもりが、同時にプレイヤーの自動移動やメニュー表示が発生してしまう。
    if (FilterGUI.hiddedn()) {
        _TouchInput_onMouseDown.call(this, event);
    }
}
