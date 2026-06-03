import type { DefaultSize } from "../types.js";

export interface SliderOptions {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: string | boolean;
  hidden?: string | boolean;
}

export const SLIDER_SIZE: DefaultSize = { w: 6, h: 5 };

export function sliderDSL(opts: SliderOptions = {}): Record<string, unknown> {
  return {
    label: { text: opts.label ?? "", align: "left" },
    defaultValue: { value: opts.defaultValue ?? 0 },
    min: { value: opts.min ?? 0 },
    max: { value: opts.max ?? 100 },
    step: { value: opts.step ?? 1 },
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
