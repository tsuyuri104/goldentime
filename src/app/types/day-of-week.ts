export const DayOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
} as const;
export declare type DayOfWeek = typeof DayOfWeek[keyof typeof DayOfWeek];