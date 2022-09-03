import { AnalysisBreakdown } from "./analysis-breakdown";

export interface AnalysisLeftDailyData {
    date: string,
    totalHours: number,
    breakdown: AnalysisBreakdown[],
}