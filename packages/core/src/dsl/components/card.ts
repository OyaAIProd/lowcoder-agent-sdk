import type { DefaultSize } from "../types.js";

export interface CardOptions {
  title?: string;
  showTitle?: boolean;
  showHoverEffect?: boolean;
  cardType?: "custom" | "common";
  hidden?: string | boolean;
}

export const CARD_SIZE: DefaultSize = { w: 8, h: 40 };

export function cardDSL(opts: CardOptions = {}): Record<string, unknown> {
  return {
    title: opts.title ?? "",
    showTitle: opts.showTitle ?? true,
    showHoverEffect: opts.showHoverEffect ?? false,
    cardType: opts.cardType ?? "custom",
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
