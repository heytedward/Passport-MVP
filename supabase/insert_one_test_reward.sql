-- Insert just ONE test reward for debugging
-- Run this after create_essential_tables.sql

INSERT INTO public.rewards (reward_id, name, description, category, rarity, wings_value, season, active) VALUES
('monarch_tee_001', 'Monarch Classic Tee', 'Premium cotton t-shirt with subtle Monarch branding', 'tops', 'common', 10, 'Spring2025', true)
ON CONFLICT (reward_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    wings_value = EXCLUDED.wings_value,
    season = EXCLUDED.season,
    active = EXCLUDED.active; 