# Botlt

Botlt is a Node.js application that scrapes posts containing external links from specific subreddits on Reddit and posts them on either a /kbin magazine or a Lemmy community. It allows for handling multiple subreddits and communities, with individual filters for each.

## Prerequisites

- Node.js (v14 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/driccio98/Botlt.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Botlt
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

The bot uses a `config.yml` file to determine the settings for scraping and posting. Adjust the values in the `config.yml` file according to your requirements.

Example `config.yml` file:
```yaml
reddit:
  baseUrl: https://old.reddit.com  # The base URL for accessing the Reddit website.

lemmy:
  baseUrl: https://lemmy.world  # The base URL for accessing the Lemmy website.

communityMap:
  - subreddit: exampleSubreddit
    postFilter:
      postLimit: 75  # Limits the number of posts to retrieve from the subreddit.
      minUpvotes: 800  # Sets the minimum number of upvotes a post must have to be included.
      maxDownvotes: 300  # Sets the maximum number of downvotes a post can have to be included.
      minUpvoteRatio: 0.75  # Defines the minimum ratio of upvotes to total votes a post must have to be included.
      maxTimeHours: 6  # Specifies the maximum age (in hours) of a post to be included.
      excludedUrlPatterns: # User defined regular expresions to exclude urls.
        - \.redd\.it$
        - reddit\.com
        - i\.redd.it\/\w+
        - v\.redd.it\/\w+
    community:
      name: BotIt@kbin.social
      postIfQuietFor: 5 # Posting will be skipped if a post is newer than this amount of hours

  - subreddit: exampleSubreddit
    postFilter:
      postLimit: 75
      minUpvotes: 800
      maxDownvotes: 300
      minUpvoteRatio: 0.75
      maxTimeHours: 5
      excludedUrlPatterns:
        - \.redd\.it$
        - reddit\.com
        - i\.redd.it\/\w+
        - v\.redd.it\/\w+
    community:       
      name: BotIt@kbin.social
      postIfQuietFor: 5
```

Additionally, set up the following environment variables by copying the provided `.env.template` file and renaming it to `.env`. Update the values in the `.env` file according to your Lemmy account:
- `LEMMY_USER`: Username for your Lemmy account
- `LEMMY_PASS`: Password for your Lemmy account

## Usage

To build the project, use the following command:
```bash
npm run build
```

To run the bot, use the following command:
```bash
npm start
```

The bot will scrape posts from the specified subreddits on Reddit according to the configuration file and post them on the corresponding /kbin magazines or Lemmy communities.

## Development

During development, you can use the following command to run the bot without the need for building:
```bash
npm run dev
```

This will use `ts-node` to directly run the TypeScript files.

## Scheduler

To schedule the bot to run at specific intervals, you can use the cron argument `--cron`. Make sure you have provided the necessary cron expression as a command-line argument.

To run the bot with the scheduler, use the following command:
```bash
npm run start -- --cron "*/5 * * * *"
```

Replace `"*/5 * * * *"` with your desired cron expression.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [Unlicense](https://unlicense.org/).
