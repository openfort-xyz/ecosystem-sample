import { Layout } from '@openfort/ecosystem-js/react';
import React from 'react';

const Loading: React.FC = () => {
  return (
    <Layout>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="animate-spin"
      >
        <circle 
          cx="25" 
          cy="25" 
          r="20" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
      
      {/* Adding custom styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `
        }}
      />
    </Layout>
  );
};

export default Loading;