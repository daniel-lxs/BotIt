# Botlt

Botlt is a Node.js application that scrapes posts that contain external links from a specific subreddit on Reddit and posts them on a /kbin magazine or Lemmy community. It will take into account the posts that already exist in the community and won't post duplicates. It utilizes the `axios` library for making HTTP requests and the Lemmy JS client (`lemmy-js-client`) library for interacting with the Lemmy platform.

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

The bot uses a `config.yml` file to determine the subreddit to scrape and the criteria for selecting posts, as well as the Lemmy platform information. Adjust the values in the `config.yml` file according to your requirements.

Example `config.yml` file:
```yaml
reddit:
  baseUrl: https://old.reddit.com
  subreddit: worldnews
  postFilter:
    limit: 5
    minUpvotes: 500
    maxDownvotes: 500
    minUpvoteRatio: 0.70
    maxTimeHours: 4

lemmy:
  baseUrl: https://lemmy.world
  communityName: botlt_test@kbin.social
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

The bot will scrape posts from the specified subreddit on Reddit according to the configuration file and post them on a /kbin magazine or a Lemmy community.

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

