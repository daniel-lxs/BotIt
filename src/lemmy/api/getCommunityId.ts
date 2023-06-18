import { LemmyHttp } from 'lemmy-js-client';

export async function getCommunityId(
  client: LemmyHttp,
  jwt: string,
  communityName: string
) {
  const response = await client.getCommunity({
    auth: jwt,
    name: communityName,
  });

  return response.community_view.community.id;
}
