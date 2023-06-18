import * as fs from 'fs';
import * as yaml from 'yaml';
import { LemmyHttp } from 'lemmy-js-client';

import { scrapeSubreddit } from './reddit/api/scrapeSubreddit';
import { Config } from './model/Config';
import { parseRawPosts } from './kbin/service/parseRawPosts';
import { getJwt } from './lemmy/api/getJwt';
import { createPost } from './lemmy/api/createPost';
import { getCommunityId } from './lemmy/api/getCommunityId';

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

    const rawPosts = await scrapeSubreddit(config.reddit);
    const parsedPosts = parseRawPosts(rawPosts);

    const postUrl = createPost(
      lemmyClient,
      await getJwt(lemmyClient, jwt),
      communityId,
      parsedPosts[1]
    );

    console.log(JSON.stringify(postUrl));
  } catch (error) {
    console.error('Process terminated: ', error);
  }
}

start();
