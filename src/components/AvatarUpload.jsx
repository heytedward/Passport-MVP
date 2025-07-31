import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 3px solid #FFB000;
  box-shadow: 0 0 20px rgba(255, 176, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 176, 0, 0.5);
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #FFB000;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFB000;
  font-size: 1.5rem;
  border-radius: 50%;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #FFB000, #FF8C00);
  color: #1a1a2e;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 176, 0, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 176, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.3);
`;

const SuccessMessage = styled.div`
  color: #51cf66;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(81, 207, 102, 0.3);
`;

const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  onAvatarUpdate, 
  size = 120,
  showButton = true 
}) => {
  const [avatar, setAvatar] = useState(currentAvatarUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    setAvatar(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const validateFile = (file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a JPEG, PNG, or WebP image');
    }

    return true;
  };

  const uploadAvatar = async (file) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Add timeout to prevent stuck loading state
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout - please try again')), 30000); // Increased to 30 seconds
      });

      // Validate file
      validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('Starting avatar upload...', { fileName, filePath });

      // Upload to Supabase storage with timeout
      const uploadPromise = (async () => {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true // Overwrite if exists
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('Avatar uploaded successfully:', data.publicUrl);

        // Update user profile with new avatar URL (create if doesn't exist)
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({ 
            id: userId,
            avatar_url: data.publicUrl,
            email: (await supabase.auth.getUser()).data.user?.email,
            username: (await supabase.auth.getUser()).data.user?.user_metadata?.username || (await supabase.auth.getUser()).data.user?.email,
            display_name: (await supabase.auth.getUser()).data.user?.user_metadata?.username || (await supabase.auth.getUser()).data.user?.email,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error('Profile update error:', updateError);
          // Provide more specific error message based on the error type
          if (updateError.code === '42501') {
            throw new Error('Permission denied - please contact support');
          } else if (updateError.code === '23505') {
            throw new Error('Profile already exists - please try again');
          } else {
            throw new Error(`Failed to update profile: ${updateError.message}`);
          }
        }

        return data.publicUrl;
      })();

      const publicUrl = await Promise.race([uploadPromise, timeoutPromise]);

      // Update local state
      setAvatar(publicUrl);
      setSuccess('Profile picture updated successfully! 🦋');

      // Call callback if provided
      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Avatar upload error:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <AvatarContainer>
      <AvatarWrapper style={{ width: size, height: size }}>
        {avatar ? (
          <AvatarImage 
            src={avatar} 
            alt="User avatar" 
            onError={() => setAvatar(null)}
          />
        ) : (
          <AvatarPlaceholder>🦋</AvatarPlaceholder>
        )}
        
        {isLoading && (
          <LoadingOverlay>
            ⏳
          </LoadingOverlay>
        )}
      </AvatarWrapper>

      {showButton && (
        <UploadButton 
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Change Picture'}
        </UploadButton>
      )}

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </AvatarContainer>
  );
};

export default AvatarUpload; 