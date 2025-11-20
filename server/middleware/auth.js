// Authentication Middleware for Express/Node.js Backend
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const getSupabaseClient = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseKey);
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided. Please include Authorization: Bearer <token> header',
            });
            return;
        }

        const token = authHeader.replace('Bearer ', '');

        // Create Supabase client
        const supabase = getSupabaseClient();

        // Verify token and get user
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
                details: error?.message,
            });
            return;
        }

        // Fetch user profile from database
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, email, role, name')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError);
        }

        // Attach user and supabase client to request
        req.user = {
            id: user.id,
            email: user.email || '',
            role: profile?.role || 'user',
        };
        req.supabase = supabase;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authenticate request',
        });
    }
}

/**
 * Optional Authentication Middleware
 * Allows requests without token but attaches user if token is present
 */
export async function optionalAuthenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            next();
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabaseClient();

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
            const { data: profile } = await supabase
                .from('users')
                .select('id, email, role, name')
                .eq('id', user.id)
                .single();

            req.user = {
                id: user.id,
                email: user.email || '',
                role: profile?.role || 'user',
            };
            req.supabase = supabase;
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
}

/**
 * Role-Based Authorization Middleware
 * Requires user to have specific role(s)
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }

        const userRole = req.user.role || 'user';

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                userRole,
            });
            return;
        }

        next();
    };
}

/**
 * Workspace Authorization Middleware
 * Verifies user is member of the workspace
 */
export async function requireWorkspaceMember(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }

        const workspaceId = req.params.workspaceId || req.body.workspace_id || req.body.group_id;

        if (!workspaceId) {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Workspace ID required',
            });
            return;
        }

        // Check if user is member of workspace
        const { data: membership, error } = await req.supabase
            .from('group_members')
            .select('role')
            .eq('group_id', workspaceId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !membership) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'You are not a member of this workspace',
            });
            return;
        }

        // Attach membership info to request
        req.workspaceMembership = membership;

        next();
    } catch (error) {
        console.error('Workspace authorization error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify workspace membership',
        });
    }
}

/**
 * Admin-Only Workspace Middleware
 * Requires user to be admin or owner of workspace
 */
export async function requireWorkspaceAdmin(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }

        const workspaceId = req.params.workspaceId || req.body.workspace_id || req.body.group_id;

        if (!workspaceId) {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Workspace ID required',
            });
            return;
        }

        const { data: membership, error } = await req.supabase
            .from('group_members')
            .select('role')
            .eq('group_id', workspaceId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !membership) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'You are not a member of this workspace',
            });
            return;
        }

        if (!['admin', 'owner'].includes(membership.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Admin or owner role required',
                userRole: membership.role,
            });
            return;
        }

        req.workspaceMembership = membership;

        next();
    } catch (error) {
        console.error('Workspace admin authorization error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify workspace admin status',
        });
    }
}
