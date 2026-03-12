import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
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
