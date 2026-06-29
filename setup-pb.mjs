const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pocketbase.asmvnzla.org";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@asmvnzla.com";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("ERROR: PB_ADMIN_PASSWORD environment variable is required");
  console.error("Usage: PB_ADMIN_PASSWORD=yourpassword node setup-pb.mjs");
  process.exit(1);
}

async function main() {
  console.log("Authenticating...");
  const authResp = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!authResp.ok) {
    const err = await authResp.text();
    throw new Error(`Auth failed: ${err}`);
  }
  const { token } = await authResp.json();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  console.log("  ✓ Authenticated\n");

  // Helper to create or update a collection
  async function upsertCollection(name, type, schema, rules = {}) {
    // Check if collection already exists
    const existing = await fetch(`${PB_URL}/api/collections/${name}`, { headers });
    const collectionData = {
      name,
      type,
      schema,
      indexes: [],
      system: false,
      listRule: rules.listRule ?? "@request.auth.id != \"\"",
      viewRule: rules.viewRule ?? "@request.auth.id != \"\"",
      createRule: rules.createRule ?? "@request.auth.id != \"\"",
      updateRule: rules.updateRule ?? "user = @request.auth.id || @request.auth.role = \"admin\"",
      deleteRule: rules.deleteRule ?? "user = @request.auth.id || @request.auth.role = \"admin\"",
    };

    if (existing.ok) {
      const existingData = await existing.json();
      const resp = await fetch(`${PB_URL}/api/collections/${existingData.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(collectionData),
      });
      const data = await resp.json();
      console.log(`  ✓ ${name} updated (${data.id})`);
      return data;
    } else {
      // Create first without rules (to avoid validation errors on non-existent fields)
      const { updateRule, deleteRule, ...createData } = collectionData;
      const resp = await fetch(`${PB_URL}/api/collections`, {
        method: "POST",
        headers,
        body: JSON.stringify(createData),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error(`  ✗ ${name}: ${text}`);
        return null;
      }
      const data = await resp.json();
      console.log(`  ✓ ${name} created (${data.id})`);
      // Now set the rules
      if (updateRule || deleteRule) {
        const rulePatch = {};
        if (updateRule) rulePatch.updateRule = updateRule;
        if (deleteRule) rulePatch.deleteRule = deleteRule;
        await fetch(`${PB_URL}/api/collections/${data.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(rulePatch),
        });
        console.log(`     rules set`);
      }
      return data;
    }
  }

  // Get users collection ID
  const usersResp = await fetch(`${PB_URL}/api/collections/users`, { headers });
  const usersCol = await usersResp.json();
  const USERS_ID = usersCol.id;
  console.log(`  Users collection ID: ${USERS_ID}`);

  // Extend users with custom fields via PATCH
  console.log("\nExtending users collection...");
  const existingFieldNames = (usersCol.fields || usersCol.schema || []).map(f => f.name);
  const extraUserFields = [
    { name: "phone", type: "text", required: false, options: {} },
    { name: "whatsapp", type: "text", required: false, options: {} },
    { name: "role", type: "select", required: true, options: { maxSelect: 1, values: ["damnificado", "transportista", "anfitrion", "donante", "admin"] } },
    { name: "languages", type: "json", required: false, options: {} },
    { name: "verified", type: "bool", required: false, options: {} },
  ].filter(f => !existingFieldNames.includes(f.name));

  if (extraUserFields.length > 0) {
    const newSchema = [...(usersCol.fields || usersCol.schema || []), ...extraUserFields];
    const upResp = await fetch(`${PB_URL}/api/collections/${USERS_ID}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields: newSchema }),
    });
    if (upResp.ok) console.log("  ✓ users extended");
    else {
      const err = await upResp.text();
      console.error("  ✗ users extension via PATCH failed:", err);
      console.log("  → Creating separate 'profiles' collection as fallback");
      await upsertCollection("profiles", "base", [
        { name: "user", type: "relation", required: true, options: { collectionId: USERS_ID, maxSelect: 1 } },
        { name: "phone", type: "text", required: false, options: {} },
        { name: "whatsapp", type: "text", required: false, options: {} },
        { name: "role", type: "select", required: true, options: { maxSelect: 1, values: ["damnificado", "transportista", "anfitrion", "donante", "admin"] } },
        { name: "languages", type: "json", required: false, options: {} },
        { name: "verified", type: "bool", required: false, options: {} },
      ], {
        createRule: "@request.auth.id != \"\"",
        updateRule: "user = @request.auth.id || @request.auth.role = \"admin\"",
        deleteRule: "user = @request.auth.id || @request.auth.role = \"admin\"",
      });
    }
  } else {
    console.log("  - users already extended");
  }

  // Create base collections
  console.log("\nCreating base collections...");
  const reqCommon = { listRule: "@request.auth.id != \"\"", viewRule: "@request.auth.id != \"\"", createRule: "@request.auth.id != \"\"" };

  await upsertCollection("travel_requests", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "has_destination", type: "bool", required: false, options: {} },
    { name: "origin_state", type: "text", required: true, options: {} },
    { name: "origin_municipality", type: "text", required: true, options: {} },
    { name: "origin_city", type: "text", required: true, options: {} },
    { name: "destination_state", type: "text", required: false, options: {} },
    { name: "destination_municipality", type: "text", required: false, options: {} },
    { name: "destination_city", type: "text", required: false, options: {} },
    { name: "people_to_move", type: "number", required: true, options: { min: 1 } },
    { name: "people_to_house", type: "number", required: false, options: { min: 0 } },
    { name: "children_count", type: "number", required: false, options: { min: 0 } },
    { name: "adults_count", type: "number", required: false, options: { min: 0 } },
    { name: "housing_destruction", type: "select", required: true, options: { maxSelect: 1, values: ["total", "grave", "se_puede_reparar", "prestada_emergencia"] } },
    { name: "members", type: "json", required: false, options: {} },
    { name: "registrant_type", type: "select", required: true, options: { maxSelect: 1, values: ["damnificado", "colaborador"] } },
    { name: "registrant_relation", type: "text", required: false, options: {} },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["open", "matched_transport", "matched_housing", "completed", "cancelled"] } },
    { name: "notes", type: "editor", required: false, options: {} },
  ], reqCommon);

  await upsertCollection("transport_offers", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "vehicle_type", type: "select", required: true, options: { maxSelect: 1, values: ["moto", "carro", "camioneta", "camion"] } },
    { name: "capacity", type: "number", required: true, options: { min: 1 } },
    { name: "origin_state", type: "text", required: true, options: {} },
    { name: "origin_municipality", type: "text", required: true, options: {} },
    { name: "origin_city", type: "text", required: true, options: {} },
    { name: "destination_state", type: "text", required: true, options: {} },
    { name: "destination_municipality", type: "text", required: true, options: {} },
    { name: "destination_city", type: "text", required: true, options: {} },
    { name: "available_from", type: "date", required: false, options: {} },
    { name: "available_until", type: "date", required: false, options: {} },
    { name: "flexible_date", type: "bool", required: false, options: {} },
    { name: "needs_gas_donation", type: "bool", required: false, options: {} },
    { name: "gas_donation_amount", type: "number", required: false, options: {} },
    { name: "accepts_passengers", type: "bool", required: false, options: {} },
    { name: "accepts_cargo", type: "bool", required: false, options: {} },
    { name: "notes", type: "editor", required: false, options: {} },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["open", "matched", "in_transit", "completed", "cancelled"] } },
  ], reqCommon);

  await upsertCollection("housing_offers", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "state", type: "text", required: true, options: {} },
    { name: "municipality", type: "text", required: true, options: {} },
    { name: "city", type: "text", required: true, options: {} },
    { name: "address", type: "text", required: false, options: {} },
    { name: "capacity", type: "number", required: true, options: { min: 1 } },
    { name: "max_stay_days", type: "number", required: true, options: { min: 1 } },
    { name: "accepts_children", type: "bool", required: false, options: {} },
    { name: "accepts_adults", type: "bool", required: false, options: {} },
    { name: "accepts_families", type: "bool", required: false, options: {} },
    { name: "has_furniture", type: "bool", required: false, options: {} },
    { name: "has_kitchen", type: "bool", required: false, options: {} },
    { name: "has_bathroom", type: "bool", required: false, options: {} },
    { name: "notes", type: "editor", required: false, options: {} },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["open", "occupied", "full", "cancelled"] } },
  ], reqCommon);

  await upsertCollection("donations", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "donor_name", type: "text", required: false, options: {} },
    { name: "donor_contact", type: "text", required: false, options: {} },
    { name: "amount", type: "number", required: true, options: { min: 0 } },
    { name: "currency", type: "select", required: true, options: { maxSelect: 1, values: ["USD", "VES", "EUR"] } },
    { name: "payment_method", type: "select", required: true, options: { maxSelect: 1, values: ["bank_transfer", "paypal", "zelle", "pago_movil", "other"] } },
    { name: "target_type", type: "select", required: true, options: { maxSelect: 1, values: ["general", "transportista", "familia", "gasolina", "hospedaje"] } },
    { name: "message", type: "editor", required: false, options: {} },
    { name: "confirmed", type: "bool", required: false, options: {} },
  ], reqCommon);

  // Get all collections to resolve IDs for relations
  console.log("\nFetching collection IDs...");
  const allColsResp = await fetch(`${PB_URL}/api/collections?skipTotal=1`, { headers });
  const allColsData = await allColsResp.json();
  const allCols = allColsData.items || allColsData || [];
  const travelReqId = allCols.find(c => c.name === "travel_requests")?.id;
  const transportOfferId = allCols.find(c => c.name === "transport_offers")?.id;
  const housingOfferId = allCols.find(c => c.name === "housing_offers")?.id;

  await upsertCollection("matches", "base", [
    { name: "travel_request", type: "relation", required: true, options: { collectionId: travelReqId || USERS_ID, maxSelect: 1 } },
    { name: "transport_offer", type: "relation", required: false, options: { collectionId: transportOfferId || USERS_ID, maxSelect: 1 } },
    { name: "housing_offer", type: "relation", required: false, options: { collectionId: housingOfferId || USERS_ID, maxSelect: 1 } },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["pending", "confirmed", "in_progress", "completed", "cancelled"] } },
    { name: "notes", type: "editor", required: false, options: {} },
  ], reqCommon);

  // Fix matches relations to correct collectionIds
  const matchesCol = allCols.find(c => c.name === "matches");
  if (matchesCol && travelReqId && transportOfferId && housingOfferId) {
    const existingFields = matchesCol.fields || matchesCol.schema || [];
    const updatedSchema = existingFields.map(f => {
      if (f.name === "travel_request") f.options.collectionId = travelReqId;
      if (f.name === "transport_offer") f.options.collectionId = transportOfferId;
      if (f.name === "housing_offer") f.options.collectionId = housingOfferId;
      return f;
    });
    const upResp = await fetch(`${PB_URL}/api/collections/${matchesCol.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields: updatedSchema }),
    });
    if (upResp.ok) console.log("  ✓ matches relations fixed");
    else console.error("  ✗ matches relations fix failed:", await upResp.text());
  }

  const matchesId = allCols.find(c => c.name === "matches")?.id || matchesCol?.id;
  await upsertCollection("reviews", "base", [
    { name: "match", type: "relation", required: true, options: { collectionId: matchesId || USERS_ID, maxSelect: 1 } },
    { name: "from_user", type: "relation", required: true, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "to_user", type: "relation", required: true, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "rating", type: "number", required: true, options: { min: 1, max: 5 } },
    { name: "comment", type: "editor", required: false, options: {} },
    { name: "category", type: "select", required: true, options: { maxSelect: 1, values: ["transporte", "hospedaje", "colaboracion"] } },
  ], reqCommon);

  // Companies & Jobs collections (public create via API route proxy)
  console.log("\nCreating companies & jobs collections...");
  const companyReqCommon = { listRule: "@request.auth.id != \"\"", viewRule: "@request.auth.id != \"\"", createRule: "@request.auth.id != \"\"" };

  await upsertCollection("companies", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "name", type: "text", required: true, options: {} },
    { name: "rif", type: "text", required: false, options: {} },
    { name: "sector", type: "select", required: false, options: { maxSelect: 1, values: ["tecnologia", "salud", "educacion", "construccion", "comercio", "transporte", "alimentacion", "servicios", "otro"] } },
    { name: "state", type: "text", required: false, options: {} },
    { name: "municipality", type: "text", required: false, options: {} },
    { name: "city", type: "text", required: false, options: {} },
    { name: "address", type: "text", required: false, options: {} },
    { name: "description", type: "editor", required: false, options: {} },
    { name: "contact_name", type: "text", required: true, options: {} },
    { name: "contact_phone", type: "text", required: false, options: {} },
    { name: "contact_email", type: "email", required: true, options: {} },
    { name: "website", type: "url", required: false, options: {} },
    { name: "verified", type: "bool", required: false, options: {} },
  ], companyReqCommon);

  await upsertCollection("jobs", "base", [
    { name: "company", type: "relation", required: true, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "title", type: "text", required: true, options: {} },
    { name: "description", type: "editor", required: false, options: {} },
    { name: "requirements", type: "editor", required: false, options: {} },
    { name: "location_state", type: "text", required: true, options: {} },
    { name: "location_city", type: "text", required: false, options: {} },
    { name: "modality", type: "select", required: true, options: { maxSelect: 1, values: ["presencial", "remoto", "hibrido"] } },
    { name: "salary_range", type: "text", required: false, options: {} },
    { name: "contact_email", type: "email", required: true, options: {} },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["open", "closed", "filled"] } },
  ], companyReqCommon);

  // Supplies collection (physical donations & requests)
  console.log("\nCreating supplies & graphics collections...");
  const supplyReqCommon = { listRule: "@request.auth.id != \"\"", viewRule: "@request.auth.id != \"\"", createRule: "@request.auth.id != \"\"" };

  await upsertCollection("supplies", "base", [
    { name: "user", type: "relation", required: false, options: { collectionId: USERS_ID, maxSelect: 1 } },
    { name: "type", type: "select", required: true, options: { maxSelect: 1, values: ["offer", "request"] } },
    { name: "category", type: "select", required: true, options: { maxSelect: 1, values: ["camas", "comida", "ropa", "medicinas", "agua", "higiene", "electronico", "materiales", "muebles", "otros"] } },
    { name: "title", type: "text", required: true, options: {} },
    { name: "description", type: "editor", required: false, options: {} },
    { name: "quantity", type: "number", required: false, options: { min: 0 } },
    { name: "condition", type: "select", required: false, options: { maxSelect: 1, values: ["nuevo", "usado_bueno", "usado_regular", "no_aplica"] } },
    { name: "state", type: "text", required: true, options: {} },
    { name: "municipality", type: "text", required: false, options: {} },
    { name: "city", type: "text", required: false, options: {} },
    { name: "address", type: "text", required: false, options: {} },
    { name: "contact_name", type: "text", required: true, options: {} },
    { name: "contact_phone", type: "text", required: false, options: {} },
    { name: "needs_transport", type: "bool", required: false, options: {} },
    { name: "photos", type: "file", required: false, options: { maxSelect: 5, maxSize: 10485760 } },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["open", "matched", "completed", "cancelled"] } },
  ], supplyReqCommon);

  // Graphics collection (downloadable resources)
  await upsertCollection("graphics", "base", [
    { name: "title", type: "text", required: true, options: {} },
    { name: "description", type: "editor", required: false, options: {} },
    { name: "category", type: "select", required: true, options: { maxSelect: 1, values: ["flyer", "infografia", "banner", "logo", "manual", "otro"] } },
    { name: "file", type: "file", required: true, options: { maxSelect: 1, maxSize: 52428800 } },
    { name: "thumbnail", type: "file", required: false, options: { maxSelect: 1, maxSize: 5242880 } },
    { name: "tags", type: "text", required: false, options: {} },
    { name: "downloads", type: "number", required: false, options: { min: 0 } },
    { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["published", "draft"] } },
  ], supplyReqCommon);

  // Estados collection (Venezuelan states, municipalities, coords)
  console.log("\nCreating estados & donation_settings collections...");
  await upsertCollection("estados", "base", [
    { name: "name", type: "text", required: true, options: {} },
    { name: "capital", type: "text", required: false, options: {} },
    { name: "municipios", type: "json", required: false, options: {} },
    { name: "lat", type: "number", required: false, options: { min: -90, max: 90 } },
    { name: "lng", type: "number", required: false, options: { min: -180, max: 180 } },
  ], { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" });

  // Donation settings collection
  await upsertCollection("donation_settings", "base", [
    { name: "method", type: "select", required: true, options: { maxSelect: 1, values: ["bank", "paypal", "zelle"] } },
    { name: "label", type: "text", required: true, options: {} },
    { name: "details", type: "json", required: true, options: {} },
    { name: "sort_order", type: "number", required: false, options: { min: 0 } },
  ], { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" });

  console.log("\n✓ All collections ready!");
}

main().catch(console.error);
