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
      <div className="bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            {t('home.title')}
          </h1>
          <p className="text-xl mb-6" style={{ color: 'hsl(var(--foreground))' }}>
            {t('home.subtitle')}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border hover:border-gray-300"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors shadow-sm border"
                  style={{
                    backgroundColor: 'hsl(var(--muted))',
                    borderColor: 'hsl(var(--border))',
                  }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: 'hsl(var(--primary))' }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
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
