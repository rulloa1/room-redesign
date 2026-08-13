function VapiDemo() {
  const startDemo = () => {
    window.alert(
      "The AI voice demo is not configured for public use. Please contact Royal Solutions to schedule a secure demonstration.",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 to-primary py-20 px-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-primary-foreground mb-6">
          Experience AI-Powered Lead Qualification
        </h1>
        <p className="text-xl text-primary-foreground/80 mb-8">
          The public voice demo is currently unavailable while we complete secure deployment controls.
        </p>
        <button
          onClick={startDemo}
          className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-10 py-5 rounded-full text-xl font-bold hover:from-accent/90 hover:to-accent/70 transform hover:scale-105 transition-all shadow-2xl"
        >
          Request a Secure Demo
        </button>
        <p className="text-primary-foreground/60 mt-6 text-sm">
          Contact Royal Solutions to discuss an authenticated demonstration.
        </p>
      </div>
    </div>
  );
}

export default VapiDemo;
