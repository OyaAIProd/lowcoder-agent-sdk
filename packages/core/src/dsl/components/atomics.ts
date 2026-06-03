/**
 * Componentes atómicos pequeños sin opciones complejas:
 * link, icon, iconButton, floatingButton, progress, progressCircle,
 * timer, avatar, qrCode, jsonLottie.
 */
import type { DefaultSize } from "../types.js";

// ─── Link ─────────────────────────────────────────────────────────────────────

export interface LinkOptions {
  text: string;
  onClick?: string;                    // nombre de query
  href?: string;                       // URL alternativa
  hidden?: string | boolean;
  disabled?: string | boolean;
}

export const LINK_SIZE: DefaultSize = { w: 3, h: 5 };

export function linkDSL(opts: LinkOptions): Record<string, unknown> {
  const onEvent: unknown[] = [];
  if (opts.onClick) {
    onEvent.push({
      name: "click",
      handler: { compType: "executeQuery", comp: { queryName: opts.onClick } },
    });
  } else if (opts.href) {
    onEvent.push({
      name: "click",
      handler: { compType: "openUrl", comp: { url: opts.href } },
    });
  }
  return {
    text: opts.text,
    onEvent,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
  };
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

export interface IconOptions {
  icon: string;                       // formato "/icon:antd/dashboard-outlined"
  iconSize?: string;                  // "24px"
  hidden?: string | boolean;
  autoHeight?: boolean;
}

export const ICON_SIZE: DefaultSize = { w: 3, h: 5 };

export function iconDSL(opts: IconOptions): Record<string, unknown> {
  return {
    icon: opts.icon,
    iconSize: opts.iconSize ?? "20px",
    autoHeight: opts.autoHeight !== false ? "auto" : "fixed",
    hidden: opts.hidden ?? false,
    style: {},
  };
}

// ─── Icon Button ──────────────────────────────────────────────────────────────

export interface IconButtonOptions {
  prefixIcon: string;
  text?: string;
  onClick?: string;
  type?: "default" | "primary" | "dashed" | "text" | "link";
  shape?: "default" | "circle" | "round";
  hidden?: string | boolean;
  disabled?: string | boolean;
}

export function iconButtonDSL(opts: IconButtonOptions): Record<string, unknown> {
  const onEvent: unknown[] = [];
  if (opts.onClick) {
    onEvent.push({
      name: "click",
      handler: { compType: "executeQuery", comp: { queryName: opts.onClick } },
    });
  }
  return {
    text: opts.text ?? "",
    prefixIcon: opts.prefixIcon,
    type: opts.type ?? "default",
    shape: opts.shape ?? "default",
    onEvent,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
  };
}

// ─── Floating Button ──────────────────────────────────────────────────────────

export interface FloatingButtonOptions {
  buttons?: Array<{ id: string; label: string; icon?: string; onClick?: string }>;
  icon?: string;
  hidden?: string | boolean;
}

export function floatingButtonDSL(opts: FloatingButtonOptions = {}): Record<string, unknown> {
  return {
    icon: opts.icon ?? "/icon:antd/plus-outlined",
    buttons: (opts.buttons ?? []).map((b) => ({
      id: b.id,
      label: b.label,
      icon: b.icon ?? "",
      onEvent: b.onClick
        ? [{ name: "click", handler: { compType: "executeQuery", comp: { queryName: b.onClick } } }]
        : [],
    })),
    hidden: opts.hidden ?? false,
  };
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressOptions {
  value: number | string;
  showInfo?: boolean;
  type?: "line" | "circle";
  status?: "normal" | "exception" | "active" | "success";
  hidden?: string | boolean;
}

export function progressDSL(opts: ProgressOptions): Record<string, unknown> {
  // `value` se acepta como string o número y se serializa como string (Lowcoder lo evalúa).
  // No envolver en { value: N } — eso causa que use el default (60%).
  return {
    value: typeof opts.value === "number" ? String(opts.value) : opts.value,
    showInfo: opts.showInfo !== false,
    status: opts.status ?? "normal",
    hidden: opts.hidden ?? false,
  };
}

export function progressCircleDSL(opts: ProgressOptions): Record<string, unknown> {
  return progressDSL(opts);
}

// ─── Timer ────────────────────────────────────────────────────────────────────

export interface TimerOptions {
  defaultValue?: number;            // milisegundos
  format?: string;                  // "HH:mm:ss"
  type?: "countdown" | "stopwatch";
  hidden?: string | boolean;
}

export function timerDSL(opts: TimerOptions = {}): Record<string, unknown> {
  return {
    defaultValue: opts.defaultValue ?? 0,
    format: opts.format ?? "HH:mm:ss",
    type: opts.type ?? "stopwatch",
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export interface AvatarOptions {
  src?: string;
  text?: string;
  shape?: "circle" | "square";
  size?: "large" | "default" | "small" | number;
  hidden?: string | boolean;
}

export function avatarDSL(opts: AvatarOptions = {}): Record<string, unknown> {
  return {
    src: opts.src ?? "",
    text: opts.text ?? "",
    shape: opts.shape ?? "circle",
    size: opts.size ?? "default",
    hidden: opts.hidden ?? false,
  };
}

// ─── Mermaid ──────────────────────────────────────────────────────────────────

export interface MermaidOptions {
  diagram: string;                  // código mermaid
  hidden?: string | boolean;
}

export function mermaidDSL(opts: MermaidOptions): Record<string, unknown> {
  return {
    mermaidString: opts.diagram,
    hidden: opts.hidden ?? false,
  };
}

// ─── jsonLottie (animaciones) ─────────────────────────────────────────────────

export interface JsonLottieOptions {
  value: string;                    // URL JSON Lottie o {{var}}
  speed?: number;
  loop?: boolean;
  autoPlay?: boolean;
  hidden?: string | boolean;
}

export function jsonLottieDSL(opts: JsonLottieOptions): Record<string, unknown> {
  return {
    value: opts.value,
    speed: opts.speed ?? 1,
    loop: opts.loop !== false,
    autoPlay: opts.autoPlay !== false,
    hidden: opts.hidden ?? false,
  };
}
