export const getSocialShareTemplate = (referralCode, platform = 'instagram') => {
  const templates = {
    instagram: {
      text: `🦋 Just joined Monarch Passport!\n\nIt's like Pokemon GO but for fashion - scan QR codes on clothing to collect digital rewards!\n\nUse my code: ${referralCode}\n\n#MonarchPassport #DigitalFashion #QRCollecting`,
      hashtags: ['MonarchPassport', 'DigitalFashion', 'QRCollecting', 'FashionTech']
    },
    twitter: {
      text: `🦋 Just discovered @MonarchPassport - it's like Pokemon GO but for fashion!\n\nScan QR codes to collect digital rewards. Use my referral code: ${referralCode}\n\n#MonarchPassport #DigitalFashion`,
      hashtags: ['MonarchPassport', 'DigitalFashion']
    },
    general: {
      text: `Join me on Monarch Passport! 🦋\n\nIt's an innovative app where you scan QR codes on clothing to collect digital rewards and earn WINGS.\n\nUse my referral code: ${referralCode}\n\nYou'll get 25 WINGS for joining + 25 more for your first scan!`,
      hashtags: []
    }
  };

  return templates[platform] || templates.general;
};



export const getShareMessageForPlatform = (referralCode, platform) => {
  return getSocialShareTemplate(referralCode, platform);
};

export const generateShareLink = (referralCode, baseUrl = window.location.origin) => {
  return `${baseUrl}/join/${referralCode}`;
};

export const createInstagramStoryContent = (referralCode, userName) => {
  const baseMessage = getSocialShareTemplate(referralCode, 'instagram');
  
  return {
    text: baseMessage.text,
    backgroundGradient: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 50%, #9D4EDD 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FFD700',
    userName: userName,
    link: generateShareLink(referralCode)
  };
}; 