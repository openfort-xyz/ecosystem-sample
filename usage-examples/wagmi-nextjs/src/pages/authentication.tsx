import React from "react";
import { NextPage } from "next";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { useAccount, useConnect } from "wagmi";
import { ecosystemWalletInstance } from "@/src/utils/ecosystemWallet";
import LoginSignupForm from "../components/Authentication/LoginSignupForm";

const AuthenticationPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { address, status } = useAccount();
  const { connectors, connect } = useConnect();

  const connectWallet = React.useCallback(() => {
    const injectedConnector = connectors.find(
      (connector) => connector.id === 'com.rapidfire.id'
    );
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connectors, connect]);

  React.useEffect(() => {
    const handleAuthentication = async () => {
      if(status === "disconnected" && user) {
        const idToken = await user.getIdToken();
        await ecosystemWalletInstance.authenticate(idToken);
        connectWallet()
      }
      if(status === "connected") {
        router.push('/');
      }
    };

    handleAuthentication();
  }, [user, status, address, router]);

  return <LoginSignupForm />;
};

export default AuthenticationPage;
