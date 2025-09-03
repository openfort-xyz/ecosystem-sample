"use client";

import { Button } from "../ui/button";
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { ecosystemWalletInstance } from "@/app/utils/ecosystemWallet";
import { LogOut, Copy, Check } from "lucide-react";
import { Card } from "../ui/card";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncateAddress } from "@/lib/wallet";
import { ConnectKitButton } from "connectkit";

export function WalletConnect() {
  const [copied, setCopied] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'wagmi' | 'connectkit' | 'rainbowkit'>('wagmi');
  
  useEffect(() => {
    ecosystemWalletInstance.getEthereumProvider({
      policy: process.env.NEXT_PUBLIC_POLICY_ID,
    });
  }, []);
  const chainId = useChainId();
  const { address, isConnected, connector, chain: accountChain, status } = useAccount();
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (status ==="connected" && accountChain?.id !== chainId) {
      switchChain({chainId: chainId})
    }
  }, [status]);
  const { connectors, connect, error } = useConnect();
  const { disconnect } = useDisconnect();
  
  const connectWallet = useCallback(() => {
    const injectedConnector = connectors.find(
      (connector) => connector.id === 'com.rapidfire.id'
    );
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connectors, connect]);
  
  const handleDisconnectWallet = useCallback(async() => {
    disconnect();
    const provider = await connector?.getProvider();
    (provider as any).disconnect(); // this is needed because wagmi isn't calling the providers disconnect method
    location.reload();
  }, [disconnect, connector]);

  const copyToClipboard = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-start space-y-2">
        <h3 className="inline-block text-muted-foreground text-xs font-medium bg-transparent/50 rounded-full p-2">Select your provider</h3>
        <p className="text-muted-foreground font-medium text-sm md:text-base">
        {`Preview how it integrates with your existing wallet providers.`}
        </p>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2">
            
            <Button
              variant="outline"
              className={`flex-1 font-medium justify-start rounded-full ${selectedWallet === 'wagmi' ? 'bg-muted/50 border-border' : ''}`}
              onClick={() => setSelectedWallet('wagmi')}
            >
              <WagmiLogo />
              Wagmi
            </Button>
            
            <Button 
              variant="outline"
              className={`flex-1 justify-start rounded-full ${selectedWallet === 'connectkit' ? 'bg-muted/50 border-border' : ''}`}
              onClick={() => setSelectedWallet('connectkit')}
            >
              <ConnectKitLogo />
              ConnectKit
            </Button>

            <Button 
              variant="outline"
              className={`flex-1 justify-start rounded-full hidden md:flex ${selectedWallet === 'rainbowkit' ? 'bg-muted/50 border-border' : ''}`}
              onClick={() => setSelectedWallet('rainbowkit')}
            >
              <RainbowLogo />
              RainbowKit
            </Button>
          </div>
          
          {selectedWallet === 'wagmi' ? (
            <div className='flex'>
              <Button
                onClick={connectWallet}
                className="inline-flex font-bold items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm px-6 py-5"
              >
                Sign in
              </Button>
            </div>
          ) : (
            <div className="w-full">
              {selectedWallet === 'connectkit' ? (
                <ConnectKitButton />
              ) : (
                <div className="hidden md:block">
                  <ConnectButton />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0">
      {address && (
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="w-full font-mono text-sm text-muted-foreground break-all px-3 py-2 rounded-lg flex justify-between items-center bg-muted/20 hover:bg-muted/30 h-auto"
          >
            <a
            href={accountChain?.blockExplorers?.default.url + '/address/' + address}
            target="_blank"
            rel="noopener noreferrer"
            className=" truncate text-primary hover:text-primary/80 hover:underline cursor-pointer text-sm"
            >
              {truncateAddress(address)}
            </a>
            {copied ? (
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDisconnectWallet}
            className="flex items-center justify-center gap-2 rounded-lg"
            size="sm"
          >
            <LogOut className="w-3 h-3" /> Log out
          </Button>
        </div>
      )}
    </Card>
  );
}


function WagmiLogo() {
  return (
    <svg
      aria-hidden="true"
      className="text-[#1B1B1B] dark:text-white w-6 mr-2"
      fill="none"
      height="auto"
      viewBox="0 0 24 11"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M2.67052 6.6763C2.67052 7.41374 3.26834 8.01156 4.00578 8.01156H6.6763C7.41374 8.01156 8.01156 7.41374 8.01156 6.6763L8.01156 1.33526C8.01156 0.597817 8.60938 0 9.34682 0C10.0843 0 10.6821 0.597816 10.6821 1.33526V6.6763C10.6821 7.41374 11.2799 8.01156 12.0173 8.01156H14.6879C15.4253 8.01156 16.0231 7.41374 16.0231 6.6763V1.33526C16.0231 0.597816 16.6209 0 17.3584 0C18.0958 0 18.6936 0.597817 18.6936 1.33526V9.34682C18.6936 10.0843 18.0958 10.6821 17.3584 10.6821H1.33526C0.597816 10.6821 0 10.0843 0 9.34682L4.76837e-07 1.33526C5.21541e-07 0.597817 0.597817 0 1.33526 0C2.0727 0 2.67052 0.597816 2.67052 1.33526L2.67052 6.6763ZM21.6185 11C22.6018 11 23.3988 10.2029 23.3988 9.21965C23.3988 8.23639 22.6018 7.43931 21.6185 7.43931C20.6352 7.43931 19.8382 8.23639 19.8382 9.21965C19.8382 10.2029 20.6352 11 21.6185 11Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}

function ConnectKitLogo() {
  return (
    <svg
      aria-hidden="true"
      className="dark:text-white w-6 mr-2"
      fill="none"
      height="auto"
      viewBox="0 0 400 400"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2453_12901)">
        <path
          d="M400 67.2214C399.995 49.482 392.946 32.4706 380.402 19.9269C367.859 7.38321 350.847 0.334041 333.108 0.329055C300.663 -9.31323e-05 273.861 23.1814 267.212 53.6417H265.557C262.472 38.5604 254.283 25.0035 242.369 15.2553C230.456 5.50702 215.546 0.163361 200.153 0.124706C184.759 0.0860515 169.823 5.35476 157.861 15.0431C145.898 24.7314 137.641 38.247 134.481 53.3125H132.826C130.364 41.4247 124.722 30.4276 116.503 21.4935C108.283 12.5593 97.7934 6.02281 86.1515 2.58075C74.5096 -0.861307 62.1519 -1.07995 50.3955 1.94812C38.6392 4.97619 27.9247 11.1375 19.3942 19.7753C10.8637 28.4131 4.83689 39.2038 1.95605 50.9971C-0.924786 62.7904 -0.551646 75.1444 3.0357 86.7423C6.62305 98.3403 13.2902 108.747 22.3264 116.855C31.3627 124.962 42.4294 130.465 54.3471 132.778V134.104C39.0594 137.086 25.284 145.29 15.3803 157.311C5.4766 169.333 0.0609582 184.424 0.0609582 200C0.0609582 215.576 5.4766 230.667 15.3803 242.688C25.284 254.71 39.0594 262.914 54.3471 265.895V267.212C42.4173 269.479 31.328 274.946 22.2654 283.028C13.2027 291.111 6.50753 301.505 2.89594 313.098C-0.71565 324.692 -1.1078 337.049 1.76143 348.849C4.63066 360.648 10.6533 371.446 19.1853 380.087C27.7173 388.727 38.4376 394.886 50.1997 397.905C61.9618 400.923 74.3231 400.688 85.9617 397.224C97.6003 393.759 108.078 387.196 116.275 378.237C124.472 369.277 130.079 358.258 132.496 346.358H134.152C140.443 376.818 167.593 399.962 199.718 399.962C215.171 400.033 230.166 394.722 242.129 384.94C254.091 375.159 262.275 361.517 265.275 346.358H266.93C273.221 376.818 300.371 399.962 332.496 399.962C349.146 399.923 365.184 393.687 377.487 382.469C389.789 371.25 397.475 355.853 399.045 339.278C400.616 322.703 395.959 306.137 385.983 292.807C376.007 279.478 361.425 270.34 345.079 267.174V265.858C360.367 262.876 374.142 254.672 384.046 242.651C393.95 230.629 399.365 215.538 399.365 199.962C399.365 184.387 393.95 169.295 384.046 157.274C374.142 145.252 360.367 137.048 345.079 134.067V132.741C360.479 130.026 374.428 121.968 384.473 109.984C394.518 98.0004 400.016 82.8584 400 67.2214Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_2453_12901">
          <rect width="400" height="400" fill="black"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function RainbowLogo() {
  return (
    <svg
      aria-hidden="true"
      className="rounded-sm w-6 mr-2"
      fill="none"
      height="auto"
      viewBox="0 0 120 120"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M120 0H0V120H120V0Z" fill="url(#paint0_linear_681_14)" />
      <path
        d="M20 38H26C56.9279 38 82 63.0721 82 94V100H94C97.3137 100 100 97.3137 100 94C100 53.1309 66.8691 20 26 20C22.6863 20 20 22.6863 20 26V38Z"
        fill="url(#paint1_radial_681_14)"
      />
      <path
        d="M84 94H100C100 97.3137 97.3137 100 94 100H84V94Z"
        fill="url(#paint2_linear_681_14)"
      />
      <path
        d="M26 20V36H20V26C20 22.6863 22.6863 20 26 20Z"
        fill="url(#paint3_linear_681_14)"
      />
      <path
        d="M20 36H26C58.0325 36 84 61.9675 84 94V100H66V94C66 71.9086 48.0914 54 26 54H20V36Z"
        fill="url(#paint4_radial_681_14)"
      />
      <path d="M68 94H84V100H68V94Z" fill="url(#paint5_linear_681_14)" />
      <path d="M20 52V36H26V52H20Z" fill="url(#paint6_linear_681_14)" />
      <path
        d="M20 62C20 65.3137 22.6863 68 26 68C40.3594 68 52 79.6406 52 94C52 97.3137 54.6863 100 58 100H68V94C68 70.804 49.196 52 26 52H20V62Z"
        fill="url(#paint7_radial_681_14)"
      />
      <path
        d="M52 94H68V100H58C54.6863 100 52 97.3137 52 94Z"
        fill="url(#paint8_radial_681_14)"
      />
      <path
        d="M26 68C22.6863 68 20 65.3137 20 62V52H26V68Z"
        fill="url(#paint9_radial_681_14)"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_681_14"
          x1="60"
          x2="60"
          y1="0"
          y2="120"
        >
          <stop stopColor="#174299" />
          <stop offset="1" stopColor="#001E59" />
        </linearGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(26 94) rotate(-90) scale(74)"
          gradientUnits="userSpaceOnUse"
          id="paint1_radial_681_14"
          r="1"
        >
          <stop offset="0.770277" stopColor="#FF4000" />
          <stop offset="1" stopColor="#8754C9" />
        </radialGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_681_14"
          x1="83"
          x2="100"
          y1="97"
          y2="97"
        >
          <stop stopColor="#FF4000" />
          <stop offset="1" stopColor="#8754C9" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_681_14"
          x1="23"
          x2="23"
          y1="20"
          y2="37"
        >
          <stop stopColor="#8754C9" />
          <stop offset="1" stopColor="#FF4000" />
        </linearGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(26 94) rotate(-90) scale(58)"
          gradientUnits="userSpaceOnUse"
          id="paint4_radial_681_14"
          r="1"
        >
          <stop offset="0.723929" stopColor="#FFF700" />
          <stop offset="1" stopColor="#FF9901" />
        </radialGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_681_14"
          x1="68"
          x2="84"
          y1="97"
          y2="97"
        >
          <stop stopColor="#FFF700" />
          <stop offset="1" stopColor="#FF9901" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_681_14"
          x1="23"
          x2="23"
          y1="52"
          y2="36"
        >
          <stop stopColor="#FFF700" />
          <stop offset="1" stopColor="#FF9901" />
        </linearGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(26 94) rotate(-90) scale(42)"
          gradientUnits="userSpaceOnUse"
          id="paint7_radial_681_14"
          r="1"
        >
          <stop offset="0.59513" stopColor="#00AAFF" />
          <stop offset="1" stopColor="#01DA40" />
        </radialGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(51 97) scale(17 45.3333)"
          gradientUnits="userSpaceOnUse"
          id="paint8_radial_681_14"
          r="1"
        >
          <stop stopColor="#00AAFF" />
          <stop offset="1" stopColor="#01DA40" />
        </radialGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(23 69) rotate(-90) scale(17 322.37)"
          gradientUnits="userSpaceOnUse"
          id="paint9_radial_681_14"
          r="1"
        >
          <stop stopColor="#00AAFF" />
          <stop offset="1" stopColor="#01DA40" />
        </radialGradient>
      </defs>
    </svg>
  )
}
