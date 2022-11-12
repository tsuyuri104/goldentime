import { AnalysisBreakdown } from "./analysis-breakdown";

export interface AnalysisDailyData {
    date: Date,
    totalHours: number,
    breakdown: AnalysisBreakdown[],
    isSaturday: boolean,
    isSunday: boolean,
    isHoliday: boolean,
}