import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, MoreVertical, Plus, Trash2, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { useTasks } from '@/hooks/useTasks';

interface TasksProps {
    tasksHook: ReturnType<typeof useTasks>;
}

export function Tasks({ tasksHook }: TasksProps) {
    const { tasks, loading, activeTaskId, setActiveTaskId, addTask, deleteTask, toggleComplete, updateTask } = tasksHook;
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [estPomodoros, setEstPomodoros] = useState(1);

    // Edit State
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editEstPomodoros, setEditEstPomodoros] = useState(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        await addTask(newTitle, estPomodoros);
        setNewTitle('');
        setEstPomodoros(1);
        setIsAdding(false);
    };

    const startEditing = (task: any) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditEstPomodoros(task.estPomodoros);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditTitle('');
        setEditEstPomodoros(1);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTaskId && editTitle.trim()) {
            await updateTask(editingTaskId, {
                title: editTitle,
                estPomodoros: editEstPomodoros
            });
            setEditingTaskId(null);
        }
    };

    if (loading) {
        return (
            <Card className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-2xl border-white/10 p-8 md:p-10 shadow-2xl rounded-[2.5rem] flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </Card>
        );
    }

    return (
        <Card className="w-[calc(100%-2rem)] md:w-full max-w-xl mx-auto bg-white/10 backdrop-blur-2xl border-white/10 p-6 md:p-10 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white tracking-tight">Tasks</h3>
                <div className="bg-white/10 p-2 rounded-xl">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                            <DropdownMenuItem className="focus:bg-white/10">Clear finished tasks</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/10">Clear all tasks</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active Task Display */}
            {activeTaskId && tasks.find(t => t.id === activeTaskId) && (
                <div className="mb-8 p-6 bg-white/5 border-l-4 border-white/80 rounded-r-2xl">
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Current Focus</p>
                    <h2 className="text-2xl font-bold text-white mb-2">{tasks.find(t => t.id === activeTaskId)?.title}</h2>
                    <p className="text-white/60 font-mono">{tasks.find(t => t.id === activeTaskId)?.actPomodoros} / {tasks.find(t => t.id === activeTaskId)?.estPomodoros}</p>
                </div>
            )}

            <ScrollArea className="h-[300px] mb-6 pr-4">
                <div className="space-y-3">
                    {tasks.map(task => {
                        if (editingTaskId === task.id) {
                            return (
                                <div key={task.id} className="p-4 bg-white/5 rounded-xl border border-white/20 animate-in fade-in zoom-in-95">
                                    <form onSubmit={saveEdit}>
                                        <Input
                                            autoFocus
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="bg-transparent border-none text-lg font-bold text-white placeholder:text-white/20 focus-visible:ring-0 px-0 mb-4"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-white/60">Est</p>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={editEstPomodoros}
                                                    onChange={(e) => setEditEstPomodoros(parseInt(e.target.value) || 1)}
                                                    className="w-16 h-8 bg-white/10 border-none text-center font-mono font-bold text-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                    className="text-white/40 hover:text-white h-8"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    className="bg-black text-white hover:bg-zinc-800 font-bold px-4 rounded-lg h-8"
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={task.id}
                                onClick={() => {
                                    if (!task.completed) setActiveTaskId(task.id);
                                }}
                                className={cn(
                                    "group relative flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all",
                                    activeTaskId === task.id ? "bg-white/10 border-white/20 shadow-lg scale-[1.02] cursor-default" :
                                        task.completed ? "bg-white/5 opacity-60 cursor-default" : "bg-white/5 hover:bg-white/[0.07] cursor-pointer"
                                )}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComplete(task.id);
                                    }}
                                    className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                        task.completed ? "bg-red-400 border-red-400 text-white" : "border-white/30 hover:border-white/60"
                                    )}
                                >
                                    {task.completed && <Check className="w-3.5 h-3.5" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <span className={cn("font-medium text-white block truncate", task.completed && "line-through text-white/40")}>
                                        {task.title}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-white/40 font-mono text-sm font-bold mr-2">
                                        {task.actPomodoros} <span className="text-white/20">/</span> {task.estPomodoros}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditing(task);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/20 hover:text-white hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {!isAdding ? (
                <Button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-6 rounded-2xl border-2 border-dashed border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all font-bold uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Task
                </Button>
            ) : (
                <div className="p-4 bg-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                    <form onSubmit={handleSubmit}>
                        <Input
                            autoFocus
                            placeholder="What are you working on?"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-transparent border-none text-xl font-bold text-white placeholder:text-white/20 focus-visible:ring-0 px-0 mb-4"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white/60">Est Pomodoros</p>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={estPomodoros}
                                    onChange={(e) => setEstPomodoros(parseInt(e.target.value) || 1)}
                                    className="w-16 h-8 bg-white/10 border-none text-center font-mono font-bold text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAdding(false)}
                                    className="text-white/40 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-black text-white hover:bg-zinc-800 font-bold px-6 rounded-xl"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </Card>
    );
}
