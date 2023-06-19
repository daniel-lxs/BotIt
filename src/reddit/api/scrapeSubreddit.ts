import axios from 'axios';
import { CommunityMapEntry } from '../../model/Config';
import { CacheRepository } from '../repository/CacheRepository';
import { RawPost } from '../model/RawPost';
import { filterRawPosts } from '../service/filterRawPosts';

export async function scrapeSubreddit(
  baseUrl: string,
  { subreddit, postFilter }: CommunityMapEntry,
  cacheRepository: CacheRepository
): Promise<RawPost[]> {
  console.log('Getting posts...');

  try {
    let rawPosts: RawPost[] = [];
    // Check if the subreddit is already in the cache
    const cachedData = await cacheRepository.getCache(subreddit, 10000);
    if (cachedData) {
      console.log(`Using cached posts for subreddit: ${subreddit}`);
      rawPosts = JSON.parse(cachedData);
    } else {
      const response = await axios.get(`${baseUrl}/r/${subreddit}/hot.json`);

      rawPosts = response.data.data.children.sort(
        (a: any, b: any) => b.data.ups - a.data.ups
      );
      // Save the response to cache
      await cacheRepository.saveCache(subreddit, JSON.stringify(rawPosts));
    }

    if (postFilter) {
      rawPosts = filterRawPosts(rawPosts, postFilter);

      if (postFilter.postLimit) {
        rawPosts = rawPosts.slice(0, postFilter.postLimit);
      }
    }

    return rawPosts;
  } catch (error) {
    throw new Error(`Scraping failed: ${error}`);
  }
}
