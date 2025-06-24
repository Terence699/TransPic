'use client';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-sm text-muted-foreground">
          {/* Left side */}
          <div className="flex items-center space-x-1">
            <span>Built by</span>
            <a
              href="https://yifuyuantech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors duration-200 relative group"
            >
              Yifu Yuan
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </a>
          </div>

          {/* Center */}
          <div className="flex items-center space-x-4">
            <span>100% Client-side Processing</span>
            <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
            <span>No Data Collection</span>
          </div>

          {/* Right side */}
          <div>
            <span>© 2025 TransPic. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}