'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Bell, Volume2, Timer as TimerIcon, Save, Palette, Check } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
    '#ba4949', '#38858a', '#397097', '#7d53a2', '#af4e91', '#518a58', '#545764'
];

export function SettingsModal() {
    const { settings, updateSettings, isLoaded } = useSettings();

    if (!isLoaded) return null;

    const ColorPicker = ({ label, current, onChange }: { label: string, current: string, onChange: (val: string) => void }) => (
        <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-black text-foreground/40">{label}</Label>
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => onChange(color)}
                        className={cn(
                            "w-8 h-8 rounded-lg transition-all border-2 flex items-center justify-center",
                            current === color ? "border-foreground scale-110 shadow-lg" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                    >
                        {current === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                ))}
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-border/50 hover:border-border transition-all group">
                    <input
                        type="color"
                        value={current}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-x-[-8px] inset-y-[-8px] w-[150%] h-[150%] cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all duration-500">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-background/95 backdrop-blur-3xl border-border text-foreground rounded-[2rem] overflow-hidden shadow-2xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Palette className="w-6 h-6 text-orange-500" />
                        POMORA SETTINGS
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="timer" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 mb-8">
                        <TabsTrigger value="timer" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <TimerIcon className="w-4 h-4 mr-2" />
                            Timer
                        </TabsTrigger>
                        <TabsTrigger value="theme" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Palette className="w-4 h-4 mr-2" />
                            Theme
                        </TabsTrigger>
                        <TabsTrigger value="sound" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Volume2 className="w-4 h-4 mr-2" />
                            Sound
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="timer" className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest font-black text-foreground/40">Durations (Minutes)</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="focus" className="text-xs font-bold">Focus</Label>
                                    <Input
                                        id="focus"
                                        type="number"
                                        value={settings.focusTime}
                                        onChange={(e) => updateSettings({ focusTime: Number(e.target.value) })}
                                        className="bg-foreground/[0.03] border-border rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="short" className="text-xs font-bold">Short</Label>
                                    <Input
                                        id="short"
                                        type="number"
                                        value={settings.shortBreakTime}
                                        onChange={(e) => updateSettings({ shortBreakTime: Number(e.target.value) })}
                                        className="bg-foreground/[0.03] border-border rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="long" className="text-xs font-bold">Long</Label>
                                    <Input
                                        id="long"
                                        type="number"
                                        value={settings.longBreakTime}
                                        onChange={(e) => updateSettings({ longBreakTime: Number(e.target.value) })}
                                        className="bg-foreground/[0.03] border-border rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Auto-start Breaks</Label>
                                    <p className="text-[10px] text-foreground/40 lowercase">Initiate next session automatically</p>
                                </div>
                                <Switch
                                    checked={settings.autoStartBreaks}
                                    onCheckedChange={(checked: boolean) => updateSettings({ autoStartBreaks: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Auto-start Pomodoros</Label>
                                    <p className="text-[10px] text-foreground/40 lowercase">Resume focus flow automatically</p>
                                </div>
                                <Switch
                                    checked={settings.autoStartPomodoros}
                                    onCheckedChange={(checked: boolean) => updateSettings({ autoStartPomodoros: checked })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Long Break Interval</Label>
                                <p className="text-sm font-bold">{settings.longBreakInterval} Rounds</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ longBreakInterval: Math.max(1, settings.longBreakInterval - 1) })}
                                >-</Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ longBreakInterval: settings.longBreakInterval + 1 })}
                                >+</Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Daily Goal</Label>
                                <p className="text-sm font-bold">{settings.dailyGoal} Sessions</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ dailyGoal: Math.max(1, settings.dailyGoal - 1) })}
                                >-</Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ dailyGoal: settings.dailyGoal + 1 })}
                                >+</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="theme" className="space-y-8">
                        <ColorPicker
                            label="Focus Color"
                            current={settings.themeColors.focus}
                            onChange={(color) => updateSettings({ themeColors: { ...settings.themeColors, focus: color } })}
                        />
                        <ColorPicker
                            label="Short Break Color"
                            current={settings.themeColors.shortBreak}
                            onChange={(color) => updateSettings({ themeColors: { ...settings.themeColors, shortBreak: color } })}
                        />
                        <ColorPicker
                            label="Long Break Color"
                            current={settings.themeColors.longBreak}
                            onChange={(color) => updateSettings({ themeColors: { ...settings.themeColors, longBreak: color } })}
                        />

                        <div className="p-4 bg-muted/50 border border-border rounded-xl">
                            <p className="text-[10px] leading-relaxed text-foreground/50 text-center uppercase tracking-widest font-bold">
                                Themes only apply to the timer section.
                                <br />Navbar & Footer follow system preference.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Dark Mode when running</Label>
                                    <p className="text-[10px] text-foreground/40 lowercase">Switch to dark mode automatically</p>
                                </div>
                                <Switch
                                    checked={settings.darkModeWhenRunning}
                                    onCheckedChange={(checked: boolean) => updateSettings({ darkModeWhenRunning: checked })}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sound" className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Alarm Volume</Label>
                                <span className="text-[10px] font-mono text-foreground/40">{settings.alarmVolume}%</span>
                            </div>
                            <Slider
                                value={[settings.alarmVolume]}
                                max={100}
                                step={1}
                                onValueChange={(vals: number[]) => updateSettings({ alarmVolume: vals[0] })}
                            />
                        </div>


                        <div className="space-y-6 pt-4 border-t border-border/50">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Background Sound</Label>
                                <p className="text-[10px] text-foreground/40 lowercase">Choose ambient sound for focus sessions</p>
                                <select
                                    value={settings.tickingSound}
                                    onChange={(e) => updateSettings({ tickingSound: e.target.value as any })}
                                    className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="none" className="bg-background text-foreground">None</option>
                                    <option value="slow" className="bg-background text-foreground">Ticking Slow</option>
                                    <option value="fast" className="bg-background text-foreground">Ticking Fast</option>

                                </select>
                            </div>



                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Volume</Label>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider hover:bg-foreground/5"
                                            onClick={() => {
                                                if (settings.tickingSound === 'none') return;
                                                const TICKING_SOUNDS: Record<string, string> = {
                                                    slow: '/sounds/ticking-slow.mp3',
                                                    fast: '/sounds/ticking-fast.mp3',
                                                };


                                                const url = TICKING_SOUNDS[settings.tickingSound];

                                                if (url) {
                                                    const audio = new Audio(url);
                                                    audio.volume = settings.tickingVolume / 100;
                                                    audio.play().catch(() => { });
                                                }
                                            }}
                                            disabled={settings.tickingSound === 'none'}
                                        >
                                            Test Sound
                                        </Button>
                                        <span className="text-[10px] font-mono text-foreground/40">{settings.tickingVolume}%</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[settings.tickingVolume]}
                                    max={100}
                                    step={1}
                                    disabled={settings.tickingSound === 'none'}
                                    onValueChange={(vals: number[]) => updateSettings({ tickingVolume: vals[0] })}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="info" className="space-y-6">
                        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                            <p className="text-xs leading-relaxed text-foreground/70">
                                Pomora protocols are designed for synchronization between your mind and your environment.
                                <br /><br />
                                For maximum efficiency, we recommend 4 focus sessions followed by a 15-minute sanctuary break.
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Long Break Interval</Label>
                                <p className="text-sm font-bold">{settings.longBreakInterval} Rounds</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ longBreakInterval: Math.max(1, settings.longBreakInterval - 1) })}
                                >-</Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border"
                                    onClick={() => updateSettings({ longBreakInterval: settings.longBreakInterval + 1 })}
                                >+</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                    <DialogClose asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold gap-2">
                            <Save className="w-4 h-4" />
                            COMPLETE PROTOCOL
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
