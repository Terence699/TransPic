'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MainLayout } from '@/components/layout/main-layout';
import {
  ImageIcon,
  Maximize2,
  RefreshCw,
  Code2
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();

  const features = [
    {
      href: '/compress',
      icon: ImageIcon,
      title: t('home.features.compress.title'),
      description: t('home.features.compress.description'),
    },
    {
      href: '/resize',
      icon: Maximize2,
      title: t('home.features.resize.title'),
      description: t('home.features.resize.description'),
    },
    {
      href: '/convert',
      icon: RefreshCw,
      title: t('home.features.convert.title'),
      description: t('home.features.convert.description'),
    },
    {
      href: '/svg-editor',
      icon: Code2,
      title: t('home.features.svgEditor.title'),
      description: t('home.features.svgEditor.description'),
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        
        <div className="container mx-auto px-4 py-20 lg:py-32">
          {/* Hero Section */}
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in-up" 
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {t('home.title')}
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8 animate-fade-in-up delay-100 leading-relaxed" 
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {t('home.subtitle')}
            </p>
            <p 
              className="text-lg animate-fade-in-up delay-200"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {t('home.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
                style={{
                  backgroundColor: 'hsl(var(--card))',
                  animationDelay: `${(index + 3) * 100}ms`
                }}
              >
                {/* Card Hover Gradient Border/Glow effect could go here */}
                
                <div className="flex flex-col items-center text-center h-full">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                    }}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
