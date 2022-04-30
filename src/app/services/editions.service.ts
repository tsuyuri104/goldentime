import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditionsService {

  public FIELD_NAME = class {
    public static readonly EDITION: string = "edition";
    public static readonly TITLE: string = "title";
    public static readonly TEXT: string = "text";
    public static readonly CREATE_TIMESTAMP: string = "create_timestamp";
    public static readonly ARTICLE_ID: string = "article_id";
  }

  constructor() { }
}
