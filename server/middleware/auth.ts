import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "flexindihair-secret-key";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        email: string;
      };
      customer?: {
        id: number;
        email: string;
      };
    }
  }
}

export const generateAdminToken = (admin: { id: number; email: string }) => {
  return jwt.sign({ id: admin.id, email: admin.email, role: "admin" }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

export const generateCustomerToken = (customer: { id: number; email: string }) => {
  return jwt.sign({ id: customer.id, email: customer.email, role: "customer" }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    
    const admin = await storage.getAdminByEmail(decoded.email);
    
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized - Invalid admin" });
    }
    
    req.admin = {
      id: admin.id,
      email: admin.email,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const requireCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    
    if (decoded.role !== "customer") {
      return res.status(403).json({ message: "Forbidden - Customer access required" });
    }
    
    const customer = await storage.getCustomerByEmail(decoded.email);
    
    if (!customer) {
      return res.status(401).json({ message: "Unauthorized - Invalid customer" });
    }
    
    req.customer = {
      id: customer.id,
      email: customer.email,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const optionalCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    
    if (decoded.role !== "customer") {
      return next();
    }
    
    const customer = await storage.getCustomerByEmail(decoded.email);
    
    if (customer) {
      req.customer = {
        id: customer.id,
        email: customer.email,
      };
    }
    
    next();
  } catch (error) {
    // Continue without customer context if token is invalid
    next();
  }
};
