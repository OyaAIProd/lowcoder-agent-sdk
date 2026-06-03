import type { DefaultSize } from "../types.js";

export interface InputOptions {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
  allowClear?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const INPUT_SIZE: DefaultSize = { w: 6, h: 6 };

export function inputDSL(opts: InputOptions): Record<string, unknown> {
  return {
    label: { text: opts.label ?? "", align: "left" },
    placeholder: opts.placeholder ?? "",
    defaultValue: { value: opts.defaultValue ?? "" },
    required: opts.required ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    allowClear: opts.allowClear ?? false,
    showCount: opts.showCount ?? false,
    maxLength: opts.maxLength ? { value: opts.maxLength } : { value: "" },
    onEvent: [],
  };
}
