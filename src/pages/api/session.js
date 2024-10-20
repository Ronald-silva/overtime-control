
import { auth } from '../../utils/firebase-admin';

const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { idToken } = req.body;
    
    try {
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      res.setHeader('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn};`);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}