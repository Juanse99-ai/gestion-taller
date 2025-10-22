'use client';
import { useState } from 'react';

export default function Page() {
  const [fileName, setFileName] = useState<string>('');

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Importar Inventario (Excel)
      </h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setFileName(f ? f.name : '');
        }}
      />

      {fileName && (
        <p style={{ marginTop: 12 }}>
          Archivo seleccionado: <strong>{fileName}</strong>
        </p>
      )}
    </main>
  );
}
