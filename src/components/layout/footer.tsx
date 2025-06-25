'use client';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-3 text-sm text-muted-foreground">
          {/* Creator */}
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

          {/* Copyright */}
          <div className="text-center">
            <span>© 2025 TransPic. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}