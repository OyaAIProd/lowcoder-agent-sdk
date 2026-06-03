import type { DefaultSize } from "../types.js";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectOptions {
  label?: string;
  placeholder?: string;
  options?: SelectOption[] | string;
  defaultValue?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
}

export const SELECT_SIZE: DefaultSize = { w: 6, h: 5 };

export function selectDSL(opts: SelectOptions): Record<string, unknown> {
  const options = Array.isArray(opts.options)
    ? opts.options
    : opts.options
    ? { type: "mapData", data: opts.options }
    : [];

  return {
    label: { text: opts.label ?? "", align: "left" },
    placeholder: opts.placeholder ?? "",
    options,
    defaultValue: { value: opts.defaultValue ?? "" },
    allowClear: opts.allowClear ?? false,
    showSearch: opts.showSearch ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
