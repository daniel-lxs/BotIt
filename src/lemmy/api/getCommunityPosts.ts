import { LemmyHttp } from 'lemmy-js-client';
import { LogContext, LogDomain, logger } from '../../logger';

export async function getCommunityPosts(
  client: LemmyHttp,
  jwt: string,
  communityId: number,
  limit?: number
) {
  const response = await client.getPosts({
    auth: jwt,
    community_id: communityId,
    limit: limit,
    sort: 'New',
  });
  return response.posts;
}
