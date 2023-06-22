import { getLinkPreview } from 'link-preview-js';
import { Post } from '../model/Post';
import { LinkPreview } from '../model/LinkPreview';
import { LogContext, LogDomain, logger } from '../../logger';

export async function getPostURLPreview(post: Post): Promise<Post> {
  //https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
  const postDeepCopy: Post = JSON.parse(JSON.stringify(post));
  try {
    const userAgent = process.env.USER_AGENT || 'googlebot';
    const headers = { 'user-agent': userAgent, 'Accept-Language': 'en-US' };

    const response = await getLinkPreview(post.url, { headers });
    const linkPreview = response as LinkPreview;

    if (linkPreview.description) {
      postDeepCopy.content = linkPreview.description;
    }
  } catch (error) {
    logger(
      LogContext.Error,
      'Something went wrong getting this post link preview, returning original post...',
      LogDomain.Lemmy
    );
    return post;
  }
  return postDeepCopy;
}
