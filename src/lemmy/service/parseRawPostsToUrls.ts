import { PostView } from 'lemmy-js-client'

export function parseRawPostsToUrls(rawPosts: PostView[]): string[] {
    return rawPosts.reduce((acc: string[], postView) => {
        if (postView.post.url != null) {
            acc.push(postView.post.url);
        }
        return acc;
    }, []);
}