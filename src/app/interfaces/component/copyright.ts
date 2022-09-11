export interface Copyright {
    category: string,
    index: number,
    items: CopyrightItem[],
}
export interface CopyrightItem {
    name: string,
    url: string,
    isDeleted: boolean,
}