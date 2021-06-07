import { FilterGUI } from "../FilterGUI";

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this);
    if ($gameTemp.isPlaytest()) {
        FilterGUI.init();
    }
}
