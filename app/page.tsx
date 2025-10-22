export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Gestión Taller – Multidiagnósticos AS</h1>
      <p>Bienvenido al sistema administrativo.</p>

      <ul style={{ lineHeight: 1.8 }}>
        <li><a href="/(privado)/inventario">📦 Módulo de Inventario</a></li>
        <li><a href="/(privado)/crm">👥 Base de Clientes</a></li>
      </ul>
    </main>
  );
}
