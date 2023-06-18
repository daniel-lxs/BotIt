import * as fs from 'fs';
import * as yaml from 'yaml';
import { LemmyHttp } from 'lemmy-js-client';

import { scrapeSubreddit } from './reddit/api/scrapeSubreddit';
import { Config } from './model/Config';
import { parseRawPosts } from './reddit/service/parseRawPosts';
import { getJwt } from './lemmy/api/getJwt';
import { createPost } from './lemmy/api/createPost';
import { getCommunityId } from './lemmy/api/getCommunityId';
import { getCommunityPosts } from './lemmy/api/getCommunityPosts';
import { parseRawPostsToUrls } from './lemmy/service/parseRawPostsToUrls';

const dotenv = require('dotenv');
dotenv.config();

function getConfig(): Config {
  try {
    // Read the YAML configuration file
    const configFile = fs.readFileSync('config.yml', 'utf-8');
    return yaml.parse(configFile);
  } catch (error) {
    throw new Error(`Error reading the configuration file: ${error}`);
  }
}

async function start() {
  try {
    const config = getConfig();

    const lemmyClient = new LemmyHttp(config.lemmy.baseUrl);
    let jwt = await getJwt(lemmyClient);

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
        console.log(`Skipping already posted url: ${parsedPosts[i].url}`)
      }
      i++;
    }

    if (!newUrlFound) {
      console.log(`There aren't any new posts from reddit to crosspost to kbin.`)
      return;
    }

    const postUrl = await createPost(
      lemmyClient,
      await getJwt(lemmyClient, jwt),
      communityId,
      parsedPosts[i]
    );

    console.log(`Succesfully posted to: ${postUrl}`);
  } catch (error) {
    console.error('Process terminated: ', error);
  }
}

start();
