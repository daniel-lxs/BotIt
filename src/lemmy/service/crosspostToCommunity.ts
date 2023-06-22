import { LemmyHttp } from 'lemmy-js-client';

import {
  getJwt,
  createPost,
  getCommunityId,
  getCommunityPosts,
  parseRawPostsToUrls,
  getPostURLPreview,
} from '../../lemmy';
import { CrosspostData } from '../../model/CrosspostData';
import { Config } from '../../model/Config';
import { PostRepository } from '../../reddit/repository/PostRepository';
import { LogContext, LogDomain, logger } from '../../logger';

export async function crosspostToCommunity(
  lemmyClient: LemmyHttp,
  jwt: string,
  crosspostData: CrosspostData,
  config: Config,
  postRepository: PostRepository
) {
  const { subreddit, communityName, posts } = crosspostData;
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
    const post = posts[i];

    if (!communityUrls.includes(post.url)) {
      // Check if the post already exists using getPostByUrl
      const existingPost = await postRepository.getPostByUrl(
        post.url,
        communityName
      );

      if (existingPost) {
        logger(
          LogContext.Info,
          `Post with URL ${post.url} already exists in the database. Skipping...`,
          LogDomain.Lemmy
        );
        i++;
        continue;
      }

      logger(
        LogContext.Info,
        `Found a Reddit post from subreddit ${subreddit} to crosspost to ${communityName}!`,
        LogDomain.Lemmy
      );
      newUrlFound = true;
      break;
    } else {
      logger(
        LogContext.Info,
        `Skipping already posted URL: ${post.url}`,
        LogDomain.Lemmy
      );
    }

    i++;
  }

  if (!newUrlFound) {
    logger(
      LogContext.Info,
      `There aren't any new posts from subreddit ${subreddit} to crosspost to ${communityName}.`,
      LogDomain.Lemmy
    );
    return;
  }

  const postWithPreview = await getPostURLPreview(posts[i]);

  logger(LogContext.Warning, JSON.stringify(postWithPreview), LogDomain.Lemmy);

  const postUrl = await createPost(
    lemmyClient,
    await getJwt(lemmyClient, jwt),
    communityId,
    postWithPreview
  );

  if (!postUrl) {
    logger(LogContext.Error, 'Post url unavailable', LogDomain.Lemmy);
    return;
  }

  logger(
    LogContext.Info,
    `Successfully posted to ${communityName}: ${postUrl}`,
    LogDomain.Lemmy
  );

  // Save the posted post using the PostRepository
  await postRepository.savePost({ ...posts[i], communityName });
}
