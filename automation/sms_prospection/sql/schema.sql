-- Schéma de référence PostgreSQL (Supabase) de l'assistant de prospection SMS
-- (BtoB artisans & commerçants). À exécuter directement si DATABASE_URL pointe
-- vers Supabase/Postgres.
--
-- En local (SQLite, zéro configuration), ne pas exécuter ce fichier : db.py crée
-- automatiquement le même schéma via SQLAlchemy Core (`Table.metadata.create_all`),
-- qui génère un DDL portable (autoincrement adapté au moteur) à partir des mêmes
-- définitions de colonnes.

CREATE TABLE IF NOT EXISTS sms_prospect (
    id              SERIAL PRIMARY KEY,
    phone           TEXT NOT NULL UNIQUE,        -- format E.164, ex: +33612345678
    prenom          TEXT NOT NULL,
    nom             TEXT,                        -- nom du prospect / de l'entreprise, utilisé pour "Audit de [Nom]"
    secteur         TEXT NOT NULL,                -- clé du secteur (voir secteurs.py)
    ville           TEXT,
    email           TEXT,
    booking_token   TEXT UNIQUE,                  -- token unique inclus dans le lien du SMS
    statut          TEXT NOT NULL DEFAULT 'nouveau',
        -- nouveau | envoye | echec | stop | rdv_pris
    date_envoi      TIMESTAMP,
    date_rdv        TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_prospect_statut ON sms_prospect (statut);
CREATE INDEX IF NOT EXISTS idx_sms_prospect_token ON sms_prospect (booking_token);

CREATE TABLE IF NOT EXISTS sms_blacklist (
    id          SERIAL PRIMARY KEY,
    phone       TEXT NOT NULL UNIQUE,             -- format E.164
    source      TEXT NOT NULL DEFAULT 'stop_sms',  -- stop_sms | import_manuel | plainte
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_envoi_log (
    id              SERIAL PRIMARY KEY,
    prospect_id     INTEGER NOT NULL REFERENCES sms_prospect (id),
    message         TEXT NOT NULL,
    statut_envoi    TEXT NOT NULL,                 -- envoye | echec | bloque_blacklist
    provider_ref    TEXT,                          -- id retourné par Brevo/Twilio
    erreur          TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
