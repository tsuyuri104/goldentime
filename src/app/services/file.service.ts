import { Injectable } from '@angular/core';
import { Encode } from '../types/encode';
import { FileType } from '../types/file-type';
import { EncodingService } from './encoding.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  //#region コンストラクタ
  constructor(private sEncoding: EncodingService) {

  }
  //#endregion

  //#region download
  /**
   * ファイルをダウンロードする
   * @param value ファイルの内容
   * @param fileName ファイル名（拡張子不要）
   * @param fileType ファイル形式
   * @param encode
   */
  public download(value: string, fileName: string, fileType: FileType, encode?: Encode): void {

    const fileNameWithExtension: string = this.combineExtension(fileName, fileType);

    // SJISの場合は変換する
    let blob = new Blob([value], { type: fileType });
    if (encode === "SJIS") {
      blob = new Blob([new Uint8Array(this.sEncoding.convertUnit8ArrayFromUnicode(value))], { type: fileType });
    }

    // ダウンロードさせる
    let downloader = document.createElement('a');
    downloader.href = URL.createObjectURL(blob);
    downloader.download = fileNameWithExtension;
    downloader.click();
  }
  //#endregion

  //#region combineExtension
  /**
   * ファイル名に拡張子をつける
   * @param fileName ファイル名
   * @param fileType ファイル形式
   * @returns 
   */
  private combineExtension(fileName: string, fileType: FileType): string {

    let extension: string = "";

    switch (fileType) {
      case "text/csv":
        extension = ".csv";
        break;
      case "text/html":
        extension = ".html";
        break;
      default:
        break;
    }

    return fileName + extension;
  }
  //#endregion
}
