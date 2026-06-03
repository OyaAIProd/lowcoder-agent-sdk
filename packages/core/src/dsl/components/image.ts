import type { DefaultSize } from "../types.js";

export interface ImageOptions {
  src: string;
  altText?: string;
  hidden?: string | boolean;
  autoHeight?: boolean;
}

export const IMAGE_SIZE: DefaultSize = { w: 6, h: 25 };

export function imageDSL(opts: ImageOptions): Record<string, unknown> {
  return {
    src: opts.src,
    altText: opts.altText ?? "",
    autoHeight: opts.autoHeight !== false ? "auto" : "fixed",
    hidden: opts.hidden ?? false,
    style: {},
    onEvent: [],
  };
}
