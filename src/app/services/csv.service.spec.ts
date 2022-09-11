import { TestBed } from '@angular/core/testing';

import { CSVService } from './csv.service';

describe('CSVService', () => {
  let service: CSVService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CSVService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('convertStringCsvLineを実行', () => {
    const contents: string[] = ["あ", "い", "う", "え", "お", "か", "き"];
    const result: string = '"あ","い","う","え","お","か","き","空","空","空"\n';
    expect(service.convertStringCsvLine(contents, 10, "空")).toBe(result);
  });
});
