"use client";

import { Card } from '../ui/card';

export function InstallInstructions() {

  return (
    <div className="space-y-4">
      <h3 className="inline-block text-muted-foreground text-xs font-medium bg-transparent/50 rounded-full p-2">Install Rapidfire ID</h3>
      {/* Code snippet card */}
      <Card className="bg-card border border-border p-0 overflow-hidden">
        <div className="bg-muted/50 p-2 text-sm font-mono">
          <div className="flex items-center gap-2 text-foreground">
            <span className='text-muted-foreground'>{'>'}</span>
            <span className='font-bold'>npm i @rapidfire/id</span>
          </div>
        </div>
      </Card>
      
      <Card className="bg-card border border-border p-0 overflow-hidden">
        <div className="bg-muted/50 p-2 text-sm font-mono">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">1</span>
              <span className='font-bold'>import Wallet from &apos;@rapidfire/id&apos;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">2</span>
              <span className='font-bold'>Wallet.<span className="text-primary">getEthereumProvider</span>()</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
