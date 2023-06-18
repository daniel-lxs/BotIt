import cron, { CronJob } from 'cron';
import minimist, { ParsedArgs } from 'minimist';
import * as fs from 'fs';
import * as yaml from 'yaml';

import { start } from './main';
import { Config } from './model/Config';
import { LemmyHttp } from 'lemmy-js-client';
import { getJwt } from './lemmy/api/getJwt';

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

async function runScheduler(): Promise<void> {
  // Parse command-line arguments using minimist
  const args: ParsedArgs = minimist(process.argv.slice(2));
  const cronExpression = args['cron'];

  const config = getConfig();

  const lemmyClient = new LemmyHttp(config.lemmy.baseUrl);
  let jwt = await getJwt(lemmyClient);

  if (cronExpression) {
    const job = new CronJob({
      cronTime: cronExpression,
      onTick: () => {
        console.log('[Scheduler] Running scheduled fetch...');
        start(lemmyClient, config, jwt);
      },
      start: false,
    });

    console.log('[Scheduler] Scheduler started.');
    // Start the cron job
    job.start();
  } else {
    console.log(
      '[Scheduler] Cron expression not provided. Please specify the --cron argument.'
    );
    process.exit(1);
  }
}

runScheduler().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
