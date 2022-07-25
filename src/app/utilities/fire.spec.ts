import { Fire } from './fire';

describe('Fire', () => {
  it('should create an instance', () => {
    expect(new Fire()).toBeTruthy();
  });

  it('combinePathを実行', () => {
    expect(Fire.combinePath(["a", "b", "c"])).toBe("a/b/c");
  });
});
