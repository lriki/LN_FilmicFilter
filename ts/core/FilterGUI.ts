import dat, { GUIController } from 'dat.gui';
import { FilmicFilterParams } from './FilmicFilterData';
import { FilmicFilterControl } from './FilmicFilterControl';

export class FilterGUI {
    private static _gui: dat.GUI | undefined;
    private static _hiddedn: boolean;
    private static _controlers: GUIController[];

    public static isPlaytest(): boolean {
        return $gameTemp && $gameTemp.isPlaytest();
    }

    public static init() {
        if (this._gui) {
            this._gui.destroy();
            this._gui = undefined;
            this._controlers = [];
        }
        this._hiddedn = true;
        this._controlers = [];

        const element = document.getElementById("gameCanvas");
        if (!element) throw new Error("gameCanvas element not found.");

        this._gui = new dat.GUI({ autoPlace: true, hideable: true });
        const guiContainer = this._gui.domElement.parentElement;
        if (!guiContainer) throw new Error("guiContainer element not found.");

        guiContainer.style.zIndex = "20";

        this._gui.hide();
        
        const handlers = {
            save: () => { 
                const a = document.createElement('a');
                a.href = 'data:application/json,' + encodeURIComponent(JsonEx.stringify($gameScreen._lnFilmicFilter.params));
                a.download = '1-Filter.json';
                a.onchange = e => {
                };
                a.addEventListener("change", function(evt) {
                }, false);
                a.click();
            },
            load: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json, application/json';
                
                input.onchange = function(event: any) {
                        const reader = new FileReader();
                        reader.readAsText(event.target.files[0]);
                        reader.onload = () => {
                            const v = reader.result;
                            if (typeof(v) == "string") {
                                const params: FilmicFilterParams = JsonEx.parse(v);
                                FilmicFilterControl.copyParams(params, $gameScreen._lnFilmicFilter.params);
                                FilterGUI.refresh();
                            }
                        };
                };
                input.click();
            }
        };
        this._gui.add(handlers, "save");
        this._gui.add(handlers, "load");

        // dat.GUI は個々のパラメータについて書式を明示的に指定することができない。
        // 小数点以下の値を表示する場合、初期値として小数部設定済みの値が必要になる。
        // そのため初期値として 0.1 を設定して各値を作成する。
        // 
        // また dat.GUI 内部ではフィールドごとに参照を持っているようで、
        // オブジェクトを再作成しても古いオブジェクトのフィールドの参照が残ってしまい
        // 値の編集が効かなくなってしまう。
        // 対策として Params オブジェクト及び各フィールドのインスタンスが再作成されないように
        // コピー時はフィールドを1つずつ代入で設定している。
        
        // 設定退避
        const orgParams = FilmicFilterControl.makeDefaultParams();
        FilmicFilterControl.copyParams($gameScreen._lnFilmicFilter.params, orgParams);

        // GUI 用のデフォルト値を作る
        FilmicFilterControl.copyParams(FilmicFilterControl.makeGuiDefaultParams(), $gameScreen._lnFilmicFilter.params);
        
        const params = $gameScreen._lnFilmicFilter.params;
        const bloom = this._gui.addFolder("Bloom");
        this._controlers.push(bloom.add(params, 'luminosityThreshold', 0.0, 1.0));
        this._controlers.push(bloom.add(params, 'luminositySmoothWidth', 0.0, 1.0));
        this._controlers.push(bloom.add(params, 'bloomStrength', 0.0, 1.0));
        this._controlers.push(bloom.add(params, 'bloomRadius', 0.0, 5.0));

        const tonemap = this._gui.addFolder("Tonemap");
        this._controlers.push(tonemap.add(params, 'linearWhite', 0, 10.0));
        this._controlers.push(tonemap.add(params, 'shoulderStrength', 0, 10.0));
        this._controlers.push(tonemap.add(params, 'linearStrength', 0, 10.0));
        this._controlers.push(tonemap.add(params, 'linearAngle', 0, 2.0));
        this._controlers.push(tonemap.add(params, 'toeStrength', 0, 1.0));
        this._controlers.push(tonemap.add(params, 'toeNumerator', 0, 1.0));
        this._controlers.push(tonemap.add(params, 'toeDenominator', 0, 2.0));
        this._controlers.push(tonemap.add(params, 'exposure', 0, 2.0));

        const tone = this._gui.addFolder("ColorTone");
        this._controlers.push(tone.add(params, 'toneColorR', -1.0, 1.0));
        this._controlers.push(tone.add(params, 'toneColorG', -1.0, 1.0));
        this._controlers.push(tone.add(params, 'toneColorB', -1.0, 1.0));
        this._controlers.push(tone.add(params, 'toneGray', 0.0, 1.0));

        const vignette = this._gui.addFolder("Vignette");
        this._controlers.push(vignette.add(params, 'vignetteSize', 0.0, 1.0));
        this._controlers.push(vignette.add(params, 'vignetteAmount', 0.0, 10.0));

        const tilt = this._gui.addFolder("TiltShift");
        this._controlers.push(tilt.add(params, 'tiltScale', 0.0, 5.0));
        this._controlers.push(tilt.add(params, 'tiltOffset', -1.0, 1.0));

        FilmicFilterControl.copyParams(orgParams, $gameScreen._lnFilmicFilter.params);
        this.refresh();
    }

    public static toggle(): void {
        this._hiddedn = !this._hiddedn;
        if (this._hiddedn) {
            this._gui?.hide();
        }
        else {
            this._gui?.show();
        }
    }

    public static hiddedn(): boolean {
        return this._hiddedn;
    }

    private static refresh(): void {
        for (const c of this._controlers) {
            c.updateDisplay();
        }
    }
}
