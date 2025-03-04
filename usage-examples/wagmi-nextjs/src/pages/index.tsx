'use client';

import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useAccount } from 'wagmi';
import { Actions } from "../components/Actions/Actions";
import { ConnectorsList } from "../components/ConnectorsList";

const HomePage: NextPage = () => {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
        <div className="absolute top-2 right-2">
        </div>
        <ConnectorsList />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
      <div className="absolute top-2 right-2">
      </div>
      <Actions />
    </div>
  );
};

export default HomePage;