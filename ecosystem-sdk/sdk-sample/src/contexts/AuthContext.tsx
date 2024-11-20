import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from "react";
import { authService } from "../services/authService";
import { User } from "firebase/auth";
import { ecosystemWalletInstance } from "../utils/ecosystemWallet"; 

interface AuthContextType {
  user: User | null;
  idToken: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    return authService.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        setIdToken(null);
        return;
      }
      const token = await user.getIdToken();
      setUser(user);
      setIdToken(token);
      console.log(`[token changed] updating token with openfort`);
      const response = await ecosystemWalletInstance.authenticate(token);
      if('redirect_url' in response) {
        window.location.href = response.redirect_url;
      }
    });
  }, []);

  useEffect(() => {
    const handle = setInterval(async () => {
      if (user) {
        const token = await user.getIdToken(true);
        setIdToken(token);
        console.log(`[refreshed token] updating token with openfort`);
        await ecosystemWalletInstance.authenticate(token);
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={{ user, idToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
