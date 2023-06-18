export interface RawPost {
  kind: string;
  data: {
    id: string;
    title: string;
    selftext: string;
    hidden: boolean;
    downs: number;
    ups: number;
    upvote_ratio: number;
    url_overridden_by_dest: string;
    over_18: boolean;
    is_video: boolean;
    stickied: boolean;
    pinned: boolean;
    removal_reason: string | null;
    author: string;
    //For now
    media_embed: any;
    created_utc: number;
  };
}
