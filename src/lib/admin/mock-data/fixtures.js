export const FIRST_NAMES = [
  "Amara", "Chidinma", "Ngozi", "Folake", "Adaeze", "Zainab", "Kemi", "Yewande",
  "Chiamaka", "Bisola", "Temitope", "Aisha", "Funmilayo", "Ifeoma", "Halima",
  "Omolara", "Blessing", "Chioma", "Sarah", "Grace", "Tolu", "Ronke", "Amina",
  "Precious", "Damilola", "Uche", "Adanna", "Similoluwa", "Rita", "Ebele",
];

export const LAST_NAMES = [
  "Okafor", "Johnson", "Adebayo", "Okonkwo", "Balogun", "Eze", "Adeyemi",
  "Nwosu", "Ibrahim", "Afolabi", "Chukwu", "Okoye", "Bello", "Onyekwere",
  "Fashola", "Uzo", "Momoh", "Abiodun", "Nnamdi", "Olawale",
];

export const CITIES = [
  { city: "Lagos", state: "Lagos", country: "Nigeria" },
  { city: "Abuja", state: "FCT", country: "Nigeria" },
  { city: "Port Harcourt", state: "Rivers", country: "Nigeria" },
  { city: "Ibadan", state: "Oyo", country: "Nigeria" },
  { city: "Enugu", state: "Enugu", country: "Nigeria" },
  { city: "Abeokuta", state: "Ogun", country: "Nigeria" },
  { city: "Accra", state: "Greater Accra", country: "Ghana" },
  { city: "London", state: "England", country: "United Kingdom" },
];

export const STREETS = [
  "Admiralty Way", "Bourdillon Road", "Awolowo Road", "Adeola Odeku Street",
  "Ozumba Mbadiwe Avenue", "Allen Avenue", "Ligali Ayorinde Street",
  "Kofo Abayomi Street", "Glover Road", "Chevron Drive",
];

export function fullName(rng) {
  return `${rng.item(FIRST_NAMES)} ${rng.item(LAST_NAMES)}`;
}

export function emailFor(name, index) {
  const [first, last] = name.toLowerCase().split(" ");
  return `${first}.${last}${index}@mailbox.com`;
}

export function addressFor(rng) {
  const location = rng.item(CITIES);
  return {
    line1: `${rng.int(1, 200)} ${rng.item(STREETS)}`,
    city: location.city,
    state: location.state,
    country: location.country,
    postalCode: String(rng.int(100000, 109999)),
  };
}

export const PRODUCT_CATALOG = [
  { title: "Silk Wrap Dress", category: "Dresses" },
  { title: "Satin Slip Dress", category: "Dresses" },
  { title: "Tiered Maxi Dress", category: "Dresses" },
  { title: "Printed Midi Dress", category: "Dresses" },
  { title: "Asymmetric Column Dress", category: "Dresses" },
  { title: "Tailored Blazer", category: "Outerwear" },
  { title: "Wool Trench Coat", category: "Outerwear" },
  { title: "Quilted Bomber Jacket", category: "Outerwear" },
  { title: "Oversized Wool Coat", category: "Outerwear" },
  { title: "Cropped Denim Jacket", category: "Outerwear" },
  { title: "Ribbed Knit Co-ord", category: "Co-ord Sets" },
  { title: "Linen Two-Piece Set", category: "Co-ord Sets" },
  { title: "Satin Cami Co-ord", category: "Co-ord Sets" },
  { title: "Tailored Trouser Set", category: "Co-ord Sets" },
  { title: "Structured Tote Bag", category: "Accessories" },
  { title: "Gold Chain Belt", category: "Accessories" },
  { title: "Silk Head Scarf", category: "Accessories" },
  { title: "Statement Hoop Earrings", category: "Accessories" },
  { title: "Leather Ankle Boots", category: "Accessories" },
  { title: "Pleated Midi Skirt", category: "New Arrivals" },
  { title: "Corset Top", category: "New Arrivals" },
  { title: "Draped Jumpsuit", category: "New Arrivals" },
  { title: "Off-Shoulder Gown", category: "The Signature Edit" },
  { title: "Beaded Evening Dress", category: "The Signature Edit" },
];

export const SIZES = ["XS", "S", "M", "L", "XL"];
export const COLORS = ["Black", "Ivory", "Burgundy", "Sage", "Camel", "Rust"];
