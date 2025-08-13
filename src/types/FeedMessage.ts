export type FeedMessageLink = {
    id: string,
    index?: number,
    match: string,
    type: string,
}

export type FeedMessage = {
    day: number | string,
    emoji: string,
    links: FeedMessageLink[],
    season: number,
    status: string,
    text: string,
    ts: string,
    type: string,
};