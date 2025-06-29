import { SocialAnalyticsDashboard } from '@/components/social/SocialAnalyticsDashboard';

export default function SocialAnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your performance across all social media platforms in real-time.
        </p>
      </div>

      <SocialAnalyticsDashboard />
    </div>
  );
}