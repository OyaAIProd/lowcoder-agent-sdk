import type { DefaultSize } from "../types.js";
import { genericChartDSL, type GenericChartOptions } from "./charts.js";

export type ChartType = "bar" | "line" | "pie" | "scatter";

/**
 * Chart genérico — alias para `genericChartDSL`.
 * Para charts especializados con más control usa `barChart`, `lineChart`,
 * `pieChart`, `gaugeChart`, `radarChart`, `funnelChart`, `heatmapChart`.
 */
export interface ChartOptions extends Omit<GenericChartOptions, "type"> {
  chartType?: ChartType;
}

export const CHART_SIZE: DefaultSize = { w: 12, h: 40 };

export function chartDSL(opts: ChartOptions): Record<string, unknown> {
  return genericChartDSL({
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    yAxisKey: opts.yAxisKey,
    title: opts.title,
    type: opts.chartType ?? "bar",
    hidden: opts.hidden,
  });
}
