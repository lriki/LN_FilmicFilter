import dat, { GUIController } from 'dat.gui';
import { Game_LNFilmicFilterParams, Game_LNFilmicFilterParams_copy, Game_LNFilmicFilterParams_Default, Game_LNFilmicFilterParams_guiDefaults } from './rmmz/Game_LNFilmicFilter';

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
                a.href = 'data:application/json,' + encodeURIComponent(JsonEx.stringify($gameScreen._lnFilmicFilterParams));
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
                                const params: Game_LNFilmicFilterParams = JsonEx.parse(v);
                                Game_LNFilmicFilterParams_copy(params, $gameScreen._lnFilmicFilterParams);
                                FilterGUI.refresh();
                            }
                         };
                };
                input.click();
            }
        };
        this._gui.add(handlers, "save");
        this._gui.add(handlers, "load");

        
        // 設定退避
        const orgParams = Game_LNFilmicFilterParams_Default();
        Game_LNFilmicFilterParams_copy($gameScreen._lnFilmicFilterParams, orgParams);

        // GUI 用のデフォルト値を作る
        Game_LNFilmicFilterParams_copy(Game_LNFilmicFilterParams_guiDefaults(), $gameScreen._lnFilmicFilterParams);
        
        const params = $gameScreen._lnFilmicFilterParams;
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

        Game_LNFilmicFilterParams_copy(orgParams, $gameScreen._lnFilmicFilterParams);
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
