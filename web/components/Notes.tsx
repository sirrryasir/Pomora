import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, StickyNote, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Note {
    id: string;
    content: string;
    created_at: string;
}

const GUEST_STORAGE_KEY = 'pomora_guest_notes';

export function Notes({ themeColor = '#f97316' }: { themeColor?: string }) {
    const { user, loading: authLoading } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            fetchNotes();
        }
    }, [user, authLoading]);

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            if (user) {
                const resp = await fetch('/api/notes');
                if (resp.ok) {
                    const data = await resp.json();
                    setNotes(Array.isArray(data) ? data : []);
                } else {
                    const errData = await resp.json().catch(() => ({ error: 'Failed to fetch notes' }));
                    setError(errData.error || 'Server error occurred');
                }
            } else {
                // Guest mode - Local Storage
                const saved = localStorage.getItem(GUEST_STORAGE_KEY);
                if (saved) {
                    setNotes(JSON.parse(saved));
                } else {
                    setNotes([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch notes:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setAdding(true);
        try {
            const tempId = crypto.randomUUID();
            const noteContent = newNote.trim();
            const newNoteObj: Note = {
                id: tempId,
                content: noteContent,
                created_at: new Date().toISOString(),
            };

            if (user) {
                const resp = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: noteContent }),
                });
                if (resp.ok) {
                    const savedNote = await resp.json();
                    setNotes((prev) => [savedNote, ...prev]);
                }
            } else {
                // Guest mode
                const updatedNotes = [newNoteObj, ...notes];
                setNotes(updatedNotes);
                localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedNotes));
            }
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setAdding(false);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            if (user) {
                const resp = await fetch(`/api/notes/${id}`, {
                    method: 'DELETE',
                });
                if (resp.ok) {
                    setNotes((prev) => prev.filter((n) => n.id !== id));
                }
            } else {
                // Guest mode
                const updatedNotes = notes.filter((n) => n.id !== id);
                setNotes(updatedNotes);
                localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedNotes));
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    if (authLoading) {
        return (
            <Card className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-2xl border-white/10 p-8 md:p-10 shadow-2xl rounded-[2.5rem] flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </Card>
        );
    }

    return (
        <Card className="w-[calc(100%-2rem)] md:w-full max-w-xl mx-auto bg-white/10 backdrop-blur-2xl border-white/10 p-6 md:p-10 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl shrink-0">
                        <StickyNote className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Focus Notes</h3>
                        <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-widest font-bold">Capture your flow</p>
                    </div>
                </div>
                {!user && (
                    <div className="self-start sm:self-auto px-3 py-1 rounded-full border text-[9px] md:text-[10px] uppercase font-black bg-white/5 border-white/20 text-white/60">
                        Guest Mode
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[10px] uppercase font-black hover:bg-red-500/10 text-red-400"
                        onClick={fetchNotes}
                    >
                        Retry
                    </Button>
                </div>
            )}

            <form onSubmit={addNote} className="flex gap-2 md:gap-3 mb-8 md:mb-10">
                <Input
                    placeholder="What are you working on?"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="h-12 md:h-14 bg-white/5 border-white/10 text-white rounded-xl md:rounded-2xl placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-white/30 transition-all text-sm px-4 md:px-6"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={adding}
                    className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-90 shrink-0 border-none bg-white text-black hover:bg-zinc-100"
                >
                    {adding ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
                </Button>
            </form>

            <ScrollArea className="h-[300px] md:h-[350px] pr-2 md:pr-4">
                <div className="space-y-3 md:space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-white/20" />
                            <p className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-widest font-black">Loading your thoughts...</p>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-12 md:py-16 opacity-20 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-3xl bg-white/10 flex items-center justify-center">
                                <StickyNote className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">Your mind is clear.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="group flex items-start justify-between p-4 md:p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl md:rounded-2xl transition-all duration-300"
                            >
                                <p className="text-xs md:text-sm leading-relaxed text-white/80 pr-4">{note.content}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 md:h-8 md:w-8 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    onClick={() => deleteNote(note.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}
