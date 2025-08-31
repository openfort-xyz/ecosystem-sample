"use client";

export function Header() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-3xl md:text-3xl font-mono">
        <a 
          href="https://www.onetap.io" 
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
         Onetap Demo
        </a>
      </h1>
      <p className="text-muted-foreground font-medium text-sm md:text-base">
        {`Onetap is a modern, one-click solution to unlock onchain payments and subscriptions.`}
      </p>
    </div>
  );
}