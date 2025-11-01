// app/(privado)/recepcion/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RecepcionPage() {
  const [form, setForm] = useState({
    placa: '',
    cliente: '',
    telefono: '',
    motivo: 'Mantenimiento', // Mantenimiento | Reparación | Garantía
    observaciones: '',
    km_actual: '',
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setOk(null); setErr(null);
    try {
      // Si ya creaste el RPC en Supabase: rpc_crear_recepcion
      // Llama: placa, cliente, telefono, motivo, observaciones, km_actual
      const { data, error } = await supabase.rpc('rpc_crear_recepcion', {
        p_placa: form.placa.trim().toUpperCase(),
        p_cliente: form.cliente.trim(),
        p_telefono: form.telefono.trim(),
        p_motivo: form.motivo,
        p_observaciones: form.observaciones.trim(),
        p_km_actual: form.km_actual ? Number(form.km_actual) : null,
      });

      if (error) throw error;
      setOk('Recepción registrada correctamente.');
      setForm({ placa: '', cliente: '', telefono: '', motivo: 'Mantenimiento', observaciones: '', km_actual: '' });
    } catch (e: any) {
      setErr(e.message ?? 'Error registrando recepción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Recepción de Vehículos</h1>

      <form onSubmit={onSubmit} style={{ maxWidth: 520, display: 'grid', gap: 12 }}>
        <input name="placa" placeholder="Placa (ABC123)" value={form.placa} onChange={onChange} required />
        <input name="cliente" placeholder="Nombre del cliente" value={form.cliente} onChange={onChange} required />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={onChange} />
        <select name="motivo" value={form.motivo} onChange={onChange}>
          <option>Mantenimiento</option>
          <option>Reparación</option>
          <option>Garantía</option>
        </select>
        <input name="km_actual" placeholder="Kilometraje" value={form.km_actual} onChange={onChange} />
        <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={onChange} rows={4} />

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar recepción'}
        </button>

        {ok && <p style={{ color: 'green' }}>{ok}</p>}
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
    </main>
  );
}
