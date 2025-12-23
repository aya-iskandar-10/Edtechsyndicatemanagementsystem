import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-71a69640/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EdTech Syndicate API'
  });
});

// Sign up endpoint
app.post('/make-server-71a69640/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    console.log('📝 Signup request:', { email, name });

    if (!email || !password || !name) {
      console.log('❌ Missing required fields');
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created:', data.user.id);
    return c.json({ user: data.user });
  } catch (error: any) {
    console.error('❌ Signup exception:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Submit application
app.post('/make-server-71a69640/application', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.log('❌ No authorization token');
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user?.id) {
      console.log('❌ Invalid token or user not found');
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    console.log('📤 Application submission from user:', user.id);

    // Check if user already has an application
    const existingApp = await kv.get(`application:${user.id}`);

    if (existingApp) {
      console.log('⚠️ User already has an application:', existingApp.id);
      return c.json({
        error: 'You have already submitted an application',
        existingApplicationId: existingApp.id
      }, 400);
    }

    // Get application data
    const applicationData = await c.req.json();

    console.log('📝 Application data:', {
      fullName: applicationData.fullName,
      email: applicationData.email,
      position: applicationData.position,
      organization: applicationData.organization
    });

    // Validate required fields
    const requiredFields = [
      'fullName', 'email', 'phone', 'position',
      'organization', 'yearsExperience', 'education',
      'specialization', 'motivation'
    ];

    const missingFields = requiredFields.filter(field => !applicationData[field]);

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return c.json({
        error: 'Missing required fields',
        missingFields
      }, 400);
    }

    // Create application
    const applicationId = crypto.randomUUID();
    const application = {
      id: applicationId,
      userId: user.id,
      fullName: applicationData.fullName,
      email: applicationData.email,
      phone: applicationData.phone,
      position: applicationData.position,
      organization: applicationData.organization,
      yearsExperience: applicationData.yearsExperience,
      education: applicationData.education,
      specialization: applicationData.specialization,
      linkedin: applicationData.linkedin || null,
      motivation: applicationData.motivation,
      files: applicationData.files || null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      expiryDate: null,
      membershipNumber: null
    };

    console.log('💾 Saving application:', applicationId);

    // Save application to KV store
    await kv.set(`application:${user.id}`, application);

    // Verify save
    const savedApp = await kv.get(`application:${user.id}`);

    if (!savedApp) {
      console.error('❌ Application save verification failed');
      return c.json({ error: 'Failed to save application to database' }, 500);
    }

    console.log('✅ Application saved and verified:', applicationId);

    // Add to pending list
    try {
      const pendingApps = (await kv.get('applications:pending')) || [];
      pendingApps.push(applicationId);
      await kv.set('applications:pending', pendingApps);
      console.log('📋 Added to pending list. Total pending:', pendingApps.length);
    } catch (e) {
      console.warn('⚠️ Failed to update pending list:', e);
      // Don't fail the request if this fails
    }

    return c.json({
      success: true,
      applicationId: applicationId,
      message: 'Application submitted successfully',
      application: savedApp
    });

  } catch (error: any) {
    console.error('❌ Application submission exception:', error);
    return c.json({
      error: 'Failed to submit application',
      details: error.message
    }, 500);
  }
});

// Get application by user ID
app.get('/make-server-71a69640/application/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('🔍 Fetching application for user:', userId);

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const application = await kv.get(`application:${userId}`);

    if (!application) {
      console.log('ℹ️ No application found for user:', userId);
      return c.json({ error: 'Application not found' }, 404);
    }

    console.log('✅ Application found:', application.id, '| Status:', application.status);
    return c.json(application);

  } catch (error: any) {
    console.error('❌ Get application exception:', error);
    return c.json({
      error: 'Failed to fetch application',
      details: error.message
    }, 500);
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

    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check admin role
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('🔐 Admin check:', { userId: user.id, isAdmin });

    if (!isAdmin) {
      console.log('❌ Access denied - not admin');
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    console.log('📋 Fetching all applications...');

    // Get all applications
    const applications = await kv.getByPrefix('application:');

    console.log('✅ Found', applications.length, 'applications');

    // Sort by submission date
    const sortedApplications = applications.sort((a: any, b: any) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json(sortedApplications);

  } catch (error: any) {
    console.error('❌ Admin get applications exception:', error);
    return c.json({
      error: 'Failed to fetch applications',
      details: error.message
    }, 500);
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

    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isAdmin = user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const applicationId = c.req.param('id');
    const { expiryDate } = await c.req.json();

    if (!expiryDate) {
      return c.json({ error: 'Expiry date is required' }, 400);
    }

    console.log('✅ Approving application:', applicationId);

    // Find application
    const applications = await kv.getByPrefix('application:');
    const application = applications.find((app: any) => app.id === applicationId);

    if (!application) {
      console.log('❌ Application not found:', applicationId);
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
    console.log('✅ Application approved with membership:', membershipNumber);

    // Update lists
    const pendingApps = (await kv.get('applications:pending')) || [];
    const updatedPending = pendingApps.filter((id: string) => id !== applicationId);
    await kv.set('applications:pending', updatedPending);

    const approvedApps = (await kv.get('applications:approved')) || [];
    approvedApps.push(applicationId);
    await kv.set('applications:approved', approvedApps);

    return c.json({ success: true, application: updatedApplication });

  } catch (error: any) {
    console.error('❌ Approve application exception:', error);
    return c.json({
      error: 'Failed to approve application',
      details: error.message
    }, 500);
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

    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isAdmin = user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const applicationId = c.req.param('id');
    console.log('❌ Rejecting application:', applicationId);

    // Find application
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
    console.log('✅ Application rejected');

    // Update lists
    const pendingApps = (await kv.get('applications:pending')) || [];
    const updatedPending = pendingApps.filter((id: string) => id !== applicationId);
    await kv.set('applications:pending', updatedPending);

    const rejectedApps = (await kv.get('applications:rejected')) || [];
    rejectedApps.push(applicationId);
    await kv.set('applications:rejected', rejectedApps);

    return c.json({ success: true, application: updatedApplication });

  } catch (error: any) {
    console.error('❌ Reject application exception:', error);
    return c.json({
      error: 'Failed to reject application',
      details: error.message
    }, 500);
  }
});

console.log('🚀 EdTech Syndicate API Server starting...');
Deno.serve(app.fetch);