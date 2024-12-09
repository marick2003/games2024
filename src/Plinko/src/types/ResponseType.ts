export type PageResults = {
    IsSuccess: boolean,
    PageSize: number,
    ItemCount: number,
    PageCount: number,
    PageIndex: number,
}

export interface BetHistoryResponseList extends PageResults {
    Data: {
        Items: BetHistoryResponse[]
    }
}

export type BetHistoryResponse = {
    Id: string;
    Currency: string,
    Amount: number;
    Payout: number;
    PayoutMultiplier: number;
    Rows: number;
    Risk: string;
    Ball: string;
    Time: string;
}
