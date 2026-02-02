import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class ImageService {
    constructor() {
        // Register local fonts for guaranteed rendering in all environments
        const localFontPath = path.resolve(__dirname, '../../assets/fonts/font.ttf');
        const localFontRegularPath = path.resolve(__dirname, '../../assets/fonts/font-regular.ttf');
        if (fs.existsSync(localFontPath)) {
            GlobalFonts.registerFromPath(localFontPath, 'CustomSans');
        }
        if (fs.existsSync(localFontRegularPath)) {
            GlobalFonts.registerFromPath(localFontRegularPath, 'CustomSansRegular');
        }
    }
    async generateLeaderboardCard(guildName, timeframe, entries, client) {
        const width = 1000;
        const height = 1100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const colors = {
            bg: '#0B111B',
            card: '#151D29',
            accent: '#FF6B35',
            gold: '#FFD700',
            silver: '#C0C0C0',
            bronze: '#CD7F32',
            textMain: '#FFFFFF',
            textMuted: '#94A3B8'
        };
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 64px CustomSans, Arial, sans-serif';
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.textAlign = 'center';
        ctx.fillText('Study Time Leaderboards', width / 2, 95);
        ctx.font = 'bold 20px CustomSans, Arial, sans-serif';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(`server: ${guildName}`, width / 2, 135);
        ctx.font = 'bold 22px CustomSans, Arial, sans-serif';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(`TOP STUDY PERFORMANCE • ${timeframe.toUpperCase()}`, width / 2, 165);
        // Add logo to top-right corner
        try {
            const logoPath = path.resolve(__dirname, '../../assets/images/pomo_icon.png');
            if (fs.existsSync(logoPath)) {
                const logo = await loadImage(logoPath);
                ctx.drawImage(logo, width - 80, 40, 40, 40);
            }
        }
        catch (e) { }
        const podiumY = 320;
        const podiumConfigs = [
            { pos: 1, x: 500, size: 190, color: colors.gold, rank: '1ST' },
            { pos: 2, x: 260, size: 155, color: colors.silver, rank: '2ND' },
            { pos: 3, x: 740, size: 155, color: colors.bronze, rank: '3RD' }
        ];
        for (const config of podiumConfigs) {
            const userEntry = entries[config.pos - 1];
            if (!userEntry)
                continue;
            const timeframeKey = timeframe.toLowerCase();
            const timeValue = userEntry[`${timeframeKey}_time`];
            const hours = (typeof timeValue === 'number' ? timeValue / 60 : 0).toFixed(1);
            try {
                const user = await client.users.fetch(userEntry.user_id).catch(() => null);
                const avatarImg = user ? await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 })) : null;
                ctx.save();
                ctx.shadowBlur = 25;
                ctx.shadowColor = config.color;
                ctx.strokeStyle = config.color;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(config.x, podiumY, config.size / 2 + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.beginPath();
                ctx.arc(config.x, podiumY, config.size / 2, 0, Math.PI * 2);
                ctx.clip();
                if (avatarImg) {
                    ctx.drawImage(avatarImg, config.x - config.size / 2, podiumY - config.size / 2, config.size, config.size);
                }
                else {
                    ctx.fillStyle = colors.card;
                    ctx.fill();
                }
                ctx.restore();
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px CustomSans, Arial, sans-serif';
                ctx.fillStyle = colors.textMuted;
                ctx.fillText(config.rank, config.x, podiumY + (config.size / 2) + 45);
                ctx.font = 'bold 32px CustomSans, Arial, sans-serif';
                ctx.fillStyle = colors.textMain;
                ctx.fillText(user?.displayName || 'Unknown', config.x, podiumY + (config.size / 2) + 90);
                ctx.font = 'bold 26px CustomSans, Arial, sans-serif';
                ctx.fillStyle = colors.accent;
                ctx.fillText(`${hours} hours`, config.x, podiumY + (config.size / 2) + 130);
            }
            catch (e) { }
        }
        const listStartY = 580;
        const rowWidth = 850;
        const rowHeight = 75;
        const rowX = (width - rowWidth) / 2;
        for (let i = 3; i < Math.min(entries.length, 10); i++) {
            const entry = entries[i];
            const y = listStartY + (i - 3) * (rowHeight + 15);
            ctx.fillStyle = colors.card;
            this.drawRoundedRect(ctx, rowX, y, rowWidth, rowHeight, 37.5);
            ctx.fill();
            ctx.font = 'bold 30px CustomSans, Arial, sans-serif';
            ctx.fillStyle = colors.textMain;
            ctx.textAlign = 'left';
            ctx.fillText((i + 1).toString(), rowX + 40, y + 48);
            try {
                const user = await client.users.fetch(entry.user_id).catch(() => null);
                if (user) {
                    const rowAvatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(rowX + 110, y + rowHeight / 2, 28, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(rowAvatar, rowX + 82, y + rowHeight / 2 - 28, 56, 56);
                    ctx.restore();
                    ctx.font = 'bold 28px sans-serif';
                    ctx.fillStyle = colors.textMain;
                    ctx.fillText(user.displayName, rowX + 160, y + 48);
                }
            }
            catch (e) { }
            const timeframeKey = timeframe.toLowerCase();
            const timeValue = entry[`${timeframeKey}_time`] || 0;
            const h = Math.floor(timeValue / 60);
            const m = timeValue % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            ctx.textAlign = 'right';
            ctx.fillStyle = colors.accent;
            ctx.font = 'bold 30px CustomSans, Arial, sans-serif';
            ctx.fillText(timeStr, rowX + rowWidth - 40, y + 48);
        }
        ctx.textAlign = 'center';
        ctx.font = '20px CustomSans, Arial, sans-serif';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(`Data updated hourly`, width / 2, height - 30);
        return canvas.toBuffer('image/png');
    }
    async generateStatusCard(session, client, channelName = 'Pomora Room') {
        const width = 800;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#09090B';
        ctx.fillRect(0, 0, width, height);
        const participants = Array.from(session.participants.values());
        const avatarSize = 52;
        const startX = 60;
        const startY = 110;
        const spacingX = 25;
        const spacingY = 35;
        for (let i = 0; i < Math.min(participants.length, 9); i++) {
            const p = participants[i];
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = startX + col * (avatarSize + spacingX + 50);
            const y = startY + row * (avatarSize + spacingY + 20);
            ctx.fillStyle = '#111114';
            this.drawRoundedRect(ctx, x - 15, y - 15, avatarSize + 30, avatarSize + 65, 12);
            try {
                const user = await client.users.fetch(p.userId);
                const avatarImg = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
                ctx.restore();
                const badgeWidth = 56;
                const badgeHeight = 18;
                const badgeX = x + (avatarSize - badgeWidth) / 2;
                const badgeY = y + avatarSize + 6;
                ctx.fillStyle = p.isActive ? '#FF6B35' : '#27272A';
                this.drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 6);
                ctx.fillStyle = p.isActive ? '#FFFFFF' : '#A1A1AA';
                ctx.font = 'bold 10px CustomSans, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(p.isActive ? 'PRESENT' : 'AWAY', badgeX + badgeWidth / 2, badgeY + 13);
                const elapsedMs = Date.now() - p.joinedAt.getTime();
                const totalSecs = Math.floor(elapsedMs / 1000);
                const h = Math.floor(totalSecs / 3600);
                const m = Math.floor((totalSecs % 3600) / 60);
                const s = totalSecs % 60;
                const elapsedStr = h > 0 ? `${h}h ${m}m` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                ctx.fillStyle = '#71717A';
                ctx.font = '500 10px CustomSans, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(elapsedStr, x + avatarSize / 2, badgeY + 32);
            }
            catch (err) { }
        }
        try {
            const logoPath = path.resolve(__dirname, '../../assets/images/pomo_icon.png');
            if (fs.existsSync(logoPath)) {
                const logo = await loadImage(logoPath);
                const headerText = channelName.toUpperCase();
                ctx.font = 'bold 22px CustomSans, Arial, sans-serif';
                const textWidth = ctx.measureText(headerText).width;
                const logoSize = 32;
                const totalWidth = logoSize + 14 + textWidth;
                const centerX = (width - totalWidth) / 2;
                ctx.drawImage(logo, centerX, 35, logoSize, logoSize);
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FF6B35';
                ctx.fillText(headerText, centerX + logoSize + 14, 58);
            }
        }
        catch (e) { }
        const centerX = 600;
        const centerY = 200;
        const radius = 110;
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        if (session) {
            const progress = (session.duration - session.remaining) / session.duration;
            const endAngle = -Math.PI / 2 + (Math.PI * 2 * progress);
            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
            ctx.stroke();
            const handleX = centerX + Math.cos(endAngle) * radius;
            const handleY = centerY + Math.sin(endAngle) * radius;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
            ctx.fill();
            const mins = Math.floor(session.remaining / 60);
            const secs = session.remaining % 60;
            const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FAFAFA';
            ctx.font = 'bold 64px CustomSans, Arial, sans-serif';
            ctx.fillText(timeStr, centerX, centerY + 15);
            ctx.font = 'bold 16px CustomSans, Arial, sans-serif';
            ctx.fillStyle = session.type === 'focus' ? '#FF6B35' : '#43B581';
            ctx.fillText(session.type.toUpperCase(), centerX, centerY + 56);
        }
        return canvas.toBuffer('image/png');
    }
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
