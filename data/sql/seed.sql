-- ============================================================
-- ImmoExpert — Seed data (development only)
-- Realistic DVF-based price points for Paris, Lyon, Marseille
-- ============================================================

-- Paris arrondissements (sample transactions)
INSERT INTO "PricePoint" (id, mutation_id, sale_date, price, surface_area, price_per_sqm, property_type, latitude, longitude, postal_code, city, room_count, "createdAt", "updatedAt")
VALUES
  -- Paris 1er
  (gen_random_uuid(), 'DVF-75001-001', '2025-11-15', 650000, 52, 12500, 'APARTMENT', 48.8606, 2.3477, '75001', 'Paris', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-75001-002', '2025-10-22', 480000, 38, 12631, 'APARTMENT', 48.8601, 2.3470, '75001', 'Paris', 2, NOW(), NOW()),

  -- Paris 6e (Saint-Germain)
  (gen_random_uuid(), 'DVF-75006-001', '2025-12-01', 1200000, 90, 13333, 'APARTMENT', 48.8539, 2.3326, '75006', 'Paris', 4, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-75006-002', '2025-11-10', 850000, 65, 13076, 'APARTMENT', 48.8531, 2.3318, '75006', 'Paris', 3, NOW(), NOW()),

  -- Paris 11e
  (gen_random_uuid(), 'DVF-75011-001', '2025-12-05', 520000, 55, 9454, 'APARTMENT', 48.8583, 2.3786, '75011', 'Paris', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-75011-002', '2025-11-20', 390000, 40, 9750, 'APARTMENT', 48.8575, 2.3790, '75011', 'Paris', 2, NOW(), NOW()),

  -- Paris 16e (Passy)
  (gen_random_uuid(), 'DVF-75016-001', '2025-12-10', 1500000, 120, 12500, 'APARTMENT', 48.8626, 2.2763, '75016', 'Paris', 5, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-75016-002', '2025-11-28', 680000, 58, 11724, 'APARTMENT', 48.8620, 2.2758, '75016', 'Paris', 3, NOW(), NOW()),

  -- Paris 18e (Montmartre)
  (gen_random_uuid(), 'DVF-75018-001', '2025-12-03', 420000, 48, 8750, 'APARTMENT', 48.8868, 2.3391, '75018', 'Paris', 2, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-75018-002', '2025-11-15', 330000, 35, 9428, 'APARTMENT', 48.8874, 2.3395, '75018', 'Paris', 2, NOW(), NOW()),

  -- Lyon 6e (Foch)
  (gen_random_uuid(), 'DVF-69006-001', '2025-12-08', 480000, 85, 5647, 'APARTMENT', 45.7666, 4.8531, '69006', 'Lyon', 4, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-69006-002', '2025-11-25', 320000, 58, 5517, 'APARTMENT', 45.7660, 4.8525, '69006', 'Lyon', 3, NOW(), NOW()),

  -- Lyon 1er (Presqu'île)
  (gen_random_uuid(), 'DVF-69001-001', '2025-12-02', 380000, 70, 5428, 'APARTMENT', 45.7676, 4.8345, '69001', 'Lyon', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-69001-002', '2025-11-18', 260000, 48, 5416, 'APARTMENT', 45.7670, 4.8340, '69001', 'Lyon', 2, NOW(), NOW()),

  -- Marseille 7e (Endoume)
  (gen_random_uuid(), 'DVF-13007-001', '2025-12-07', 280000, 65, 4307, 'APARTMENT', 43.2831, 5.3664, '13007', 'Marseille', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-13007-002', '2025-11-22', 195000, 47, 4148, 'APARTMENT', 43.2825, 5.3658, '13007', 'Marseille', 2, NOW(), NOW()),

  -- Bordeaux Chartrons
  (gen_random_uuid(), 'DVF-33000-001', '2025-12-09', 340000, 62, 5483, 'APARTMENT', 44.8527, -0.5799, '33000', 'Bordeaux', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-33000-002', '2025-11-30', 480000, 90, 5333, 'HOUSE', 44.8532, -0.5793, '33000', 'Bordeaux', 5, NOW(), NOW()),

  -- Nantes Île de Nantes
  (gen_random_uuid(), 'DVF-44000-001', '2025-12-04', 290000, 58, 5000, 'APARTMENT', 47.2032, -1.5597, '44000', 'Nantes', 3, NOW(), NOW()),
  (gen_random_uuid(), 'DVF-44000-002', '2025-11-17', 210000, 42, 5000, 'APARTMENT', 47.2038, -1.5590, '44000', 'Nantes', 2, NOW(), NOW())

ON CONFLICT (mutation_id) DO NOTHING;

-- ── Sample Courses (formation) ──────────────────────────────
-- Insert only if not already present
INSERT INTO "Course" (id, title, description, "order", published, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(), title, description, "order", true, NOW(), NOW()
FROM (VALUES
  ('Expert en Valeur Vénale — Module 1', 'Fondamentaux de l''expertise immobilière et cadre légal', 1),
  ('Module 2 — Méthodes d''évaluation', 'Comparaison directe, capitalisation des revenus, coût de remplacement', 2),
  ('Module 3 — Analyse des données DVF', 'Exploitation des données transactionnelles pour affiner les estimations', 3),
  ('Module 4 — Marchés spéciaux', 'Fonds de commerce, murs commerciaux, immobilier de prestige', 4)
) AS t(title, description, "order")
WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE "Course".title = t.title);
