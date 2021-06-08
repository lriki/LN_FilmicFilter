import { FilterFileManager } from "../core/FilterFileManager";
import { FilterGUI } from "../FilterGUI";

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this);
    if ($gameTemp.isPlaytest()) {
        FilterGUI.init();
    }
}

const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!FilterFileManager.isIndexLoaded()) return false;
    return true;
}
