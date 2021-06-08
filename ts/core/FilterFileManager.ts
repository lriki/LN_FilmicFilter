import fs from "fs";
import path from "path";
import { FilmicFilterParams } from "ts/core/FilmicFilterData";

export class FilterFileManager {

    public static fileIndex: (string | undefined)[] | undefined;
    private static _fileCount: number;
    private static _loadedFileCount: number;
    private static _dataList: (FilmicFilterParams | undefined)[];

    public static loadIndex(): void {
        this._fileCount = 0;
        this._loadedFileCount = 0;
        this._dataList = [];

        this.loadDataFile("filters/index.json", (obj) => {
            this.fileIndex = (obj as string[]);
            for (let i = 0; i < this.fileIndex.length; i++) {
                const file = this.fileIndex[i];
                if (file) {
                    this._fileCount++;
                    this.loadDataFile(file, (obj) => {
                        this._dataList[i] = (obj as FilmicFilterParams);
                        this._loadedFileCount++;
                    });
                }
            }
        });
    }

    public static isLoaded(): boolean {
        return !!this.fileIndex && this._fileCount == this._loadedFileCount;
    }

    public static getData(index: number): FilmicFilterParams {
        const params = this._dataList[index];
        if (!params) throw new Error(`ID:${index} の FilmicFilter 設定ファイルが見つかりませんでした。`);
        return params;
    }

    /*
    public static loadFilterParams(fileNumber: number, loaded: (params: FilmicFilterParams) => void): void {
        const files = this.fileIndex;
        if (files && files[fileNumber]) {
            this.loadDataFile(files[fileNumber], (obj) => loaded(obj as FilmicFilterParams));
        }
        else {
            throw new Error("Filter index file not loaded.");
        }
    }
    */
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

    public static updateIndexFile(): void {
        if (this.isNode()) {
            fs.readdir("data/filters", function(err, files){
                if (err) throw err;
                const fileList = files.filter(function(file) {
                    return fs.statSync(file).isFile() && /.*\.json$/.test(file);
                });
                console.log(fileList);

                const indexData = [];
                for (const file of fileList) {
                    if (file == "index.json") {
                        // これは除外
                    }
                    else {
                        const tokens = file.split("-");
                        if (tokens.length <  2) throw new Error(`${file}: ファイル名にIDが含まれていません。`);

                        const filename = path.basename(file);
                        indexData[Number(tokens[0])] = filename;
                    }
                }

                fs.writeFileSync("data/filters/index.json", JsonEx.stringify(indexData));
            });
        }
    }

    public static isNode(): boolean {
        return (process.title !== 'browser');
    }
}
