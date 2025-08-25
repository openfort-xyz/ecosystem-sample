"use client";

import { ExternalLink } from "lucide-react";
import { Logo } from "../Logo";

export function Header() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl md:text-3xl font-mono flex items-center gap-2">
        <a 
          href="https://www.npmjs.com/package/@rapidfire/id" 
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <span>Demo</span>
        </a>
      </h1>
      <p className="text-muted-foreground font-medium text-sm md:text-base">
        {`Rapidfire ID is a demo wallet created with `}
        <span className="flex items-center">
          <Logo className="inline-block h-6 mr-2" />
          <span className="flex items-center font-bold hover:underline">
            <a key={'openfort-documentation'} href={'https://www.openfort.io/docs/products/cross-app-wallet'} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Ecosystem SDK
            </a>
            <ExternalLink className="w-3 h-3 ml-1 text-muted-foreground" /> 
          </span>
        </span>
        <br/>
        {`It's a powerful cross-app wallet with simple UX.`}
      </p>
    </div>
  );
}