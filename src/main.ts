import { LemmyHttp } from 'lemmy-js-client';
import { CacheRepository, PostRepository, getSubredditPosts } from './reddit';
import { logger, LogContext, LogDomain } from './logger';
import { crosspostToCommunity, getJwt, isCommunityQuiet } from './lemmy';
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
      let isQuiet = true;
      if (communityEntry.community.postIfQuietFor) {
        isQuiet = await isCommunityQuiet(
          lemmyClient,
          await getJwt(lemmyClient, jwt),
          communityEntry.community.name,
          communityEntry.community.postIfQuietFor
        );

        if (!isQuiet) {
          logger(
            LogContext.Info,
            `The community ${communityEntry.community.name} was active in the past ${communityEntry.community.postIfQuietFor} hour(s), skipping...`,
            LogDomain.Lemmy
          );
          continue;
        }
      }

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
