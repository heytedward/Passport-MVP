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
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastUserRef = useRef(null);
  const setReferralCodeTimeoutRef = useRef(null);

  // Birthday launch bonus configuration
  const BIRTHDAY_LAUNCH = {
    startDate: '2025-09-07',
    endDate: '2025-09-14',
    bonusMultiplier: 2
  };

  const isBirthdayLaunch = () => {
    const now = new Date();
    const start = new Date(BIRTHDAY_LAUNCH.startDate);
    const end = new Date(BIRTHDAY_LAUNCH.endDate);
    return now >= start && now <= end;
  };

  // Generate referral code from username/email
  const generateReferralCode = useCallback((user) => {
    if (!user) return null;
    
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortCode = cleanUsername.substring(0, 6);
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    
    return `${shortCode}${randomSuffix}`.toUpperCase();
  }, []);

  // Create or get existing referral code
  const ensureReferralCode = useCallback(async () => {
    if (!user) {
      console.log('❌ ensureReferralCode: No user provided');
      return null;
    }

    // Prevent multiple simultaneous calls
    if (referralCode) {
      console.log('✅ Referral code already exists:', referralCode);
      return referralCode;
    }

    // Prevent multiple initialization attempts
    if (hasInitializedRef.current) {
      console.log('🔄 ensureReferralCode: Already initialized, skipping');
      return referralCode;
    }

    // Prevent concurrent processing
    if (isProcessingRef.current) {
      console.log('🔄 ensureReferralCode: Already processing, skipping');
      return referralCode;
    }

    isProcessingRef.current = true;
    hasInitializedRef.current = true;
    console.log('🔧 ensureReferralCode: Starting for user:', user.id);

    // Set a timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Referral code generation timeout')), 10000)
    );

    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('⚠️ Supabase environment variables not configured, generating fallback code');
        const fallbackCode = generateReferralCode(user);
        setReferralCode(fallbackCode);
        return fallbackCode;
      }

      console.log('🔍 Checking for existing referral code...');
      
      // Race between the database query and timeout
      const queryPromise = supabase
        .from('referral_codes')
        .select('referral_code')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      const { data: existingCode, error: fetchError } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('📊 Existing code query result:', { existingCode, fetchError });

      if (existingCode) {
        console.log('✅ Found existing referral code:', existingCode.referral_code);
        // Clear any pending timeout
        if (setReferralCodeTimeoutRef.current) {
          clearTimeout(setReferralCodeTimeoutRef.current);
        }
        // Set code immediately if it's different
        if (referralCode !== existingCode.referral_code) {
          setReferralCode(existingCode.referral_code);
        }
        return existingCode.referral_code;
      }

      console.log('🆕 No existing code found, generating new one...');
      // Create new referral code
      let attempts = 0;
      let newCode;
      let created = false;

      while (!created && attempts < 5) {
        newCode = generateReferralCode(user);
        console.log(`🎲 Attempt ${attempts + 1}: Generated code ${newCode}`);
        
        const insertPromise = supabase
          .from('referral_codes')
          .insert([{ user_id: user.id, referral_code: newCode }])
          .select('referral_code')
          .single();

        const { data: createdCode, error: createError } = await Promise.race([insertPromise, timeoutPromise]);

        console.log('💾 Insert result:', { createdCode, createError });

        if (!createError) {
          console.log('✅ Successfully created referral code:', createdCode.referral_code);
          // Clear any pending timeout
          if (setReferralCodeTimeoutRef.current) {
            clearTimeout(setReferralCodeTimeoutRef.current);
          }
          // Set code immediately if it's different
          if (referralCode !== createdCode.referral_code) {
            setReferralCode(createdCode.referral_code);
          }
          return createdCode.referral_code;
        } else if (createError.code === '23505') {
          // Code already exists, try again
          console.log('⚠️ Code collision, trying again...');
          attempts++;
        } else {
          throw createError;
        }
      }

      throw new Error('Failed to generate unique referral code');

    } catch (error) {
      console.error('❌ Error ensuring referral code:', error);
      setError(error.message);
      
      // If it's a timeout, try to generate a fallback code
      if (error.message.includes('timeout')) {
        console.log('⏰ Timeout occurred, generating fallback code');
        const fallbackCode = generateReferralCode(user);
        setReferralCode(fallbackCode);
        return fallbackCode;
      }
      
      return null;
    } finally {
      isProcessingRef.current = false;
    }
  }, [user, generateReferralCode]);

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

      // Apply birthday launch bonus
      if (isBirthdayLaunch()) {
        welcomeBonus *= BIRTHDAY_LAUNCH.bonusMultiplier;
      }

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
        description_param: `Welcome bonus for joining via referral code: ${referralCode}${isBirthdayLaunch() ? ' (Birthday Launch 2x Bonus!)' : ''}`
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

      // Apply birthday launch bonus
      if (isBirthdayLaunch()) {
        referrerReward *= BIRTHDAY_LAUNCH.bonusMultiplier;
        refereeReward *= BIRTHDAY_LAUNCH.bonusMultiplier;
      }

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

      const birthdayBonus = isBirthdayLaunch() ? ' (Birthday Launch 2x Bonus!)' : '';

      // Award WINGS to both users using RPC
      await Promise.all([
        // Referrer reward
        supabase.rpc('add_wings_to_user', {
          user_id_param: referral.referrer_id,
          wings_amount: referrerReward,
          activity_type_param: 'referral',
          description_param: `Referral completed - friend completed first scan${birthdayBonus}`
        }),
        // Referee additional reward
        supabase.rpc('add_wings_to_user', {
          user_id_param: refereeId,
          wings_amount: refereeReward,
          activity_type_param: 'referral_bonus',
          description_param: `First scan bonus - referred user reward${birthdayBonus}`
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
    
    // Add birthday launch messaging
    if (isBirthdayLaunch()) {
      shareText = `🎂 IT'S MONARCH PASSPORT'S BIRTHDAY WEEK! 🦋\n\nJoin the celebration with DOUBLE REFERRAL REWARDS!\n\n✨ 50 WINGS for joining (normally 25)\n🎁 50 more for first scan (normally 25)\n👑 I get 100 WINGS when you scan (normally 50)\n\nUse code: ${code}\n\nBirthday bonuses end Sept 14th!`;
    }

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
      hasInitializedRef.current = false; // Reset for next user
      isProcessingRef.current = false; // Reset for next user
    }
  }, [user]); // Only depend on user, not the callback functions

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
    error,
    processReferralSignup,
    completeReferral,
    generateReferralLink,
    shareReferral,
    isBirthdayLaunch: isBirthdayLaunch(),
    refreshData: () => {
      loadReferralStats();
      loadReferralHistory();
    }
  };
}; 