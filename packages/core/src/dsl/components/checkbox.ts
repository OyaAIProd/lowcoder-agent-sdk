import type { DefaultSize } from "../types.js";

export interface CheckboxOptions {
  label?: string;
  defaultValue?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
}

export const CHECKBOX_SIZE: DefaultSize = { w: 4, h: 5 };

export function checkboxDSL(opts: CheckboxOptions): Record<string, unknown> {
  return {
    label: { text: opts.label ?? "", align: "left" },
    defaultValue: opts.defaultValue ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
