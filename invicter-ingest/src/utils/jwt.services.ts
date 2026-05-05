import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  private jwtService = new JwtService({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  });

  async generateToken(user: any) {
    const payload = {
      uuidUser: user.uuidUser,
      email: user.email,
      plan: user.plan,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
