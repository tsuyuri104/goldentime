import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { Daily } from '../interfaces/document/daily';
import { GroupName } from '../interfaces/document/group-name';
import { GroupNameKeyValue } from '../interfaces/document/group-name-key-value';
import { Jobs } from '../interfaces/document/jobs';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class GroupNameService {

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly USER: string = "user";
    public static readonly GROUP_NAME: string = "group_name";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region メソッド

  //#region getData
  /**
   * データを取得する
   * @param email 
   * @returns 
   */
  public async getData(email: string): Promise<GroupName[]> {
    let data: GroupName[] = [];

    const db = getFirestore();
    const q = query(collectionGroup(db, this.sUrdayin.SUB_COLLECTION_NAME.GROUP_NAME), where(this.FIELD_NAME.USER, "==", email));
    const docs = await getDocs(q);

    docs.forEach(doc => {
      data.push(<GroupName>doc.data());
    });

    return data;
  }
  //#endregion

  //#region getDataKeyValue
  /**
   * データを取得する（KeyValueスタイルで）
   * @param email 
   * @returns 
   */
  public async getDataKeyValue(email: string): Promise<GroupNameKeyValue> {
    let data: GroupNameKeyValue = {};

    const db = getFirestore();
    const q = query(collectionGroup(db, this.sUrdayin.SUB_COLLECTION_NAME.GROUP_NAME), where(this.FIELD_NAME.USER, "==", email));
    const docs = await getDocs(q);

    docs.forEach(doc => {
      data[doc.id] = <GroupName>doc.data();
    });

    return data;
  }
  //#endregion

  //#region insertData
  /**
   * データを登録する
   * @param inputData 
   * @param email 
   */
  public insertData(inputData: Daily, email: string): void {
    const db = getFirestore();

    const ref = collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.GROUP_NAME);

    //仕事データ整形（集約グループ名のみ抽出して、重複なしの配列にする）
    let groupNames: string[] = (<Jobs[]>inputData.jobs).map(x => x.group_name);
    groupNames = groupNames.filter((x, i, self) => {
      return self.indexOf(x) === i;
    });

    groupNames.forEach(async name => {

      //グループ名がない場合は登録しない
      if (name === "") {
        return;
      }

      //データを取得する
      const q = query(ref, where(this.FIELD_NAME.GROUP_NAME, "==", name));
      let docs = await getDocs(q);

      //データが存在する場合、処理はここまで
      if (docs.size > 0) {
        return;
      }

      const groupName: GroupName = {
        user: email,
        group_name: name,
      }

      //登録する
      addDoc(ref, groupName);
    });
  }
  //#endregion

  //#region deleteDoc
  /**
   * データを削除する
   * @param email 
   * @param docKey 
   */
  public async deleteDoc(email: string, docKey: string): Promise<void> {
    const db = getFirestore();
    const ref = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.GROUP_NAME, docKey);
    deleteDoc(ref);
  }
  //#endregion

  //#endregion
}
