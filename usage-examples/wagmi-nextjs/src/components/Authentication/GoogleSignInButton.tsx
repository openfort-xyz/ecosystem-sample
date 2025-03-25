import React from "react";
import { useAuthentication } from "../../hooks/useAuthentication";
import { ecosystemWalletInstance } from "@/src/utils/ecosystemWallet";

const GoogleSignInButton: React.FC<{connectWallet: ()=>void}> = ({connectWallet}) => {
  const { signInWithGoogle } = useAuthentication();

  const handleSignInWithGoogle = async () => {
    try {
      const authCredential = await signInWithGoogle();
      const idToken = await authCredential.user.getIdToken();
      await ecosystemWalletInstance.authenticate(idToken);
      connectWallet();
    }
    catch (error) {
      console.error("Failed to sign in with Google:", error);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <button
      onClick={handleSignInWithGoogle}
      className="w-full p-2 border border-gray-300 rounded hover:bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50"
    >
      Continue with Google
    </button>
  );
};

export default GoogleSignInButton;
