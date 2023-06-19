import cron, { CronJob } from 'cron';
import minimist, { ParsedArgs } from 'minimist';
import * as fs from 'fs';
import * as yaml from 'yaml';

import { start } from './main';
import { Config } from './model/Config';
import { LemmyHttp } from 'lemmy-js-client';
import { getJwt } from './lemmy/api/getJwt';
import { CacheRepository } from './reddit/repository/CacheRepository';
import { logger, LogContext, LogDomain } from './logger';

const dotenv = require('dotenv');
dotenv.config();

function getConfig(): Config {
  try {
    // Read the YAML configuration file
    const configFile = fs.readFileSync('config.yml', 'utf-8');
    return yaml.parse(configFile);
  } catch (error) {
    logger(
      LogContext.Error,
      `Error reading the configuration file: ${error}`,
      LogDomain.Scheduler
    );
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

  const cacheRepository = new CacheRepository();

  if (cronExpression) {
    const job = new CronJob({
      cronTime: cronExpression,
      onTick: () => {
        logger(
          LogContext.Info,
          'Running scheduled fetch...',
          LogDomain.Scheduler
        );
        start(lemmyClient, config, jwt, cacheRepository);
      },
      start: false,
    });

    logger(LogContext.Info, 'Scheduler started.', LogDomain.Scheduler);
    // Start the cron job
    job.start();
  } else {
    logger(
      LogContext.Info,
      'Cron expression not provided. Running fetch once...',
      LogDomain.Scheduler
    );
    start(lemmyClient, config, jwt, cacheRepository);
  }
}

runScheduler().catch((error) => {
  logger(LogContext.Error, `An error occurred: ${error}`, LogDomain.Scheduler);
});
