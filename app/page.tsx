'use client';

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Tipo de fila esperada desde Excel
type Row = {
  codigo?: string | number;
  nombre?: string;
  marca?: string;
  categoria?: string;
  precio?: number;
  costo?: number;
  ubicacion?: string;
  raw?: any;
};

// Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Page() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [info, setInfo] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleImport() {
    try {
      setError('');
      setInfo('');

      // Permite presionar el botón siempre y validamos aquí
      if (!file) {
        setError('Selecciona un archivo .xlsx o .xls antes de importar.');
        fileRef.current?.focus();
        return;
      }

      setImporting(true);

      // Leer Excel
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      // Normalizar columnas tolerando mayúsculas/minúsculas/acentos
      const rows: Row[] = json.map((r) => ({
        codigo    : r.codigo ?? r.CODIGO ?? r.Codigo ?? r.Código ?? r['código'],
        nombre    : r.nombre ?? r.NOMBRE ?? r.Nombre,
        marca     : r.marca ?? r.MARCA ?? r.Marca,
        categoria : r.categoria ?? r.CATEGORIA ?? r.Categoría ?? r.Categoria,
        precio    : r.precio ?? r.PRECIO ?? r.Precio,
        costo     : r.costo ?? r.COSTO ?? r.Costo,
        ubicacion : r.ubicacion ?? r.UBICACION ?? r.Ubicacion ?? r.Ubicación,
        raw       : r,
      }));

      const cleaned = rows.map((r) => ({
        codigo   : r.codigo?.toString().trim() || null,
        nombre   : r.nombre?.toString().trim() || null,
        marca    : r.marca?.toString().trim() || null,
        categoria: r.categoria?.toString().trim() || null,
        precio   : r.precio != null && r.precio !== '' ? Number(r.precio) : null,
        costo    : r.costo  != null && r.costo  !== '' ? Number(r.costo)  : null,
        ubicacion: r.ubicacion?.toString().trim() || null,
        raw      : r.raw,
      }));

      // Subir en lotes
      const CHUNK = 500;
      let inserted = 0;
      for (let i = 0; i < cleaned.length; i += CHUNK) {
        const slice = cleaned.slice(i, i + CHUNK);
        const { error } = await supabase
          .from('inventario')
          .upsert(slice, { onConflict: 'codigo', ignoreDuplicates: false });
        if (error) throw error;
        inserted += slice.length;
      }

      setInfo(`✅ Importación completa: ${inserted} filas procesadas.`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Error importando el archivo');
    } finally {
      setImporting(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Importar Inventario (Excel)</h1>
      <p style={{ marginTop: 0, color: '#444' }}>Sube tu archivo .xlsx / .xls con columnas como: <code>codigo</code>, <code>nombre</code>, <code>marca</code>, <code>categoria</code>, <code>precio</code>, <code>costo</code>, <code>ubicacion</code>.</p>

      <div style={{ marginTop: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8, maxWidth: 560 }}>
        <label htmlFor="file" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          1) Selecciona el archivo
        </label>
        <input
          id="file"
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: 'block' }}
        />

        {file && (
          <p style={{ marginTop: 8 }}>
            Archivo seleccionado: <strong>{file.name}</strong>
          </p>
        )}

        <hr style={{ margin: '16px 0' }} />

        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          style={{
            padding: '12px 20px',
            fontSize: 16,
            fontWeight: 700,
            border: '1px solid #222',
            borderRadius: 8,
            background: importing ? '#e5e7eb' : '#facc15',
            boxShadow: '0 1px 3px rgba(0,0,0,.12)',
            cursor: importing ? 'not-allowed' : 'pointer',
          }}
        >
          {importing ? 'Importando…' : '📥 Importar ahora'}
        </button>

        {!file && (
          <div style={{ marginTop: 8, color: '#666' }}>
            👉 El botón permanece visible. Si lo presionas sin archivo, te recordaré que selecciones uno.
          </div>
        )}
      </div>

      {info && <p style={{ marginTop: 16, color: 'green' }}>{info}</p>}
      {error && <p style={{ marginTop: 16, color: 'crimson' }}>{error}</p>}

      <div style={{ marginTop: 40 }}>
        <a href="/" style={{ marginRight: 16 }}>🏠 Ir al Home</a>
        <a href="/CRM">👥 Ir a Clientes (CRM)</a>
      </div>
    </main>
  );
}
