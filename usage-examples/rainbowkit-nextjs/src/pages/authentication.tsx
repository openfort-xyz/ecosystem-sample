import React from "react";
import { NextPage } from "next";
import LoginSignupForm from "../components/Authentication/LoginSignupForm";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

const HomePage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if(user) router.push('/')

  return <LoginSignupForm />;
};

export default HomePage;
