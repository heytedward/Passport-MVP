import { supabase } from './supabaseClient';

export const testStorageConnection = async () => {
  try {
    console.log('🔍 Testing Supabase storage connection...');
    
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return { success: false, error: bucketsError.message };
    }
    
    console.log('✅ Buckets found:', buckets?.map(b => b.name) || []);
    
    // Test 2: Check if avatars bucket exists
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.log('⚠️ Avatars bucket not found, attempting to create...');
      
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Error creating avatars bucket:', createError);
        return { success: false, error: `Failed to create bucket: ${createError.message}` };
      }
      
      console.log('✅ Avatars bucket created successfully');
    } else {
      console.log('✅ Avatars bucket exists');
    }
    
    // Test 3: Try to list files in avatars bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (filesError) {
      console.error('❌ Error listing files in avatars bucket:', filesError);
      return { success: false, error: `Storage permission error: ${filesError.message}` };
    }
    
    console.log('✅ Can list files in avatars bucket:', files?.length || 0, 'files');
    
    return { success: true, message: 'Storage connection working properly' };
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return { success: false, error: error.message };
  }
};

export const checkStoragePolicies = async () => {
  try {
    console.log('🔍 Checking storage policies...');
    
    // This would require admin access to check policies
    // For now, we'll test by trying to upload a small test file
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`test/${testFileName}`, testBlob, {
        cacheControl: '0',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return { success: false, error: uploadError.message };
    }
    
    // Clean up test file
    await supabase.storage
      .from('avatars')
      .remove([`test/${testFileName}`]);
    
    console.log('✅ Storage policies working correctly');
    return { success: true, message: 'Storage policies working' };
    
  } catch (error) {
    console.error('❌ Policy check failed:', error);
    return { success: false, error: error.message };
  }
}; 