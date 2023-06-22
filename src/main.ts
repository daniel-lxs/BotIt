import { LemmyHttp } from 'lemmy-js-client';
import {
  CacheRepository,
  PostRepository,
  getSubredditPosts,
} from './reddit';
import { logger, LogContext } from './logger';
import { crosspostToCommunity } from './lemmy';
import { CommunityMapEntry, Config } from './model/Config';
import { CrosspostData } from './model/CrosspostData';

export async function start(
  lemmyClient: LemmyHttp,
  config: Config,
  jwt: string,
  cacheRepository: CacheRepository,
  postRepository: PostRepository
) {
  try {
    const communityMap: CommunityMapEntry[] = config.communityMap;

    const crosspostDataList: CrosspostData[] = [];
    for (const communityEntry of communityMap) {
      const crosspostData = await getSubredditPosts(
        config,
        communityEntry,
        cacheRepository
      );
      crosspostDataList.push(crosspostData);
    }

    for (const crosspostData of crosspostDataList) {
      await crosspostToCommunity(
        lemmyClient,
        jwt,
        crosspostData,
        config,
        postRepository
      );
    }
  } catch (error) {
    logger(LogContext.Error, 'Process terminated: ' + error);
  }
}
