import React from "react";
import { NextPage } from "next";
import LoginSignupForm from "../components/Authentication/LoginSignupForm";
import LogoutButton from "../components/Shared/LogoutButton";
import { useAuth } from "../contexts/AuthContext";
import { useAccount } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import { Actions } from "../components/Actions/Actions";

const HomePage: NextPage = () => {
  const { user } = useAuth();
  const { isConnected } = useAccount();

  if (!user) return <LoginSignupForm />;
  if (!isConnected) return  (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
      <p className="text-gray-400 mb-2">Welcome, {user.email}!</p>
      <div className="absolute top-2 right-2">
        <LogoutButton />
      </div>
      <ConnectKitButton />
    </div>
  )
      

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
      <p className="text-gray-400 mb-2">Welcome, {user.email}!</p>
      <div className="absolute top-2 right-2">
        <LogoutButton />
      </div>
      <Actions />
    </div>
  );
};

export default HomePage;
