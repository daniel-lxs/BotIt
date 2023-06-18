import axios, { AxiosResponse } from 'axios';

import { RawSubreddit } from '../model/RawSubreddit';
import { RawPost } from '../model/RawPost';
import { RedditConfig } from '../../model/Config';
import { PostFilter } from '../model/PostFilter';
import { isPostWithinTimeLimit } from '../service/isPostWithinTimeLimit';

export async function scrapeSubreddit({
  baseUrl,
  subreddit,
  postFilter,
}: RedditConfig): Promise<RawPost[]> {
  console.log('Getting posts...');
  try {
    const response: AxiosResponse<RawSubreddit> = await axios.get(
      `${baseUrl}/r/${subreddit}.json`
    );

    let rawPosts = response.data.data.children.sort(
      (a, b) => b.data.ups - a.data.ups
    );

    rawPosts = filterRawPosts(rawPosts, postFilter);

    if (postFilter.postLimit) {
      rawPosts = rawPosts.slice(0, postFilter.postLimit);
    }

    return rawPosts;
  } catch (error) {
    throw new Error(`Scraping failed: ${error}`);
  }
}

function filterRawPosts(
  rawPosts: RawPost[],
  { minUpvotes, maxDownvotes, minUpvoteRatio, maxTimeHours }: PostFilter
) {
  let stickiedOrRemoved = 0;
  let notEnoughUpvotes = 0;
  let tooManyDownVotes = 0;
  let badUpvoteRatio = 0;
  let tooOld = 0;
  let noLink = 0;

  const filteredPosts = rawPosts.filter((rawPost) => {
    if (rawPost.data.stickied || rawPost.data.removal_reason) {
      stickiedOrRemoved++;
      return false;
    }

    if (minUpvotes && rawPost.data.ups < minUpvotes) {
      notEnoughUpvotes++;
      return false;
    }

    if (maxDownvotes && rawPost.data.downs > maxDownvotes) {
      tooManyDownVotes++;
      return false;
    }

    if (minUpvoteRatio && rawPost.data.upvote_ratio < minUpvoteRatio) {
      badUpvoteRatio++;
      return false;
    }

    if (maxTimeHours && !isPostWithinTimeLimit(rawPost, maxTimeHours)) {
      tooOld++;
      return false;
    }

    if (
      !rawPost.data.url_overridden_by_dest ||
      rawPost.data.url_overridden_by_dest.includes('redd.it')
    ) {
      noLink++;
      return false;
    }

    return true;
  });

  if (filteredPosts.length > 0) {
    console.log(`${filteredPosts.length} viable posts found:`);
    filteredPosts.forEach((post) => {
      console.log(`* ${post.data.url_overridden_by_dest} (${post.data.title})`);
    });
  } else {
    console.log(`No valid posts found in the subreddit. Here is the breakdown:
* ${stickiedOrRemoved} were stickied or removed
* ${noLink} had no link
* ${tooOld} were too old (max hours: ${maxTimeHours})
* ${notEnoughUpvotes} didn't have enough upvotes (min: ${minUpvotes})
* ${tooManyDownVotes} had too many downvotes (max: ${maxDownvotes})
* ${badUpvoteRatio} had bad upvote ratios (min ratio: ${minUpvoteRatio})

Please try again later or update the config.yml values to adjust your configurations (min upvotes, max downvotes, min ratio)
`);
  }

  return filteredPosts;
}
