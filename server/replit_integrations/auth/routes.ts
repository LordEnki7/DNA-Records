import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/admin-login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      const adminUsername = process.env.ADMIN_USERNAME || "dnaadmin";
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return res.status(503).json({ message: "Admin credentials not configured" });
      }
      if (username !== adminUsername || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      (req.session as any).adminLoggedIn = true;
      req.session.save((err: any) => {
        if (err) return res.status(500).json({ message: "Session error" });
        res.json({ success: true });
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/admin-logout", (req: any, res) => {
    (req.session as any).adminLoggedIn = false;
    req.session.save(() => res.json({ success: true }));
  });

  app.get("/api/auth/admin-status", (req: any, res) => {
    res.json({ isAdmin: !!(req.session as any).adminLoggedIn });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/claim-admin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const adminCount = await authStorage.getAdminCount();
      if (adminCount > 0) {
        return res.status(403).json({ message: "An admin already exists. Contact an existing admin to grant access." });
      }
      const user = await authStorage.grantAdmin(userId);
      res.json(user);
    } catch (error) {
      console.error("Error claiming admin:", error);
      res.status(500).json({ message: "Failed to claim admin" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const allUsers = await authStorage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/grant-admin", isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const requester = await authStorage.getUser(requesterId);
      if (!requester?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const user = await authStorage.grantAdmin(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to grant admin" });
    }
  });

  app.post("/api/admin/users/:id/revoke-admin", isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const requester = await authStorage.getUser(requesterId);
      if (!requester?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (req.params.id === requesterId) {
        return res.status(400).json({ message: "You cannot revoke your own admin access" });
      }
      const user = await authStorage.revokeAdmin(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to revoke admin" });
    }
  });
}
