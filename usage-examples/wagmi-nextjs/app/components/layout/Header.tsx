"use client";

import { RapidFireLogo } from "../ui/rapid-fire-logo";

export function Header() {
  return (
    <div className="text-center space-y-4 mb-8 md:mb-12">
      <h1 className="text-3xl md:text-4xl font-mono flex items-center justify-center gap-2">
        <RapidFireLogo className="w-8 h-8 md:w-10 md:h-10 text-orange-500" /> 
        <a 
          href="https://www.npmjs.com/package/@rapidfire/id" 
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text group-hover:underline relative">
            <span className="group-hover:hidden">Rapidfire ID example</span>
            <span className="hidden group-hover:inline">@rapidfire/id on NPM</span>
            </span>
        </a>
      </h1>
      <p className="text-orange-200 font-medium text-sm md:text-base px-4">
        {`Rapidfire ID is a demo wallet created with the `}
        <a key={'openfort-documentation'} href={'https://www.openfort.xyz/docs/guides/ecosystem'} 
          target="_blank" 
          className="underline"
          rel="noopener noreferrer"
        >
            Ecosystem SDK.
        </a>
        <br/>
        {`It's a powerful cross-app wallet with simple UX.`}
      </p>
      <p className="text-gray-400 text-sm md:text-base px-4">
        Get started by editing <code className="text-gray-300">src/app/page.tsx</code>
      </p>
    </div>
  );
}