/**
 * CRUD de usuarios contra jsonplaceholder (read-only en realidad, pero el flujo es real).
 * Muestra form + tabla + estados de loading.
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("Gestión de Usuarios")
  .withSettings({ category: "Business" })

  // Hero
  .addText("title", { text: "## 👥 Gestión de Usuarios", at: { x: 0, y: 0, w: 24, h: 8 } })
  .addDivider("d1", { at: { x: 0, y: 8, w: 24, h: 3 } })

  // Form de creación
  .addText("formTitle", { text: "### ➕ Nuevo usuario", at: { x: 0, y: 11, w: 24, h: 6 } })
  .addInput("nameInput", {
    label: "Nombre completo",
    placeholder: "Ej: Juan Pérez",
    required: true,
    at: { x: 0, y: 17, w: 8, h: 8 },
  })
  .addInput("emailInput", {
    label: "Email",
    placeholder: "juan@ejemplo.com",
    required: true,
    at: { x: 8, y: 17, w: 8, h: 8 },
  })
  .addSelect("roleSelect", {
    label: "Rol",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
    defaultValue: "viewer",
    at: { x: 16, y: 17, w: 4, h: 8 },
  })
  .addButton("createBtn", {
    text: "Crear usuario",
    type: "submit",
    onClick: "createUser",
    disabled: "{{!nameInput.value || !emailInput.value}}",
    loading: "{{createUser.isFetching}}",
    at: { x: 20, y: 17, w: 4, h: 8 },
  })

  // Tabla con filtros
  .addDivider("d2", { title: "Usuarios", align: "left", at: { x: 0, y: 26, w: 24, h: 3 } })
  .addInput("searchInput", {
    label: "Buscar",
    placeholder: "Nombre, email, empresa…",
    allowClear: true,
    at: { x: 0, y: 29, w: 8, h: 8 },
  })
  .addButton("refreshBtn", {
    text: "↺ Recargar",
    onClick: "loadUsers",
    loading: "{{loadUsers.isFetching}}",
    at: { x: 8, y: 29, w: 4, h: 8 },
  })
  .addTable("usersTable", {
    data: `{{ loadUsers.data?.filter(u => !searchInput.value ||
      u.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      u.company.name.toLowerCase().includes(searchInput.value.toLowerCase())
    ) || [] }}`,
    columns: [
      { title: "ID", dataIndex: "id", width: 60 },
      { title: "Nombre", dataIndex: "name" },
      { title: "Username", dataIndex: "username", isTag: true },
      { title: "Email", dataIndex: "email" },
      { title: "Teléfono", dataIndex: "phone" },
      { title: "Empresa", dataIndex: "company.name" },
      { title: "Ciudad", dataIndex: "address.city" },
    ],
    pageSize: 8,
    at: { x: 0, y: 37, w: 24, h: 50 },
  })

  // Queries
  .addFetchQuery("loadUsers", {
    url: "https://jsonplaceholder.typicode.com/users",
    triggerType: "automatic",
  })
  .addJsQuery("createUser", {
    script: `return fetch("https://jsonplaceholder.typicode.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: nameInput.value,
    email: emailInput.value,
    role: roleSelect.value,
  }),
}).then(function(res) {
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}).then(function(data) {
  message.success("Usuario " + data.name + " creado (ID: " + data.id + ")");
  loadUsers.run();
  return data;
});`,
    triggerType: "manual",
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ CRUD creado`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
