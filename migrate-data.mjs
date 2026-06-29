import { readFileSync, existsSync } from "fs";
import { createRequire } from "module";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pocketbase.asmvnzla.org";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@asmvnzla.com";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("ERROR: PB_ADMIN_PASSWORD environment variable is required");
  process.exit(1);
}

const headers = { "Content-Type": "application/json" };

async function main() {
  // Authenticate
  console.log("Authenticating...");
  const authResp = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers,
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!authResp.ok) throw new Error(`Auth failed: ${await authResp.text()}`);
  const { token } = await authResp.json();
  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };
  console.log("  ✓ Authenticated\n");

  // Helper: get collection ID by name
  async function getCollectionId(name) {
    const resp = await fetch(`${PB_URL}/api/collections/${name}`, { headers: authHeaders });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.id;
  }

  // Helper: create record
  async function createRecord(collectionId, data) {
    const resp = await fetch(`${PB_URL}/api/collections/${collectionId}/records`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error(`  ✗ failed to create record: ${err}`);
      return null;
    }
    return await resp.json();
  }

  // 1. Seed estados from venezuela.json + coords.json
  const estadosId = await getCollectionId("estados");
  if (!estadosId) {
    console.error("  ✗ estados collection not found. Run setup-pb.mjs first.");
    process.exit(1);
  }

  console.log("Seeding estados...");
  const venezuelaPath = new URL("./data/venezuela.json", import.meta.url).pathname;
  const coordsPath = new URL("./data/coords.json", import.meta.url).pathname;

  if (!existsSync(venezuelaPath)) {
    console.error("  ✗ data/venezuela.json not found");
    process.exit(1);
  }

  const estadosData = JSON.parse(readFileSync(venezuelaPath, "utf-8"));
  const coordsData = existsSync(coordsPath) ? JSON.parse(readFileSync(coordsPath, "utf-8")) : {};

  for (const estado of estadosData) {
    const coord = coordsData[estado.estado] || [0, 0];
    await createRecord(estadosId, {
      name: estado.estado,
      capital: estado.capital,
      municipios: estado.municipios,
      lat: coord[0],
      lng: coord[1],
    });
    console.log(`  ✓ ${estado.estado}`);
  }
  console.log(`  → ${estadosData.length} estados seeded\n`);

  // 2. Seed donation_settings
  const donationSettingsId = await getCollectionId("donation_settings");
  if (!donationSettingsId) {
    console.error("  ✗ donation_settings collection not found. Run setup-pb.mjs first.");
    process.exit(1);
  }

  console.log("Seeding donation settings...");
  const donationSettings = [
    {
      method: "bank",
      label: "Transferencia Bancaria",
      details: {
        bank: "Banco de Venezuela",
        account: "0102-XXXX-XXXX-XXXX",
        holder: "Fundación Desde Cero",
        rif: "J-XXXXXXXX-X",
      },
      sort_order: 1,
    },
    {
      method: "paypal",
      label: "PayPal",
      details: { email: "donaciones@desdecero.org" },
      sort_order: 2,
    },
    {
      method: "zelle",
      label: "Zelle",
      details: { email: "donaciones@desdecero.org", holder: "Fundación Desde Cero" },
      sort_order: 3,
    },
  ];

  for (const setting of donationSettings) {
    await createRecord(donationSettingsId, setting);
    console.log(`  ✓ ${setting.method} (${setting.label})`);
  }
  console.log(`  → ${donationSettings.length} settings created\n`);

  console.log("✓ Migration complete!");
}

main().catch(console.error);
