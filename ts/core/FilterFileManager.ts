import fs from "fs";
import path from "path";
import { FilmicFilterParams } from "ts/core/FilmicFilterData";

export class FilterFileManager {
    public static fileIndex: (string | undefined)[] | undefined;
    private static _fileCount: number;
    private static _loadedFileCount: number;
    private static _dataList: (FilmicFilterParams | undefined)[];
    private static _defaultParams: FilmicFilterParams | undefined;

    public static loadIndex(): void {
        this._fileCount = -1;
        this._loadedFileCount = 0;
        this._dataList = [];
        this._defaultParams = undefined;

        this.loadDataFile("data/filters/index.json", (obj) => {
            this.fileIndex = (obj as string[]);
            this._fileCount = 0;
            for (let i = 0; i < this.fileIndex.length; i++) {
                const file = this.fileIndex[i];
                if (file) {
                    this._fileCount++;
                    this.loadDataFile("data/filters/" + file, (obj) => {
                        this._dataList[i] = (obj as FilmicFilterParams);
                        this._loadedFileCount++;
                    }, () => {
                        DataManager.onXhrError("", "file", file);
                    });
                }
            }
        }, () => {
            console.log("not found?");
        });
    }

    public static isLoaded(): boolean {
        return !!this.fileIndex && this._fileCount == this._loadedFileCount;
    }

    public static defaultParams(): FilmicFilterParams {
        if (this._defaultParams)
            return this._defaultParams;
        else
            return this.getData(0);
    }

    public static setDefaultParams(params: FilmicFilterParams | undefined): void {
        this._defaultParams = params;
    }

    public static getData(index: number): FilmicFilterParams {
        const params = this._dataList[index];
        if (!params) {
            throw new Error(`ID:${index} の FilmicFilter 設定ファイルが見つかりませんでした。`);
        }
        return params;
    }
    
    private static loadDataFile(src: string, onLoad: (obj: any) => void, onError: () => void) {
        const xhr = new XMLHttpRequest();
        const url = src;
        xhr.open("GET", url);
        xhr.overrideMimeType("application/json");
        xhr.onload = () => this.onXhrLoad(xhr, src, url, onLoad);
        xhr.onerror = onError;//DataManager.onXhrError(src, src, url);
        xhr.send();
    }
    
    private static onXhrLoad(xhr: XMLHttpRequest, src: string, url: string, onLoad: (obj: any) => void) {
        if (xhr.status < 400) {
            onLoad(JSON.parse(xhr.responseText));
        } else {
            DataManager.onXhrError(src, src, url);
        }
    }

    public static updateIndexFile(onEnd: () => void): void {
        if (this.isNode()) {
            fs.mkdir("data/filters", (err) => { // 成否にかかわらずコールバックは呼び出される
                fs.readdir("data/filters", function(err, files) {
                    const indexData = [];
    
                    if (!err) {
                        const fileList = files.filter(function(file) {
                            return /.*\.json$/.test(file);
                        });
        
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
                    }
    
                    fs.writeFileSync("data/filters/index.json", JsonEx.stringify(indexData));
                    onEnd();
                });
            });
        }
        else {
            onEnd();
        }
    }

    public static isNode(): boolean {
        return (process.title !== 'browser');
    }
}
