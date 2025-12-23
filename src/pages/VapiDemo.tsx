import { useEffect } from 'react';

declare global {
  interface Window {
    Vapi: new (apiKey: string) => {
      start: (assistantId: string) => void;
    };
  }
}

function VapiDemo() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const startDemo = () => {
    if (window.Vapi) {
      const vapi = new window.Vapi('896a35f2-1d18-467d-ad8d-234277064884');
      vapi.start('6a789161-3269-44a4-b637-06a1afbaf833');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 to-primary py-20 px-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-primary-foreground mb-6">
          Experience AI-Powered Lead Qualification
        </h1>
        <p className="text-xl text-primary-foreground/80 mb-8">
          Talk to our AI agent demo and discover how Royal Solutions can transform your business with intelligent automation
        </p>
        <button 
          onClick={startDemo}
          className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-10 py-5 rounded-full text-xl font-bold hover:from-accent/90 hover:to-accent/70 transform hover:scale-105 transition-all shadow-2xl"
        >
          👑 Try Our AI Agent Demo
        </button>
        <p className="text-primary-foreground/60 mt-6 text-sm">
          Click to start a live conversation • No signup required
        </p>
      </div>
    </div>
  );
}

export default VapiDemo;
