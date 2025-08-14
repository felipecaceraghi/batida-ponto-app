import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

interface PunchResponse {
  success?: boolean;
  error?: string;
  punch?: {
    id: number;
    timestamp: Date;
    ip: string;
    userId: number;
  };
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PunchResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Método não permitido' });
  }
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  const hashed = hashPassword(password);
  try {
    const user = await prisma.user.findFirst({ where: { email, password: hashed } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    // Determine client IP. x-forwarded-for may contain a list if behind a proxy.
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    // Check whether this user already has a punch.
    const existingForUser = await prisma.punch.findFirst({ where: { userId: user.id } });
    if (existingForUser) {
      return res.status(400).json({ error: 'Usuário já registrou uma batida de ponto' });
    }
    // Check whether this IP has been used.
    const existingForIp = await prisma.punch.findUnique({ where: { ip } });
    if (existingForIp) {
      return res.status(400).json({ error: 'Este IP já foi utilizado para uma batida de ponto' });
    }
    const punch = await prisma.punch.create({ data: { userId: user.id, ip } });
    return res.status(200).json({ success: true, punch });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}
