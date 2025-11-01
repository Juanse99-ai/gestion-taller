import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware desactivado: permite todas las rutas sin autenticación
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Config vacío: no aplica en ninguna ruta
export const config = {
  matcher: [],
};
