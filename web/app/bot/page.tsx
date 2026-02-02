import { BotShowcase } from '@/components/BotShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bot Showcase',
    description: 'Transform your Discord server into a high-performance study hub with Pomora.',
};

export default function BotPage() {
    return <BotShowcase />;
}
