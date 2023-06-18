import axios, { AxiosResponse } from 'axios';

import { RawSubreddit } from '../model/RawSubreddit';
import { RawPost } from '../model/RawPost';
import { RedditConfig } from '../../model/Config';
import { PostFilter } from '../model/PostFilter';

export async function scrapeSubreddit({
  baseUrl,
  subreddit,
  postFilter,
}: RedditConfig): Promise<RawPost[]> {
  console.log('Getting posts');
  try {
    const response: AxiosResponse<RawSubreddit> = await axios.get(
      `${baseUrl}/r/${subreddit}.json`
    );

    let rawPosts = response.data.data.children.sort(
      (a, b) => b.data.ups - a.data.ups
    );

    rawPosts = filterRawPosts(rawPosts, postFilter);

    if (postFilter.limit) {
      rawPosts = rawPosts.slice(0, postFilter.limit);
    }

    return rawPosts;
  } catch (error) {
    throw new Error(`Scraping failed: ${error}`);
  }
}

function filterRawPosts(
  rawPosts: RawPost[],
  { minUpvotes, maxDownvotes, minUpvoteRatio }: PostFilter
) {
  return rawPosts.filter((rawPost) => {
    if (rawPost.data.stickied || rawPost.data.removal_reason) {
      return false;
    }

    if (minUpvotes && rawPost.data.ups < minUpvotes) {
      return false;
    }

    if (maxDownvotes && rawPost.data.downs > maxDownvotes) {
      return false;
    }

    if (minUpvoteRatio && rawPost.data.upvote_ratio < minUpvoteRatio) {
      return false;
    }

    return true;
  });
}
