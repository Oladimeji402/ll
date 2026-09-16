-- Seed defaults for every store_settings section, ported from the mock
-- data generator so the admin panel isn't blank on first load. Homepage's
-- featured ids point at real collections/products instead of mock ones.

insert into public.store_settings (key, value) values
  ('shipping', '{
    "freeShippingThreshold": 150000,
    "zones": [
      {
        "id": "zone-lagos",
        "name": "Lagos",
        "regions": ["Lagos Island", "Lagos Mainland", "Lekki", "Ikeja"],
        "methods": [
          { "id": "m1", "name": "Same-day Delivery", "rate": 3500, "estimateDays": "Same day" },
          { "id": "m2", "name": "Next-day Delivery", "rate": 2000, "estimateDays": "1 day" }
        ]
      },
      {
        "id": "zone-nigeria",
        "name": "Nationwide Nigeria",
        "regions": ["All other states"],
        "methods": [
          { "id": "m3", "name": "Standard Delivery", "rate": 3000, "estimateDays": "3-5 days" },
          { "id": "m4", "name": "Express Delivery", "rate": 6000, "estimateDays": "1-2 days" }
        ]
      },
      {
        "id": "zone-intl",
        "name": "International",
        "regions": ["Africa", "Europe", "North America"],
        "methods": [
          { "id": "m5", "name": "Standard International", "rate": 25000, "estimateDays": "7-14 days" },
          { "id": "m6", "name": "Express International", "rate": 45000, "estimateDays": "3-5 days" }
        ]
      }
    ]
  }'::jsonb),
  ('store', '{
    "name": "LL Collectives",
    "supportEmail": "hello@llcollectives.com",
    "supportPhone": "+234 801 234 5678",
    "address": "12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    "currency": "NGN"
  }'::jsonb),
  ('checkout', '{"guestCheckout": true, "requirePhone": true, "termsUrl": "/terms"}'::jsonb),
  ('notifications', '{"emailOnNewOrder": true, "emailOnLowStock": true, "emailOnReturn": true, "smsOnShipment": false}'::jsonb),
  ('email', '{"senderName": "LL Collectives", "senderEmail": "orders@llcollectives.com", "replyTo": "hello@llcollectives.com"}'::jsonb),
  ('seo', '{"defaultTitle": "LL Collectives — Contemporary Ready-to-Wear", "defaultDescription": "Shop contemporary ready-to-wear from LL Collectives.", "socialImageTone": 0}'::jsonb),
  ('preferences', '{"dateFormat": "MMM D, YYYY", "timezone": "Africa/Lagos", "weekStartsOn": "Monday"}'::jsonb),
  ('payments', '{"methodsEnabled": ["Card", "Bank Transfer", "Cash on Delivery"]}'::jsonb);

insert into public.store_settings (key, value)
select 'homepage', jsonb_build_object(
  'hero', jsonb_build_object(
    'heading', 'View New Collection',
    'description', 'It begins with a single thread. A pattern drawn from culture, a rhythm carried through fabric.',
    'ctaLabel', 'View New Collection',
    'ctaHref', '#collection-new',
    'panels', jsonb_build_array(
      jsonb_build_object('tone', 0, 'alt', 'Model wearing a printed maxi look'),
      jsonb_build_object('tone', 1, 'alt', 'Model wearing a co-ord set'),
      jsonb_build_object('tone', 2, 'alt', 'Model wearing a patterned dress')
    )
  ),
  'announcementBar', jsonb_build_object('text', 'FREE DELIVERY IN LAGOS', 'enabled', true),
  'featuredCollectionIds', (select coalesce(jsonb_agg(id), '[]'::jsonb) from (select id from public.collections order by position limit 3) c),
  'featuredProductIds', (select coalesce(jsonb_agg(id), '[]'::jsonb) from (select id from public.products order by created_at limit 8) p),
  'editorialSections', jsonb_build_array(
    jsonb_build_object(
      'id', 'story',
      'heading', 'Our Story',
      'body', 'It begins with a single thread. A pattern drawn from culture, a rhythm carried through fabric. From motive to form, the line becomes a language.'
    )
  )
);
