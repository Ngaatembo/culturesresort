-- Brief cultural context for traditional dishes that were seeded with no
-- description. General, factual cultural notes about the dish itself
-- (Zimbabwean/regional food culture) — not claims about house recipe or
-- preparation specifics we don't actually know.

UPDATE menu_items SET description = 'Zimbabwe''s everyday staple: a firm maize porridge, made to be pinched off and dipped into a relish.'
  WHERE name = 'Sadza Rezviyo / Remhunga';

UPDATE menu_items SET description = 'The same staple maize porridge, known as isitshwala in Ndebele or ugali further north.'
  WHERE name = 'Sadza / Ugali (Isitshwala)';

UPDATE menu_items SET description = 'Rice with peanut butter sauce — a comforting East and Southern African pairing, traditionally served alongside meat or greens.'
  WHERE name = 'Mpunga Une Dovi';

UPDATE menu_items SET description = 'Leafy greens (muriwo) cooked in a peanut butter sauce (dovi) — a classic Zimbabwean way of preparing vegetables.'
  WHERE name = 'Muriwo Une Dovi';

UPDATE menu_items SET description = 'Goat ribs, a favourite cut across Southern and East Africa for slow grilling.'
  WHERE name = 'Goat Ribs (Mbavu za Mbuzi)';

UPDATE menu_items SET description = 'Chicken pieces piri-piri style, marinated with the chilli popularised along the East African coast.'
  WHERE name = 'Piri Piri Gizzards';

UPDATE menu_items SET description = 'Free-range village chicken (kuku kienyeji), prized for firmer meat than commercially raised birds.'
  WHERE name = 'Road Runner Chicken (Kuku Kienyeji)';

UPDATE menu_items SET description = 'Charcoal-grilled pork chops, cooked over open flame in the East African style.'
  WHERE name = 'Mbuzi Ulaya (Charcoal Grilled Pork Chops)';

UPDATE menu_items SET description = 'Mopani worms (madora) — a traditional Zimbabwean delicacy, high in protein and typically dried before cooking.'
  WHERE name = 'Mopani Worms (Madora)';

UPDATE menu_items SET description = 'Slow-braised pork trotters, cooked until the meat falls off the bone — a traditional, nose-to-tail cut.'
  WHERE name = 'Pork Trotters / Bones';
