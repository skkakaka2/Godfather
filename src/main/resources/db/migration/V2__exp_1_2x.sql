-- ============================================================
-- V2: Lv.4+ exp_required 提升 1.2 倍（四舍五入到5的倍数）
-- 第1-3级保持不变
-- ============================================================

UPDATE level_config SET exp_required = CASE id
    -- Lv.4 自律达人
    WHEN 10 THEN 1080
    WHEN 11 THEN 1315
    WHEN 12 THEN 1565
    -- Lv.5 自律精英
    WHEN 13 THEN 1800
    WHEN 14 THEN 2105
    WHEN 15 THEN 2395
    -- Lv.6 自律强者
    WHEN 16 THEN 2700
    WHEN 17 THEN 3115
    WHEN 18 THEN 3545
    -- Lv.7 自律大师
    WHEN 19 THEN 3960
    WHEN 20 THEN 4445
    WHEN 21 THEN 4915
    -- Lv.8 自律王者
    WHEN 22 THEN 5400
    WHEN 23 THEN 5995
    WHEN 24 THEN 6605
    -- Lv.9 自律传奇
    WHEN 25 THEN 7200
    WHEN 26 THEN 8100
    WHEN 27 THEN 9000
    -- Lv.10 自律至尊
    WHEN 28 THEN 9900
    WHEN 29 THEN 12600
    WHEN 30 THEN 15300
END
WHERE id BETWEEN 10 AND 30;
