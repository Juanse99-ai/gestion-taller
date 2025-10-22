'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [info, setInfo] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleImport() {
    try {
      setError('');
      setInfo('');
      if (!file) {
        setError('Selecciona un archivo .xlsx o .xls');
        return;
      }
      setImporting(true);

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const rows: Row[] = json.map((r) => ({
        codigo    : r.codigo ?? r.CODIGO ?? r.Codigo ?? r.Código,
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
        precio   : r.precio ? Number(r.precio) : null,
        costo    : r.costo ? Number(r.costo) : null,
        ubicacion: r.ubicacion?.toString().trim() || null,
        raw      : r.raw,
      }));

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

      setInfo(`Importación completa: ${inserted} filas procesadas.`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Error importando el archivo');
    } finally {
      setImporting(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Importar Inventario (Excel)
      </h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file && (
        <p style={{ marginTop: 8 }}>
          Archivo seleccionado: <strong>{file.name}</strong>
        </p>
      )}

      <div style={{ marginTop: 16, display: 'block', border: '1px dashed #888', padding: 12 }}>
        <button
          type="button"
          onClick={handleImport}
          disabled={!file || importing}
          style={{
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            border: '1px solid #000',
            background: '#f5f5f5',
            display: 'inline-block',
            cursor: !file || importing ? 'not-allowed' : 'pointer'
          }}
        >
          {importing ? 'Importando…' : 'Importar'}
        </button>

        {!file && (
          <div style={{ marginTop: 8, color: '#555' }}>
            👉 Selecciona un archivo arriba para habilitar el botón.
          </div>
        )}
      </div>

      {info && <p style={{ marginTop: 12, color: 'green' }}>{info}</p>}
      {error && <p style={{ marginTop: 12, color: 'crimson' }}>{error}</p>}
    </main>
  );
}
