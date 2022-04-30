import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  public FIELD_NAME = class {
    public static readonly comment: string = "comment";
    public static readonly commenter: string = "commenter";
    public static readonly CREATE_TIMESTAMP: string = "create_timestamp";
    public static readonly ARTICLE_ID: string = "article_id";
  }

  constructor() { }
}
