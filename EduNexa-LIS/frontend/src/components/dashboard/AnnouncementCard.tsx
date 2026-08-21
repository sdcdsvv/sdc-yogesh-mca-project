import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const getIcon = () => {
    switch (announcement.type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getColors = () => {
    switch (announcement.type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getColors()}`}>
      <div className="flex items-start gap-3 mb-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{announcement.title}</h4>
          <p className="text-sm text-gray-700">{announcement.content}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-right">
        {new Date(announcement.date).toLocaleDateString()}
      </p>
    </div>
  );
};