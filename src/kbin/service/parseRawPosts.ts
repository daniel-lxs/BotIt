import { RawPost } from '../../reddit/model/RawPost';
import { Post } from '../model/Post';

export function parseRawPosts(rawPosts: RawPost[]): Post[] {
  const posts = rawPosts.map((rawPost) => {
    const post: Post = {
      id: rawPost.data.id,
      title: rawPost.data.title,
      url: rawPost.data.url_overridden_by_dest,
      posted: false,
    };

    if (rawPost.data.selftext.length) {
      post.content = rawPost.data.selftext;
    }
    return post;
  });

  return posts;
}
