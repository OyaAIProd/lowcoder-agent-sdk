import { DslBuilder, type BuildInput, type QueryEntry } from "./dsl/DslBuilder.js";
import type {
  UICompType,
  ResourceType,
  LowcoderDSL,
  AppSettingsDSL,
  PreloadDSL,
  TempStateDSL,
  ApplicationView,
  LayoutPos,
} from "./dsl/types.js";
import type { ComponentEntry } from "./layout/AutoLayout.js";
import type {
  ButtonOptions, InputOptions, TextAreaOptions, TextOptions,
  TableOptions, SelectOptions, NumberInputOptions, CheckboxOptions,
  DividerOptions, ImageOptions, ContainerOptions, ChartOptions,
  CardOptions, BarLineChartOptions, PieChartOptions, GaugeChartOptions,
  RadarChartOptions, FunnelChartOptions, HeatmapChartOptions,
  LinkOptions, IconOptions, IconButtonOptions, FloatingButtonOptions,
  ProgressOptions, TimerOptions, AvatarOptions, MermaidOptions,
  JsonLottieOptions, SliderOptions,
} from "./dsl/components/index.js";
import type { RestApiQueryOptions } from "./dsl/queries/restApiQuery.js";
import type { JsQueryOptions } from "./dsl/queries/jsQuery.js";
import { jsFetchScript } from "./dsl/queries/jsQuery.js";
import type { SqlQueryOptions } from "./dsl/queries/sqlQuery.js";
import { LowcoderClient } from "./LowcoderClient.js";

type WithAt<T> = T & { at?: LayoutPos };

export class LowcoderApp {
  private readonly title: string;
  private readonly components: ComponentEntry[] = [];
  private readonly queries: QueryEntry[] = [];
  private readonly tempStates: TempStateDSL[] = [];
  private appSettings: Partial<AppSettingsDSL> = {};
  private appPreload: Partial<PreloadDSL> = {};

  constructor(title: string) {
    this.title = title;
  }

  // ─── Componentes ──────────────────────────────────────────────────────────

  addButton(id: string, opts: WithAt<ButtonOptions> = {}): this {
    return this.addComponent(id, "button", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addInput(id: string, opts: WithAt<InputOptions> = {}): this {
    return this.addComponent(id, "input", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addTextArea(id: string, opts: WithAt<TextAreaOptions> = {}): this {
    return this.addComponent(id, "textArea", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addText(id: string, opts: WithAt<TextOptions>): this {
    return this.addComponent(id, "text", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addTable(id: string, opts: WithAt<TableOptions>): this {
    return this.addComponent(id, "table", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addSelect(id: string, opts: WithAt<SelectOptions> = {}): this {
    return this.addComponent(id, "select", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addMultiSelect(id: string, opts: WithAt<SelectOptions> = {}): this {
    return this.addComponent(id, "multiSelect", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addNumberInput(id: string, opts: WithAt<NumberInputOptions> = {}): this {
    return this.addComponent(id, "numberInput", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addCheckbox(id: string, opts: WithAt<CheckboxOptions> = {}): this {
    return this.addComponent(id, "checkbox", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addDivider(id: string, opts: WithAt<DividerOptions> = {}): this {
    return this.addComponent(id, "divider", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addImage(id: string, opts: WithAt<ImageOptions>): this {
    return this.addComponent(id, "image", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addContainer(id: string, opts: WithAt<ContainerOptions> = {}): this {
    return this.addComponent(id, "container", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addChart(id: string, opts: WithAt<ChartOptions>): this {
    return this.addComponent(id, "chart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  // ─── Componentes avanzados ────────────────────────────────────────────────

  addCard(id: string, opts: WithAt<CardOptions> = {}): this {
    return this.addComponent(id, "card", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addBarChart(id: string, opts: WithAt<BarLineChartOptions>): this {
    return this.addComponent(id, "barChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addLineChart(id: string, opts: WithAt<BarLineChartOptions>): this {
    return this.addComponent(id, "lineChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addPieChart(id: string, opts: WithAt<PieChartOptions>): this {
    return this.addComponent(id, "pieChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addGaugeChart(id: string, opts: WithAt<GaugeChartOptions>): this {
    return this.addComponent(id, "gaugeChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addRadarChart(id: string, opts: WithAt<RadarChartOptions>): this {
    return this.addComponent(id, "radarChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addFunnelChart(id: string, opts: WithAt<FunnelChartOptions>): this {
    return this.addComponent(id, "funnelChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addHeatmapChart(id: string, opts: WithAt<HeatmapChartOptions>): this {
    return this.addComponent(id, "heatmapChart", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addLink(id: string, opts: WithAt<LinkOptions>): this {
    return this.addComponent(id, "link", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addIcon(id: string, opts: WithAt<IconOptions>): this {
    return this.addComponent(id, "icon", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addIconButton(id: string, opts: WithAt<IconButtonOptions>): this {
    return this.addComponent(id, "iconButton", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addFloatingButton(id: string, opts: WithAt<FloatingButtonOptions> = {}): this {
    return this.addComponent(id, "floatingButton", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addProgress(id: string, opts: WithAt<ProgressOptions>): this {
    return this.addComponent(id, "progress", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addProgressCircle(id: string, opts: WithAt<ProgressOptions>): this {
    return this.addComponent(id, "progressCircle", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addTimer(id: string, opts: WithAt<TimerOptions> = {}): this {
    return this.addComponent(id, "timer", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addAvatar(id: string, opts: WithAt<AvatarOptions> = {}): this {
    return this.addComponent(id, "avatar", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addMermaid(id: string, opts: WithAt<MermaidOptions>): this {
    return this.addComponent(id, "mermaid", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addJsonLottie(id: string, opts: WithAt<JsonLottieOptions>): this {
    return this.addComponent(id, "jsonLottie", opts as unknown as Record<string, unknown> & { at?: LayoutPos });
  }

  addSlider(id: string, opts: WithAt<SliderOptions> = {}): this {
    return this.addComponent(id, "slider", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  addRangeSlider(id: string, opts: WithAt<SliderOptions> = {}): this {
    return this.addComponent(id, "rangeSlider", opts as Record<string, unknown> & { at?: LayoutPos });
  }

  /** Añade cualquier tipo de componente usando su compType nativo de Lowcoder */
  addComponent(
    id: string,
    type: UICompType | string,
    opts: { at?: LayoutPos } & Record<string, unknown> = {}
  ): this {
    const { at, ...rest } = opts as { at?: LayoutPos } & Record<string, unknown>;
    this.components.push({ id, compType: type as UICompType, options: rest, at });
    return this;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  addRestQuery(id: string, opts: RestApiQueryOptions): this {
    this.queries.push({ id, type: "restApi", options: opts as unknown as Record<string, unknown> });
    return this;
  }

  addJsQuery(id: string, opts: JsQueryOptions): this {
    this.queries.push({ id, type: "js", options: opts as unknown as Record<string, unknown> });
    return this;
  }

  /**
   * Atajo: añade una JS query que hace `fetch()` a una URL pública y devuelve el JSON.
   * Útil cuando la instancia Lowcoder no tiene datasources REST configurados.
   * Funciona sin configuración adicional — el código se ejecuta en el browser.
   */
  addFetchQuery(
    id: string,
    opts: {
      url: string;
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      headers?: Record<string, string>;
      body?: unknown;
      triggerType?: "automatic" | "manual" | "onPageLoad";
    }
  ): this {
    const script = jsFetchScript({
      url: opts.url,
      method: opts.method,
      headers: opts.headers,
      body: opts.body,
    });
    this.queries.push({
      id,
      type: "js",
      options: { script, triggerType: opts.triggerType ?? "automatic" },
    });
    return this;
  }

  addSqlQuery(id: string, opts: SqlQueryOptions & { dbType?: "mysql" | "postgres" | "mssql" }): this {
    const type = opts.dbType ?? "mysql";
    this.queries.push({ id, type: type as ResourceType, options: opts as unknown as Record<string, unknown> });
    return this;
  }

  /** Añade cualquier tipo de query */
  addQuery(id: string, type: ResourceType, opts: Record<string, unknown>): this {
    this.queries.push({ id, type, options: opts });
    return this;
  }

  // ─── Estado temporal ──────────────────────────────────────────────────────

  addTempState(name: string, initialValue: unknown): this {
    this.tempStates.push({ name, comp: { value: initialValue } });
    return this;
  }

  // ─── Configuración ────────────────────────────────────────────────────────

  withSettings(settings: Partial<AppSettingsDSL>): this {
    this.appSettings = { ...this.appSettings, ...settings };
    return this;
  }

  withPreload(preload: Partial<PreloadDSL>): this {
    this.appPreload = { ...this.appPreload, ...preload };
    return this;
  }

  // ─── Salida ───────────────────────────────────────────────────────────────

  build(): LowcoderDSL {
    const input: BuildInput = {
      title: this.title,
      components: this.components,
      queries: this.queries,
      tempStates: this.tempStates,
      settings: this.appSettings,
      preload: this.appPreload,
    };
    return DslBuilder.build(input);
  }

  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  /**
   * Despliega la app a una instancia Lowcoder.
   *
   * @param client - LowcoderClient configurado
   * @param orgId  - Opcional. Si se omite, se auto-detecta usando
   *                 `client.getCurrentOrgId()` (la org activa del usuario actual)
   * @param opts   - folderId y publish opcionales
   */
  async deploy(
    client: LowcoderClient,
    orgId?: string,
    opts?: { folderId?: string; publish?: boolean }
  ): Promise<ApplicationView> {
    const dsl = this.build();
    const resolvedOrgId = orgId ?? (await client.getCurrentOrgId());
    const app = await client.createApp({
      name: this.title,
      orgId: resolvedOrgId,
      applicationType: 1,
      editingApplicationDSL: dsl,
      folderId: opts?.folderId,
    });
    if (opts?.publish) {
      await client.publishApp(app.applicationInfoView.applicationId);
    }
    return app;
  }
}
