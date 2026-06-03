import type { DefaultSize } from "../types.js";

export interface NumberInputOptions {
  label?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
}

export const NUMBER_INPUT_SIZE: DefaultSize = { w: 6, h: 6 };

export function numberInputDSL(opts: NumberInputOptions): Record<string, unknown> {
  return {
    label: { text: opts.label ?? "", align: "left" },
    placeholder: opts.placeholder ?? "",
    defaultValue: { value: opts.defaultValue ?? "" },
    min: opts.min !== undefined ? { value: opts.min } : { value: "" },
    max: opts.max !== undefined ? { value: opts.max } : { value: "" },
    step: opts.step ?? 1,
    required: opts.required ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
