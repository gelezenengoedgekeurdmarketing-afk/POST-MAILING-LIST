import type { Express } from "express";
import { createServer, type Server } from "http";
import { storagePromise } from "./storage";
import { insertBusinessSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
// TODO: Uncomment when database is enabled
// import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  const upload = multer({ storage: multer.memoryStorage() });
  
  // Wait for storage to be initialized
  const storage = await storagePromise;
  const { databaseIntended, databaseAvailable, databaseDisabled } = await import("./storage");
  
  // Set up authentication only if using DatabaseStorage
  if (databaseAvailable) {
    const { setupAuth, isAuthenticated } = await import("./replitAuth");
    const { setupLocalAuth, isAuthenticatedLocal } = await import("./passportLocal");
    
    await setupAuth(app);
    await setupLocalAuth(app);
    
    // Auth user endpoint (only available with database)
    app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });
    
    console.log("🔐 Authentication enabled - database storage active");
    console.log("🔑 Local username/password login available");
  } else if (databaseIntended && !databaseDisabled) {
    // Database was configured and should be working, but isn't - this is a critical failure
    console.error("❌ Database was configured but is unavailable - API will be restricted");
    console.error("   The app will not allow unauthenticated access to protect your data");
  } else {
    console.log("⚠️  Authentication disabled - using in-memory storage");
    console.log("   To enable login features, activate the database in your Replit workspace");
  }

  // Helper to conditionally apply auth middleware
  // Three modes:
  // 1. Database available → require authentication (works with both Replit Auth and Local)
  // 2. Database intended but temporarily down (not disabled) → block all requests (fail closed)
  // 3. Database not intended OR explicitly disabled → allow unauthenticated access
  const authMiddleware = databaseAvailable
    ? (await import("./passportLocal")).isAuthenticatedLocal 
    : (databaseIntended && !databaseDisabled)
    ? (_req: any, res: any, _next: any) => {
        res.status(503).json({ 
          error: "Service temporarily unavailable",
          message: "Database connection required but unavailable" 
        });
      }
    : (_req: any, _res: any, next: any) => next();

  // Get all businesses
  app.get("/api/businesses", authMiddleware, async (req, res) => {
    try {
      const allBusinesses = await storage.getAllBusinesses();
      res.json(allBusinesses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get business by ID
  app.get("/api/businesses/:id", authMiddleware, async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new business
  app.post("/api/businesses", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const newBusiness = await storage.createBusiness(validatedData);
      res.status(201).json(newBusiness);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a business
  app.patch("/api/businesses/:id", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.partial().parse(req.body);
      const updatedBusiness = await storage.updateBusiness(req.params.id, validatedData);
      if (!updatedBusiness) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a business
  app.delete("/api/businesses/:id", authMiddleware, async (req, res) => {
    try {
      const success = await storage.deleteBusiness(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk create businesses (for import)
  app.post("/api/businesses/bulk", authMiddleware, async (req, res) => {
    try {
      const { businesses: businessList } = req.body;
      if (!Array.isArray(businessList)) {
        return res.status(400).json({ error: "businesses must be an array" });
      }
      const validatedBusinesses = businessList.map(b => insertBusinessSchema.parse(b));
      const createdBusinesses = await storage.createBusinesses(validatedBusinesses);
      res.status(201).json(createdBusinesses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Import Excel/CSV file (auth runs before file upload)
  app.post("/api/import", (req, res, next) => {
    // Run auth first, before multer processes the file
    authMiddleware(req, res, (err?: any) => {
      if (err) return next(err);
      // Only process file upload if authenticated
      upload.single("file")(req, res, next);
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);

      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      data.forEach((row: any, index: number) => {
        try {
          // Coerce numeric values to strings (common in Excel exports)
          const toString = (val: any) => val !== null && val !== undefined ? String(val) : "";
          
          // Merge dialog tags WITH per-row tags from Categorie column
          let rowTags = [...tags]; // Start with dialog tags
          const rowTagsField = row.tags || row.Tags || row.TAGS || row['(google) categorie'] || row.categorie || row.Categorie;
          if (rowTagsField) {
            const perRowTags = Array.isArray(rowTagsField) 
              ? rowTagsField 
              : toString(rowTagsField).split(',').map((t: string) => t.trim()).filter(Boolean);
            // Merge tags, avoiding duplicates
            const mergedSet = new Set([...rowTags, ...perRowTags]);
            rowTags = Array.from(mergedSet);
          }
          
          const business = {
            name: toString(row.name || row.Name || row.NAME || row['naam (zaak)'] || row['Naam zaak'] || row.naam || row.Naam || row.zaak),
            streetName: toString(row.streetName || row.street_name || row.StreetName || row.address || row.Address || row.ADDRESS || row.adresregel || row.Adresregel || row['Adresregel 1'] || row['adresregel 1']),
            zipcode: toString(row.zipcode || row.zip || row.Zipcode || row.ZIP || row.postalCode || row.postal_code || row.PostalCode || row.PC || row.pc),
            city: toString(row.city || row.City || row.CITY || row.PLAATS || row.plaats || row.Plaats),
            email: toString(row.email || row.Email || row.EMAIL || row['e-mail'] || row.mail),
            phone: toString(row.phone || row.Phone || row.PHONE || row.telefoon || row.Telefoon || row.tel),
            tags: rowTags,
            comment: toString(row.comment || row.Comment || row.COMMENT || row.opmerking || row.Opmerking),
            isActive: row.isActive !== undefined ? row.isActive : (row.is_active !== undefined ? row.is_active : true),
          };

          // Validate required fields before attempting to parse
          const missingFields = [];
          if (!business.name) missingFields.push("name");
          if (!business.streetName) missingFields.push("streetName");
          if (!business.zipcode) missingFields.push("zipcode");
          if (!business.city) missingFields.push("city");

          if (missingFields.length > 0) {
            results.errors.push({
              row: index + 2, // +2 because Excel rows are 1-indexed and first row is header
              data: row,
              error: `Missing required fields: ${missingFields.join(", ")}`,
            });
          } else {
            const validated = insertBusinessSchema.parse(business);
            results.success.push(validated);
          }
        } catch (error: any) {
          results.errors.push({
            row: index + 2,
            data: row,
            error: error.message,
          });
        }
      });

      // Create businesses for successful rows
      let createdBusinesses: any[] = [];
      if (results.success.length > 0) {
        createdBusinesses = await storage.createBusinesses(results.success);
      }

      res.status(results.errors.length > 0 ? 207 : 201).json({
        success: results.errors.length === 0,
        imported: createdBusinesses.length,
        failed: results.errors.length,
        businesses: createdBusinesses,
        errors: results.errors,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Export businesses to Excel/CSV
  app.post("/api/export", authMiddleware, async (req, res) => {
    try {
      const { format, ids } = req.body;
      
      let businessesToExport;
      if (ids && Array.isArray(ids) && ids.length > 0) {
        const allBusinesses = await storage.getAllBusinesses();
        businessesToExport = allBusinesses.filter(b => ids.includes(b.id));
      } else {
        businessesToExport = await storage.getAllBusinesses();
      }

      const data = businessesToExport.map(b => ({
        Name: b.name,
        "Street Name": b.streetName,
        Zipcode: b.zipcode,
        City: b.city,
        Email: b.email,
        Phone: b.phone || '',
        Tags: (b.tags || []).join(", "),
        Comment: b.comment || '',
        Active: b.isActive ? "Yes" : "No",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Businesses");

      if (format === "word") {
        // Create Word document with specific formatting
        const sections = businessesToExport.map(business => {
          return [
            new Paragraph({
              text: business.name,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: business.streetName,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `${business.zipcode} ${business.city}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
          ];
        }).flat();

        const doc = new Document({
          sections: [{
            properties: {},
            children: sections,
          }],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", 'attachment; filename="businesses.docx"');
        res.send(buffer);
      } else if (format === "csv" || format === "mailinglist") {
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="businesses.csv"');
        res.send(csv);
      } else {
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="businesses.xlsx"');
        res.send(buffer);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
