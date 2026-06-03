import type { DefaultSize, EventHandler } from "../types.js";

export interface ButtonOptions {
  text?: string;
  type?: "default" | "submit";
  onClick?: string;
  disabled?: string | boolean;
  loading?: string | boolean;
  tooltip?: string;
  hidden?: string | boolean;
}

export const BUTTON_SIZE: DefaultSize = { w: 6, h: 6 };

function makeClickHandler(queryName: string): EventHandler {
  return {
    name: "click",
    handler: { compType: "executeQuery", comp: { queryName } },
  };
}

export function buttonDSL(opts: ButtonOptions): Record<string, unknown> {
  const onEvent: EventHandler[] = [];
  if (opts.onClick) {
    onEvent.push(makeClickHandler(opts.onClick));
  }
  return {
    text: opts.text ?? "Button",
    type: opts.type ?? "",
    onEvent,
    disabled: opts.disabled ?? false,
    loading: opts.loading ?? false,
    tooltip: opts.tooltip ?? "",
    hidden: opts.hidden ?? false,
  };
}
