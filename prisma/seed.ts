import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateSku } from './skuGenerator.ts';

const connectionString = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DATABASE_URL_DIRECT is required');
}

process.env.DATABASE_URL = connectionString;
const prisma = new PrismaClient();

const phoneData = [
  { modelCode: 'IP', generation: '8', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '9', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '10', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '11', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '12', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '13', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '14', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '14', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'IP', generation: '14', variantCode: 'PR', variantName: 'Pro' },
  { modelCode: 'IP', generation: '14', variantCode: 'PM', variantName: 'Pro Max' },
  { modelCode: 'IP', generation: '15', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '15', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'IP', generation: '15', variantCode: 'PR', variantName: 'Pro' },
  { modelCode: 'IP', generation: '15', variantCode: 'PM', variantName: 'Pro Max' },
  { modelCode: 'IP', generation: '16', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '16', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'IP', generation: '16', variantCode: 'PR', variantName: 'Pro' },
  { modelCode: 'IP', generation: '16', variantCode: 'PM', variantName: 'Pro Max' },
  { modelCode: 'IP', generation: '17', variantCode: 'ZZ', variantName: null },
  { modelCode: 'IP', generation: '17', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'IP', generation: '17', variantCode: 'PR', variantName: 'Pro' },
  { modelCode: 'IP', generation: '17', variantCode: 'PM', variantName: 'Pro Max' },
  { modelCode: 'GS', generation: '23', variantCode: 'ZZ', variantName: null },
  { modelCode: 'GS', generation: '23', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'GS', generation: '23', variantCode: 'UL', variantName: 'Ultra' },
  { modelCode: 'GS', generation: '23', variantCode: 'FE', variantName: 'FE' },
  { modelCode: 'GS', generation: '24', variantCode: 'ZZ', variantName: null },
  { modelCode: 'GS', generation: '24', variantCode: 'PL', variantName: 'Plus' },
  { modelCode: 'GS', generation: '24', variantCode: 'UL', variantName: 'Ultra' },
  { modelCode: 'GS', generation: '24', variantCode: 'FE', variantName: 'FE' },
  { modelCode: 'GA', generation: '54', variantCode: 'ZZ', variantName: null },
  { modelCode: 'GA', generation: '55', variantCode: 'ZZ', variantName: null },
] as const;

const partTypeData = [
  { bucketName: 'Visual Interface', code: 'A', name: 'Screen' },
  { bucketName: 'Visual Interface', code: 'B', name: 'Display' },
  { bucketName: 'Visual Interface', code: 'C', name: 'Digitizer' },
  { bucketName: 'Chassis & Enclosure', code: 'A', name: 'Back Glass' },
  { bucketName: 'Chassis & Enclosure', code: 'B', name: 'Frame' },
  { bucketName: 'Chassis & Enclosure', code: 'C', name: 'Housing' },
  { bucketName: 'Functional Modules', code: 'A', name: 'Battery' },
  { bucketName: 'Functional Modules', code: 'B', name: 'Camera' },
  { bucketName: 'Interconnects', code: 'A', name: 'Charge Port' },
  { bucketName: 'Interconnects', code: 'B', name: 'Flex Cable' },
] as const;

const partQualities = [
  { code: 'OR', name: 'Original' },
  { code: 'RF', name: 'Refurbished' },
  { code: 'OE', name: 'OEM' },
] as const;

const partsToCreate = [
  {
    brandCode: 'AI',
    modelCode: 'IP',
    generation: '15',
    variantCode: 'PR',
    partTypeKey: 'Visual Interface:A',
    qualityCode: 'OR',
    primaryPhoneKey: 'IP-15-PR',
    compatibleKeys: ['IP-15-PR'],
    supplier: 'MobileStar',
    cost: 8500,
    price: 14999,
    initialStock: 25,
  },
  {
    brandCode: 'AI',
    modelCode: 'IP',
    generation: '15',
    variantCode: 'PR',
    partTypeKey: 'Visual Interface:A',
    qualityCode: 'RF',
    primaryPhoneKey: 'IP-15-PR',
    compatibleKeys: ['IP-15-PR'],
    supplier: 'MobileStar',
    cost: 4500,
    price: 8999,
    initialStock: 40,
  },
  {
    brandCode: 'AI',
    modelCode: 'IP',
    generation: '15',
    variantCode: 'PM',
    partTypeKey: 'Chassis & Enclosure:A',
    qualityCode: 'OE',
    primaryPhoneKey: 'IP-15-PM',
    compatibleKeys: ['IP-15-PM'],
    supplier: 'PartsDirect',
    cost: 2200,
    price: 4499,
    initialStock: 60,
  },
  {
    brandCode: 'AI',
    modelCode: 'IP',
    generation: '14',
    variantCode: 'ZZ',
    partTypeKey: 'Functional Modules:A',
    qualityCode: 'OR',
    primaryPhoneKey: 'IP-14-ZZ',
    compatibleKeys: ['IP-14-ZZ', 'IP-14-PL'],
    supplier: 'CellParts Inc',
    cost: 1800,
    price: 3499,
    initialStock: 100,
  },
  {
    brandCode: 'AI',
    modelCode: 'IP',
    generation: '16',
    variantCode: 'ZZ',
    partTypeKey: 'Interconnects:A',
    qualityCode: 'RF',
    primaryPhoneKey: 'IP-16-ZZ',
    compatibleKeys: ['IP-16-ZZ', 'IP-16-PL'],
    supplier: null,
    cost: 800,
    price: 1999,
    initialStock: 75,
  },
  {
    brandCode: 'SA',
    modelCode: 'GS',
    generation: '24',
    variantCode: 'UL',
    partTypeKey: 'Visual Interface:A',
    qualityCode: 'OR',
    primaryPhoneKey: 'GS-24-UL',
    compatibleKeys: ['GS-24-UL'],
    supplier: 'MobileStar',
    cost: 11000,
    price: 19999,
    initialStock: 15,
  },
  {
    brandCode: 'SA',
    modelCode: 'GS',
    generation: '24',
    variantCode: 'UL',
    partTypeKey: 'Visual Interface:A',
    qualityCode: 'RF',
    primaryPhoneKey: 'GS-24-UL',
    compatibleKeys: ['GS-24-UL'],
    supplier: 'MobileStar',
    cost: 5500,
    price: 10999,
    initialStock: 30,
  },
  {
    brandCode: 'SA',
    modelCode: 'GS',
    generation: '23',
    variantCode: 'ZZ',
    partTypeKey: 'Chassis & Enclosure:C',
    qualityCode: 'OE',
    primaryPhoneKey: 'GS-23-ZZ',
    compatibleKeys: ['GS-23-ZZ', 'GS-23-FE'],
    supplier: 'PartsDirect',
    cost: 3000,
    price: 5999,
    initialStock: 20,
  },
  {
    brandCode: 'SA',
    modelCode: 'GS',
    generation: '24',
    variantCode: 'ZZ',
    partTypeKey: 'Chassis & Enclosure:B',
    qualityCode: 'OR',
    primaryPhoneKey: 'GS-24-ZZ',
    compatibleKeys: ['GS-24-ZZ', 'GS-24-PL'],
    supplier: 'CellParts Inc',
    cost: 2500,
    price: 4999,
    initialStock: 35,
  },
  {
    brandCode: 'SA',
    modelCode: 'GA',
    generation: '54',
    variantCode: 'ZZ',
    partTypeKey: 'Functional Modules:B',
    qualityCode: 'RF',
    primaryPhoneKey: 'GA-54-ZZ',
    compatibleKeys: ['GA-54-ZZ'],
    supplier: null,
    cost: 1500,
    price: 2999,
    initialStock: 50,
  },
  {
    brandCode: 'SA',
    modelCode: 'GA',
    generation: '55',
    variantCode: 'ZZ',
    partTypeKey: 'Interconnects:B',
    qualityCode: 'OE',
    primaryPhoneKey: 'GA-55-ZZ',
    compatibleKeys: ['GA-55-ZZ'],
    supplier: 'CellParts Inc',
    cost: 500,
    price: 1299,
    initialStock: 0,
  },
] as const;

const brandLookup = new Map<string, { code: string; name: string }>([
  ['AI', { code: 'AI', name: 'Apple' }],
  ['SA', { code: 'SA', name: 'Samsung' }],
]);

const modelLookup = new Map<string, { code: string; name: string }>([
  ['AI-IP', { code: 'IP', name: 'iPhone' }],
  ['SA-GS', { code: 'GS', name: 'Galaxy S' }],
  ['SA-GA', { code: 'GA', name: 'Galaxy A' }],
]);

const partTypeLookup = new Map(partTypeData.map((row) => [`${row.bucketName}:${row.code}`, row]));

const phoneLookup = new Map<string, string>();
const partTypeIds = new Map<string, string>();
const qualityIds = new Map<string, string>();
const bucketIds = new Map<string, number>();

async function upsertBrandsAndModels() {
  for (const [brandCode, brand] of brandLookup) {
    const createdBrand = await prisma.brand.upsert({
      where: { code: brand.code },
      update: { name: brand.name },
      create: { code: brand.code, name: brand.name },
    });

    for (const [modelKey, model] of modelLookup) {
      if (!modelKey.startsWith(`${brandCode}-`)) continue;
      await prisma.model.upsert({
        where: {
          brandId_code: {
            brandId: createdBrand.id,
            code: model.code,
          },
        },
        update: { name: model.name },
        create: { brandId: createdBrand.id, code: model.code, name: model.name },
      });
    }
  }
}

async function upsertPhones() {
  const iphone = await prisma.model.findFirst({
    where: { code: 'IP' },
    select: { id: true },
  });
  const galaxyS = await prisma.model.findFirst({
    where: { code: 'GS' },
    select: { id: true },
  });
  const galaxyA = await prisma.model.findFirst({
    where: { code: 'GA' },
    select: { id: true },
  });

  if (!iphone || !galaxyS || !galaxyA) {
    throw new Error('Expected base models to exist before seeding phones');
  }

  const modelByCode = new Map<string, string>([
    ['IP', iphone.id],
    ['GS', galaxyS.id],
    ['GA', galaxyA.id],
  ]);

  for (const phone of phoneData) {
    const modelId = modelByCode.get(phone.modelCode);
    if (!modelId) throw new Error(`Missing model for ${phone.modelCode}`);

    const created = await prisma.phone.upsert({
      where: {
        modelId_generation_variantCode: {
          modelId,
          generation: phone.generation,
          variantCode: phone.variantCode,
        },
      },
      update: {
        variantName: phone.variantName,
        externalModelId: null,
      },
      create: {
        modelId,
        generation: phone.generation,
        variantCode: phone.variantCode,
        variantName: phone.variantName,
        externalModelId: null,
      },
    });

    phoneLookup.set(`${phone.modelCode}-${phone.generation}-${phone.variantCode}`, created.id);
  }
}

async function upsertBucketsPartTypesAndQualities() {
  const bucketNames = [...new Set(partTypeData.map((row) => row.bucketName))];

  for (const bucketName of bucketNames) {
    const bucket = await prisma.bucket.upsert({
      where: { name: bucketName },
      update: {},
      create: { name: bucketName },
    });
    bucketIds.set(bucketName, bucket.id);
  }

  for (const row of partTypeData) {
    const bucketId = bucketIds.get(row.bucketName);
    if (!bucketId) throw new Error(`Missing bucket: ${row.bucketName}`);

    const created = await prisma.partType.upsert({
      where: {
        bucketId_code: {
          bucketId,
          code: row.code,
        },
      },
      update: { name: row.name },
      create: { bucketId, code: row.code, name: row.name },
    });
    partTypeIds.set(`${row.bucketName}:${row.code}`, created.id);
  }

  for (const quality of partQualities) {
    const created = await prisma.partQuality.upsert({
      where: { code: quality.code },
      update: { name: quality.name },
      create: { code: quality.code, name: quality.name },
    });
    qualityIds.set(quality.code, created.id);
  }
}

async function upsertParts() {
  const partTypeAlias: Record<string, string> = {
    'Visual Interface:A': 'screen',
    'Visual Interface:B': 'display',
    'Visual Interface:C': 'digitizer',
    'Chassis & Enclosure:A': 'back glass',
    'Chassis & Enclosure:B': 'frame',
    'Chassis & Enclosure:C': 'housing',
    'Functional Modules:A': 'battery',
    'Functional Modules:B': 'camera',
    'Interconnects:A': 'charge port',
    'Interconnects:B': 'flex cable',
  };

  for (const item of partsToCreate) {
    const partType = partTypeLookup.get(item.partTypeKey);
    const partTypeId = partTypeIds.get(item.partTypeKey);
    const qualityId = qualityIds.get(item.qualityCode);
    const primaryPhoneId = phoneLookup.get(item.primaryPhoneKey);

    if (!partType || !partTypeId || !qualityId || !primaryPhoneId) {
      throw new Error(`Missing seed dependency for ${item.brandCode}-${item.modelCode}-${item.generation}-${item.variantCode}`);
    }

    const bucketId = bucketIds.get(partType.bucketName);
    if (!bucketId) {
      throw new Error(`Missing bucket id for ${partType.bucketName}`);
    }

    const skuData = generateSku({
      brandCode: item.brandCode,
      modelCode: item.modelCode,
      generation: item.generation,
      variantCode: item.variantCode,
      bucketId,
      partTypeCode: partType.code,
      qualityCode: item.qualityCode,
    });

    const model = item.brandCode === 'AI'
      ? { brandName: 'apple', modelName: 'iphone' }
      : item.modelCode === 'GS'
        ? { brandName: 'samsung', modelName: 'galaxy s' }
        : { brandName: 'samsung', modelName: 'galaxy a' };

    const variantName = phoneData.find(
      (phone) =>
        phone.modelCode === item.modelCode &&
        phone.generation === item.generation &&
        phone.variantCode === item.variantCode
    )?.variantName;

    const searchTerms = [
      model.brandName,
      model.modelName,
      `s${item.generation}`,
      item.variantCode !== 'ZZ' ? item.variantCode.toLowerCase() : null,
      variantName?.toLowerCase(),
      partTypeAlias[item.partTypeKey],
      partQualities.find((quality) => quality.code === item.qualityCode)?.name.toLowerCase(),
      skuData.sku.toLowerCase(),
    ].filter(Boolean) as string[];

    const searchIndex = [...new Set(searchTerms)].join(' ');

    const part = await prisma.partMaster.upsert({
      where: { sku: skuData.sku },
      update: {
        searchIndex,
        partTypeId,
        qualityId,
        primaryPhoneId,
        supplier: item.supplier,
        cost: item.cost,
        price: item.price,
        stock: item.initialStock,
      },
      create: {
        sku: skuData.sku,
        searchIndex,
        partTypeId,
        qualityId,
        primaryPhoneId,
        supplier: item.supplier,
        cost: item.cost,
        price: item.price,
        stock: item.initialStock,
      },
    });

    for (const phoneKey of new Set(item.compatibleKeys)) {
      const phoneId = phoneLookup.get(phoneKey);
      if (!phoneId) continue;

      await prisma.phoneCompatibility.upsert({
        where: {
          partId_phoneId: {
            partId: part.id,
            phoneId,
          },
        },
        update: {},
        create: {
          partId: part.id,
          phoneId,
        },
      });
    }

    if (item.supplier) {
      await prisma.partAlias.upsert({
        where: {
          supplier_supplierSku: {
            supplier: item.supplier,
            supplierSku: `${item.brandCode}-${item.modelCode}-${item.generation}-${item.variantCode}-${item.qualityCode}`,
          },
        },
        update: {
          partId: part.id,
          supplierName: `${model.brandName} ${model.modelName} ${item.generation} ${item.variantCode}`.trim(),
        },
        create: {
          partId: part.id,
          supplier: item.supplier,
          supplierSku: `${item.brandCode}-${item.modelCode}-${item.generation}-${item.variantCode}-${item.qualityCode}`,
          supplierName: `${model.brandName} ${model.modelName} ${item.generation} ${item.variantCode}`.trim(),
        },
      });
    }

    const existingLedger = await prisma.stockLedger.findFirst({
      where: {
        partId: part.id,
        reference: 'seed',
        reason: 'INITIAL_STOCK',
      },
      select: { id: true },
    });

    if (!existingLedger && item.initialStock > 0) {
      await prisma.stockLedger.create({
        data: {
          partId: part.id,
          change: item.initialStock,
          balance: item.initialStock,
          reason: 'INITIAL_STOCK',
          reference: 'seed',
        },
      });
    }
  }
}

async function main() {
  console.log('🌱 Seeding database with upserts...');
  await upsertBrandsAndModels();
  await upsertPhones();
  await upsertBucketsPartTypesAndQualities();
  await upsertParts();
  console.log('✅ Seed upsert complete');
}

main()
  .catch((error) => {
    console.error('❌ Seed execution failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
