import { z } from "zod";
import { COMPONENT_DEFAULT_SIZES } from "@aorizondo/lowcoder-agent-sdk-core";

export const GetComponentTypesInputSchema = z.object({});

export function handleGetComponentTypes(): string {
  const types = Object.entries(COMPONENT_DEFAULT_SIZES).map(([type, size]) => ({
    type,
    defaultWidth: size?.w,
    defaultHeight: size?.h,
    description: COMPONENT_DESCRIPTIONS[type] ?? "",
  }));

  return JSON.stringify(types, null, 2);
}

const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  button: "Botón clickeable. options: {text, onClick (nombre de query), disabled, loading, tooltip}",
  input: "Campo de texto. options: {label, placeholder, defaultValue, required, disabled, allowClear}",
  textArea: "Área de texto multilínea. options: {label, placeholder, defaultValue, minRows, maxRows}",
  text: "Texto/Markdown. options: {text (soporta {{expr}} y Markdown)}",
  table: "Tabla de datos. options: {data (ej: '{{query1.data}}'), columns: [{title, dataIndex}]}",
  select: "Selector desplegable. options: {label, options: [{label, value}], defaultValue, allowClear, showSearch}",
  multiSelect: "Selector múltiple. options: {label, options: [{label, value}], defaultValue}",
  numberInput: "Input numérico. options: {label, defaultValue, min, max, step}",
  checkbox: "Casilla de verificación. options: {label, defaultValue}",
  divider: "Línea divisoria. options: {title, align: left|center|right}",
  image: "Imagen. options: {src (URL o {{expr}}), altText}",
  container: "Contenedor vacío para agrupar componentes. options: {autoHeight, scrollbars}",
  chart: "Gráfico de datos. options: {data (ej: '{{query.data}}'), xAxisKey, series: [{name, dataIndex, chartType}], chartType: line|bar|pie}",
  radio: "Grupo de radio buttons. options: {label, options: [{label, value}], defaultValue}",
  switch: "Interruptor on/off. options: {label, defaultValue}",
  slider: "Control deslizante. options: {label, defaultValue, min, max, step}",
  date: "Selector de fecha. options: {label, placeholder, required}",
  iframe: "Frame embebido. options: {src (URL)}",
  progress: "Barra de progreso. options: {value (0-100), label}",
  form: "Formulario con validación. options: {title, submitText}",
  modal: "Ventana modal. options: {title, okText, cancelText}",
};
