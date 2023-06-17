import * as cheerio from "cheerio";
import axios from "axios";

import { Post } from "./model/Post";

async function scrapeSubreddit(postLimit: number, delay: number) {
  try {
    const baseUrl = "https://old.reddit.com";
    const subreddit = "worldnews";
    const postListResponse = await axios.get(`${baseUrl}/r/${subreddit}`);

    const $postList = cheerio.load(postListResponse.data);

    const posts: Post[] = [];

    let scrapedPosts = 0; // Counter for the scraped posts

    const elements = $postList(".sitetable.linklisting a.title").toArray();

    for (let i = 0; i < elements.length && scrapedPosts < postLimit; i++) {
      const element = elements[i];

      if ($postList(element).attr('data-outbound-expiration') === '0') {
        continue; // Stickied post
      }

      const postTitle = $postList(element).text().trim();
      const postLink = $postList(element).attr("href");
      const post: Post = { title: postTitle, link: postLink };

      if (postLink?.includes("/r/")) {
        // Delay execution before parsing post content
        await new Promise((resolve) =>
          setTimeout(resolve, delay * scrapedPosts)
        );

        const postPageResponse = await axios.get(`${baseUrl}${post.link}`);
        const $postPage = cheerio.load(postPageResponse.data);

        const postContent = $postPage(".entry.unvoted .usertext-body")
          .first()
          .text()
          .trim()
          .replace(/\\[^\w\s]/g, "");
        post.content = postContent;
      }

      posts.push(post);
      scrapedPosts++; // Increment the counter after each post is scraped
    }

    console.log(JSON.stringify(posts));
  } catch (error) {
    console.error("Error: ", error);
  }
}

// Call the function with the desired post limit (e.g., 5 posts) and delay (e.g., 5000 milliseconds)
scrapeSubreddit(5, 5000);
