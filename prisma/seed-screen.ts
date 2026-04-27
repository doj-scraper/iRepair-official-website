// prisma/seed-screen.ts
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
