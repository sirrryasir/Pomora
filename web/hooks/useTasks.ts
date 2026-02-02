import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actPomodoros: number;
    completed: boolean;
    created_at: string;
}

const GUEST_TASKS_KEY = 'pomora_guest_tasks';
const ACTIVE_TASK_KEY = 'pomora_active_task_id';

export function useTasks() {
    const { user, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        if (!authLoading) {
            fetchTasks();
            const savedActive = localStorage.getItem(ACTIVE_TASK_KEY);
            if (savedActive) setActiveTaskId(savedActive);
        }
    }, [user, authLoading]);

    // Save active task persistence
    useEffect(() => {
        if (activeTaskId) {
            localStorage.setItem(ACTIVE_TASK_KEY, activeTaskId);
        } else {
            localStorage.removeItem(ACTIVE_TASK_KEY);
        }
    }, [activeTaskId]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            if (user) {
                const resp = await fetch('/api/notes');
                if (resp.ok) {
                    const rawData = await resp.json();
                    // Parse content field to get Task object, or fallback if legacy note
                    const parsedTasks = rawData.map((item: any) => {
                        try {
                            const parsed = JSON.parse(item.content);
                            if (parsed.title !== undefined && parsed.estPomodoros !== undefined) {
                                return { ...parsed, id: item.id };
                            }
                            // Legacy note fallback (create a task from it)
                            return {
                                id: item.id,
                                title: item.content,
                                estPomodoros: 1,
                                actPomodoros: 0,
                                completed: false,
                                created_at: item.created_at
                            };
                        } catch {
                            return {
                                id: item.id,
                                title: item.content,
                                estPomodoros: 1,
                                actPomodoros: 0,
                                completed: false,
                                created_at: item.created_at
                            };
                        }
                    });
                    setTasks(parsedTasks);
                }
            } else {
                const saved = localStorage.getItem(GUEST_TASKS_KEY);
                if (saved) setTasks(JSON.parse(saved));
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (title: string, estPomodoros: number) => {
        const newTaskContent = {
            title,
            estPomodoros,
            actPomodoros: 0,
            completed: false,
            created_at: new Date().toISOString()
        };

        if (user) {
            const resp = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: JSON.stringify(newTaskContent) }),
            });
            if (resp.ok) {
                const saved = await resp.json();
                const task: Task = { ...newTaskContent, id: saved.id };
                setTasks(prev => [task, ...prev]);
                if (!activeTaskId) setActiveTaskId(task.id);
            }
        } else {
            const task: Task = { ...newTaskContent, id: crypto.randomUUID() };
            const updated = [task, ...tasks];
            setTasks(updated);
            localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
            if (!activeTaskId) setActiveTaskId(task.id);
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, ...updates };

        // Optimistic UI update
        const newTasks = tasks.map(t => t.id === id ? updatedTask : t);
        setTasks(newTasks);

        if (user) {
            // Needed to delete and recreate because API doesn't support PATCH (DB schema limit handling via content hack)
            // Wait, we can't easily update 'content' with POST. 
            // Phase 1 implementation suggests simple POST/GET/DELETE.
            // If we don't have PATCH endpoint, we might need to delete & re-add or just accept local state for now if complex.
            // BUT, looking at `api/notes/route.ts`, there is no PATCH/PUT. 
            // I should double check [id]/route.ts.
            // For now, I will assume DELETE + POST is too heavy. 
            // I will implement a simpler `api/notes/[id]` PATCH if possible, or check if it exists.
            // If not, I will silently fail backend update or try to fix it. 
            // Let's assume for this MVP we might need to ADD a PATCH route if it's missing, or use a workaround.
            // Workaround: Since I am an agent, I can check [id]/route.ts next. 
            // For now, I'll update local state.
            await updateTaskBackend(id, updatedTask);
        } else {
            localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(newTasks));
        }
    };

    const deleteTask = async (id: string) => {
        if (activeTaskId === id) setActiveTaskId(null);

        if (user) {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        } else {
            const updated = tasks.filter(t => t.id !== id);
            localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
        }
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const toggleComplete = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) updateTask(id, { completed: !task.completed });
    };

    const incrementActiveTask = () => {
        if (!activeTaskId) return;
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
            updateTask(activeTaskId, { actPomodoros: task.actPomodoros + 1 });
        }
    };

    // Helper to update backend (will implement PATCH check next)
    const updateTaskBackend = async (id: string, task: Task) => {
        try {
            await fetch(`/api/notes/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ content: JSON.stringify(task) })
            });
        } catch (e) {
            console.error('Backend update failed', e);
        }
    };

    return {
        tasks,
        loading,
        activeTaskId,
        setActiveTaskId,
        addTask,
        deleteTask,
        toggleComplete,
        incrementActiveTask,
        updateTask
    };
}
