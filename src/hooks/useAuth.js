import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => useContext(AuthContext);
