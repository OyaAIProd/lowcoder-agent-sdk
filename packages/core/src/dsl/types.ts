/** Clave hex aleatoria usada por el grid de Lowcoder para identificar items */
export type GridKey = string;

export interface LayoutItem {
  i: GridKey;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  delayCollision?: boolean;
}

export interface GridItemDSL {
  compType: UICompType;
  name: string;
  comp: Record<string, unknown>;
}

export interface UiDSL {
  items: Record<GridKey, GridItemDSL>;
  layout: Record<GridKey, LayoutItem>;
}

export interface EventHandler {
  name: string;
  handler: {
    compType: "executeQuery" | "message" | "goToApp" | "openUrl" | "copyToClipboard";
    comp?: Record<string, unknown>;
  };
}

export interface QueryDSL {
  id: string;
  compType: ResourceType;
  name: string;
  datasourceId: string;
  triggerType: "automatic" | "manual" | "onPageLoad";
  comp: Record<string, unknown>;
  timeout?: number;
}

export interface TempStateDSL {
  name: string;
  comp: {
    value: unknown;
  };
}

export interface TransformerDSL {
  name: string;
  comp: {
    script: string;
    runWhen?: string;
  };
}

export interface AppSettingsDSL {
  title: string;
  description: string;
  category: string;
  themeId: string;
  showHeaderInPublic: boolean;
  gridColumns: number;
  gridRowHeight: number;
  gridPaddingX: number;
  gridPaddingY: number;
  preventAppStylesOverwriting: boolean;
  maxWidth: { dropdown: string; input: number };
  gridRowCount: string;
  disableCollision: boolean;
  lowcoderCompVersion: string;
}

export interface PreloadDSL {
  script: string;
  css: string;
  libs?: string[];
}

export interface LowcoderDSL {
  ui: UiDSL;
  queries: QueryDSL[];
  tempStates: TempStateDSL[];
  transformers: TransformerDSL[];
  settings: AppSettingsDSL;
  preload: PreloadDSL;
}

/** Tamaño por defecto de un componente en el grid */
export interface DefaultSize {
  w: number;
  h: number;
}

/** Override de posición/tamaño para un componente concreto */
export interface LayoutPos {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

// ─── Tipos de componentes UI (extraídos de uiCompRegistry) ───────────────────

/**
 * Catálogo completo de compTypes nativos de Lowcoder.
 * Para plugins de terceros usa `addComponent(id, "package/Component", opts)`.
 */
export type UICompType =
  // Inputs básicos
  | "input" | "password" | "numberInput" | "textArea" | "autocomplete"
  | "switch" | "checkbox" | "radio"
  | "date" | "dateRange" | "time" | "timeRange"
  | "slider" | "rangeSlider" | "rating"
  | "select" | "multiSelect" | "tree" | "treeSelect" | "cascader"
  | "transfer" | "segmentedControl"
  // Botones y acciones
  | "button" | "controlButton" | "dropdown" | "toggleButton"
  | "link" | "iconButton" | "floatingButton" | "menu"
  // Display
  | "text" | "icon" | "qrCode"
  | "image" | "carousel" | "audio" | "video" | "shape" | "jsonLottie"
  | "imageEditor" | "colorPicker"
  | "divider" | "progress" | "progressCircle"
  // Tablas
  | "table" | "tableLite" | "pivotTable"
  // Charts
  | "chart" | "basicChart" | "barChart" | "lineChart" | "pieChart"
  | "scatterChart" | "candleStickChart" | "funnelChart" | "gaugeChart"
  | "graphChart" | "heatmapChart" | "radarChart" | "sankeyChart"
  | "sunburstChart" | "themeriverChart" | "treeChart" | "treemapChart"
  | "mermaid" | "timeline"
  // Mapas
  | "openLayersGeoMap" | "chartsGeoMap"
  // Layout y contenedores
  | "container" | "card" | "tabbedContainer" | "collapsibleContainer"
  | "responsiveLayout" | "pageLayout" | "columnLayout" | "splitLayout"
  | "floatTextContainer" | "modal" | "drawer" | "listView" | "grid"
  | "form" | "jsonSchemaForm" | "jsonEditor" | "jsonExplorer"
  | "richTextEditor"
  // Navegación
  | "navigation" | "step"
  // Project management
  | "ganttChart" | "kanban" | "hillchart" | "bpmnEditor"
  | "calendar" | "timer"
  // Files
  | "file" | "fileViewer" | "fileUpload"
  // Collaboration
  | "meeting" | "sharingcomponent" | "videocomponent"
  | "avatar" | "avatarGroup" | "comment" | "mention"
  // Misc
  | "multiTags" | "scanner" | "signature" | "tour" | "iframe" | "custom";

// ─── Tipos de recursos (queries) ─────────────────────────────────────────────

export type ResourceType =
  | "restApi"
  | "js"
  | "mysql"
  | "postgres"
  | "mongodb"
  | "redis"
  | "es"
  | "graphql"
  | "googleSheets"
  | "smtp"
  | "oracle"
  | "mssql"
  | "snowflake"
  | "libraryQuery";

// ─── Tipos de respuesta de la API REST ───────────────────────────────────────

export interface ApplicationMeta {
  applicationId: string;
  applicationGid: string;
  name: string;
  applicationType: 1 | 2 | 3 | 6;
  applicationStatus: "NORMAL" | "RECYCLED" | "DELETED";
  createAt: number;
  createBy: string;
  lastEditedAt?: number;
  folderId?: string;
  orgId?: string;
  publicToAll?: boolean;
  publicToMarketplace?: boolean;
}

export interface ApplicationView {
  applicationInfoView: ApplicationMeta;
  applicationDSL: LowcoderDSL;
  moduleDSL?: Record<string, unknown>;
  orgCommonSettings?: Record<string, unknown>;
}

export interface CreateAppRequest {
  orgId: string;
  name: string;
  applicationType: 1 | 2 | 3 | 6;
  editingApplicationDSL: LowcoderDSL;
  folderId?: string;
  publicToAll?: boolean;
}
