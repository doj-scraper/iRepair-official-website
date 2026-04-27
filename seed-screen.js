seed-screen.ts 

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The master list with integer cents (e.g., $18.50 = 1850)
const screenInventory = [
  { gen: "8", variant: "ZZ", name: "iPhone 8", price: 1850, specs: "4.7-inch LCD", models: "A1863, A1905" },
  { gen: "8", variant: "PL", name: "iPhone 8 Plus", price: 2200, specs: "5.5-inch LCD", models: "A1864" },
  { gen: "X", variant: "ZZ", name: "iPhone X", price: 3500, specs: "5.8-inch OLED", models: "A1865, A1901" },
  { gen: "XS", variant: "ZZ", name: "iPhone XS", price: 3800, specs: "5.8-inch OLED", models: "A1920" },
  { gen: "XS", variant: "PM", name: "iPhone XS Max", price: 4500, specs: "6.5-inch OLED", models: "A1921" },
  { gen: "XR", variant: "ZZ", name: "iPhone XR", price: 2800, specs: "6.1-inch LCD", models: "A1984" },
  { gen: "11", variant: "ZZ", name: "iPhone 11", price: 3200, specs: "6.1-inch LCD", models: "A2111" },
  { gen: "11", variant: "PR", name: "iPhone 11 Pro", price: 4200, specs: "5.8-inch OLED", models: "A2160" },
  { gen: "11", variant: "PM", name: "iPhone 11 Pro Max", price: 5000, specs: "6.5-inch OLED", models: "A2161" },
  { gen: "SE2", variant: "ZZ", name: "iPhone SE (2nd Gen)", price: 1850, specs: "4.7-inch LCD", models: "A2275" },
  { gen: "12", variant: "ZZ", name: "iPhone 12", price: 5500, specs: "6.1-inch OLED", models: "A2172" },
  { gen: "12", variant: "MN", name: "iPhone 12 mini", price: 5000, specs: "5.4-inch OLED", models: "A2176" },
  { gen: "12", variant: "PR", name: "iPhone 12 Pro", price: 5500, specs: "6.1-inch OLED", models: "A2341" },
  { gen: "12", variant: "PM", name: "iPhone 12 Pro Max", price: 6500, specs: "6.7-inch OLED", models: "A2342" },
  { gen: "13", variant: "ZZ", name: "iPhone 13", price: 6000, specs: "6.1-inch OLED", models: "A2482" },
  { gen: "13", variant: "MN", name: "iPhone 13 mini", price: 5500, specs: "5.4-inch OLED", models: "A2481" },
  { gen: "13", variant: "PR", name: "iPhone 13 Pro", price: 8500, specs: "6.1-inch OLED", models: "A2483" },
  { gen: "13", variant: "PM", name: "iPhone 13 Pro Max", price: 10500, specs: "6.7-inch OLED", models: "A2484" },
  { gen: "SE3", variant: "ZZ", name: "iPhone SE (3rd Gen)", price: 2000, specs: "4.7-inch LCD", models: "A2595" },
  { gen: "14", variant: "ZZ", name: "iPhone 14", price: 7500, specs: "6.1-inch OLED", models: "A2649" },
  { gen: "14", variant: "PL", name: "iPhone 14 Plus", price: 8500, specs: "6.7-inch OLED", models: "A2632" },
  { gen: "14", variant: "PR", name: "iPhone 14 Pro", price: 12000, specs: "6.1-inch OLED", models: "A2650" },
  { gen: "14", variant: "PM", name: "iPhone 14 Pro Max", price: 14000, specs: "6.7-inch OLED", models: "A2651" },
  { gen: "15", variant: "ZZ", name: "iPhone 15", price: 11000, specs: "6.1-inch OLED", models: "A2846" },
  { gen: "15", variant: "PL", name: "iPhone 15 Plus", price: 12500, specs: "6.7-inch OLED", models: "A2847" },
  { gen: "15", variant: "PR", name: "iPhone 15 Pro", price: 16000, specs: "6.1-inch OLED", models: "A2848" },
  { gen: "15", variant: "PM", name: "iPhone 15 Pro Max", price: 19000, specs: "6.7-inch OLED", models: "A2849" },
  { gen: "16", variant: "ZZ", name: "iPhone 16", price: 0, specs: "6.1-inch OLED", models: "A3081" },
  { gen: "16", variant: "PL", name: "iPhone 16 Plus", price: 0, specs: "6.7-inch OLED", models: "A3082" },
  { gen: "16", variant: "PR", name: "iPhone 16 Pro", price: 0, specs: "6.3-inch OLED", models: "A3083" },
  { gen: "16", variant: "PM", name: "iPhone 16 Pro Max", price: 0, specs: "6.9-inch OLED", models: "A3084" },
];

async function seedEverything() {
  console.log("🛠️ Step 1: Building Base Taxonomy...");

  // 1. Upsert Brand
  const apple = await prisma.brand.upsert({
    where: { code: "AP" },
    update: {},
    create: { code: "AP", name: "Apple" }
  });

  // 2. Upsert Model
  const iphoneModel = await prisma.model.upsert({
    where: { brandId_code: { brandId: apple.id, code: "IP" } },
    update: {},
    create: { brandId: apple.id, code: "IP", name: "iPhone" }
  });

  // 3. Upsert Taxonomy
  const displayBucket = await prisma.bucket.upsert({
    where: { name: "Displays" },
    update: {},
    create: { name: "Displays" }
  });

  const screenType = await prisma.partType.upsert({
    where: { bucketId_code: { bucketId: displayBucket.id, code: "SC" } },
    update: {},
    create: { bucketId: displayBucket.id, code: "SC", name: "Screen" }
  });

  const oemQuality = await prisma.partQuality.upsert({
    where: { code: "OE" },
    update: {},
    create: { code: "OE", name: "OEM" }
  });

  console.log("📱 Step 2: Building Phones and Screens...");

  for (const item of screenInventory) {
    // 4. UPSERT THE PHONE (Creates it if it doesn't exist!)
    const phone = await prisma.phone.upsert({
      where: {
        modelId_generation_variantCode: {
          modelId: iphoneModel.id,
          generation: item.gen,
          variantCode: item.variant
        }
      },
      update: {
        variantName: item.name,
        externalModelId: item.models.substring(0, 20) // Ensure it fits the VarChar(20) limit
      },
      create: {
        modelId: iphoneModel.id,
        generation: item.gen,
        variantCode: item.variant,
        variantName: item.name,
        externalModelId: item.models.substring(0, 20)
      }
    });

    console.log(`✓ Phone Verified: ${item.name}`);

    // 5. UPSERT THE INVENTORY PART
    const smartSku = `SC-AP-IP${item.gen}${item.variant}-OE`;
    const searchTerms = `Apple ${item.name} Screen Display ${item.models} ${item.specs} OEM`;

    await prisma.partMaster.upsert({
      where: { sku: smartSku },
      update: {
        price: item.price, 
        searchIndex: searchTerms.toLowerCase(),
      },
      create: {
        sku: smartSku,
        searchIndex: searchTerms.toLowerCase(),
        partTypeId: screenType.id,
        qualityId: oemQuality.id,
        primaryPhoneId: phone.id,
        price: item.price, 
        stock: 50,
      }
    });

    console.log(`  └─ 📦 Added SKU: ${smartSku}`);
  }

  console.log("🎉 All Phones and Screens successfully seeded!");
}

seedEverything()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



////

schema update 


generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Brand {
  id     String  @id @default(uuid())
  code   String  @unique @db.VarChar(2)
  name   String  @db.VarChar(50)
  models Model[]
}

model Model {
  id      String  @id @default(uuid())
  code    String  @db.VarChar(4)
  name    String  @db.VarChar(50)
  brandId String
  brand   Brand   @relation(fields: [brandId], references: [id])
  phones  Phone[]

  @@unique([brandId, code])
}

model Phone {
  id              String   @id @default(uuid())
  generation      String   @db.VarChar(4)
  variantCode     String   @db.VarChar(4)
  variantName     String?  @db.VarChar(20)
  externalModelId String?  @db.VarChar(20)
  modelId         String
  model           Model    @relation(fields: [modelId], references: [id])
  primaryParts    PartMaster[] @relation("PrimaryPhoneParts")
  compatibilities PhoneCompatibility[]

  @@unique([modelId, generation, variantCode])
  @@index([modelId])
  @@index([externalModelId])
}

model Bucket {
  id        Int        @id @default(autoincrement())
  name      String     @unique @db.VarChar(20)
  partTypes PartType[]
}

model PartType {
  id       String       @id @default(uuid())
  code     String       @db.VarChar(2)
  name     String       @db.VarChar(30)
  bucketId Int
  bucket   Bucket       @relation(fields: [bucketId], references: [id])
  parts    PartMaster[]

  @@unique([bucketId, code])
  @@index([bucketId])
}

model PartQuality {
  id    String       @id @default(uuid())
  code  String       @unique @db.VarChar(2)
  name  String       @db.VarChar(20)
  parts PartMaster[]
}

model PartMaster {
  id             String   @id @default(uuid())
  sku            String   @unique @db.VarChar(20)
  searchIndex    String   @db.Text
  partTypeId     String
  qualityId      String
  primaryPhoneId String
  supplier       String?  @db.VarChar(50)
  
  // 🔄 UPDATED: Changed from Decimal to Int to store values in exact cents (e.g., $18.50 = 1850)
  cost           Int?     
  price          Int?     
  
  stock          Int      @default(0)
  createdAt      DateTime @default(now()) @db.Timestamp(6)
  updatedAt      DateTime @updatedAt @db.Timestamp(6)

  partType        PartType    @relation(fields: [partTypeId], references: [id])
  quality         PartQuality @relation(fields: [qualityId], references: [id])
  primaryPhone    Phone       @relation("PrimaryPhoneParts", fields: [primaryPhoneId], references: [id])
  compatibilities PhoneCompatibility[]
  aliases         PartAlias[]
  stockLedger     StockLedger[]

  @@index([stock])
  @@index([partTypeId, qualityId])
  @@index([createdAt])
}

model PhoneCompatibility {
  id      String     @id @default(uuid())
  partId  String
  phoneId String
  part    PartMaster @relation(fields: [partId], references: [id], onDelete: Cascade)
  phone   Phone      @relation(fields: [phoneId], references: [id], onDelete: Cascade)

  @@unique([partId, phoneId])
  @@index([phoneId])
  @@index([partId])
}

model PartAlias {
  id           String     @id @default(uuid())
  partId       String
  supplier     String     @db.VarChar(50)
  supplierSku  String     @db.VarChar(50)
  supplierName String?    @db.Text
  part         PartMaster @relation(fields: [partId], references: [id], onDelete: Cascade)

  @@unique([supplier, supplierSku], name: "supplier_supplierSku")
  @@index([supplierSku])
  @@index([partId])
}

model StockLedger {
  id          String     @id @default(uuid())
  partId      String
  change      Int        @db.Integer
  balance     Int        @db.Integer
  reason      String     @db.VarChar(50)
  reference   String?    @db.VarChar(100)
  createdAt   DateTime   @default(now()) @db.Timestamp(6)
  part        PartMaster @relation(fields: [partId], references: [id])

  @@index([partId, createdAt])
  @@index([partId]) 
}




////


uodate for cents 



model PartMaster {
  id             String   @id @default(uuid())
  sku            String   @unique @db.VarChar(20)
  searchIndex    String   @db.Text
  partTypeId     String
  qualityId      String
  primaryPhoneId String
  supplier       String?  @db.VarChar(50)
  
  // 🔄 CHANGED: Now using Int for Cents instead of Decimal
  cost           Int?     
  price          Int?     
  
  stock          Int      @default(0)
  createdAt      DateTime @default(now()) @db.Timestamp(6)
  updatedAt      DateTime @updatedAt @db.Timestamp(6)

  // ... (keep relations exactly as they were)
}


//\\\


export interface CreatePartInput {
  primaryPhoneId: string;
  partTypeId: string;
  qualityId: string;
  compatiblePhoneIds: string[];
  supplier?: string | null;
  cost?: number | null; // 🔄 Changed: Now expects cents (e.g., 1450)
  price?: number | null; // 🔄 Changed: Now expects cents (e.g., 1850)
  initialStock?: number;
}


///////

This schema is beautifully normalized. It completely ditches the chaotic nested hierarchy from the earlier project reports in favor of a clean, relational PartMaster table.
This structure makes generating your "Smart SKUs" incredibly methodical because almost every table has a specific code field (VarChar(2) or VarChar(4)).
Before we map out your 5 screens, I need to raise a **CRITICAL SYSTEM ALERT** regarding this schema versus the UI code we just wrote:
🚨 **The Decimal Pricing Conflict**
In this schema, you are using price Decimal? @db.Decimal(10, 2). This means you are storing prices like 14.50.
However, the OmniCatalogPage and ProductDetailCard components we just built are doing (part.wholesalePrice / 100) because the previous API contract demanded integer cents (e.g., 1450).
 * **The Fix:** If you keep this Decimal schema (which is perfectly fine), you just need to delete the / 100 math from the React components. They should just render the price directly.
### How to Build Your SKUs with this Schema
Your schema is designed to mathematically generate the SKU from the foreign keys. To add your 5 iPhone screens (from iPhone 8 up to the iPhone 17 Ultra), here is exactly how the data needs to cascade:
#### 1. The Foundation (Do this once)
First, you establish the taxonomy codes in the parent tables:
 * **Brand:** Name: "Apple" | Code: "AP"
 * **Model:** Name: "iPhone" | Code: "IP"
 * **Bucket:** Name: "Displays"
 * **PartType:** Name: "Screen" | Code: "SC" | Bucket: (Displays)
 * **PartQuality:** Name: "OEM" | Code: "OE"
#### 2. The Phones (The Devices)
Next, you define the specific phones using your generation and variantCode strings.
 * **iPhone 8:** Gen: "8", Variant: "ZZ" (Base)
 * **iPhone 17 Ultra:** Gen: "17", Variant: "UL" (Ultra)
#### 3. The PartMaster (Your Final SKU)
Now you combine them to create the actual inventory items you sell. Based on your VarChar lengths, your Smart SKU formula should be:
[PartType Code]-[Brand Code]-[Model Code][Gen][Variant]-[Quality]
**For the iPhone 8 Screen (OEM):**
 * **SKU:** SC-AP-IP8ZZ-OE
 * **price:** 18.50 (Decimal)
 * **stock:** 50
**For the iPhone 17 Ultra Screen (OEM):**
 * **SKU:** SC-AP-IP17UL-OE
 * **price:** 0.00 *(Remember, 0 triggers the "Contact for Price" UI!)*
 * **stock:** 10
### Why this Schema is a massive upgrade:
 1. **The PhoneCompatibility Join Table:** This is the most powerful part of this schema. If that iPhone 8 screen *also* fits the iPhone SE (2nd Gen), you don't create a second SKU. You just add a row to PhoneCompatibility linking SC-AP-IP8ZZ-OE to the iPhone SE Phone record. Your Omni-Search UI will instantly find it when a user searches "iPhone SE Screen."
 2. **StockLedger Integration:** Having a dedicated ledger table means you aren't just overwriting a stock number. Every time a buyer adds to cart and checks out, the ledger records exactly *why* the stock dropped.
 3. **No Null Ambiguity:** Enforcing variantCode = "ZZ" for base models instead of allowing NULL prevents massive database indexing headaches down the line.
### Next Step for Data Entry
Are you comfortable manually entering these first 5 screens into the database via npx prisma studio, or do you want me to write a quick seed.ts script that programmatically inserts the Apple/iPhone foundation and loops through your 5 screens to populate them instantly?


Import { Prisma } from '@prisma/client';

export interface CreatePartInput {
  primaryPhoneId: string;
  partTypeId: string;
  qualityId: string;
  compatiblePhoneIds: string[];
  supplier?: string | null;
  cost?: number | Prisma.Decimal | null;
  price?: number | Prisma.Decimal | null;
  initialStock?: number;
}



Here are the American model ID numbers (also known as the "A" model numbers) for the iPhone generations you requested.

· iPhone 8: A1863 (GSM), A1905 (Verizon)
· iPhone 8 Plus: A1864
· iPhone X: A1865 (Verizon/Sprint), A1901 (AT&T/T-Mobile)
· iPhone XS: A1920
· iPhone XS Max: A1921
· iPhone XR: A1984
· iPhone 11: A2111
· iPhone 11 Pro: A2160
· iPhone 11 Pro Max: A2161
· iPhone SE (2nd generation): A2275
· iPhone 12: A2172
· iPhone 12 mini: A2176
· iPhone 12 Pro: A2341
· iPhone 12 Pro Max: A2342
· iPhone 13: A2482
· iPhone 13 mini: A2481
· iPhone 13 Pro: A2483
· iPhone 13 Pro Max: A2484
· iPhone SE (3rd generation): A2595
· iPhone 14: A2649
· iPhone 14 Plus: A2632
· iPhone 14 Pro: A2650
· iPhone 14 Pro Max: A2651
· iPhone 15: A2846
· iPhone 15 Plus: A2847
· iPhone 15 Pro: A2848
· iPhone 15 Pro Max: A2849
· iPhone 16e: A3212
· iPhone 16: A3081
· iPhone 16 Plus: A3082
· iPhone 16 Pro: A3083
· iPhone 16 Pro Max: A3084
· iPhone 17e: A3575 (also A3260)
· iPhone 17: A3258
· iPhone 17 Air: A3260 (also A3517)
· iPhone 17 Pro: A3256

Here are the screen sizes and display types for the American models:

· iPhone 8: 4.7‑inch LCD
· iPhone 8 Plus: 5.5‑inch LCD
· iPhone X: 5.8‑inch OLED
· iPhone XS: 5.8‑inch OLED
· iPhone XS Max: 6.5‑inch OLED
· iPhone XR: 6.1‑inch LCD
· iPhone 11: 6.1‑inch LCD
· iPhone 11 Pro: 5.8‑inch OLED
· iPhone 11 Pro Max: 6.5‑inch OLED
· iPhone SE (2nd gen): 4.7‑inch LCD
· iPhone 12: 6.1‑inch OLED
· iPhone 12 mini: 5.4‑inch OLED
· iPhone 12 Pro: 6.1‑inch OLED
· iPhone 12 Pro Max: 6.7‑inch OLED
· iPhone 13: 6.1‑inch OLED
· iPhone 13 mini: 5.4‑inch OLED
· iPhone 13 Pro: 6.1‑inch OLED
· iPhone 13 Pro Max: 6.7‑inch OLED
· iPhone SE (3rd gen): 4.7‑inch LCD
· iPhone 14: 6.1‑inch OLED
· iPhone 14 Plus: 6.7‑inch OLED
· iPhone 14 Pro: 6.1‑inch OLED
· iPhone 14 Pro Max: 6.7‑inch OLED
· iPhone 15: 6.1‑inch OLED
· iPhone 15 Plus: 6.7‑inch OLED
· iPhone 15 Pro: 6.1‑inch OLED
· iPhone 15 Pro Max: 6.7‑inch OLED
· iPhone 16e: 6.1‑inch OLED
· iPhone 16: 6.1‑inch OLED
· iPhone 16 Plus: 6.7‑inch OLED
· iPhone 16 Pro: 6.3‑inch OLED
· iPhone 16 Pro Max: 6.9‑inch OLED
· iPhone 17e: 6.1‑inch OLED
· iPhone 17: 6.3‑inch OLED
· iPhone 17 Air: 6.5‑inch OLED
· iPhone 17 Pro: 6.3‑inch OLED
· iPhone 17 Pro Max: 6.9‑inch OLED

Item Product Description Resale Price (USD)
1 IP SE (2020)/8 Screen INCELL with Metal Plate Black S+ 13
2 IP 8 Plus Screen INCELL Black S+ 12
3 IP 8 Screen INCELL with Metal Plate White S+ 11
4 IP 8 Plus Screen INCELL White S+ 10
5 IP X Screen INCELL HD+ Black A+ 9
6 IP XR Screen INCELL HD+ Black A+ 8
7 IP XS Screen INCELL HD+ Black A+ 7
8 IP XS Max Screen INCELL FHD Black A+ 6
9 IP 11 Pro Screen INCELL ICR Removable HD+ Black A+ 5
10 IP 11 Pro Screen INCELL ICR Removable HD+ Black A+ 4
11 IP 11 Pro Max Screen INCELL ICR Removable FHD Black A+ 3
12 IP 12 Pro Max Screen INCELL ICR Removable FHD Black A+ 2
13 IP 12/12 Pro Screen INCELL ICR Removable FHD Black A+ 1
14 IP 13 Screen INCELL ICR Removable FHD Black A+ 21.50
15 IP 13 Pro Screen INCELL ICR Removable FHD Black A+ 24.50
16 IP 13 Pro Max Screen INCELL ICR Removable FHD Black A+ 17.85
17 IP 14 Screen INCELL ICR Removable FHD Black A+ 18
18 IP 14 Plus Screen INCELL ICR Removable FHD Black A+ 26
19 IP 14 Pro Screen INCELL ICR Removable FHD Black A+ 81
20 IP 14 Pro Max Screen INCELL ICR Removable FHD Black A+ 21.50
21 IP 15 Screen INCELL ICR Removable FHD Black A+ 22
22 IP 15 Plus Screen INCELL ICR Removable FHD Black A+ 22
23 IP 15 Pro Screen INCELL ICR Removable FHD Black A+ 34
24 IP 15 Pro Max Screen INCELL ICR Removable FHD Black A+ 23.50
25 IP 16 Screen INCELL ICR Removable FHD Black A+ 30.70
26 IP 16 Plus Screen INCELL ICR Removable FHD Black A+ 35.95
27 IP 16 Pro Screen INCELL ICR Removable FHD Black A+ 37.96
28 IP 16 Pro Max Screen INCELL ICR Removable FHD Black A+ 54
29 IP 17 Screen INCELL ICR Removable FHD Black A+ \u2014
30 IP 17 Pro Screen INCELL ICR Removable FHD Black A+ \u2014
31 IP 17 Pro Max Screen INCELL ICR Removable FHD Black A+ \u2014
 


OK i am giving you a document with a few things, you will need to ensure that we update the objectives. first. we need to make a change to how we display pricing, i guess we have been doing it with a decimal? but stripe does it with no decimal? so 2000 is 2000 cents which is 20.00 dollars...so thats how we will do it... we need to make sure to add all the iphones and their model numbers into the database, and we need to add the inventory and part descriptions (they are all screens, part descriptions and price to sell them at are in the document). I will follow up later with images, so don't worry about that but there is instruction inside for that too... make a plan, complete the objectives..and then we will move on after we finish these objectives. 


Here is the exact hit list to get the inventory live:
**1. Schema Update (Integer Cents)**
We are moving away from Decimal for pricing. Update the cost and price fields in the PartMaster model to Int. We are strictly using integer cents across the board now (e.g., $18.50 is stored as 1850) to avoid floating-point math errors and align with standard e-commerce processing.
**2. Database Sync**
Once the schema is updated, please run:
 * npx prisma db push --force-reset
 * npx prisma generate
**3. Run the Seed Script (Taxonomy, iPhones + Model Numbers, and Screens)**
Execute the seedEverything() script provided in the text file. It is built to safely upsert the data in this exact order:
 * **The base taxonomy:** (Brand: Apple, Model: iPhone, Buckets, etc.)
 * **The physical iPhone records:** It creates every specific Phone record (iPhone 8 through the 16 Pro Max) AND explicitly injects their exact American "A" model numbers (e.g., A2848, A2849) into the externalModelId field. This ensures technicians can search by the exact model number.
 * **The Screen Inventory:** Finally, it injects all 31 screen SKUs and links them to the iPhones created in the previous step.
   *(Note: A few of the newer models are intentionally priced at 0. Our UI is built to intercept 0 and render a "Contact for Price" badge.)*
**4. Product Imagery**
I attached a couple of photos of stacked screen boxes. I am going to use an AI image generator to create clean, uniform, high-end B2B marketing photos based on these stacks. You don't need to wire up specific image URLs in the database right now. Just ensure the frontend has a fallback placeholder for the screens until I generate and export the final assets.
Let me know when the seed is complete and the dev server is rendering the catalog!



