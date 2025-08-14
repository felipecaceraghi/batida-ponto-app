import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

interface ChangePasswordResponse {
  success?: boolean;
  error?: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChangePasswordResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Método não permitido' });
  }
  const { token, password } = req.body as { token: string; password: string };
  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }
  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    const hashed = hashPassword(password);
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}
