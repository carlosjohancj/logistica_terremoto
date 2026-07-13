import { getSupabase } from "@/lib/supabase";
import { HousingOfferValues } from "@/lib/schemas/housing-offer";
import { TransportOfferValues } from "@/lib/schemas/transport-offer";
import { TravelRequestValues } from "@/lib/schemas/travel-request";

async function submitAsUser(
  table: string,
  data: Record<string, unknown>
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Debes iniciar sesión para publicar");

  data.user = user.id;
  const { error } = await supabase.from(table).insert(data).select().single();
  if (error) throw error;
}

export async function submitHousingOffer(values: HousingOfferValues) {
  const data: Record<string, unknown> = {
    state: values.state,
    municipality: values.municipality,
    city: values.city,
    capacity: values.capacity,
    max_stay_days: values.max_stay_days,
    status: "open",
    accepts_children: values.accepts_children,
    accepts_adults: values.accepts_adults,
    accepts_families: values.accepts_families,
    has_furniture: values.has_furniture,
    has_kitchen: values.has_kitchen,
    has_bathroom: values.has_bathroom,
  };
  if (values.address) data.address = values.address;
  if (values.notes) data.notes = values.notes;
  await submitAsUser("housing_offers", data);
}

export async function submitTransportOffer(values: TransportOfferValues) {
  const data: Record<string, unknown> = {
    vehicle_type: values.vehicle_type,
    capacity: values.capacity,
    origin_state: values.origin_state,
    origin_municipality: values.origin_municipality,
    origin_city: values.origin_city,
    destination_state: values.destination_state,
    destination_municipality: values.destination_municipality,
    destination_city: values.destination_city,
    status: "open",
    flexible_date: values.flexible_date,
    needs_gas_donation: values.needs_gas_donation,
    accepts_passengers: values.accepts_passengers,
    accepts_cargo: values.accepts_cargo,
  };
  if (values.available_from)
    data.available_from = new Date(values.available_from).toISOString();
  if (values.available_until)
    data.available_until = new Date(values.available_until).toISOString();
  if (values.gas_donation_amount)
    data.gas_donation_amount = values.gas_donation_amount;
  if (values.notes) data.notes = values.notes;
  await submitAsUser("transport_offers", data);
}

export async function submitTravelRequest(values: TravelRequestValues) {
  const data: Record<string, unknown> = {
    origin_state: values.origin_state,
    origin_municipality: values.origin_municipality,
    origin_city: values.origin_city,
    people_to_move: values.people_to_move,
    housing_destruction: values.housing_destruction,
    registrant_type: values.registrant_type,
    status: "open",
  };
  if (values.has_destination) {
    data.has_destination = true;
    data.destination_state = values.destination_state;
    data.destination_municipality = values.destination_municipality;
    data.destination_city = values.destination_city;
  }
  if (values.people_to_house) data.people_to_house = values.people_to_house;
  if (values.children_count) data.children_count = values.children_count;
  if (values.adults_count) data.adults_count = values.adults_count;
  if (values.registrant_relation) data.registrant_relation = values.registrant_relation;
  if (values.needs_cargo_transport) data.needs_cargo_transport = true;
  if (values.cargo_description) data.cargo_description = values.cargo_description;
  if (values.notes) data.notes = values.notes;
  await submitAsUser("travel_requests", data);
}
