-- ============================================================
-- 等级升级难度整体增加 50%（exp_required × 1.5，取整到 5 的倍数）
-- 覆盖所有家庭的 level_config（family_id=0 模板 + 已创建家庭）
-- ============================================================

-- Lv.1 自律新手
UPDATE level_config SET exp_required = 0    WHERE level = 1 AND sub_level = 1;
UPDATE level_config SET exp_required = 55   WHERE level = 1 AND sub_level = 2;
UPDATE level_config SET exp_required = 105  WHERE level = 1 AND sub_level = 3;

-- Lv.2 自律学徒
UPDATE level_config SET exp_required = 150  WHERE level = 2 AND sub_level = 1;
UPDATE level_config SET exp_required = 255  WHERE level = 2 AND sub_level = 2;
UPDATE level_config SET exp_required = 360  WHERE level = 2 AND sub_level = 3;

-- Lv.3 自律行者
UPDATE level_config SET exp_required = 450  WHERE level = 3 AND sub_level = 1;
UPDATE level_config SET exp_required = 600  WHERE level = 3 AND sub_level = 2;
UPDATE level_config SET exp_required = 750  WHERE level = 3 AND sub_level = 3;

-- Lv.4 自律达人
UPDATE level_config SET exp_required = 900  WHERE level = 4 AND sub_level = 1;
UPDATE level_config SET exp_required = 1095 WHERE level = 4 AND sub_level = 2;
UPDATE level_config SET exp_required = 1305 WHERE level = 4 AND sub_level = 3;

-- Lv.5 自律精英
UPDATE level_config SET exp_required = 1500 WHERE level = 5 AND sub_level = 1;
UPDATE level_config SET exp_required = 1755 WHERE level = 5 AND sub_level = 2;
UPDATE level_config SET exp_required = 1995 WHERE level = 5 AND sub_level = 3;

-- Lv.6 自律强者
UPDATE level_config SET exp_required = 2250 WHERE level = 6 AND sub_level = 1;
UPDATE level_config SET exp_required = 2595 WHERE level = 6 AND sub_level = 2;
UPDATE level_config SET exp_required = 2955 WHERE level = 6 AND sub_level = 3;

-- Lv.7 自律大师
UPDATE level_config SET exp_required = 3300 WHERE level = 7 AND sub_level = 1;
UPDATE level_config SET exp_required = 3705 WHERE level = 7 AND sub_level = 2;
UPDATE level_config SET exp_required = 4095 WHERE level = 7 AND sub_level = 3;

-- Lv.8 自律王者
UPDATE level_config SET exp_required = 4500 WHERE level = 8 AND sub_level = 1;
UPDATE level_config SET exp_required = 4995 WHERE level = 8 AND sub_level = 2;
UPDATE level_config SET exp_required = 5505 WHERE level = 8 AND sub_level = 3;

-- Lv.9 自律传奇
UPDATE level_config SET exp_required = 6000 WHERE level = 9 AND sub_level = 1;
UPDATE level_config SET exp_required = 6750 WHERE level = 9 AND sub_level = 2;
UPDATE level_config SET exp_required = 7500 WHERE level = 9 AND sub_level = 3;

-- Lv.10 自律至尊
UPDATE level_config SET exp_required = 8250  WHERE level = 10 AND sub_level = 1;
UPDATE level_config SET exp_required = 10500 WHERE level = 10 AND sub_level = 2;
UPDATE level_config SET exp_required = 12750 WHERE level = 10 AND sub_level = 3;
