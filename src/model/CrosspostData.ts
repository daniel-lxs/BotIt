import { Post } from '../lemmy';

export interface CrosspostData {
  subreddit: string;
  communityName: string;
  posts: Post[];
}
