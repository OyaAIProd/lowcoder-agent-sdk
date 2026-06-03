import type { DefaultSize } from "../types.js";

export interface ContainerOptions {
  hidden?: string | boolean;
  autoHeight?: boolean;
  scrollbars?: boolean;
}

export const CONTAINER_SIZE: DefaultSize = { w: 12, h: 25 };

export function containerDSL(opts: ContainerOptions = {}): Record<string, unknown> {
  return {
    autoHeight: opts.autoHeight !== false ? "auto" : "fixed",
    scrollbars: opts.scrollbars ?? false,
    hidden: opts.hidden ?? false,
    container: {
      header: { layout: {}, items: {} },
      body: { "0": { view: { layout: {}, items: {} } } },
      footer: { layout: {}, items: {} },
      showHeader: false,
      showFooter: false,
    },
    style: {},
  };
}
