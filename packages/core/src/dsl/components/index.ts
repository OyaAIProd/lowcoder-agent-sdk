export * from "./button.js";
export * from "./input.js";
export * from "./textArea.js";
export * from "./text.js";
export * from "./table.js";
export * from "./select.js";
export * from "./numberInput.js";
export * from "./checkbox.js";
export * from "./divider.js";
export * from "./image.js";
export * from "./container.js";
export * from "./chart.js";
export * from "./card.js";
export * from "./charts.js";
export * from "./atomics.js";
export * from "./slider.js";

import type { DefaultSize, UICompType } from "../types.js";
import { BUTTON_SIZE } from "./button.js";
import { INPUT_SIZE } from "./input.js";
import { TEXT_AREA_SIZE } from "./textArea.js";
import { TEXT_SIZE } from "./text.js";
import { TABLE_SIZE } from "./table.js";
import { SELECT_SIZE } from "./select.js";
import { NUMBER_INPUT_SIZE } from "./numberInput.js";
import { CHECKBOX_SIZE } from "./checkbox.js";
import { DIVIDER_SIZE } from "./divider.js";
import { IMAGE_SIZE } from "./image.js";
import { CONTAINER_SIZE } from "./container.js";
import { CHART_SIZE } from "./chart.js";

export const COMPONENT_DEFAULT_SIZES: Partial<Record<UICompType, DefaultSize>> = {
  // Básicos
  button: BUTTON_SIZE, controlButton: BUTTON_SIZE, toggleButton: BUTTON_SIZE,
  dropdown: BUTTON_SIZE, link: { w: 3, h: 5 }, iconButton: { w: 3, h: 5 },
  floatingButton: { w: 5, h: 5 }, menu: { w: 6, h: 5 },
  // Inputs
  input: INPUT_SIZE, password: INPUT_SIZE, numberInput: NUMBER_INPUT_SIZE,
  textArea: TEXT_AREA_SIZE, autocomplete: { w: 6, h: 5 },
  switch: { w: 6, h: 5 }, checkbox: CHECKBOX_SIZE, radio: { w: 6, h: 20 },
  date: { w: 6, h: 5 }, dateRange: { w: 10, h: 5 },
  time: { w: 6, h: 5 }, timeRange: { w: 10, h: 5 },
  slider: { w: 6, h: 5 }, rangeSlider: { w: 6, h: 5 }, rating: { w: 6, h: 5 },
  select: SELECT_SIZE, multiSelect: SELECT_SIZE,
  tree: { w: 5, h: 40 }, treeSelect: { w: 6, h: 5 }, cascader: { w: 6, h: 5 },
  transfer: { w: 12, h: 40 }, segmentedControl: { w: 6, h: 5 },
  // Display
  text: TEXT_SIZE, icon: { w: 3, h: 5 }, qrCode: { w: 5, h: 20 },
  image: IMAGE_SIZE, carousel: { w: 12, h: 40 }, audio: { w: 6, h: 5 },
  video: { w: 12, h: 40 }, shape: { w: 6, h: 25 }, jsonLottie: { w: 6, h: 25 },
  imageEditor: { w: 12, h: 40 }, colorPicker: { w: 6, h: 5 },
  divider: DIVIDER_SIZE, progress: { w: 6, h: 5 }, progressCircle: { w: 5, h: 10 },
  // Tablas
  table: TABLE_SIZE, tableLite: TABLE_SIZE, pivotTable: { w: 12, h: 40 },
  // Charts
  chart: CHART_SIZE, basicChart: CHART_SIZE, barChart: CHART_SIZE,
  lineChart: CHART_SIZE, pieChart: CHART_SIZE, scatterChart: CHART_SIZE,
  candleStickChart: CHART_SIZE, funnelChart: CHART_SIZE,
  gaugeChart: { w: 8, h: 40 }, graphChart: CHART_SIZE,
  heatmapChart: CHART_SIZE, radarChart: CHART_SIZE,
  sankeyChart: CHART_SIZE, sunburstChart: CHART_SIZE,
  themeriverChart: CHART_SIZE, treeChart: CHART_SIZE, treemapChart: CHART_SIZE,
  mermaid: CHART_SIZE, timeline: { w: 12, h: 40 },
  // Mapas
  openLayersGeoMap: { w: 12, h: 40 }, chartsGeoMap: { w: 12, h: 40 },
  // Layout
  container: CONTAINER_SIZE, card: { w: 8, h: 40 },
  tabbedContainer: { w: 24, h: 50 }, collapsibleContainer: { w: 12, h: 25 },
  responsiveLayout: { w: 24, h: 25 }, pageLayout: { w: 24, h: 60 },
  columnLayout: { w: 12, h: 25 }, splitLayout: { w: 24, h: 30 },
  floatTextContainer: { w: 12, h: 25 },
  modal: { w: 6, h: 5 }, drawer: { w: 6, h: 5 },
  listView: { w: 12, h: 40 }, grid: { w: 12, h: 40 },
  form: { w: 12, h: 50 }, jsonSchemaForm: { w: 12, h: 50 },
  jsonEditor: { w: 12, h: 40 }, jsonExplorer: { w: 12, h: 40 },
  richTextEditor: { w: 12, h: 40 },
  // Navegación
  navigation: { w: 24, h: 5 }, step: { w: 24, h: 8 },
  // Project Management
  ganttChart: { w: 24, h: 60 }, kanban: { w: 24, h: 50 },
  hillchart: { w: 12, h: 40 }, bpmnEditor: { w: 24, h: 60 },
  calendar: { w: 24, h: 60 }, timer: { w: 6, h: 25 },
  // Files
  file: { w: 6, h: 5 }, fileViewer: { w: 12, h: 40 }, fileUpload: { w: 6, h: 5 },
  // Collaboration
  meeting: { w: 24, h: 60 }, sharingcomponent: { w: 6, h: 5 },
  videocomponent: { w: 12, h: 40 },
  avatar: { w: 3, h: 8 }, avatarGroup: { w: 6, h: 8 },
  comment: { w: 12, h: 40 }, mention: { w: 6, h: 5 },
  // Misc
  multiTags: { w: 6, h: 5 }, scanner: { w: 6, h: 5 }, signature: { w: 12, h: 25 },
  tour: { w: 6, h: 5 }, iframe: { w: 12, h: 40 },
};

import { buttonDSL } from "./button.js";
import { inputDSL } from "./input.js";
import { textAreaDSL } from "./textArea.js";
import { textDSL } from "./text.js";
import { tableDSL } from "./table.js";
import { selectDSL } from "./select.js";
import { numberInputDSL } from "./numberInput.js";
import { checkboxDSL } from "./checkbox.js";
import { dividerDSL } from "./divider.js";
import { imageDSL } from "./image.js";
import { containerDSL } from "./container.js";
import { chartDSL } from "./chart.js";
import { cardDSL } from "./card.js";
import {
  barChartDSL, lineChartDSL, pieChartDSL, gaugeChartDSL,
  radarChartDSL, funnelChartDSL, heatmapChartDSL,
} from "./charts.js";
import {
  linkDSL, iconDSL, iconButtonDSL, floatingButtonDSL,
  progressDSL, progressCircleDSL, timerDSL, avatarDSL,
  mermaidDSL, jsonLottieDSL,
} from "./atomics.js";
import { sliderDSL } from "./slider.js";

type DslFn = (opts: Record<string, unknown>) => Record<string, unknown>;

export const COMPONENT_DSL_MAP: Partial<Record<UICompType, DslFn>> = {
  button: buttonDSL as unknown as DslFn,
  input: inputDSL as unknown as DslFn,
  textArea: textAreaDSL as unknown as DslFn,
  text: textDSL as unknown as DslFn,
  table: tableDSL as unknown as DslFn,
  select: selectDSL as unknown as DslFn,
  multiSelect: selectDSL as unknown as DslFn,
  numberInput: numberInputDSL as unknown as DslFn,
  checkbox: checkboxDSL as unknown as DslFn,
  divider: dividerDSL as unknown as DslFn,
  image: imageDSL as unknown as DslFn,
  container: containerDSL as unknown as DslFn,
  card: cardDSL as unknown as DslFn,
  chart: chartDSL as unknown as DslFn,
  barChart: barChartDSL as unknown as DslFn,
  lineChart: lineChartDSL as unknown as DslFn,
  pieChart: pieChartDSL as unknown as DslFn,
  gaugeChart: gaugeChartDSL as unknown as DslFn,
  radarChart: radarChartDSL as unknown as DslFn,
  funnelChart: funnelChartDSL as unknown as DslFn,
  heatmapChart: heatmapChartDSL as unknown as DslFn,
  link: linkDSL as unknown as DslFn,
  icon: iconDSL as unknown as DslFn,
  iconButton: iconButtonDSL as unknown as DslFn,
  floatingButton: floatingButtonDSL as unknown as DslFn,
  progress: progressDSL as unknown as DslFn,
  progressCircle: progressCircleDSL as unknown as DslFn,
  timer: timerDSL as unknown as DslFn,
  avatar: avatarDSL as unknown as DslFn,
  mermaid: mermaidDSL as unknown as DslFn,
  jsonLottie: jsonLottieDSL as unknown as DslFn,
  slider: sliderDSL as unknown as DslFn,
  rangeSlider: sliderDSL as unknown as DslFn,
};
