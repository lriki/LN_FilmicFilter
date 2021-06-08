import dat, { GUIController } from 'dat.gui';
import { FilmicFilterParams } from './core/FilmicFilterData';
import { LNFilmicFilter } from './core/FilmicFilter';

export class FilterGUI {
    private static _gui: dat.GUI | undefined;
    private static _hiddedn: boolean;
    private static _controlers: GUIController[];

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
        //this._gui.domElement = element;
        //element.append(this._gui.domElement);
        const guiContainer = this._gui.domElement.parentElement;
        if (!guiContainer) throw new Error("guiContainer element not found.");

        //this._gui.domElement.addEventListener('mousedown', e => { e.stopImmediatePropagation(); }, true);

        guiContainer.style.zIndex = "2";

        this._gui.hide();

        //this._gui.
        
        const handlers = {
            save: () => { 
                const a = document.createElement('a');
                a.href = 'data:application/json,' + encodeURIComponent(JsonEx.stringify($gameScreen._lnFilmicFilter.params));
                a.download = '1-Filter.json';
                a.onchange = e => {
                    console.log("onchange", e);
                };
                a.addEventListener("change", function(evt) {
                    console.log("go", evt);
                }, false);

                a.click();
                /*
               console.log("cre s");
               //var nwWindow = require('nw.gui').Window.get();
               console.log("nwWindow", Window);

                const a = document.createElement('input');
                var attr = document.createAttribute('nwsaveas')
                a.attributes.setNamedItem(attr);
                a.id = "imgSaveDialog";
                a.accept = "text/plain";
                a.style.display = "none";

                a.addEventListener('change', function () {
                    var dist = this.value;
                    console.log("change");
                    /*
                    nwWindow.capturePage(function (buffer) {
                        fs.writeFile(dist, buffer, 'base64');
                    }, {
                        format: 'png',
                        datatype: 'buffer'
                    });
                });

                a.click();
                console.log("cre e");
                */
            },
            load: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json, application/json';
                /*
                element.addEventListener('click', function(event: any) {
                    alert(event.target.value); 
                }, false);
                */
                
                input.onchange = function(event: any) {
                        const reader = new FileReader();
                        reader.readAsText(event.target.files[0]);
                        reader.onload = () => {
                            const v = reader.result;
                            if (typeof(v) == "string") {
                                const params: FilmicFilterParams = JsonEx.parse(v);
                                LNFilmicFilter.copyParams(params, $gameScreen._lnFilmicFilter.params);
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
        const orgParams = LNFilmicFilter.makeDefaultParams();
        LNFilmicFilter.copyParams($gameScreen._lnFilmicFilter.params, orgParams);

        // GUI 用のデフォルト値を作る
        LNFilmicFilter.copyParams(LNFilmicFilter.makeGuiDefaultParams(), $gameScreen._lnFilmicFilter.params);
        
        const params = $gameScreen._lnFilmicFilter.params;
        const bloom = this._gui.addFolder("bloom");
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

        LNFilmicFilter.copyParams(orgParams, $gameScreen._lnFilmicFilter.params);
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
