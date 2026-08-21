// Token Helper Utility

export const getAuthToken = (): string | null => {
  // Check both possible token names
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No token found. Please login.');
    return null;
  }
  
  // Check token format
  if (!token.startsWith('eyJ')) {
    console.error('❌ Invalid token format');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    return null;
  }
  
  return token;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }
  
  try {
    // Decode JWT token (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Add 5 minute buffer to prevent false expiry
    if (now >= (exp + 300000)) {
      console.error('❌ Token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    // If we can't decode, assume it's valid and let backend decide
    console.warn('⚠️ Could not decode token, assuming valid');
    return true;
  }
};

export const getUserRole = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isTeacher = (): boolean => {
  return getUserRole() === 'teacher';
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('✅ Auth cleared. Please login again.');
};

export const debugToken = (): void => {
  console.log('=== TOKEN DEBUG ===');
  
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  
  if (token) {
    console.log('2. Token format valid:', token.startsWith('eyJ'));
    console.log('3. Token length:', token.length);
    console.log('4. Token valid:', isTokenValid());
  }
  
  const role = getUserRole();
  console.log('5. User role:', role);
  console.log('6. Is teacher:', isTeacher());
  
  if (!token) {
    console.log('❌ Solution: Please login');
  } else if (!isTokenValid()) {
    console.log('❌ Solution: Token expired. Logout and login again');
  } else if (!isTeacher()) {
    console.log('❌ Solution: Need teacher account to upload videos');
  } else {
    console.log('✅ Everything looks good!');
  }
};

// Make debugToken available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugToken = debugToken;
}
