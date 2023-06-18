export interface Config {
  reddit: RedditConfig;
  lemmy: LemmyConfig;
}

export interface RedditConfig {
  baseUrl: string;
  subreddit: string;
  postFilter: {
    minUpvotes?: number;
    maxDownvotes?: number;
    minUpvoteRatio?: number;
    limit?: number;
  };
}

export interface LemmyConfig {
  baseUrl: string;
  communityName: string;
}
