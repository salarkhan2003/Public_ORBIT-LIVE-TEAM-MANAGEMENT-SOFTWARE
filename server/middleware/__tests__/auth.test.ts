// Tests for Authentication Middleware
/// <reference types="jest" />
import { Response } from 'express';
import { authenticate, requireRole, requireWorkspaceMember } from '../auth';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Define MockAuthRequest to match our middleware (avoiding name collision)
interface MockAuthRequest {
  headers?: Record<string, string>;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  supabase?: unknown;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

describe('Authentication Middleware', () => {
  let mockRequest: Partial<MockAuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockSupabase: {
    auth: {
      getUser: jest.Mock;
    };
    from: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
  };

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('authenticate', () => {
    it('should reject request without Authorization header', async () => {
      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: expect.stringContaining('No token provided'),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat token' };

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid token and attach user to request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'developer',
        name: 'Test User',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockProfile.role,
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should reject request without user', () => {
      const middleware = requireRole('admin');

      middleware(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'developer',
      };
      const middleware = requireRole('admin');

      middleware(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept user with required role', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };
      const middleware = requireRole('admin', 'owner');

      middleware(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireWorkspaceMember', () => {
    it('should reject request without workspaceId', async () => {
      mockRequest.user = { id: 'user-123', email: 'test@example.com' };
      mockRequest.params = {};
      mockRequest.body = {};

      await requireWorkspaceMember(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject user not member of workspace', async () => {
      mockRequest.user = { id: 'user-123', email: 'test@example.com' };
      mockRequest.params = { workspaceId: 'workspace-123' };
      mockRequest.supabase = mockSupabase;

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      await requireWorkspaceMember(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept workspace member', async () => {
      mockRequest.user = { id: 'user-123', email: 'test@example.com' };
      mockRequest.params = { workspaceId: 'workspace-123' };
      mockRequest.supabase = mockSupabase;

      mockSupabase.single.mockResolvedValue({
        data: { role: 'member' },
        error: null,
      });

      await requireWorkspaceMember(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
