import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up Dify test user...');

    // テストユーザーを作成（既に存在する場合はスキップ）
    const existingUser = await prisma.user.findUnique({
      where: { id: 'dify-user-001' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser.id);
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        }
      });
    }

    // 新しいテストユーザーを作成
    const testUser = await prisma.user.create({
      data: {
        id: 'dify-user-001',
        name: 'Dify Test User',
        email: 'dify-test@example.com',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('Test user created successfully:', testUser.id);

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to setup test user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}