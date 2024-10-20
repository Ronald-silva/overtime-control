import { NextResponse } from 'next/server';
import { auth } from './utils/firebase-admin';

export async function middleware(request) {
  const session = request.cookies.get('session')?.value || '';

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    const userDoc = await admin.firestore().collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    if (request.nextUrl.pathname.startsWith('/reports') && userData.role !== 'manager') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/reports'],
};