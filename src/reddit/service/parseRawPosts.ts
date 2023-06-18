import { Post } from '../../lemmy/model/Post';
import { RawPost } from '../model/RawPost';

export function parseRawPosts(rawPosts: RawPost[]): Post[] {
  const posts = rawPosts.map((rawPost) => {
    const post: Post = {
      id: rawPost.data.id,
      title: rawPost.data.title,
      url: rawPost.data.url_overridden_by_dest,
    };

    if (rawPost.data.selftext.length) {
      post.content = rawPost.data.selftext;
    }
    return post;
  });

  return posts;
}