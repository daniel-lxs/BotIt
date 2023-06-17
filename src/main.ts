import * as fs from 'fs';
import * as yaml from 'yaml';

import { scrapeSubreddit } from './reddit/api/scrapeSubreddit';
import { Config } from './model/Config';
import { parseRawPosts } from './kbin/service/parseRawPosts';

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
    const rawPosts = await scrapeSubreddit(config.reddit);
    const parsedPosts = parseRawPosts(rawPosts);

    console.log(JSON.stringify(parsedPosts));
  } catch (error) {
    console.error('Process terminated: ', error);
  }
}

start();
