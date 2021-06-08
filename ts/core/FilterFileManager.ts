import { FilmicFilterParams } from "ts/core/FilmicFilterData";

declare global {  
    interface Window {
        LN_FilterFileIndex: string[]  | undefined,
    }
}

export class FilterFileManager {
    public static loadIndex(): void {
        DataManager.loadDataFile("LN_FilterFileIndex", "filters/index.json");
    }

    public static isIndexLoaded(): boolean {
        return !!this.filterIndex();
    }

    public static filterIndex(): string[] | undefined {
        return window["LN_FilterFileIndex"];
    }

    public static loadFilterParams(fileNumber: number, loaded: (params: FilmicFilterParams) => void): void {
        const files = this.filterIndex();
        if (files && files[fileNumber]) {
            this.loadDataFile(files[fileNumber], (obj) => loaded(obj as FilmicFilterParams));
        }
        else {
            throw new Error("Filter index file not loaded.");
        }
    }
    
    private static loadDataFile(src: string, onLoad: (obj: any) => void) {
        const xhr = new XMLHttpRequest();
        const url = "data/" + src;
        xhr.open("GET", url);
        xhr.overrideMimeType("application/json");
        xhr.onload = () => this.onXhrLoad(xhr, src, url, onLoad);
        xhr.onerror = () => DataManager.onXhrError(src, src, url);
        xhr.send();
    }
    
    private static onXhrLoad(xhr: XMLHttpRequest, src: string, url: string, onLoad: (obj: any) => void) {
        if (xhr.status < 400) {
            onLoad(JSON.parse(xhr.responseText));
        } else {
            DataManager.onXhrError(src, src, url);
        }
    }
}
