export interface CsvRow {
    group_name: string,
    job_name: string,
    daily_hours: Map<string, number>
}
