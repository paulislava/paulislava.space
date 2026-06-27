declare module 'TagCloud' {
  interface TagCloudOptions {
    radius?: number;
    maxSpeed?: 'slow' | 'normal' | 'fast';
    initSpeed?: 'slow' | 'normal' | 'fast';
    direction?: number;
    keep?: boolean;
  }
  interface TagCloudInstance {
    destroy(): void;
  }
  function TagCloud(
    container: HTMLElement | string,
    texts: string[],
    options?: TagCloudOptions
  ): TagCloudInstance;
  export default TagCloud;
}
