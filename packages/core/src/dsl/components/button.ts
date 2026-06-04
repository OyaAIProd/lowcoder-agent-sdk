import type { DefaultSize, EventHandler } from "../types.js";

export interface ButtonOptions {
  text?: string;
  /**
   * Tipo del botón:
   * - `""` (default) o `"default"`: botón normal — ejecuta `onClick` / `onEvent`.
   * - `"submit"`: trata el botón como submit de un Form padre. **Si NO está dentro
   *   de un Form, el botón pierde silenciosamente su `onClick`** (Lowcoder
   *   `handleClick` ramifica a `submitForm()` y omite `handleClickEvent()`).
   *
   * REGLA: solo usa `"submit"` cuando el botón está visualmente dentro de
   * `addComponent("myForm", "form", { items: { ..., btnKey: { compType: "button", ... } } })`.
   * Para botones sueltos en el grid, usa default y referencía la query con `onClick`.
   */
  type?: "default" | "submit";
  /** Nombre de la query a ejecutar al hacer click (genera handler `executeQuery`). */
  onClick?: string;
  /** Form al que pertenece el botón. Necesario si `type: "submit"`. */
  form?: string;
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

  // Anti-foot-gun: type="submit" sin form ref + onClick definido.
  // En Lowcoder, type="submit" hace que el button ejecute submitForm(form)
  // y OMITA el onEvent. Es uno de los bugs más silenciosos del DSL.
  if (opts.type === "submit" && opts.onClick && !opts.form) {
    // eslint-disable-next-line no-console
    console.warn(
      `[lowcoder-sdk] Button "${opts.text ?? ""}" tiene type:"submit" + onClick:"${opts.onClick}" ` +
      `pero NO tiene form asociado. Lowcoder ignorará el onClick y el botón ` +
      `parecerá no hacer nada. Usa type:"default" (omítelo) o pasa form:"<formId>".`
    );
  }

  return {
    text: opts.text ?? "Button",
    type: opts.type ?? "",
    onEvent,
    ...(opts.form ? { form: opts.form } : {}),
    disabled: opts.disabled ?? false,
    loading: opts.loading ?? false,
    tooltip: opts.tooltip ?? "",
    hidden: opts.hidden ?? false,
  };
}
