-- ============================================================
-- ImmoExpert — Seed data (développement uniquement)
-- Transactions DVF réalistes : Paris, Lyon, Marseille, Bordeaux, Nantes
-- ============================================================

-- ── PricePoint ──────────────────────────────────────────────
-- Noms de colonnes alignés avec schema.prisma (Prisma = camelCase → DB = camelCase)

INSERT INTO "PricePoint" (
    id, "mutationId", "saleDate", price, "surfaceArea", "pricePerSqm",
    "propertyType", latitude, longitude, "postalCode", city, "streetName",
    "roomCount", "createdAt", "updatedAt"
) VALUES
  -- Paris 1er
  (gen_random_uuid(),'DVF-75001-001','2025-11-15',650000,52,12500,'APARTMENT',48.8606,2.3477,'75001','Paris','Rue de Rivoli',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-75001-002','2025-10-22',480000,38,12631,'APARTMENT',48.8601,2.3470,'75001','Paris','Place Vendôme',2,NOW(),NOW()),
  -- Paris 6e
  (gen_random_uuid(),'DVF-75006-001','2025-12-01',1200000,90,13333,'APARTMENT',48.8539,2.3326,'75006','Paris','Boulevard Saint-Germain',4,NOW(),NOW()),
  (gen_random_uuid(),'DVF-75006-002','2025-11-10',850000,65,13076,'APARTMENT',48.8531,2.3318,'75006','Paris','Rue de Rennes',3,NOW(),NOW()),
  -- Paris 11e
  (gen_random_uuid(),'DVF-75011-001','2025-12-05',520000,55,9454,'APARTMENT',48.8583,2.3786,'75011','Paris','Boulevard Voltaire',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-75011-002','2025-11-20',390000,40,9750,'APARTMENT',48.8575,2.3790,'75011','Paris','Rue Oberkampf',2,NOW(),NOW()),
  -- Paris 16e
  (gen_random_uuid(),'DVF-75016-001','2025-12-10',1500000,120,12500,'APARTMENT',48.8626,2.2763,'75016','Paris','Avenue Victor Hugo',5,NOW(),NOW()),
  (gen_random_uuid(),'DVF-75016-002','2025-11-28',680000,58,11724,'APARTMENT',48.8620,2.2758,'75016','Paris','Rue de la Pompe',3,NOW(),NOW()),
  -- Paris 18e
  (gen_random_uuid(),'DVF-75018-001','2025-12-03',420000,48,8750,'APARTMENT',48.8868,2.3391,'75018','Paris','Rue Lepic',2,NOW(),NOW()),
  (gen_random_uuid(),'DVF-75018-002','2025-11-15',330000,35,9428,'APARTMENT',48.8874,2.3395,'75018','Paris','Boulevard de Rochechouart',2,NOW(),NOW()),
  -- Lyon 6e
  (gen_random_uuid(),'DVF-69006-001','2025-12-08',480000,85,5647,'APARTMENT',45.7666,4.8531,'69006','Lyon','Avenue Foch',4,NOW(),NOW()),
  (gen_random_uuid(),'DVF-69006-002','2025-11-25',320000,58,5517,'APARTMENT',45.7660,4.8525,'69006','Lyon','Cours Vitton',3,NOW(),NOW()),
  -- Lyon 1er
  (gen_random_uuid(),'DVF-69001-001','2025-12-02',380000,70,5428,'APARTMENT',45.7676,4.8345,'69001','Lyon','Rue de la République',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-69001-002','2025-11-18',260000,48,5416,'APARTMENT',45.7670,4.8340,'69001','Lyon','Place des Terreaux',2,NOW(),NOW()),
  -- Marseille 7e
  (gen_random_uuid(),'DVF-13007-001','2025-12-07',280000,65,4307,'APARTMENT',43.2831,5.3664,'13007','Marseille','Boulevard du Prado',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-13007-002','2025-11-22',195000,47,4148,'APARTMENT',43.2825,5.3658,'13007','Marseille','Rue Paradis',2,NOW(),NOW()),
  -- Bordeaux
  (gen_random_uuid(),'DVF-33000-001','2025-12-09',340000,62,5483,'APARTMENT',44.8527,-0.5799,'33000','Bordeaux','Cours du Médoc',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-33000-002','2025-11-30',480000,90,5333,'HOUSE',44.8532,-0.5793,'33300','Bordeaux','Rue Notre-Dame',5,NOW(),NOW()),
  -- Nantes
  (gen_random_uuid(),'DVF-44000-001','2025-12-04',290000,58,5000,'APARTMENT',47.2032,-1.5597,'44000','Nantes','Cours des 50 Otages',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-44000-002','2025-11-17',210000,42,5000,'APARTMENT',47.2038,-1.5590,'44000','Nantes','Rue Crébillon',2,NOW(),NOW()),
  -- Nice
  (gen_random_uuid(),'DVF-06000-001','2025-12-06',420000,65,6461,'APARTMENT',43.7102,7.2620,'06000','Nice','Promenade des Anglais',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-06000-002','2025-11-14',310000,50,6200,'APARTMENT',43.7108,7.2625,'06000','Nice','Avenue Jean Médecin',2,NOW(),NOW()),
  -- Strasbourg
  (gen_random_uuid(),'DVF-67000-001','2025-12-11',340000,72,4722,'APARTMENT',48.5734,7.7521,'67000','Strasbourg','Place Kléber',4,NOW(),NOW()),
  (gen_random_uuid(),'DVF-67000-002','2025-11-24',220000,48,4583,'APARTMENT',48.5729,7.7515,'67000','Strasbourg','Rue du Vieux Marché aux Poissons',2,NOW(),NOW()),
  -- Toulouse
  (gen_random_uuid(),'DVF-31000-001','2025-12-12',320000,68,4705,'APARTMENT',43.6047,1.4442,'31000','Toulouse','Place du Capitole',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-31000-002','2025-11-26',195000,44,4431,'APARTMENT',43.6052,1.4448,'31000','Toulouse','Rue Saint-Rome',2,NOW(),NOW()),
  -- Lille
  (gen_random_uuid(),'DVF-59000-001','2025-12-13',280000,70,4000,'APARTMENT',50.6292,3.0573,'59000','Lille','Grand Place',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-59000-002','2025-11-27',175000,46,3804,'APARTMENT',50.6298,3.0579,'59000','Lille','Rue de Béthune',2,NOW(),NOW()),
  -- Rennes
  (gen_random_uuid(),'DVF-35000-001','2025-12-14',310000,65,4769,'APARTMENT',48.1173,-1.6778,'35000','Rennes','Place de la République',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-35000-002','2025-11-28',205000,45,4555,'APARTMENT',48.1168,-1.6784,'35000','Rennes','Rue Saint-Malo',2,NOW(),NOW()),
  -- Montpellier
  (gen_random_uuid(),'DVF-34000-001','2025-12-10',285000,60,4750,'APARTMENT',43.6110,3.8767,'34000','Montpellier','Place de la Comédie',3,NOW(),NOW()),
  (gen_random_uuid(),'DVF-34000-002','2025-11-19',185000,42,4404,'APARTMENT',43.6115,3.8772,'34000','Montpellier','Rue Foch',2,NOW(),NOW())

ON CONFLICT ("mutationId") DO NOTHING;

-- ── Courses (formation) ─────────────────────────────────────────────────────
-- Aligné avec Course.slug (unique), Course.published (Boolean), Course.order

INSERT INTO "Course" (id, slug, title, description, "order", published, "durationMin", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(), slug, title, description, "order", true, "durationMin", NOW(), NOW()
FROM (VALUES
  ('module-1-fondamentaux',       'Expert en Valeur Vénale — Module 1 : Fondamentaux', 'Cadre légal, déontologie et posture de l''expert immobilier', 1, 90),
  ('module-2-methodes',           'Module 2 — Méthodes d''évaluation',                 'Comparaison directe, capitalisation des revenus, coût de remplacement', 2, 120),
  ('module-3-dvf',                'Module 3 — Analyse des données DVF',                'Exploitation des données transactionnelles pour affiner les estimations', 3, 90),
  ('module-4-marches-speciaux',   'Module 4 — Marchés spéciaux',                       'Fonds de commerce, murs commerciaux, immobilier de prestige', 4, 100),
  ('module-5-rapport-expertise',  'Module 5 — Rédaction du rapport d''expertise',       'Structure, argumentation et responsabilité juridique', 5, 110),
  ('module-6-outils-numeriques',  'Module 6 — Outils numériques & IA',                 'ImmoExpert, DVF API, cartographie et modèles prédictifs', 6, 80),
  ('module-7-cas-pratiques',      'Module 7 — Cas pratiques',                          '4 études de cas réels commentées', 7, 120),
  ('module-8-examen',             'Module 8 — Examen de certification',                 'QCM + étude de cas écrite — obtention du badge Expert Valeur Vénale', 8, 60)
) AS t(slug, title, description, "order", "durationMin")
WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE "Course".slug = t.slug);
