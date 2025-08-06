import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const useReferrals = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalWingsEarned: 0
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralLoading, setReferralLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastUserRef = useRef(null);
  const setReferralCodeTimeoutRef = useRef(null);


  // Generate referral code from username/email
  const generateReferralCode = useCallback((user) => {
    if (!user) return null;

    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortCode = cleanUsername.substring(0, 6);
    const randomSuffix = Math.random().toString(36).substring(2, 5);

    return `${shortCode}${randomSuffix}`.toUpperCase();
  }, []);

  // Optimized referral code generation with aggressive fallbacks
  const ensureReferralCode = useCallback(async () => {
    if (!user) return;

    setReferralLoading(true);

    try {
      console.log('🔗 Ensuring referral code for user:', user.id);

      // Check if we already have a cached referral code
      const cachedCode = localStorage.getItem(`referral_${user.id}`);
      if (cachedCode) {
        try {
          const parsed = JSON.parse(cachedCode);
          const cacheAge = Date.now() - parsed.timestamp;
          if (cacheAge < 30 * 60 * 1000) { // 30 minutes cache
            console.log('🔗 Using cached referral code:', parsed.code);
            setReferralCode(parsed.code);
            setReferralLoading(false);
            return;
          }
        } catch (e) {
          console.log('🔗 Cache parse error, proceeding with fresh generation');
        }
      }

      // Try database query with very short timeout
      let dbCode = null;
      let dbError = null;

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Referral code generation timeout')), 3000) // Very short timeout
        );

        const queryPromise = supabase
          .from('user_profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (!error && profile?.referral_code) {
          dbCode = profile.referral_code;
          console.log('🔗 Database query successful, found code:', dbCode);
        } else {
          dbError = error;
          console.log('🔗 Database query failed or no code found:', error);
        }
      } catch (timeoutError) {
        console.log('🔗 Database query timed out, using fallback');
        dbError = timeoutError;
      }

      // Process the referral code
      let finalCode;

      if (dbCode) {
        // Use database code
        finalCode = dbCode;
        console.log('🔗 Using database code:', finalCode);
      } else {
        // Generate fallback code
        console.log('🔗 Generating fallback referral code');
        finalCode = generateLocalReferralCode();
        console.log('🔗 Generated fallback code:', finalCode);
      }

      // Cache the code
      localStorage.setItem(`referral_${user.id}`, JSON.stringify({
        code: finalCode,
        timestamp: Date.now()
      }));

      setReferralCode(finalCode);
      setReferralLoading(false);

    } catch (error) {
      console.error('🔗 Critical error ensuring referral code:', error);

      // Last resort fallback
      const fallbackCode = generateLocalReferralCode();
      console.log('🔗 Using last resort fallback code:', fallbackCode);

      localStorage.setItem(`referral_${user.id}`, JSON.stringify({
        code: fallbackCode,
        timestamp: Date.now()
      }));

      setReferralCode(fallbackCode);
      setReferralLoading(false);
    }
  }, [user]);

  // Helper function to generate a local referral code
  const generateLocalReferralCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MONARCH${timestamp}${random}`.toUpperCase();
  };

  // Load referral statistics
  const loadReferralStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get referral statistics
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status, created_at, referrer_reward_given, referrer_wings_earned')
        .eq('referrer_id', user.id);

      if (referralsError) throw referralsError;

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('total_referrals, referral_wings_earned')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const stats = {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
        completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        totalWingsEarned: profile?.referral_wings_earned || 0
      };

      setReferralStats(stats);

    } catch (error) {
      console.error('Error loading referral stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load referral history with user details
  const loadReferralHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referee:referee_id (
            email,
            user_metadata
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory = referrals?.map(referral => ({
        id: referral.id,
        refereeName: referral.referee?.user_metadata?.username ||
                    referral.referee?.email?.split('@')[0] ||
                    'User',
        refereeEmail: referral.referee?.email,
        status: referral.status,
        createdAt: referral.created_at,
        completedAt: referral.completed_at,
        rewardGiven: referral.referrer_reward_given,
        wingsEarned: referral.referrer_wings_earned || 0
      })) || [];

      setReferralHistory(formattedHistory);

    } catch (error) {
      console.error('Error loading referral history:', error);
      setError(error.message);
    }
  }, [user]);

  // Process referral signup (called when someone signs up with a code)
  const processReferralSignup = useCallback(async (referralCode, newUserId) => {
    if (!referralCode || !newUserId) return;

    try {
      console.log('🔄 Processing referral signup:', { referralCode, newUserId });

      // Find the referrer
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('referral_code', referralCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.warn('Invalid referral code:', referralCode);
        return { success: false, error: 'Invalid referral code' };
      }

      // Don't allow self-referral
      if (codeData.user_id === newUserId) {
        console.warn('Self-referral attempt blocked');
        return { success: false, error: 'Cannot refer yourself' };
      }

      let welcomeBonus = 25; // WINGS for joining via referral

      // Create referral record
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .insert([
          {
            referrer_id: codeData.user_id,
            referee_id: newUserId,
            referral_code: referralCode.toUpperCase(),
            status: 'pending',
            referee_wings_earned: welcomeBonus
          }
        ])
        .select()
        .single();

      if (referralError) throw referralError;

      // Award welcome bonus to referee using RPC
      const { error: wingsError } = await supabase.rpc('add_wings_to_user', {
        user_id_param: newUserId,
        wings_amount: welcomeBonus,
        activity_type_param: 'referral_bonus',
        description_param: `Welcome bonus for joining via referral code: ${referralCode}`
      });

      if (wingsError) {
        console.warn('Failed to award welcome bonus:', wingsError);
      }

      console.log('✅ Referral signup processed successfully');
      return { success: true, data: referralData, bonusAmount: welcomeBonus };

    } catch (error) {
      console.error('Error processing referral signup:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Complete referral (called when referee completes their first action)
  const completeReferral = useCallback(async (refereeId) => {
    try {
      console.log('🔄 Attempting to complete referral for referee:', refereeId);

      // Find pending referral for this referee
      const { data: referral, error: findError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_id', refereeId)
        .eq('status', 'pending')
        .single();

      if (findError || !referral) {
        console.log('No pending referral found for referee:', refereeId);
        return { success: false, message: 'No pending referral found' };
      }

      let referrerReward = 50; // WINGS for successful referral
      let refereeReward = 25;  // Additional WINGS for first action

      // Update referral as completed
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          referrer_reward_given: true,
          referee_reward_given: true,
          referrer_wings_earned: referrerReward,
          referee_wings_earned: (referral.referee_wings_earned || 0) + refereeReward
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      // Award WINGS to both users using RPC
      await Promise.all([
        // Referrer reward
        supabase.rpc('add_wings_to_user', {
          user_id_param: referral.referrer_id,
          wings_amount: referrerReward,
          activity_type_param: 'referral',
          description_param: `Referral completed - friend completed first scan`
        }),
        // Referee additional reward
        supabase.rpc('add_wings_to_user', {
          user_id_param: refereeId,
          wings_amount: refereeReward,
          activity_type_param: 'referral_bonus',
          description_param: `First scan bonus - referred user reward`
        })
      ]);

      // Update referrer's referral count
      await supabase
        .from('user_profiles')
        .update({
          total_referrals: supabase.raw('COALESCE(total_referrals, 0) + 1')
        })
        .eq('id', referral.referrer_id);

      console.log('✅ Referral completed successfully');
      return { success: true, referrerReward, refereeReward };

    } catch (error) {
      console.error('Error completing referral:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Generate referral link
  const generateReferralLink = useCallback((code) => {
    if (!code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${code}`;
  }, []);

  // Share referral
  const shareReferral = useCallback(async (code) => {
    const referralLink = generateReferralLink(code);
    
    let shareText = `Join me on Monarch Passport! 🦋\n\nEarn exclusive fashion rewards by scanning QR codes. Use my code: ${code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Monarch Passport',
          text: shareText,
          url: referralLink
        });
        return { success: true };
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Share failed:', error);
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
      return { success: true, copied: true };
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return { success: false, link: referralLink };
    }
  }, [generateReferralLink]);

  // Initialize
  useEffect(() => {
    console.log('🔧 useReferrals useEffect triggered, user:', user?.id);
    
    // Prevent unnecessary re-runs for the same user
    if (user?.id === lastUserRef.current) {
      console.log('🔄 Same user, skipping initialization');
      return;
    }
    
    lastUserRef.current = user?.id;
    
    if (user) {
      console.log('✅ User found, calling ensureReferralCode...');
      ensureReferralCode();
      loadReferralStats();
      loadReferralHistory();
    } else {
      console.log('❌ No user found, resetting referral state');
      setReferralCode(null);
      setReferralStats({
        totalReferrals: 0,
        pendingReferrals: 0,
        completedReferrals: 0,
        totalWingsEarned: 0
      });
      setReferralHistory([]);
      setLoading(false);
      setReferralLoading(false);
      hasInitializedRef.current = false; // Reset for next user
      isProcessingRef.current = false; // Reset for next user
    }
  }, [user, ensureReferralCode]); // Only depend on user, not the callback functions

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (setReferralCodeTimeoutRef.current) {
        clearTimeout(setReferralCodeTimeoutRef.current);
      }
    };
  }, []);

  return {
    referralCode,
    referralStats,
    referralHistory,
    loading,
    referralLoading,
    setReferralLoading,
    error,
    processReferralSignup,
    completeReferral,
    generateReferralLink,
    shareReferral,
    refreshData: () => {
      loadReferralStats();
      loadReferralHistory();
    }
  };
};