import type { DefaultSize } from "../types.js";

export interface DividerOptions {
  title?: string;
  align?: "left" | "center" | "right";
  vertical?: boolean;
  hidden?: string | boolean;
}

export const DIVIDER_SIZE: DefaultSize = { w: 24, h: 3 };

export function dividerDSL(opts: DividerOptions = {}): Record<string, unknown> {
  return {
    title: opts.title ?? "",
    align: opts.align ?? "center",
    type: opts.vertical ?? false,
    hidden: opts.hidden ?? false,
    style: {},
  };
}
