import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { hashPassword } from '../password';

export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  githubUrl: true,
  telegramHandle: true,
  websiteUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserDto) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await hashPassword(input.password);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          githubUrl: input.githubUrl,
          telegramHandle: input.telegramHandle,
          websiteUrl: input.websiteUrl,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Email уже используется');
      }
      throw error;
    }
  }

  async findForLogin(email: string) {
    const record = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { ...publicUserSelect, passwordHash: true },
    });
    if (!record) {
      return null;
    }
    const { passwordHash, ...user } = record;
    return { passwordHash, user };
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  }

  updateProfile(
    id: string,
    input: {
      firstName?: string;
      lastName?: string;
      githubUrl?: string | null;
      telegramHandle?: string | null;
      websiteUrl?: string | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: input,
      select: publicUserSelect,
    });
  }
}
