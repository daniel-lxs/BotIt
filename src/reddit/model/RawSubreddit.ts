import { RawPost } from './RawPost';

export interface RawSubreddit {
  kind: string;
  data: {
    children: RawPost[];
  };
}
