# Crear plugins de componentes para Lowcoder

Los plugins son componentes React personalizados que se publican como npm packages y se instalan en cualquier instancia Lowcoder. Una vez instalados, se usan igual que componentes nativos.

Este SDK genera el JSON DSL — pero **no crea los componentes plugins**. Esa parte requiere el [lowcoder-cli](https://www.npmjs.com/package/lowcoder-cli) oficial de Lowcoder. Esta guía explica cómo crear plugins compatibles con tu SDK.

## ¿Cuándo crear un plugin?

✅ Crea un plugin cuando:
- Necesitas un componente que no existe nativo (ej: card con estructura específica)
- Vas a reutilizar el mismo componente en muchas apps
- Quieres encapsular lógica compleja en una pieza visual

❌ NO crees un plugin si:
- Solo lo vas a usar una vez → usa `text` con HTML inline
- La lógica es de datos, no visual → usa una JS query
- Es un wrapper trivial de un componente nativo → usa el nativo directamente

## Pasos

### 1. Crear proyecto plugin

```bash
yarn create lowcoder-plugin nombre-del-plugin
cd nombre-del-plugin
```

Esto crea estructura:

```
nombre-del-plugin/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts            # Punto de entrada — exporta tus componentes
│   └── MyComp.tsx
├── icons/
│   └── icon.png
└── README.md
```

### 2. Definir tu componente

`src/MyComp.tsx`:

```tsx
import {
  UICompBuilder,
  stringExposingStateControl,
  numberExposingStateControl,
  StringControl,
  BoolControl,
  withExposingConfigs,
  NameConfig,
  Section,
  withMethodExposing,
  eventHandlerControl,
} from "lowcoder-sdk";

const childrenMap = {
  // Estado expuesto (accesible vía {{myWidget.value}})
  value: stringExposingStateControl("value", "Hola mundo"),

  // Controles (parámetros de configuración del componente)
  title: StringControl,
  showBorder: BoolControl,

  // Eventos
  onEvent: eventHandlerControl([
    { label: "onChange", value: "change" },
    { label: "onClick", value: "click" },
  ]),
};

const MyCompBase = new UICompBuilder(childrenMap, (props) => {
  const value = props.value.value;
  return (
    <div
      style={{
        padding: 16,
        border: props.showBorder ? "1px solid #e2e8f0" : "none",
        borderRadius: 8,
      }}
      onClick={() => props.onEvent("click")}
    >
      <h3 style={{ margin: 0 }}>{props.title || "Mi Widget"}</h3>
      <p>Valor: {value}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const newValue = value + "!";
          props.value.onChange(newValue);
          props.onEvent("change");
        }}
      >
        Añadir !
      </button>
    </div>
  );
})
  .setPropertyViewFn((children) => (
    <>
      <Section name="Basic">
        {children.title.propertyView({ label: "Título" })}
        {children.value.propertyView({ label: "Valor inicial" })}
        {children.showBorder.propertyView({ label: "Mostrar borde" })}
      </Section>
      <Section name="Interaction">
        {children.onEvent.getPropertyView()}
      </Section>
    </>
  ))
  .build();

// Exponer métodos invocables desde JS queries: {{myWidget.reset()}}
const MyComp = withMethodExposing(MyCompBase, [
  {
    method: { name: "reset", params: [] },
    execute(comp) {
      comp.children.value.getView().onChange("");
    },
  },
]);

export default withExposingConfigs(MyComp, [
  new NameConfig("value", "Valor actual del widget"),
]);
```

### 3. Exportar en `src/index.ts`

```typescript
import MyComp from "./MyComp";

export default {
  my_widget: MyComp,
  // Puedes exportar varios componentes en un solo plugin:
  // counter: CounterComp,
  // chart_card: ChartCardComp,
};
```

### 4. Configurar `package.json`

```json
{
  "name": "@tu-usuario/lowcoder-plugin-mywidgets",
  "version": "0.1.0",
  "main": "dist/index.js",
  "lowcoder": {
    "comps": {
      "my_widget": {
        "name": "Mi Widget",
        "icon": "./icons/icon.png",
        "description": "Componente de demo",
        "layoutInfo": { "w": 6, "h": 20 }
      }
    }
  },
  "scripts": {
    "build": "lowcoder-cli build",
    "publish:plugin": "lowcoder-cli build --publish"
  }
}
```

### 5. Build y publicar a npm

```bash
yarn build              # Solo build local (output en dist/)
yarn publish:plugin     # Build + publish a npm
```

### 6. Instalar en Lowcoder

En tu instancia:

1. **Insert** (panel derecho)
2. Tab **Extensions**
3. **Add npm plugin** → introduce `@tu-usuario/lowcoder-plugin-mywidgets`
4. Click **Install**

### 7. Usar el plugin desde el SDK

```typescript
import { LowcoderApp } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("App con plugin")
  .addComponent("widget1", "@tu-usuario/lowcoder-plugin-mywidgets/my_widget", {
    title: "Test",
    value: "Inicial",
    showBorder: true,
  });
```

El SDK no valida los compTypes de plugins — pasa cualquier string en `addComponent`.

## Controles disponibles para `childrenMap`

| Control | Para qué |
| --- | --- |
| `StringControl` | String simple (no expuesto) |
| `BoolControl` | Booleano |
| `NumberControl` | Número |
| `ColorControl` | Color picker |
| `DropdownControl` | Select con opciones predefinidas |
| `IconControl` | Selector de íconos |
| `StyleControl` | Estilos CSS complejos |
| `stringExposingStateControl(name, default)` | Estado expuesto string |
| `numberExposingStateControl(name, default)` | Estado expuesto número |
| `eventHandlerControl([{label, value}])` | Eventos invocables |
| `arrayStringExposingStateControl` | Array de strings expuesto |
| `arrayObjectExposingStateControl` | Array de objects expuesto |

## Helpers útiles

| Helper | Para qué |
| --- | --- |
| `withExposingConfigs(comp, [NameConfig])` | Expone propiedades al exterior (accesibles vía `{{comp.x}}`) |
| `withMethodExposing(comp, [...])` | Expone métodos invocables (`comp.reset()`) |
| `withDefault(Control, defaultValue)` | Da un default a un control |
| `Section name="...">...</Section>` | Agrupa controles en panel de propiedades |

## Limitaciones

- **Solo UMD bundles**: el build de Lowcoder requiere formato UMD (lo hace `lowcoder-cli` automáticamente)
- **Sin SSR**: los plugins corren solo en navegador
- **CORS**: si tu plugin hace fetch a APIs externas, esas APIs deben permitir CORS desde el dominio Lowcoder
- **Sin acceso a `document.cookie`, `fetch` con credenciales**: por seguridad
- **Bundle size**: mantén el plugin chico (<500KB) para que la app cargue rápido

## Testing local

Antes de publicar a npm puedes testear con `npm link`:

```bash
# En tu plugin
cd nombre-del-plugin
yarn build
npm link

# En tu app de prueba
cd otra-app
npm link @tu-usuario/lowcoder-plugin-mywidgets
```

O mejor, usa Lowcoder en modo dev y carga el plugin desde un path local.

## Recursos adicionales

- [Lowcoder Plugin Demo oficial](https://github.com/lowcoder-org/lowcoder/tree/main/client/packages/lowcoder-plugin-demo) — buen punto de partida
- [Lowcoder SDK npm](https://www.npmjs.com/package/lowcoder-sdk) — exporta todos los helpers
- [Lowcoder CLI](https://www.npmjs.com/package/lowcoder-cli) — herramienta de build

## ¿Por qué este SDK no genera plugins?

El SDK `@aorizondo/lowcoder-agent-sdk-core` está enfocado en **generar el JSON DSL de apps**, no en crear componentes React. Crear plugins requiere:

- Bundler (Vite/Webpack) con config UMD
- Servidor de iconos
- Publicación npm con metadata específica
- Testing con instancia Lowcoder real

Es un pipeline separado que ya está bien resuelto por `lowcoder-cli`. Mezclar las dos responsabilidades complicaría el SDK sin beneficio claro.
