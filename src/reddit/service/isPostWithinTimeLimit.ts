import { RawPost } from '../model/RawPost';

export function isPostWithinTimeLimit(
  post: RawPost,
  maxTimeHours: number
): boolean {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
  const maxTimeSeconds = maxTimeHours * 60 * 60; // Convert hours to seconds
  const maxTimestamp = now - maxTimeSeconds; // Maximum timestamp allowed

  return post.data.created_utc >= maxTimestamp;
}
