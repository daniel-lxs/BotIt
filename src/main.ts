import { LemmyHttp } from 'lemmy-js-client';

import { scrapeSubreddit } from './reddit/api/scrapeSubreddit';
import { Config } from './model/Config';
import { parseRawPosts } from './reddit/service/parseRawPosts';
import { getJwt } from './lemmy/api/getJwt';
import { createPost } from './lemmy/api/createPost';
import { getCommunityId } from './lemmy/api/getCommunityId';
import { getCommunityPosts } from './lemmy/api/getCommunityPosts';
import { parseRawPostsToUrls } from './lemmy/service/parseRawPostsToUrls';

export async function start(
  lemmyClient: LemmyHttp,
  config: Config,
  jwt: string
) {
  try {
    const communityName = config.lemmy.communityName;
    const communityId = await getCommunityId(
      lemmyClient,
      await getJwt(lemmyClient, jwt),
      communityName
    );
    const communityPosts = await getCommunityPosts(
      lemmyClient,
      await getJwt(lemmyClient, jwt),
      communityId,
      config.lemmy.limit
    );
    const communityUrls = parseRawPostsToUrls(communityPosts);

    const rawPosts = await scrapeSubreddit(config.reddit);
    const parsedPosts = parseRawPosts(rawPosts);

    let i = 0;
    let newUrlFound = false;
    while (!newUrlFound && i < parsedPosts.length) {
      if (!communityUrls.includes(parsedPosts[i].url)) {
        console.log('Found a reddit post to crosspost to kbin!');
        newUrlFound = true;
        break;
      } else {
        console.log(`Skipping already posted url: ${parsedPosts[i].url}`);
      }
      i++;
    }

    if (!newUrlFound) {
      console.log(
        `There aren't any new posts from reddit to crosspost to ${communityName}.`
      );
      return;
    }

    const postUrl = await createPost(
      lemmyClient,
      await getJwt(lemmyClient, jwt),
      communityId,
      parsedPosts[i]
    );

    if (!postUrl) {
      console.log('Post url unavailable');
      return;
    }
    
    console.log(`Succesfully posted to: ${postUrl}`);
  } catch (error) {
    console.error('Process terminated: ', error);
  }
}
