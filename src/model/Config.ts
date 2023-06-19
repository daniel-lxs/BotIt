import { PostFilter } from '../reddit/model/PostFilter';

export interface Config {
  reddit: RedditConfig;
  lemmy: LemmyConfig;
  communityMap: CommunityMapEntry[];
}

export interface RedditConfig {
  baseUrl: string;
}

export interface LemmyConfig {
  baseUrl: string;
  postLimit: number;
}

export interface CommunityMapEntry {
  subreddit: string;
  postFilter?: PostFilter;
  community: string;
}
