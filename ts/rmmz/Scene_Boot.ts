import { FilterFileManager } from "../core/FilterFileManager";

const _Scene_Boot_prototype_create = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    _Scene_Boot_prototype_create.call(this);
    FilterFileManager.updateIndexFile(() => {
        FilterFileManager.loadIndex();
    });
}
