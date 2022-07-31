import { Jobs } from "./jobs";

export interface Daily {
    jobs?: Jobs[],
    memo: string,
    total: number,
    date?: string,
}
