import { Post } from 'lemmy-js-client';

export function isPostOlderThanHours(post: Post, hours: number): boolean {
  const postDate = new Date(post.published);
  const currentDateTime = new Date();
  const hoursAgo = new Date(currentDateTime.getTime() - hours * 60 * 60 * 1000);

  return postDate < hoursAgo;
}
