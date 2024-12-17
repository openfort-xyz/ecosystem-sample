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
      ecosystemWalletInstance.authenticate(token);
    });
  }, []);

  useEffect(() => {
    const handle = setInterval(async () => {
      if (user) {
        // firebase tokens are bearer tokens, i.e. they are only invalid after they expire.
        // here we issue a new token every 10 minutes to keep the token valid.
        const token = await user.getIdToken(true);
        setIdToken(token);
        console.log(`[refreshed token] updating token with openfort`);
        ecosystemWalletInstance.authenticate(token);
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
