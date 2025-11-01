'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/**
 * Importador de Inventario
 * - Seleccionas un .xlsx / .xls
 * - Botón “Importar” procesa primera hoja y hace UPSERT en `inventario` por `codigo`
 *
 * Requiere:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Row = Record<string, unknown>;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rowsCount, setRowsCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f ? f.name : '');
    setMessage(null);
    setRowsCount(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setMessage(null);

    try {
      const XLSX = await import('xlsx');
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      if (!ws) throw new Error('No se encontró una hoja válida en el Excel.');

      const rows = XLSX.utils.sheet_to_json<Row>(ws, { defval: null });
      setRowsCount(rows.length);
      if (!rows.length) {
        setMessage('El archivo no tiene filas para importar.');
        setImporting(false);
        return;
      }

      const records = rows.map((r) => {
        const get = (...keys: string[]) => {
          for (const k of keys) {
            const v = (r as any)[k];
            if (v !== undefined && v !== null && v !== '') return v;
          }
          return null;
        };

        const codigo = get('codigo', 'CODIGO', 'Code', 'code', 'Código', 'cod');
        const nombre = get('nombre', 'NOMBRE', 'name', 'Name', 'Nombre Producto');
        const marca = get('marca', 'MARCA', 'brand', 'Brand');
        const categoria = get('categoria', 'CATEGORIA', 'category', 'Category');

        const precioRaw = get('precio', 'PRECIO', 'price', 'Price', 'valor', 'Precio');
        const costoRaw = get('costo', 'COSTO', 'cost', 'Cost', 'Costo');
        const ubicacion = get('ubicacion', 'UBICACION', 'location', 'Location', 'bodega');

        const precio = precioRaw != null ? Number(precioRaw) : null;
        const costo = costoRaw != null ? Number(costoRaw) : null;

        return {
          codigo: (codigo as string) ?? crypto.randomUUID(),
          nombre: (nombre as string) ?? null,
          marca: (marca as string) ?? null,
          categoria: (categoria as string) ?? null,
          precio: Number.isFinite(precio) ? (precio as number) : null,
          costo: Number.isFinite(costo) ? (costo as number) : null,
          ubicacion: (ubicacion as string) ?? null,
          raw: r,
        };
      });

      const { error } = await supabase
        .from('inventario')
        .upsert(records, { onConflict: 'codigo' });

      if (error) throw error;

      setMessage(`Importación exitosa: ${records.length} filas.`);

    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al importar inventario.';
      console.error(err);
      setMessage(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Importar Inventario (Excel)
      </h1>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />

      {fileName && (
        <p style={{ marginTop: 12 }}>
          Archivo seleccionado: <strong>{fileName}</strong>
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleImport}
          disabled={!file || importing}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid #999',
            cursor: !file || importing ? 'not-allowed' : 'pointer',
            background: !file || importing ? '#f2f2f2' : '#111',
            color: !file || importing ? '#666' : '#fff',
            fontWeight: 600,
          }}
        >
          {importing ? 'Importando…' : 'Importar'}
        </button>
      </div>

      {rowsCount !== null && <p style={{ marginTop: 10 }}>Filas detectadas: {rowsCount}</p>}

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </main>
  );
}
