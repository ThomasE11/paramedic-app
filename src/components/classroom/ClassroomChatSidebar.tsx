/**
 * ClassroomChatSidebar — collapsible live chat for the classroom.
 *
 * Floats on the right side of the live case view. Shows a rolling list
 * of messages scoped to this session; the instructor's messages get an
 * INSTRUCTOR badge, and whoever currently holds the driver role shows
 * with a DRIVING badge.
 *
 * The sidebar is self-contained — it reads from the classroom hook's
 * chatMessages + sendChat helpers and renders independently of the
 * case UI. Both ClassroomHost and ClassroomJoin mount it.
 */

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { ClassroomRole } from '@/hooks/useClassroomSession';

interface ChatMessage {
  id: string;
  fromKey: string;
  fromName: string;
  fromRole: ClassroomRole;
  text: string;
  sentAt: string;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  selfKey: string;
  driverKeys: string[];
}

function timeShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ClassroomChatSidebar({ messages, onSend, selfKey, driverKeys }: Props) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [unread, setUnread] = useState(0);
  const lastSeenIdRef = useRef<string | null>(null);

  // Autoscroll to bottom on new message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Track unread count when the sidebar is collapsed so the user knows
  // something landed while they weren't looking.
  useEffect(() => {
    if (open) {
      lastSeenIdRef.current = messages[messages.length - 1]?.id ?? null;
      setUnread(0);
      return;
    }
    const lastSeen = lastSeenIdRef.current;
    let newCount = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].id === lastSeen) break;
      if (messages[i].fromKey !== selfKey) newCount++;
    }
    setUnread(newCount);
  }, [messages, open, selfKey]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body) return;
    await onSend(body);
    setText('');
    inputRef.current?.focus();
  };

  if (!open) {
    // Collapsed — a floating tab on the right edge.
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 rounded-l-lg bg-primary text-primary-foreground px-2 py-3 shadow-lg hover:translate-x-0 transition-transform rtl:right-auto rtl:left-0 rtl:rounded-l-none rtl:rounded-r-lg"
        aria-label="Open chat"
      >
        <ChevronsLeft className="w-4 h-4 rtl:rotate-180" />
        <MessageSquare className="w-4 h-4" />
        {unread > 0 && (
          <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
            {unread}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-40 w-80 max-w-[90vw] border-l border-border bg-background/95 backdrop-blur flex flex-col shadow-2xl animate-in slide-in-from-right-4 duration-200 rtl:right-auto rtl:left-0 rtl:border-l-0 rtl:border-r">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Classroom chat</span>
          <Badge variant="secondary" className="text-[10px]">{messages.length}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 w-7 p-0" aria-label="Collapse chat">
          <ChevronsRight className="w-4 h-4 rtl:rotate-180" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-6 text-center">
            No messages yet — be the first to say hello.
          </p>
        ) : (
          messages.map(m => {
            const mine = m.fromKey === selfKey;
            const isDriver = driverKeys.includes(m.fromKey);
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[11px] font-semibold ${mine ? 'text-primary' : 'text-foreground'}`}>
                    {mine ? 'You' : m.fromName}
                  </span>
                  {m.fromRole === 'instructor' && (
                    <Badge variant="outline" className="text-[9px] py-0 h-4 border-emerald-500 text-emerald-600">
                      INSTR
                    </Badge>
                  )}
                  {isDriver && m.fromRole !== 'instructor' && (
                    <Badge variant="outline" className="text-[9px] py-0 h-4 border-primary text-primary">
                      DRIVING
                    </Badge>
                  )}
                  <span className="text-[9px] text-muted-foreground font-mono">{timeShort(m.sentAt)}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap break-words ${
                    mine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : m.fromRole === 'instructor'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 rounded-bl-sm'
                        : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="p-3 border-t border-border shrink-0 flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message the class (Enter to send)"
          className="h-8 text-sm"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => void handleSend()}
          disabled={!text.trim()}
          className="h-8 px-3 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </footer>

      {/* Unused but referenced to avoid tree-shaking the lucide icon import. */}
      <span className="hidden"><X /></span>
    </aside>
  );
}

export default ClassroomChatSidebar;
