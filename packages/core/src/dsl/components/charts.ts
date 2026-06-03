/**
 * Wrappers para los charts especializados de Lowcoder (Apache ECharts).
 * Todos los charts comparten la misma estructura DSL base — sólo cambia el
 * `compType` registrado y el `chartConfig.compType` interno.
 *
 * Formato confirmado en client/packages/lowcoder-comps/src/comps/chartComp/.
 */
import { genGridKey } from "../../utils/idGenerator.js";
import type { DefaultSize } from "../types.js";

function makeSeries(seriesName: string, columnName: string) {
  return {
    seriesName,
    columnName,
    hide: false,
    dataIndex: genGridKey(),
  };
}

function baseChartDSL(opts: {
  title?: string;
  data: string;
  xAxisKey: string;
  series: Array<{ seriesName: string; columnName: string }>;
  chartCompType: "bar" | "line" | "pie" | "scatter";
  chartComp?: Record<string, unknown>;
  hidden?: string | boolean;
}): Record<string, unknown> {
  return {
    mode: "ui",
    title: opts.title ?? "",
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    xAxisDirection: "horizontal",
    series: opts.series.map((s) => makeSeries(s.seriesName, s.columnName)),
    chartConfig: {
      compType: opts.chartCompType,
      comp: opts.chartComp ?? {},
    },
    xConfig: {},
    yConfig: {},
    legendConfig: {},
    hidden: opts.hidden ?? false,
    onUIEvent: [],
    onEvent: [],
  };
}

// ─── Bar / Line ───────────────────────────────────────────────────────────────

export interface BarLineChartOptions {
  data: string;
  xAxisKey: string;
  yAxisKeys: string[];
  title?: string;
  hidden?: string | boolean;
  stacked?: boolean;
  showLabel?: boolean;
}

export const BAR_CHART_SIZE: DefaultSize = { w: 12, h: 40 };

export function barChartDSL(opts: BarLineChartOptions): Record<string, unknown> {
  return baseChartDSL({
    title: opts.title,
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    series: opts.yAxisKeys.map((k) => ({ seriesName: k, columnName: k })),
    chartCompType: "bar",
    chartComp: {
      type: opts.stacked ? "stackedBar" : "basicBar",
      showLabel: opts.showLabel ?? false,
    },
    hidden: opts.hidden,
  });
}

export function lineChartDSL(opts: BarLineChartOptions): Record<string, unknown> {
  return baseChartDSL({
    title: opts.title,
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    series: opts.yAxisKeys.map((k) => ({ seriesName: k, columnName: k })),
    chartCompType: "line",
    chartComp: {
      type: opts.stacked ? "stackedLine" : "basicLine",
      showLabel: opts.showLabel ?? false,
    },
    hidden: opts.hidden,
  });
}

// ─── Pie ──────────────────────────────────────────────────────────────────────

export interface PieChartOptions {
  data: string;
  labelKey: string;
  valueKey: string;
  title?: string;
  donut?: boolean;
  hidden?: string | boolean;
}

export function pieChartDSL(opts: PieChartOptions): Record<string, unknown> {
  return baseChartDSL({
    title: opts.title,
    data: opts.data,
    xAxisKey: opts.labelKey,
    series: [{ seriesName: opts.valueKey, columnName: opts.valueKey }],
    chartCompType: "pie",
    chartComp: { type: opts.donut ? "doughnut" : "basicPie" },
    hidden: opts.hidden,
  });
}

// ─── Scatter ──────────────────────────────────────────────────────────────────

export interface ScatterChartOptions {
  data: string;
  xAxisKey: string;
  yAxisKey: string;
  title?: string;
  hidden?: string | boolean;
}

export function scatterChartDSL(opts: ScatterChartOptions): Record<string, unknown> {
  return baseChartDSL({
    title: opts.title,
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    series: [{ seriesName: opts.yAxisKey, columnName: opts.yAxisKey }],
    chartCompType: "scatter",
    chartComp: {},
    hidden: opts.hidden,
  });
}

// ─── Charts especializados (gauge/radar/funnel/heatmap) ───────────────────────
// Estos son componentes propios con DSL similar pero más simple
// (no usan chartConfig con discriminador).

export interface GaugeChartOptions {
  /**
   * Valor numérico (0-100 por defecto). Acepta:
   * - número directo: `68`
   * - string con expresión: `"{{cpuUsage.value}}"`
   * - JSON con formatter: `'{"value":68,"formatter":"{value}%"}'`
   */
  value: number | string;
  title?: string;
  unit?: string;
  /** Subtipo de gauge: Default | Stage | Grade | Temperature | Clock | Barometer | MultiTitle | Ring */
  chartType?: "Default" | "Stage" | "Grade" | "Temperature" | "Clock" | "Barometer" | "MultiTitle" | "Ring";
  hidden?: string | boolean;
}

export const GAUGE_CHART_SIZE: DefaultSize = { w: 8, h: 40 };

export function gaugeChartDSL(opts: GaugeChartOptions): Record<string, unknown> {
  // El gaugeChart de Lowcoder requiere `echartsOption` con array `data[].value`.
  // Aceptamos número o expresión y construimos el JSON correcto.
  const formatter = opts.unit ? `{value} ${opts.unit}` : "{value}";
  let echartsOption: string;
  if (typeof opts.value === "number") {
    echartsOption = JSON.stringify({
      data: [{ value: opts.value, name: opts.title ?? "", formatter, color: "#6366f1" }],
    });
  } else {
    // Expresión {{ }} — la inyectamos como string para que se evalúe en runtime
    echartsOption = `{"data":[{"value":${opts.value},"formatter":"${formatter}","color":"#6366f1"}]}`;
  }

  return {
    mode: "ui",
    title: opts.title ?? "",
    chartType: opts.chartType ?? "Default",
    echartsOption,
    hidden: opts.hidden ?? false,
    onUIEvent: [],
  };
}

export interface RadarChartOptions {
  data: string;
  indicatorKey: string;
  valueKeys: string[];
  title?: string;
  hidden?: string | boolean;
}

export function radarChartDSL(opts: RadarChartOptions): Record<string, unknown> {
  return {
    mode: "ui",
    title: opts.title ?? "",
    data: opts.data,
    xAxisKey: opts.indicatorKey,
    series: opts.valueKeys.map((k) => makeSeries(k, k)),
    hidden: opts.hidden ?? false,
    onUIEvent: [],
  };
}

export interface FunnelChartOptions {
  data: string;
  labelKey: string;
  valueKey: string;
  title?: string;
  hidden?: string | boolean;
}

export function funnelChartDSL(opts: FunnelChartOptions): Record<string, unknown> {
  return {
    mode: "ui",
    title: opts.title ?? "",
    data: opts.data,
    xAxisKey: opts.labelKey,
    series: [makeSeries(opts.valueKey, opts.valueKey)],
    hidden: opts.hidden ?? false,
    onUIEvent: [],
  };
}

export interface HeatmapChartOptions {
  data: string;
  xAxisKey: string;
  yAxisKey: string;
  valueKey: string;
  title?: string;
  hidden?: string | boolean;
}

export function heatmapChartDSL(opts: HeatmapChartOptions): Record<string, unknown> {
  return {
    mode: "ui",
    title: opts.title ?? "",
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    yAxisKey: opts.yAxisKey,
    series: [makeSeries(opts.valueKey, opts.valueKey)],
    hidden: opts.hidden ?? false,
    onUIEvent: [],
  };
}

// ─── Chart genérico (compType: "chart") con sub-discriminator ─────────────────

export interface GenericChartOptions {
  data: string;
  xAxisKey: string;
  yAxisKey: string;
  title?: string;
  /** "bar" | "line" | "pie" | "scatter" */
  type?: "bar" | "line" | "pie" | "scatter";
  hidden?: string | boolean;
}

export function genericChartDSL(opts: GenericChartOptions): Record<string, unknown> {
  return baseChartDSL({
    title: opts.title,
    data: opts.data,
    xAxisKey: opts.xAxisKey,
    series: [{ seriesName: opts.yAxisKey, columnName: opts.yAxisKey }],
    chartCompType: opts.type ?? "bar",
    chartComp: {},
    hidden: opts.hidden,
  });
}
