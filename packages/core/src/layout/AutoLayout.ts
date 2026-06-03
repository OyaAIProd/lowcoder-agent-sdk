import type { DefaultSize, LayoutItem, LayoutPos, UICompType } from "../dsl/types.js";

export const GRID_COLS = 24;

export interface ComponentEntry {
  id: string;
  compType: UICompType | string;
  options: Record<string, unknown>;
  at?: LayoutPos;
}

export class AutoLayout {
  /**
   * Calcula posiciones de grid para todos los componentes.
   * Los que tienen `at` con x e y se colocan manualmente y reservan su espacio.
   * El resto se auto-posiciona con first-fit bin-packing de izquierda a derecha.
   */
  static compute(
    components: ComponentEntry[],
    defaultSizes: Partial<Record<string, DefaultSize>>
  ): Record<string, Omit<LayoutItem, "i">> {
    const result: Record<string, Omit<LayoutItem, "i">> = {};
    const occupied: Array<{ x: number; y: number; w: number; h: number }> = [];

    // Primera pasada: componentes con posición manual
    for (const comp of components) {
      if (comp.at?.x !== undefined && comp.at?.y !== undefined) {
        const size = defaultSizes[comp.compType] ?? { w: 6, h: 5 };
        const entry = {
          x: comp.at.x,
          y: comp.at.y,
          w: comp.at.w ?? size.w,
          h: comp.at.h ?? size.h,
        };
        result[comp.id] = entry;
        occupied.push(entry);
      }
    }

    // Segunda pasada: componentes auto-posicionados
    let cursorY = 0;
    for (const comp of components) {
      if (result[comp.id]) continue;

      const size = defaultSizes[comp.compType] ?? { w: 6, h: 5 };
      const w = comp.at?.w ?? size.w;
      const h = comp.at?.h ?? size.h;

      const pos = AutoLayout.findFirstFit(occupied, w, h, cursorY);
      const entry = { x: pos.x, y: pos.y, w, h };
      result[comp.id] = entry;
      occupied.push(entry);

      // Si el componente ocupa más de la mitad del grid, el siguiente empieza en nueva fila
      if (w >= GRID_COLS / 2) {
        cursorY = pos.y + h;
      }
    }

    return result;
  }

  private static findFirstFit(
    occupied: Array<{ x: number; y: number; w: number; h: number }>,
    w: number,
    h: number,
    startY: number
  ): { x: number; y: number } {
    for (let y = startY; y < startY + 10000; y++) {
      for (let x = 0; x <= GRID_COLS - w; x++) {
        if (AutoLayout.isFree(occupied, x, y, w, h)) {
          return { x, y };
        }
      }
    }
    return { x: 0, y: startY };
  }

  private static isFree(
    occupied: Array<{ x: number; y: number; w: number; h: number }>,
    x: number,
    y: number,
    w: number,
    h: number
  ): boolean {
    return !occupied.some(
      (item) =>
        x < item.x + item.w &&
        x + w > item.x &&
        y < item.y + item.h &&
        y + h > item.y
    );
  }
}
