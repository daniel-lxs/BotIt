export interface PostFilter {
  minUpvotes?: number;
  maxDownvotes?: number;
  minUpvoteRatio?: number;
  maxTimeHours?: number;
  postLimit?: number;
}
