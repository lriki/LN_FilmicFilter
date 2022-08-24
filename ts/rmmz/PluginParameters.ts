
function getString(key: string, defaultValue: string): string {
    if (typeof PluginManager == "undefined") return defaultValue;
    const v = PluginManager.parameters(pluginName)[key];
    if (v === undefined) return defaultValue;
    return v ?? "";
}

// プラグイン名
export const pluginName: string = "LN_FilmicFilter";

// アニメーション "強さ" を フックするときの値
export var paramAnimationFlushHookValue = 1;

// GUI表示キー
export var paramEditorKey = getString("EditorKey", "F11");
