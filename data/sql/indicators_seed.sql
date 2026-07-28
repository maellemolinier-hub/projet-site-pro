-- ============================================================
-- ImmoExpert — Seed des INDICATEURS DE ZONE (démo / développement)
-- Valeurs agrégées réalistes par code postal pour les villes du seed DVF.
-- En production, ces valeurs sont calculées par l'agent d'ingestion
-- (data/pipelines/tasks/indicators_refresh.py) depuis les sources INSEE.
-- Upsert par codeInsee ; ne touche pas la population chargée par refresh_communes.
-- ============================================================

INSERT INTO "ZoneIndicator" (
    id, "codeInsee", "postalCode", city, department,
    "deathRate", "birthRate", "divorceRate", "vacancyRate", "medianIncome",
    "referenceYear", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid(),'75056','75001','Paris','75',       8.1, 9.0,1.9, 9.5,42000,2023,NOW(),NOW()),
  (gen_random_uuid(),'75106','75006','Paris 6e','75',    8.4, 8.2,1.8,10.2,55000,2023,NOW(),NOW()),
  (gen_random_uuid(),'75111','75011','Paris 11e','75',   7.2,11.0,2.0, 7.8,34000,2023,NOW(),NOW()),
  (gen_random_uuid(),'75116','75016','Paris 16e','75',   9.1, 9.5,1.7, 8.9,61000,2023,NOW(),NOW()),
  (gen_random_uuid(),'75118','75018','Paris 18e','75',   7.6,12.1,2.1, 8.1,27000,2023,NOW(),NOW()),
  (gen_random_uuid(),'69381','69001','Lyon 1er','69',    7.5,11.2,2.0, 7.4,31000,2023,NOW(),NOW()),
  (gen_random_uuid(),'69386','69006','Lyon 6e','69',     8.0,10.4,1.9, 6.9,38000,2023,NOW(),NOW()),
  (gen_random_uuid(),'13207','13007','Marseille 7e','13',9.0,11.5,2.2, 8.6,24000,2023,NOW(),NOW()),
  (gen_random_uuid(),'33063','33000','Bordeaux','33',    8.3,11.0,2.0, 9.2,26000,2023,NOW(),NOW()),
  (gen_random_uuid(),'44109','44000','Nantes','44',      7.4,12.0,1.9, 7.1,27000,2023,NOW(),NOW()),
  (gen_random_uuid(),'06088','06000','Nice','06',       10.2, 8.9,2.1,11.5,25000,2023,NOW(),NOW()),
  (gen_random_uuid(),'67482','67000','Strasbourg','67',  8.1,11.3,1.8, 8.0,27000,2023,NOW(),NOW()),
  (gen_random_uuid(),'31555','31000','Toulouse','31',    7.0,12.4,2.0, 8.8,28000,2023,NOW(),NOW()),
  (gen_random_uuid(),'59350','59000','Lille','59',       8.9,12.8,2.1, 9.6,22000,2023,NOW(),NOW()),
  (gen_random_uuid(),'35238','35000','Rennes','35',      7.1,12.2,1.8, 6.7,27000,2023,NOW(),NOW()),
  (gen_random_uuid(),'34172','34000','Montpellier','34', 8.6,11.1,2.2,12.1,23000,2023,NOW(),NOW())
ON CONFLICT ("codeInsee") DO UPDATE SET
  "postalCode"   = EXCLUDED."postalCode",
  city           = EXCLUDED.city,
  department     = EXCLUDED.department,
  "deathRate"    = EXCLUDED."deathRate",
  "birthRate"    = EXCLUDED."birthRate",
  "divorceRate"  = EXCLUDED."divorceRate",
  "vacancyRate"  = EXCLUDED."vacancyRate",
  "medianIncome" = EXCLUDED."medianIncome",
  "referenceYear"= EXCLUDED."referenceYear",
  "updatedAt"    = NOW();

-- Taux de crédit immobilier national (série datée) — valeur de démo
INSERT INTO "MarketIndicator" (id, key, value, unit, date, source, "createdAt")
VALUES (gen_random_uuid(), 'credit_rate_20y', 3.45, '%', CURRENT_DATE, 'seed', NOW())
ON CONFLICT (key, date) DO UPDATE SET value = EXCLUDED.value;
