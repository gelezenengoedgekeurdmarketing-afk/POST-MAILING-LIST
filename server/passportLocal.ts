import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Express } from 'express';

export async function setupLocalAuth(app: Express) {
  // Configure Passport Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        console.log('🔍 Login attempt for username:', username);
        
        // First, test raw query to verify connection
        const { pool } = await import('./db');
        const rawResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log('🔍 Raw SQL query result:', rawResult.rows.length, 'rows');
        if (rawResult.rows.length > 0) {
          console.log('🔍 Raw user data:', rawResult.rows[0]);
        }
        
        // Find user by username using Drizzle
        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
        
        console.log('🔍 Drizzle query result:', JSON.stringify(result, null, 2));
        const [user] = result;

        console.log('🔍 User found:', user ? 'yes' : 'no');
        if (!user) {
          console.log('❌ User not found in database');
          return done(null, false, { message: 'Invalid username or password' });
        }

        console.log('🔍 Has password hash:', user.passwordHash ? 'yes' : 'no');
        if (!user.passwordHash) {
          console.log('❌ User has no password hash');
          return done(null, false, { message: 'Invalid username or password' });
        }

        // Verify password
        console.log('🔍 Comparing password...');
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        console.log('🔍 Password valid:', isValidPassword);
        
        if (!isValidPassword) {
          console.log('❌ Password mismatch');
          return done(null, false, { message: 'Invalid username or password' });
        }

        console.log('✅ Login successful for user:', username);
        return done(null, user);
      } catch (error) {
        console.error('❌ Login error:', error);
        return done(error);
      }
    }
  ));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Login route
  app.post('/api/login/local', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        
        return res.json({ 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Check if user is authenticated (for both auth methods)
  app.get('/api/auth/check', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });
}

// Middleware to check if user is authenticated (works with both Replit Auth and Local)
export function isAuthenticatedLocal(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
