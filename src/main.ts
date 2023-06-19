import { LemmyHttp } from 'lemmy-js-client';

import { scrapeSubreddit } from './reddit/api/scrapeSubreddit';
import { CommunityMapEntry, Config } from './model/Config';
import { parseRawPosts } from './reddit/service/parseRawPosts';
import { getJwt } from './lemmy/api/getJwt';
import { createPost } from './lemmy/api/createPost';
import { getCommunityId } from './lemmy/api/getCommunityId';
import { getCommunityPosts } from './lemmy/api/getCommunityPosts';
import { parseRawPostsToUrls } from './lemmy/service/parseRawPostsToUrls';
import { CacheRepository } from './reddit/repository/CacheRepository';

export async function start(
  lemmyClient: LemmyHttp,
  config: Config,
  jwt: string,
  cacheRepository: CacheRepository
) {
  try {
    const communityMap: CommunityMapEntry[] = config.communityMap;

    const subredditPromises = [];
    for (const communityEntry of communityMap) {
      const subreddit = communityEntry.subreddit;
      const communityName = communityEntry.community;

      console.log(`Scraping posts from subreddit: ${subreddit}`);
      const rawPosts = await scrapeSubreddit(
        config.reddit.baseUrl,
        communityEntry,
        cacheRepository
      );
      const parsedPosts = parseRawPosts(rawPosts);

      subredditPromises.push({ subreddit, communityName, posts: parsedPosts });
    }

    const communityDataList = await Promise.all(subredditPromises);

    for (const communityData of communityDataList) {
      const { subreddit, communityName, posts } = communityData;
      const communityId = await getCommunityId(
        lemmyClient,
        await getJwt(lemmyClient, jwt),
        communityName
      );
      const communityPosts = await getCommunityPosts(
        lemmyClient,
        await getJwt(lemmyClient, jwt),
        communityId,
        config.lemmy.postLimit
      );
      const communityUrls = parseRawPostsToUrls(communityPosts);

      let i = 0;
      let newUrlFound = false;
      while (!newUrlFound && i < posts.length) {
        if (!communityUrls.includes(posts[i].url)) {
          console.log(
            `Found a reddit post from subreddit ${subreddit} to crosspost to ${communityName}!`
          );
          newUrlFound = true;
          break;
        } else {
          console.log(`Skipping already posted url: ${posts[i].url}`);
        }
        i++;
      }

      if (!newUrlFound) {
        console.log(
          `There aren't any new posts from subreddit ${subreddit} to crosspost to ${communityName}.`
        );
        continue;
      }

      const postUrl = await createPost(
        lemmyClient,
        await getJwt(lemmyClient, jwt),
        communityId,
        posts[i]
      );

      if (!postUrl) {
        console.log('Post url unavailable');
        continue;
      }

      console.log(`Successfully posted to ${communityName}: ${postUrl}`);
    }
  } catch (error) {
    console.error('Process terminated: ', error);
  }
}
