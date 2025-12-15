import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-71a69640/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post('/make-server-71a69640/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Submit application
app.post('/make-server-71a69640/application', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user already has an application
    const existingApp = await kv.get(`application:${user.id}`);
    if (existingApp) {
      return c.json({ error: 'You have already submitted an application' }, 400);
    }

    const applicationData = await c.req.json();
    
    const application = {
      id: crypto.randomUUID(),
      userId: user.id,
      ...applicationData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Save application
    await kv.set(`application:${user.id}`, application);
    
    // Add to pending list
    const pendingApps = await kv.get('applications:pending') || [];
    pendingApps.push(application.id);
    await kv.set('applications:pending', pendingApps);

    return c.json({ success: true, applicationId: application.id });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Get application by user ID
app.get('/make-server-71a69640/application/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const application = await kv.get(`application:${userId}`);

    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    return c.json(application);
  } catch (error: any) {
    console.error('Get application error:', error);
    return c.json({ error: 'Failed to fetch application' }, 500);
  }
});

// Admin: Get all applications
app.get('/make-server-71a69640/admin/applications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    // Get all applications
    const applications = await kv.getByPrefix('application:');
    
    // Sort by submission date (most recent first)
    const sortedApplications = applications.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json(sortedApplications);
  } catch (error: any) {
    console.error('Admin get applications error:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// Admin: Approve application
app.post('/make-server-71a69640/admin/application/:id/approve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const applicationId = c.req.param('id');
    const { expiryDate } = await c.req.json();

    if (!expiryDate) {
      return c.json({ error: 'Expiry date is required' }, 400);
    }

    // Find the application
    const applications = await kv.getByPrefix('application:');
    const application = applications.find((app: any) => app.id === applicationId);

    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Generate membership number
    const membershipNumber = `EDU${Date.now().toString().slice(-8)}`;

    // Update application
    const updatedApplication = {
      ...application,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      expiryDate,
      membershipNumber
    };

    await kv.set(`application:${application.userId}`, updatedApplication);

    // Remove from pending list
    const pendingApps = await kv.get('applications:pending') || [];
    const updatedPending = pendingApps.filter((id: string) => id !== applicationId);
    await kv.set('applications:pending', updatedPending);

    // Add to approved list
    const approvedApps = await kv.get('applications:approved') || [];
    approvedApps.push(applicationId);
    await kv.set('applications:approved', approvedApps);

    return c.json({ success: true, application: updatedApplication });
  } catch (error: any) {
    console.error('Admin approve application error:', error);
    return c.json({ error: 'Failed to approve application' }, 500);
  }
});

// Admin: Reject application
app.post('/make-server-71a69640/admin/application/:id/reject', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const applicationId = c.req.param('id');

    // Find the application
    const applications = await kv.getByPrefix('application:');
    const application = applications.find((app: any) => app.id === applicationId);

    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Update application
    const updatedApplication = {
      ...application,
      status: 'rejected',
      reviewedAt: new Date().toISOString()
    };

    await kv.set(`application:${application.userId}`, updatedApplication);

    // Remove from pending list
    const pendingApps = await kv.get('applications:pending') || [];
    const updatedPending = pendingApps.filter((id: string) => id !== applicationId);
    await kv.set('applications:pending', updatedPending);

    // Add to rejected list
    const rejectedApps = await kv.get('applications:rejected') || [];
    rejectedApps.push(applicationId);
    await kv.set('applications:rejected', rejectedApps);

    return c.json({ success: true, application: updatedApplication });
  } catch (error: any) {
    console.error('Admin reject application error:', error);
    return c.json({ error: 'Failed to reject application' }, 500);
  }
});

Deno.serve(app.fetch);
