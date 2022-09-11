import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Copyright } from '../interfaces/component/copyright';

@Injectable({
  providedIn: 'root'
})
export class CopyrightService {

  //#region コンストラクタ
  constructor(private http: HttpClient) {

  }
  //#endregion

  //#region getJson
  /**
   * JSONのデータを取得する
   * @returns 
   */
  public getJson(): Observable<Copyright[]> {
    return this.http.get<Copyright[]>("./assets/jsons/copyright.json")
      .pipe(
        map((x: any) => x['copyrightJson'])
      );
  }
  //#endregion
}
