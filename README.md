
# Botlt

Botlt is a Node.js application that scrapes posts from a specific subreddit on Reddit and posts them on a /kbin magazine or Lemmy community. It utilizes the `axios` library for making HTTP requests and the Lemmy JS client library for interacting with the Lemmy platform.

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

To run the bot, use the following command:

```bash
npm run start
```

The bot will scrape posts from the specified subreddit on Reddit according to the configuration file and post them on a kbin magazine.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [Unlicense](https://unlicense.org/).
