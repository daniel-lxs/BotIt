import { LogContext, LogDomain, logger } from '../../logger';
import { CommunityMapEntry, Config } from '../../model/Config';
import { CrosspostData } from '../../model/CrosspostData';
import { scrapeSubreddit, CacheRepository, parseRawPosts } from '..';

export async function getSubredditPosts(
  config: Config,
  communityEntry: CommunityMapEntry,
  cacheRepository: CacheRepository
): Promise<CrosspostData> {
  const subreddit = communityEntry.subreddit;
  const communityName = communityEntry.community.name;

  logger(
    LogContext.Info,
    `Scraping posts from subreddit: ${subreddit}`,
    LogDomain.Reddit
  );
  const rawPosts = await scrapeSubreddit(
    config.reddit.baseUrl,
    communityEntry,
    cacheRepository
  );
  return {
    subreddit,
    communityName,
    posts: parseRawPosts(rawPosts),
  };
}
