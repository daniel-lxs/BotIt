import cron, { CronJob } from 'cron';
import minimist, { ParsedArgs } from 'minimist';
import * as fs from 'fs';
import * as yaml from 'yaml';
import path from 'path';
import sqlite3 from 'sqlite3';

import { start } from './main';
import { Config } from './model/Config';
import { LemmyHttp } from 'lemmy-js-client';
import { getJwt } from './lemmy/api/getJwt';
import { CacheRepository } from './reddit/repository/CacheRepository';
import { logger, LogContext, LogDomain } from './logger';
import { PostRepository } from './reddit/repository/PostRepository';

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

  const dbPath = path.resolve(__dirname, '../src/reddit/data/db.sqlite');

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      logger(
        LogContext.Error,
        `Error connecting to local db: ${err}`,
        LogDomain.Scheduler
      );
    }
  });

  const cacheRepository = new CacheRepository(db);
  const postRepository = new PostRepository(db);

  if (cronExpression) {
    const job = new CronJob({
      cronTime: cronExpression,
      onTick: () => {
        logger(
          LogContext.Info,
          'Running scheduled fetch...',
          LogDomain.Scheduler
        );
        start(lemmyClient, config, jwt, cacheRepository, postRepository);
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
    start(lemmyClient, config, jwt, cacheRepository, postRepository);
  }
}

runScheduler().catch((error) => {
  logger(LogContext.Error, `An error occurred: ${error}`, LogDomain.Scheduler);
});
