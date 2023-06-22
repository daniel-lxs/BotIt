export interface LinkPreview {
  url: string;
  title: string;
  siteName: string | undefined;
  description: string | undefined;
  mediaType: string;
  contentType: string | undefined;
  images: string[];
  videos: Video[];
  favicons: string[];
}

export interface Video {
  url: string | undefined;
  secureUrl: string | null | undefined;
  type: string | null | undefined;
  width: string | undefined;
  height: string | undefined;
}
