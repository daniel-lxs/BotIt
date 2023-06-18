import { Post } from '../../lemmy/model/Post';
import { RawPost } from '../model/RawPost';

export function parseRawPosts(rawPosts: RawPost[]): Post[] {
  const posts = rawPosts.reduce((acc: Post[], rawPost) => {
    if (rawPost.data.url_overridden_by_dest != null) {
      const post: Post = {
        id: rawPost.data.id,
        title: rawPost.data.title,
        url: rawPost.data.url_overridden_by_dest,
      };
  
      if (rawPost.data.selftext.length) {
        post.content = rawPost.data.selftext;
      }

      acc.push(post);
    }

    return acc;
  }, []);

  console.log(`${posts.length} viable posts found:`)
  posts.forEach(post => {
    console.log(`* ${post.url} (${post.title})`);
  })

  return posts;
}