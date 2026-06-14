import { useEffect, useMemo, useRef, useState } from "react";
import { askAdvisor, getAdvisorMessages, getAdvisorThreads } from "../../api/advisor";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatMoney = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const AdvisorIcon = ({ dark = false }) => (
  <span
    className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${
      dark ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-700"
    }`}
  >
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 8V5" />
      <path d="M8 5h8" />
      <rect x="5" y="8" width="14" height="10" rx="4" />
      <path d="M9 13h.01M15 13h.01" />
      <path d="M10 17h4" />
    </svg>
  </span>
);

const UserIcon = () => (
  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  </span>
);

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const suggestedQuestions = [
  "What should I improve this month?",
  "Am I overspending anywhere?",
  "How can I reach my goals faster?",
  "Review my budget risks.",
];

const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
};

const parseMarkdownTable = (lines, startIndex) => {
  const tableLines = [];
  let index = startIndex;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    tableLines.push(lines[index].trim());
    index += 1;
  }

  if (tableLines.length < 2) return null;

  const rows = tableLines
    .filter((line) => !/^\|?\s*-+\s*(\|\s*-+\s*)+\|?$/.test(line))
    .map((line) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim()),
    );

  return {
    rows,
    nextIndex: index,
  };
};

const AdviceContent = ({ content }) => {
  const lines = content.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const parsedTable = parseMarkdownTable(lines, index);

      if (parsedTable) {
        blocks.push({ type: "table", rows: parsedTable.rows });
        index = parsedTable.nextIndex;
        continue;
      }
    }

    if (/^\*\*.+\*\*$/.test(line)) {
      blocks.push({ type: "heading", text: line.slice(2, -2) });
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered", items });
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-•]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-•]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered", items });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
    index += 1;
  }

  return (
    <div className="space-y-4 text-sm leading-6 text-slate-700">
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`${block.text}-${blockIndex}`}
              className="pt-1 text-base font-black text-slate-900"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`${block.text}-${blockIndex}`}>
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol
              key={`ordered-${blockIndex}`}
              className="space-y-2 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className="list-decimal pl-1"
                >
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "unordered") {
          return (
            <ul
              key={`unordered-${blockIndex}`}
              className="space-y-2 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="list-disc pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          const [headers, ...rows] = block.rows;

          return (
            <div
              key={`table-${blockIndex}`}
              className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"
            >
              <table className="min-w-[620px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="px-3 py-3 font-black">
                        {renderInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          className="px-3 py-3 align-top"
                        >
                          {renderInline(cell.replace(/<br\s*\/?>/gi, "\n"))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

const Advisor = () => {
  const [periodMonth, setPeriodMonth] = useState(currentMonth());
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about your budget, spending, wallets, or goals. I will use your real monthly report data.",
    },
  ]);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [model, setModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const monthLabel = useMemo(() => {
    const [year, month] = periodMonth.split("-");
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, 1));
  }, [periodMonth]);

  const loadThreads = async () => {
    setIsLoadingThreads(true);
    try {
      const response = await getAdvisorThreads();
      setThreads(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load advisor history.",
      );
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const openThread = async (thread) => {
    setError("");
    setActiveThreadId(thread.id);
    setPeriodMonth(thread.periodMonth || currentMonth());
    setSnapshot(null);
    setModel("");

    try {
      const response = await getAdvisorMessages(thread.id);
      const savedMessages = (response.data || []).map((message) => ({
        role: message.role,
        content: message.content,
        model: message.model,
      }));
      setMessages(
        savedMessages.length > 0
          ? savedMessages
          : [
              {
                role: "assistant",
                content: "This chat does not have messages yet.",
              },
            ],
      );
      const lastAssistant = [...savedMessages]
        .reverse()
        .find((message) => message.role === "assistant" && message.model);
      setModel(lastAssistant?.model || "");
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load advisor messages.",
      );
    }
  };

  const sendQuestion = async (event, overrideQuestion) => {
    event?.preventDefault();
    const text = (overrideQuestion || question).trim();
    if (!text || isLoading) return;

    setQuestion("");
    setError("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", content: text }]);

    try {
      const response = await askAdvisor({
        question: text,
        periodMonth,
        threadId: activeThreadId || undefined,
        currency: "IDR",
        useCheapModel: false,
      });

      setModel(response.data.model || "");
      setSnapshot(response.data.snapshot || null);
      setActiveThreadId(response.data.threadId || activeThreadId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.advice || "No advice returned.",
          model: response.data.model || "",
        },
      ]);
      setThreads((current) => upsertThread(current, response.data, periodMonth));
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to ask advisor.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not generate advice right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = () => {
    setActiveThreadId("");
    setMessages([
      {
        role: "assistant",
        content:
          "New chat started. Ask anything about your current monthly financial data.",
      },
    ]);
    setSnapshot(null);
    setModel("");
    setError("");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-7xl flex-col px-4 md:h-[calc(100svh-48px)] md:min-h-0 md:px-8 xl:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            AI Advisor
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Advice based on your real wallets, budgets, transactions, and goals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none"
            value={periodMonth}
            onChange={(event) => setPeriodMonth(event.target.value)}
          />
          <button
            type="button"
            onClick={newChat}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            New Chat
          </button>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      <section className="mt-5 grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-100 bg-slate-50/60 p-4 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              History
            </p>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
              {isLoadingThreads ? (
                <p className="rounded-xl bg-white p-3 text-xs font-bold text-slate-400">
                  Loading history...
                </p>
              ) : threads.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs font-semibold leading-5 text-slate-500">
                  No advisor chats yet.
                </p>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => openThread(thread)}
                    className={`w-full rounded-xl p-3 text-left transition ${
                      activeThreadId === thread.id
                        ? "bg-blue-50 text-blue-800"
                        : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <p className="truncate text-sm font-bold">{thread.title}</p>
                    <p className="mt-1 text-xs font-medium opacity-70">
                      {thread.periodMonth || "No period"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Context
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">{monthLabel}</p>

          {snapshot ? (
            <div className="mt-4 space-y-3">
              <ContextRow label="Income" value={formatMoney(snapshot.income)} />
              <ContextRow label="Expense" value={formatMoney(snapshot.expense)} />
              <ContextRow label="Net" value={formatMoney(snapshot.net)} />
              <ContextRow
                label="Health"
                value={`${snapshot.healthScore?.score || 0}/100`}
              />
              <ContextRow
                label="Top risk"
                value={snapshot.topCategories?.[0]?.category || "No expense"}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs font-semibold leading-5 text-slate-500">
              Ask a question to load this month&apos;s financial snapshot.
            </p>
          )}
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Try Asking
            </p>
            <div className="mt-3 space-y-2">
              {suggestedQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={(event) => sendQuestion(event, item)}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white p-3 text-left text-xs font-bold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

        </aside>

        <div className="flex min-h-0 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && <AdvisorIcon />}
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 text-sm font-medium leading-6 ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <AdviceContent content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
                {message.role === "user" && <UserIcon />}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <AdvisorIcon />
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
                  Reading your report and thinking...
                </div>
              </div>
            )}
          </div>

          <form className="border-t border-slate-100 p-4" onSubmit={sendQuestion}>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Ask anything about your finances..."
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-2 text-[10px] font-medium text-slate-400">
              AI suggestions are informational. Review before applying changes.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

const ContextRow = ({ label, value }) => (
  <div className="rounded-xl bg-white p-3 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
  </div>
);

const upsertThread = (threads, response, fallbackPeriodMonth) => {
  if (!response.threadId) return threads;

  const nextThread = {
    id: response.threadId,
    title: response.threadTitle || "Advisor chat",
    periodMonth: response.periodMonth || fallbackPeriodMonth,
    updatedAt: new Date().toISOString(),
  };

  return [
    nextThread,
    ...threads.filter((thread) => thread.id !== response.threadId),
  ];
};

export default Advisor;
