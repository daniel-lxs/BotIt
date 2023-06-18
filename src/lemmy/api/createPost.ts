import { CreatePost, LemmyHttp } from 'lemmy-js-client';

import { Post } from '../model/Post';

export async function createPost(
  client: LemmyHttp,
  jwt: string,
  communityId: number,
  post: Post
): Promise<string> {
  console.log('Posting');
  const postForm: CreatePost = {
    community_id: communityId,
    auth: jwt,
    name: post.title,
    body: post.content,
    url: post.url,
  };
  const postResponse = await client.createPost(postForm);

  console.log(JSON.stringify(postResponse));

  if (!postResponse.post_view.post.url) {
    throw new Error('Could not post');
  }
  return postResponse.post_view.post.url;
}
