import { CreatePost, LemmyHttp } from 'lemmy-js-client';

import { Post } from '../model/Post';

export async function createPost(
  client: LemmyHttp,
  jwt: string,
  communityId: number,
  { title, content, url }: Post
): Promise<string | void> {
  console.log(`Posting ${url} (${title})...`);
  try {
    if (title.length > 200) {
      title = title.slice(0, 197) + '...';
    }
    const postForm: CreatePost = {
      community_id: communityId,
      auth: jwt,
      name: title,
      body: content,
      url: url,
    };
    const postResponse = await client.createPost(postForm);
    //console.log(JSON.stringify(postResponse));
    if (!postResponse.post_view.post.ap_id) {
      throw new Error('Could not post');
    }
    return postResponse.post_view.post.ap_id;
  } catch (error) {
    console.error(
      'An error occurred during the post creation process. It is uncertain whether the post was successfully created.',
      error
    );
    return;
  }
}
