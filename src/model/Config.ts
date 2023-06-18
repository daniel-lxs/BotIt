import { PostFilter } from '../reddit/model/PostFilter';

export interface Config {
  reddit: RedditConfig;
  lemmy: LemmyConfig;
}

export interface RedditConfig {
  baseUrl: string;
  subreddit: string;
  postFilter: PostFilter;
}

export interface LemmyConfig {
  baseUrl: string;
  communityName: string;
  limit?: number;
}
