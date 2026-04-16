export default function BlankPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blank Page Template</h1>
          <p className="text-muted-foreground mt-2">
            Use this page as a foundation for custom features
          </p>
        </div>
      </div>

      {/* Content Area - Ready for Customization */}
      <div className="min-h-[600px] border-2 border-dashed border-border rounded-lg p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-ai-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-ai-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Start Building</h2>
          <p className="text-muted-foreground max-w-md">
            This is your blank canvas. Add your custom components and features here.
          </p>
        </div>
      </div>
    </div>
  );
}
