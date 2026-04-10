import { useChat } from "@ai-sdk/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatSearchField } from "../components/chat-search-field";
import { Icon } from "../components/icons";
import { MessagePartsView } from "../components/message-parts";
import { formatChatListTime } from "../lib/format-chat-time";
import { getApiBaseUrl } from "../lib/api-base-url";
import { authClient } from "../lib/auth-client";
import { trpc } from "../lib/trpc";

const apiBase = getApiBaseUrl();

function userInitials(user: { name?: string | null; email?: string | null }): string {
  const n = user.name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = user.email?.trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return "??";
}

export function ChatPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/chat" });
  const chatId = search.chatId;
  const q = search.q ?? "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data?.user) {
      void navigate({ to: "/auth" });
    }
  }, [session.isPending, session.data?.user, navigate]);

  const chatsQuery = trpc.chats.list.useInfiniteQuery(
    { limit: 20, query: q || undefined },
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      enabled: !!session.data?.user,
    },
  );

  const messagesQuery = trpc.messages.listByChat.useInfiniteQuery(
    { chatId: chatId ?? "", limit: 30 },
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      enabled: !!chatId && !!session.data?.user,
    },
  );

  const flatChats = useMemo(
    () => chatsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [chatsQuery.data?.pages],
  );

  const pinnedChats = useMemo(() => flatChats.filter((c) => c.pinned), [flatChats]);
  const recentChats = useMemo(() => flatChats.filter((c) => !c.pinned), [flatChats]);

  const sortedMessages = useMemo(() => {
    const raw = messagesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    return [...raw].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesQuery.data?.pages]);

  useEffect(() => {
    if (!session.data?.user || chatsQuery.isLoading) return;
    if (chatId) return;
    const first = flatChats[0];
    if (first) {
      void navigate({
        to: "/chat",
        search: { chatId: first._id, q: q || undefined },
        replace: true,
      });
    }
  }, [session.data?.user, chatsQuery.isLoading, chatId, flatChats, navigate, q]);

  const qc = trpc.useUtils();

  const { messages, append, status, setMessages, error } = useChat({
    id: chatId ?? "draft",
    api: `${apiBase}/api/chat/stream`,
    credentials: "include",
    body: chatId ? { chatId } : {},
    onFinish: () => {
      void qc.messages.listByChat.invalidate();
      void qc.chats.list.invalidate();
      setMessages([]);
    },
  });

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !chatsQuery.hasNextPage || chatsQuery.isFetchingNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void chatsQuery.fetchNextPage();
        }
      },
      { root: listRef.current, rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chatsQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages, messages, status]);

  const createChat = trpc.chats.create.useMutation({
    onSuccess: (res) => {
      void navigate({
        to: "/chat",
        search: { chatId: res.chat._id, q: q || undefined },
      });
      void qc.chats.list.invalidate();
      setSidebarOpen(false);
    },
  });

  const renameChat = trpc.chats.rename.useMutation({
    onSuccess: () => void qc.chats.list.invalidate(),
  });
  const pinChat = trpc.chats.pin.useMutation({
    onSuccess: () => void qc.chats.list.invalidate(),
  });
  const deleteChat = trpc.chats.delete.useMutation({
    onSuccess: () => {
      void qc.chats.list.invalidate();
      void navigate({ to: "/chat", search: { q: q || undefined } });
    },
  });

  if (session.isPending || !session.data?.user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-base)]">
        <Spinner color="primary" />
      </div>
    );
  }

  const streaming = status === "streaming" || status === "submitted";
  const activeTitle = flatChats.find((c) => c._id === chatId)?.title ?? "Chat";

  const openChat = (id: string) => {
    void navigate({ to: "/chat", search: { chatId: id, q: q || undefined } });
    setSidebarOpen(false);
  };

  const setSearchQuery = (v: string) => {
    void navigate({ to: "/chat", search: { chatId, q: v || undefined } });
  };

  const sidebarInner = (
    <>
      <div className="border-b border-[var(--border)] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent)] shadow-md shadow-indigo-500/30">
              <Icon name="sparkle" size={14} color="#fff" />
            </div>
            <span className="truncate text-sm font-bold tracking-tight text-[#f0f0f5]">
              Helios
            </span>
          </div>
          <Button
            isIconOnly
            size="sm"
            radius="md"
            color="primary"
            className="text-white shadow-md shadow-indigo-500/30"
            onPress={() => createChat.mutate({ title: "Nuevo chat" })}
            isLoading={createChat.isPending}
            aria-label="Nuevo chat"
          >
            <Icon name="plus" size={16} color="#fff" />
          </Button>
        </div>
        <ChatSearchField
          value={q}
          onValueChange={setSearchQuery}
          placeholder="Buscar chats…"
          aria-label="Buscar chats por título"
        />
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-2">
        {chatsQuery.isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}
        {chatsQuery.isError && (
          <Card className="border border-red-500/20 bg-red-500/5">
            <CardBody className="p-3 text-xs text-red-200">
              No se pudieron cargar los chats.
            </CardBody>
          </Card>
        )}
        {!chatsQuery.isLoading && flatChats.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-[#5a5a70]">
            No hay chats. Creá uno para empezar.
          </p>
        )}

        {pinnedChats.length > 0 && (
          <>
            <div className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#5a5a70]">
              Anclados
            </div>
            {pinnedChats.map((c) => (
              <ChatListRow
                key={c._id}
                title={c.title}
                time={formatChatListTime(c.lastMessageAt)}
                active={c._id === chatId}
                pinned
                onSelect={() => openChat(c._id)}
                onPin={() => pinChat.mutate({ chatId: c._id, pinned: !c.pinned })}
                onRename={() => {
                  const t = window.prompt("Nuevo título", c.title);
                  if (t?.trim()) renameChat.mutate({ chatId: c._id, title: t.trim() });
                }}
                onDelete={() => {
                  if (window.confirm("¿Eliminar este chat?")) {
                    deleteChat.mutate({ chatId: c._id });
                  }
                }}
              />
            ))}
            <div className="mx-1 my-2 h-px bg-[var(--border)]" />
          </>
        )}

        {recentChats.length > 0 && (
          <>
            <div className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#5a5a70]">
              Recientes
            </div>
            {recentChats.map((c) => (
              <ChatListRow
                key={c._id}
                title={c.title}
                time={formatChatListTime(c.lastMessageAt)}
                active={c._id === chatId}
                pinned={false}
                onSelect={() => openChat(c._id)}
                onPin={() => pinChat.mutate({ chatId: c._id, pinned: !c.pinned })}
                onRename={() => {
                  const t = window.prompt("Nuevo título", c.title);
                  if (t?.trim()) renameChat.mutate({ chatId: c._id, title: t.trim() });
                }}
                onDelete={() => {
                  if (window.confirm("¿Eliminar este chat?")) {
                    deleteChat.mutate({ chatId: c._id });
                  }
                }}
              />
            ))}
          </>
        )}

        <div ref={sentinelRef} className="h-2" />
        {chatsQuery.isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-2">
        <Button
          variant="light"
          size="sm"
          className="w-full justify-start text-[#9090a8]"
          onPress={() => authClient.signOut().then(() => navigate({ to: "/auth" }))}
        >
          Cerrar sesión
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full min-h-0 flex-col overflow-hidden bg-[var(--bg-base)] lg:flex-row">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(100%,280px)] flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] transition-transform duration-200 ease-out max-lg:shadow-2xl lg:static lg:z-auto lg:min-h-0 lg:w-[260px] lg:max-h-[100dvh] lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarInner}
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!chatId && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="flex shrink-0 flex-col gap-2 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 sm:flex-row sm:items-center sm:gap-3 sm:py-2 sm:px-5">
              <div className="flex items-center gap-3">
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  radius="md"
                  className="border-[var(--border)] bg-[var(--bg-elevated)] text-[#9090a8] lg:hidden"
                  aria-label="Menú"
                  onPress={() => setSidebarOpen(true)}
                >
                  <Icon name="menu" size={15} />
                </Button>
                <h1 className="min-w-0 truncate text-sm font-semibold text-[#f0f0f5] sm:flex-1">
                  Conversaciones
                </h1>
              </div>
              <div className="w-full min-w-0 sm:flex-1 sm:max-w-lg">
                <ChatSearchField
                  value={q}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar en tus chats…"
                  aria-label="Buscar chats por título"
                />
              </div>
            </header>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-6 py-8 text-center text-[#5a5a70]">
              <Icon name="sparkle" size={32} color="#5a5a70" />
              <p className="text-sm">Seleccioná o creá un chat desde el menú.</p>
              <Button
                color="primary"
                className="lg:hidden"
                onPress={() => setSidebarOpen(true)}
                startContent={<Icon name="menu" size={16} color="#fff" />}
              >
                Abrir conversaciones
              </Button>
            </div>
          </div>
        )}

        {chatId && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="flex shrink-0 flex-col gap-2 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 sm:h-14 sm:flex-row sm:items-center sm:gap-3 sm:py-0 sm:px-5">
              <div className="flex min-h-10 items-center gap-3 sm:min-h-0 sm:flex-1 sm:overflow-hidden">
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  radius="md"
                  className="shrink-0 border-[var(--border)] bg-[var(--bg-elevated)] text-[#9090a8] lg:hidden"
                  aria-label="Menú"
                  onPress={() => setSidebarOpen(true)}
                >
                  <Icon name="menu" size={15} />
                </Button>
                <div className="min-w-0 flex-1 sm:max-w-[min(40%,280px)] lg:max-w-xs">
                  <h1 className="truncate text-sm font-semibold text-[#f0f0f5]">{activeTitle}</h1>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                      style={{ animation: "helios-pulse 2s infinite" }}
                    />
                    <span className="text-[11px] text-[#5a5a70]">Helios · listo</span>
                  </div>
                </div>
                <div className="hidden min-w-0 flex-1 sm:block sm:max-w-md lg:max-w-lg">
                  <ChatSearchField
                    value={q}
                    onValueChange={setSearchQuery}
                    placeholder="Buscar en tus chats…"
                    aria-label="Buscar chats por título"
                  />
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
                  <div className="hidden items-center gap-2 md:flex">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Conectado
                    </span>
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {userInitials(session.data.user)}
                  </div>
                </div>
              </div>
              <div className="w-full sm:hidden">
                <ChatSearchField
                  value={q}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar en tus chats…"
                  aria-label="Buscar chats por título"
                />
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              {messagesQuery.isLoading && (
                <div className="flex justify-center py-16">
                  <Spinner />
                </div>
              )}
              {messagesQuery.isError && (
                <Card className="border border-red-500/20">
                  <CardBody className="text-sm text-red-200">Error al cargar mensajes.</CardBody>
                </Card>
              )}
              {!messagesQuery.isLoading &&
                sortedMessages.length === 0 &&
                messages.length === 0 && (
                  <p className="py-12 text-center text-sm text-[#5a5a70]">
                    Envía un mensaje para empezar la conversación.
                  </p>
                )}

              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {sortedMessages.map((m) => (
                  <div key={m._id}>
                    {m.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[min(85%,560px)] rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2.5 text-white shadow-lg shadow-indigo-500/25 [&_p]:text-white">
                          <MessagePartsView parts={m.parts} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                          <Icon name="sparkle" size={13} color="#fff" />
                        </div>
                        <div className="min-w-0 max-w-[min(100%,560px)] flex-1">
                          <MessagePartsView parts={m.parts} assistantLayout />
                          {m.status === "streaming" && (
                            <span className="mt-2 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {messages.map((m) => (
                  <div key={m.id}>
                    {m.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[min(85%,560px)] rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2.5 text-white shadow-lg shadow-indigo-500/25 [&_p]:text-white">
                          {m.parts?.map((p, i) =>
                            p.type === "text" ? (
                              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                                {p.text}
                              </p>
                            ) : null,
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                          <Icon name="sparkle" size={13} color="#fff" />
                        </div>
                        <div className="min-w-0 max-w-[min(100%,560px)] flex-1">
                          {m.parts?.map((p, i) =>
                            p.type === "text" ? (
                              <div
                                key={i}
                                className={
                                  streaming
                                    ? "cursor-blink rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                                    : "rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                                }
                              >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#f0f0f5]">
                                  {p.text}
                                </p>
                              </div>
                            ) : null,
                          )}
                          {streaming && (
                            <span className="mt-2 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
              {error && (
                <div className="mx-auto mb-3 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error.message || "No se pudo obtener la respuesta."}
                </div>
              )}
              {streaming && (
                <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2 text-sm text-[#9090a8]">
                  <Spinner size="sm" color="primary" />
                  <span>
                    {status === "submitted" ? "Enviando…" : "Generando respuesta…"}
                  </span>
                </div>
              )}

              <div className="mx-auto max-w-3xl">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="mr-1 mt-0.5 text-xs text-[#5a5a70]">Tools:</span>
                  <ToolHintChip icon="calendar" label="Fecha" variant="date" />
                  <ToolHintChip icon="clock" label="Hora" variant="time" />
                  <ToolHintChip icon="cloud" label="Clima" variant="weather" />
                </div>

                <form
                  ref={formRef}
                  className="flex gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2 pl-3 sm:pl-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const text = String(fd.get("text") ?? "").trim();
                    if (!text || !chatId || streaming) return;
                    void append({
                      role: "user",
                      content: text,
                    });
                    e.currentTarget.reset();
                  }}
                >
                  <textarea
                    name="text"
                    rows={1}
                    disabled={streaming}
                    placeholder="Escribí tu mensaje…"
                    className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-relaxed text-[#f0f0f5] placeholder:text-[#5a5a70] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        formRef.current?.requestSubmit();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    isIconOnly
                    radius="md"
                    className="h-9 w-9 shrink-0 bg-[var(--accent)] text-white shadow-md shadow-indigo-500/25"
                    isDisabled={streaming}
                    isLoading={status === "submitted"}
                    aria-label="Enviar"
                  >
                    <Icon name="send" size={15} color="#fff" />
                  </Button>
                </form>
                <p className="mt-2 text-center text-[11px] text-[#5a5a70]">
                  Helios puede cometer errores. Verificá la información importante.
                </p>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

function ToolHintChip({
  icon,
  label,
  variant,
}: {
  icon: "calendar" | "clock" | "cloud";
  label: string;
  variant: "date" | "time" | "weather";
}) {
  const styles = {
    date: "border-[#818cf8]/25 bg-[#818cf8]/10 text-[#818cf8]",
    time: "border-emerald-400/25 bg-emerald-400/10 text-emerald-400",
    weather: "border-sky-400/25 bg-sky-400/10 text-sky-400",
  };
  const colors = { date: "#818cf8", time: "#34d399", weather: "#60a5fa" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${styles[variant]}`}
    >
      <Icon name={icon} size={10} color={colors[variant]} />
      {label}
    </span>
  );
}

function ChatListRow({
  title,
  time,
  active,
  pinned,
  onSelect,
  onPin,
  onRename,
  onDelete,
}: {
  title: string;
  time: string;
  active: boolean;
  pinned: boolean;
  onSelect: () => void;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative flex items-center gap-1 rounded-[10px] border transition-colors ${
        active
          ? "border-[var(--border-strong)] bg-[var(--bg-overlay)]"
          : "border-transparent hover:bg-[var(--bg-hover)]"
      }`}
    >
      {active && (
        <div
          className="absolute bottom-1/4 left-0 top-1/4 w-0.5 rounded-r bg-[var(--accent)]"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2.5 text-left"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border ${
            active
              ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
              : "border-[var(--border)] bg-[var(--bg-elevated)]"
          }`}
        >
          <Icon name="sparkle" size={15} color={active ? "var(--accent)" : "#5a5a70"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {pinned && <Icon name="pin" size={10} color="var(--accent)" />}
            <span
              className={`block truncate text-[13px] ${active ? "font-semibold text-[#f0f0f5]" : "font-medium text-[#9090a8]"}`}
            >
              {title}
            </span>
          </div>
        </div>
        <span className="shrink-0 pt-0.5 text-[11px] text-[#5a5a70]">{time}</span>
      </button>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="mr-1 opacity-60 group-hover:opacity-100"
            aria-label="Acciones"
          >
            <Icon name="dots" size={14} color="#9090a8" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Acciones del chat">
          <DropdownItem key="pin" onPress={onPin}>
            {pinned ? "Desanclar" : "Anclar"}
          </DropdownItem>
          <DropdownItem key="rename" onPress={onRename}>
            Renombrar
          </DropdownItem>
          <DropdownItem key="del" className="text-danger" color="danger" onPress={onDelete}>
            Eliminar
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
