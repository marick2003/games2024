export type PageResults = {
    IsSuccess: boolean,
    PageSize: number,
    ItemCount: number,
    PageCount: number,
    PageIndex: number,
}

export type GeneralResponse = {
    IsSuccess: boolean
}

export interface BetHistoryResponseList extends PageResults {
    Data: {
        Items: BetHistoryResponse[]
    }
}

export type BetHistoryResponse = {
    Id: string
    Currency: string
    Amount: number
    Payout: number
    PayoutMultiplier: number
    Rows: number
    Risk: string
    Ball: string
    Time: string
}

export interface BetRecordSeedResponse extends GeneralResponse {
    Data: {
        ServerSeed: string
        ServerSeedHash: string
        ClientSeed: string
        Nonce: string
    }
}
