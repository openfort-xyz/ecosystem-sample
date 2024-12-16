import React from "react";
import { NextPage } from "next";
import LogoutButton from "../components/Shared/LogoutButton";
import { useAuth } from "../contexts/AuthContext";
import { useAccount } from 'wagmi';
import { Actions } from "../components/Actions/Actions";
import { ConnectorsList } from "../components/ConnectorsList";

const HomePage: NextPage = () => {
  const { isConnected } = useAccount();
  const { user } = useAuth();
  if (!isConnected) return  (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
      <div className="absolute top-2 right-2">
        {user && <LogoutButton />}
      </div>
      <ConnectorsList />
    </div>
  )
      

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
      <div className="absolute top-2 right-2">
        <LogoutButton />
      </div>
      <Actions />
    </div>
  );
};

export default HomePage;
