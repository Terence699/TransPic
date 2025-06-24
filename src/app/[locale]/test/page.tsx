'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Loading } from '@/components/ui/loading';
import { Progress } from '@/components/ui/progress';

export default function TestPage() {
  const { addToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const testToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} toast message for testing purposes.`,
    });
  };

  const testProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const testLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Component Test Page</h1>
        
        <div className="space-y-8">
          {/* Button Tests */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>

          {/* Toast Tests */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => testToast('success')} variant="outline">
                Success Toast
              </Button>
              <Button onClick={() => testToast('error')} variant="outline">
                Error Toast
              </Button>
              <Button onClick={() => testToast('warning')} variant="outline">
                Warning Toast
              </Button>
              <Button onClick={() => testToast('info')} variant="outline">
                Info Toast
              </Button>
            </div>
          </section>

          {/* Loading Tests */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={testLoading} disabled={isLoading}>
                  Test Loading (3s)
                </Button>
                {isLoading && <Loading text="Loading..." />}
              </div>
              
              <div className="space-y-2">
                <Loading size="sm" text="Small loading" />
                <Loading size="md" text="Medium loading" />
                <Loading size="lg" text="Large loading" />
              </div>
            </div>
          </section>

          {/* Progress Tests */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Progress</h2>
            <div className="space-y-4">
              <Button onClick={testProgress}>Test Progress</Button>
              <Progress value={progress} showPercentage />
              <Progress value={75} showPercentage />
              <Progress value={50} />
            </div>
          </section>

          {/* Theme Test */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Theme Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded">Primary</div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded">Secondary</div>
              <div className="p-4 bg-muted text-muted-foreground rounded">Muted</div>
              <div className="p-4 bg-accent text-accent-foreground rounded">Accent</div>
              <div className="p-4 bg-destructive text-destructive-foreground rounded">Destructive</div>
              <div className="p-4 bg-card text-card-foreground border rounded">Card</div>
              <div className="p-4 bg-popover text-popover-foreground border rounded">Popover</div>
              <div className="p-4 bg-background text-foreground border rounded">Background</div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
