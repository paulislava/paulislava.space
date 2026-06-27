import Image from 'next/image';
import { Technology, mediaUrl } from '@/lib/strapi-types';

interface TechBadgeProps {
  tech: Technology;
  showName?: boolean;
}

export default function TechBadge({ tech, showName = true }: TechBadgeProps) {
  const icon = mediaUrl(tech.icon);
  return (
    <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-sm text-[#f1f5f9] hover:border-[#6366f1]/40 transition-colors">
      {icon && (
        <Image src={icon} alt={tech.name} width={16} height={16} className="w-4 h-4 object-contain" />
      )}
      {showName && <span>{tech.name}</span>}
    </div>
  );
}
