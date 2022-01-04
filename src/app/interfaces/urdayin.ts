import { Daily } from "./daily";
import { Monthly } from "./monthly";

export interface Urdayin {
    daily: Daily[],
    monthly: Monthly[],
    user_name: string,
}