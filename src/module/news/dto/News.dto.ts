import {NewsTypes} from "@/utils/shared/entities_enums.js";

export interface News {
    title: string;
    description: string;
    type: NewsTypes;
    userid?: number;
}