import type { DefaultSize } from "../types.js";

export interface TextOptions {
  text: string;
  hidden?: string | boolean;
  autoHeight?: boolean;
}

export const TEXT_SIZE: DefaultSize = { w: 6, h: 24 };

export function textDSL(opts: TextOptions): Record<string, unknown> {
  return {
    text: opts.text,
    autoHeight: opts.autoHeight !== false ? "auto" : "fixed",
    hidden: opts.hidden ?? false,
    style: {},
  };
}
