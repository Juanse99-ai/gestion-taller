import { NextRequest, NextResponse } from 'next/server';

// Credenciales tomadas de variables de entorno (defínelas en Netlify)
const USER = process.env.BASIC_AUTH_USER ?? '';
const PASS = process.env.BASIC_AUTH_PASS ?? '';

function unauthorized(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected Area", charset="UTF-8"',
    },
  });
}

// Decodificador base64 que funciona tanto en Edge como en Node
function decodeBase64(input: string): string {
  if (typeof atob === 'function') {
    try { return atob(input); } catch { /* fallthrough */ }
  }
  try {
    // @ts-ignore Buffer puede no existir en Edge; esta ruta se ejecuta en Node
    return Buffer.from(input, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Permitir recursos estáticos/metadatos de Next sin autenticación
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Si no hay credenciales configuradas, no bloquear (útil en desarrollo)
  if (!USER || !PASS) return NextResponse.next();

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader) return unauthorized();

  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  const decoded = decodeBase64(encoded);
  const [user, pass] = decoded.split(':');

  if (user === USER && pass === PASS) {
    return NextResponse.next();
  }

  return unauthorized();
}

// Aplicar a todo excepto los estáticos de Next/archivos públicos comunes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
