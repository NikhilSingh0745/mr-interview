export enum TypeEnum {
    INDUSTRY_TYPE = 'industry_type',
}

export interface IUtils {
    name: string,
    type: TypeEnum,
    value: string,
    createdAt: Date,
    updatedAt: Date,
}