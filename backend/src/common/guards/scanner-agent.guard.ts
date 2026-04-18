import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

interface ScannerAgentRequest extends Request {
  scannerAgentAuthorized?: boolean;
}

@Injectable()
export class ScannerAgentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ScannerAgentRequest>();
    const headerValue = request.header('x-scanner-agent-key');
    const expected = process.env.SCANNER_AGENT_KEY;

    if (!expected) {
      throw new UnauthorizedException('Scanner agent integration is not configured');
    }

    if (!headerValue || headerValue !== expected) {
      throw new UnauthorizedException('Invalid scanner agent key');
    }

    request.scannerAgentAuthorized = true;
    return true;
  }
}
