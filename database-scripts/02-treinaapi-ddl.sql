USE treinaapi;

-- ----------------------------
-- ALTER TABLES
-- ----------------------------
ALTER TABLE treina_user ADD COLUMN is_in_trial BOOLEAN DEFAULT FALSE;
ALTER TABLE treina_user ADD COLUMN is_trial_ended BOOLEAN DEFAULT FALSE;
ALTER TABLE treina_user ADD COLUMN trial_start_date TIMESTAMP;
COMMIT;

-- ----------------------------
-- UPDATE DATA
-- ----------------------------
UPDATE treina_plan SET code = 'treina_300_1y_0w0' WHERE id = 6;
COMMIT;