import { FilterGUI } from "../core/FilterGUI";

const _TouchInput_onMouseDown = TouchInput._onMouseDown;
TouchInput._onMouseDown = function(event) {
    // GUI 表示中は MouseEvent を封印する。
    // こうしないと GUI クリックしたつもりが、同時にプレイヤーの自動移動やメニュー表示が発生してしまう。
    if (FilterGUI.hiddedn()) {
        _TouchInput_onMouseDown.call(this, event);
    }
}
