# Botlt

Botlt is a simple Node.js script that scrapes posts from a subreddit on Reddit without using the Reddit API. It utilizes the `cheerio` library for parsing HTML and the `axios` library for making HTTP requests.

## Prerequisites

- Node.js (v12 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd Botlt
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

To run the script, use the following command:

```bash
ts-node src/main.ts
```

The script will scrape posts from a specified subreddit on Reddit and display the scraped posts in the console output.

You can customize the script behavior by modifying the following variables in the `main.ts` file:

- `subreddit`: The name of the subreddit to scrape. By default, it is set to `'worldnews'` as a test.
- `postLimit`: The maximum number of posts to scrape. By default, it is set to `5`.
- `delay`: The delay (in milliseconds) between scraping each post. By default, it is set to `5000` (5 seconds).

Feel free to adjust these variables according to your requirements.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [Unlicense](https://unlicense.org/).
