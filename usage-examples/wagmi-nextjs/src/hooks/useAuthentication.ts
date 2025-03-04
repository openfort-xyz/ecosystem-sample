import { authService } from '../services/authService';

export const useAuthentication = () => {
  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  return { signIn, signUp, signInWithGoogle, logout };
};
