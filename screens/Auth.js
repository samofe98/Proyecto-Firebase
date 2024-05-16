import { getAuth } from 'firebase/auth';
import { appFirebase } from '../firebase';

const Auth = getAuth(appFirebase);

export const useAuth = () => {
  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      throw error;
    }
  };

  return {
    signOut
  };
};