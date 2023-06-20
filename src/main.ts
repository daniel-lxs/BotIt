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
import { PostRepository } from './reddit/repository/PostRepository';

export async function start(
  lemmyClient: LemmyHttp,
  config: Config,
  jwt: string,
  cacheRepository: CacheRepository,
  postRepository: PostRepository
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
          // Check if the post already exists using getPostByUrl
          const existingPost = await postRepository.getPostByUrl(posts[i].url);
          if (existingPost && existingPost.communityName === communityName) {
            logger(
              LogContext.Info,
              `Post with URL ${posts[i].url} already exists on db. Skipping...`
            );
            i++;
            continue;
          }

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
        logger(LogContext.Error, 'Post url unavailable');
        continue;
      }

      logger(
        LogContext.Info,
        `Successfully posted to ${communityName}: ${postUrl}`
      );

      // Save the posted post using the PostRepository
      await postRepository.savePost({ ...posts[i], communityName });
    }
  } catch (error) {
    logger(LogContext.Error, 'Process terminated: ' + error);
  }
}
