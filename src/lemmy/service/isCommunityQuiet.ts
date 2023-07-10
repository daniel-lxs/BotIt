import { LemmyHttp } from 'lemmy-js-client';
import { getCommunityId } from '../api/getCommunityId';
import { getJwt } from '../api/getJwt';
import { getCommunityPosts } from '../api/getCommunityPosts';
import { isPostOlderThanHours } from './isPostOlderThanHours';

export async function isCommunityQuiet(
  lemmyClient: LemmyHttp,
  jwt: string,
  communityName: string,
  quietFor: number
) {
  const communityId = await getCommunityId(
    lemmyClient,
    await getJwt(lemmyClient, jwt),
    communityName
  );

  const latestPosts = await getCommunityPosts(
    lemmyClient,
    await getJwt(lemmyClient, jwt),
    communityId
  );

  for (let postView of latestPosts) {
    const post = postView.post;

    if (post.deleted || post.removed) {
      continue;
    }
    return isPostOlderThanHours(post, quietFor);
  }
  return true;
}
