import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { db } from "@db";
import { scannedItems, mappingData } from "@db/schema";
import { desc, sql, eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerRoutes(app: Express): Server {
  // Serve images from attached_assets
  app.use(express.static(path.join(__dirname, "../attached_assets")));

  // API Routes
  app.get("/api/scanned-items", async (req, res) => {
    try {
      const items = await db.select({
        id: scannedItems.id,
        code: scannedItems.code,
        path: mappingData.path,
        timestamp: scannedItems.timestamp,
        timeSlot: sql<string>`
          CASE 
            WHEN strftime('%H', datetime(${scannedItems.timestamp} / 1000, 'unixepoch')) >= '08' 
             AND strftime('%H', datetime(${scannedItems.timestamp} / 1000, 'unixepoch')) < '16' 
            THEN 'morning'
            WHEN strftime('%H', datetime(${scannedItems.timestamp} / 1000, 'unixepoch')) >= '16' 
             AND strftime('%H', datetime(${scannedItems.timestamp} / 1000, 'unixepoch')) < '24' 
            THEN 'evening'
            ELSE 'night'
          END
        `.as('timeSlot')
      })
      .from(scannedItems)
      .leftJoin(mappingData, eq(scannedItems.code, mappingData.code))
      .orderBy(desc(scannedItems.timestamp));

      // Group items by time slot
      const groupedItems = {
        morning: items.filter(item => item.timeSlot === 'morning'),
        evening: items.filter(item => item.timeSlot === 'evening'),
        night: items.filter(item => item.timeSlot === 'night')
      };

      res.json(groupedItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scanned items" });
    }
  });

  app.post("/api/scanned-items", async (req, res) => {
    try {
      const { code } = req.body;

      // تغيير التحقق إلى مرة واحدة فقط
      const scanCount = await db.select({ 
        count: sql<number>`count(*)` 
      })
      .from(scannedItems)
      .where(eq(scannedItems.code, code))
      .then(result => result[0].count);

      if (scanCount >= 1) {
        return res.status(400).json({ 
          error: "تم تسجيل هذا الكود بالفعل" 
        });
      }

      const [item] = await db.insert(scannedItems).values({ code }).returning();
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create scanned item" });
    }
  });

  app.post("/api/scanned-items/batch", async (req, res) => {
    try {
      const { items } = req.body;

      // تغيير التحقق إلى مرة واحدة فقط
      const validItems = [];
      for (const item of items) {
        const scanCount = await db.select({ 
          count: sql<number>`count(*)` 
        })
        .from(scannedItems)
        .where(eq(scannedItems.code, item.code))
        .then(result => result[0].count);

        if (scanCount < 1) {
          validItems.push(item);
        }
      }

      if (validItems.length === 0) {
        return res.status(400).json({ 
          error: "جميع الأكواد تم تسجيلها بالفعل" 
        });
      }

      const insertedItems = await db.insert(scannedItems)
        .values(validItems.map(item => ({ code: item.code })))
        .returning();
      res.json(insertedItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to batch insert scanned items" });
    }
  });

  app.delete("/api/scanned-items", async (req, res) => {
    try {
      await db.delete(scannedItems);
      res.json({ message: "All items deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete scanned items" });
    }
  });

  app.post("/api/mapping-data", async (req, res) => {
    try {
      const { mappings } = req.body;

      // Clear existing mappings
      await db.delete(mappingData);

      // Insert new mappings
      await db.insert(mappingData).values(
        mappings.map((item: any) => ({
          code: item.code?.toString() || '',
          path: item.path || '',
        }))
      );

      res.json({ message: "Mapping data uploaded successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload mapping data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}