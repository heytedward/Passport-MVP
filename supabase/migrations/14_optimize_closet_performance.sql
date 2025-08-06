-- Migration 14: Optimize closet loading performance
-- This migration adds database optimizations to improve closet loading times

-- 1. Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_closet_user_id_earned_date ON public.user_closet(user_id, earned_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_closet_category ON public.user_closet(category);
CREATE INDEX IF NOT EXISTS idx_user_closet_rarity ON public.user_closet(rarity);
CREATE INDEX IF NOT EXISTS idx_user_closet_reward_id ON public.user_closet(reward_id);
CREATE INDEX IF NOT EXISTS idx_rewards_reward_id ON public.rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- 2. Create optimized function for closet data retrieval
CREATE OR REPLACE FUNCTION public.get_user_closet_cards(user_id_param UUID)
RETURNS TABLE (
  id INTEGER,
  reward_id TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  rarity TEXT,
  mint_number INTEGER,
  wings_earned INTEGER,
  earned_date TIMESTAMP WITH TIME ZONE,
  earned_via TEXT,
  is_equipped BOOLEAN,
  image_url TEXT,
  card_image_url TEXT,
  stats JSONB,
  card_metadata JSONB,
  is_limited_edition BOOLEAN,
  collection_name TEXT,
  season TEXT,
  release_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.reward_id,
    uc.name,
    COALESCE(uc.description, r.description) as description,
    uc.category,
    uc.rarity,
    uc.mint_number,
    uc.wings_earned,
    uc.earned_date,
    uc.earned_via,
    uc.is_equipped,
    COALESCE(uc.image_url, r.image_url) as image_url,
    COALESCE(uc.card_image_url, r.card_image_url) as card_image_url,
    COALESCE(uc.stats, r.stats) as stats,
    COALESCE(uc.card_metadata, r.card_metadata) as card_metadata,
    COALESCE(uc.is_limited_edition, r.is_limited_edition) as is_limited_edition,
    COALESCE(uc.collection_name, r.collection_name) as collection_name,
    COALESCE(uc.season, r.season) as season,
    COALESCE(uc.release_date, r.release_date) as release_date
  FROM public.user_closet uc
  LEFT JOIN public.rewards r ON uc.reward_id = r.reward_id
  WHERE uc.user_id = user_id_param
  ORDER BY uc.earned_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create optimized function for user profile data
CREATE OR REPLACE FUNCTION public.get_user_profile_data(user_id_param UUID)
RETURNS TABLE (
  themes_unlocked TEXT[],
  equipped_theme TEXT,
  total_scans INTEGER,
  total_quests_completed INTEGER,
  total_items_collected INTEGER,
  wings_balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.themes_unlocked,
    up.equipped_theme,
    up.total_scans,
    up.total_quests_completed,
    up.total_items_collected,
    up.wings_balance
  FROM public.user_profiles up
  WHERE up.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create materialized view for closet statistics (updated periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.closet_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_items,
  COUNT(CASE WHEN category != 'themes' THEN 1 END) as physical_items,
  COUNT(CASE WHEN category = 'themes' THEN 1 END) as digital_items,
  COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary_items,
  COUNT(CASE WHEN rarity = 'epic' THEN 1 END) as epic_items,
  COUNT(CASE WHEN rarity = 'rare' THEN 1 END) as rare_items,
  COUNT(CASE WHEN rarity = 'uncommon' THEN 1 END) as uncommon_items,
  COUNT(CASE WHEN rarity = 'common' THEN 1 END) as common_items,
  SUM(wings_earned) as total_wings_earned
FROM public.user_closet
GROUP BY user_id;

-- 5. Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_closet_statistics_user_id ON public.closet_statistics(user_id);

-- 6. Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_closet_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.closet_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_user_closet_cards(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_closet_statistics() TO authenticated;
GRANT SELECT ON public.closet_statistics TO authenticated;

-- 8. Create trigger to automatically refresh statistics when closet changes
CREATE OR REPLACE FUNCTION public.trigger_refresh_closet_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh statistics asynchronously to avoid blocking the main operation
  PERFORM pg_notify('refresh_closet_statistics', '');
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_closet_statistics_refresh ON public.user_closet;
CREATE TRIGGER trigger_closet_statistics_refresh
  AFTER INSERT OR UPDATE OR DELETE ON public.user_closet
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_refresh_closet_statistics();

-- 9. Add performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  operation_type TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create index on performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);

-- Grant permissions
GRANT INSERT, SELECT ON public.performance_metrics TO authenticated;

-- 10. Create function to log performance metrics
CREATE OR REPLACE FUNCTION public.log_performance_metric(
  user_id_param UUID,
  operation_type_param TEXT,
  duration_ms_param INTEGER,
  metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.performance_metrics (user_id, operation_type, duration_ms, metadata)
  VALUES (user_id_param, operation_type_param, duration_ms_param, metadata_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.log_performance_metric(UUID, TEXT, INTEGER, JSONB) TO authenticated;

-- 11. Verify the optimizations
SELECT 
  'Indexes created' as optimization,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('user_closet', 'rewards', 'user_profiles')
  AND indexname LIKE 'idx_%'
UNION ALL
SELECT 
  'Functions created' as optimization,
  COUNT(*) as count
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('get_user_closet_cards', 'get_user_profile_data', 'refresh_closet_statistics')
UNION ALL
SELECT 
  'Materialized views created' as optimization,
  COUNT(*) as count
FROM pg_matviews 
WHERE schemaname = 'public'
  AND matviewname = 'closet_statistics'; 