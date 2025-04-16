export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface Manifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  prefer_related_applications?: boolean;
  related_applications?: {
    platform: string;
    url: string;
    id?: string;
  }[];
  scope?: string;
  categories?: string[];
  screenshots?: {
    src: string;
    sizes: string;
    type: string;
    label?: string;
  }[];
  iarc_rating_id?: string;
  share_target?: {
    action: string;
    method?: string;
    enctype?: string;
    params?: {
      title?: string;
      text?: string;
      url?: string;
      files?: {
        name: string;
        accept: string[];
      }[];
    };
  };
} 