import { LemmyHttp } from 'lemmy-js-client';

import { scrapeSubreddit, CacheRepository, parseRawPosts } from './reddit';
import { CommunityMapEntry, Config } from './model/Config';
import {
  getJwt,
  createPost,
  getCommunityId,
  getCommunityPosts,
  parseRawPostsToUrls,
} from './lemmy';
import { logger, LogContext } from './logger';

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

      logger(LogContext.Info, `Scraping posts from subreddit: ${subreddit}`);
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
          logger(
            LogContext.Info,
            `Found a reddit post from subreddit ${subreddit} to crosspost to ${communityName}!`
          );
          newUrlFound = true;
          break;
        } else {
          logger(
            LogContext.Info,
            `Skipping already posted url: ${posts[i].url}`
          );
        }
        i++;
      }

      if (!newUrlFound) {
        logger(
          LogContext.Info,
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
        logger(LogContext.Info, 'Post url unavailable');
        continue;
      }

      logger(
        LogContext.Info,
        `Successfully posted to ${communityName}: ${postUrl}`
      );
    }
  } catch (error) {
    logger(LogContext.Error, 'Process terminated: ' + error);
  }
}
