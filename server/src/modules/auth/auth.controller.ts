// import { Controller, Get, Post, Req, Res } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import type { Request, Response } from 'express';
// import { auth } from '../../../auth';
// import { PrismaService } from 'database/prisma.service';

// @ApiTags('Authentication')
// @Controller()
// export class AuthController {
//   constructor(private prisma: PrismaService) {}

//   @Get('auth/get-session')
//   @ApiOperation({ summary: 'Get current user session' })
//   @ApiResponse({
//     status: 200,
//     description: 'Session data retrieved successfully',
//   })
//   @ApiResponse({ status: 401, description: 'No active session' })
//   async getSession(@Req() req: Request, @Res() res: Response) {
//     try {
//       // Use Better Auth's built-in session handling
//       const session = await auth.api.getSession({
//         headers: req.headers as any,
//       });

//       if (session?.user && session?.session) {
//         return res.json(session);
//       }

//       return res.json(null);
//     } catch (error) {
//       console.error('[AUTH] Session check failed:', error);
//       return res.status(401).json({ error: 'Invalid session' });
//     }
//   }
// }
