import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../../lib/prisma';

interface ResetResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ message: 'Método não permitido' });
  }
  const { email } = req.body as { email: string };
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal if the email is not registered
      return res.status(200).json({ message: 'Se o email existir, você receberá um link para alterar a senha.' });
    }
    // Generate a unique token and set expiry (e.g. 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id
      }
    });
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    const resetLink = `${baseUrl}/change-password/${token}`;

    // Configure the transport. These environment variables should be set
    // in production. For local testing, defaults attempt to use Ethereal.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? ''
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@example.com',
      to: email,
      subject: 'Redefinição de senha',
      text: `Clique no link abaixo para alterar sua senha: ${resetLink}`,
      html: `<p>Clique no link abaixo para alterar sua senha:</p><p><a href="${resetLink}">${resetLink}</a></p>`
    });
    return res.status(200).json({ message: 'Se o email existir, você receberá um link para alterar a senha.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
}
