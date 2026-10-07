import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Send } from "lucide-react";
import { User } from "firebase/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantTabProps {
  user: User;
}

const API_URL = "https://vps-d266d648.vps.ovh.net";

export const AssistantTab = ({ user }: AssistantTabProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ahoj. Můžeš se mě zeptat například na počet zbývajících setů, hodnotu skladu, tržby, zisk nebo průměrnou prodejní cenu.",
    },
  ]);
  const completedHistory = useRef<Message[]>([]);
  const sending = useRef(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const askAssistant = async (message: string) => {
    const trimmed = message.trim();

    if (!trimmed || sending.current) {
      return;
    }

    sending.current = true;
    setError("");
    const history = completedHistory.current;
    setIsSending(true);

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmed,
      },
    ]);

    setInput("");

    try {
      let token = await user.getIdToken();

      const sendRequest = (firebaseToken: string) =>
        fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify({
            message: trimmed,
            history,
          }),
        });

      let response = await sendRequest(token);

      if (response.status === 401) {
        token = await user.getIdToken(true);
        response = await sendRequest(token);
      }

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;

        try {
          const body = await response.json();
          detail = typeof body?.detail === "string" ? body.detail : detail;
        } catch {
          // Keep the HTTP error text.
        }

        throw new Error(detail);
      }

      const data = await response.json();

      const answer =
        typeof data?.answer === "string"
          ? data.answer
          : "Asistent nevrátil textovou odpověď.";

      const nextHistory: Message[] = [
        ...history,
        { role: "user" as const, content: trimmed },
        { role: "assistant" as const, content: answer },
      ].slice(-6);
      while (nextHistory.reduce((sum, item) => sum + item.content.length, 0) > 12000) {
        nextHistory.splice(0, 2);
      }
      completedHistory.current = nextHistory;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      console.error("Assistant request failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se spojit s BrickInvest Assistantem."
      );
    } finally {
      sending.current = false;
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    askAssistant(input);
  };

  const examples = [
    "Kolik mi zbývá setů?",
    "Jaká je hodnota aktuálního skladu?",
    "Kolik jsem zatím vydělal?",
    "Jaká je průměrná prodejní cena?",
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bot size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              BrickInvest Assistant
            </h2>
            <p className="text-sm text-gray-500">
              GPT-6 Luna · živá data z BrickInvestu
            </p>
          </div>
          <button type="button" disabled={isSending}
            className="ml-auto text-sm px-3 py-2 rounded border bg-white disabled:opacity-50"
            onClick={() => {
              completedHistory.current = [];
              setMessages([]);
              setInput("");
              setError("");
            }}>Nový chat</button>
        </div>

        <div className="p-4 min-h-[320px] max-h-[520px] overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`min-w-0 max-w-[95%] sm:max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white whitespace-pre-wrap break-words"
                    : "bg-white border text-gray-800"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="assistant-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml
                      disallowedElements={["img"]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="assistant-table-scroll" role="region" aria-label="Tabulka odpovědi" tabIndex={0}>
                            <table {...props} />
                          </div>
                        ),
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                      }}
                    >{message.content}</ReactMarkdown>
                  </div>
                ) : message.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white border text-gray-500 rounded-lg px-4 py-3">
                Přemýšlím…
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => askAssistant(example)}
                  disabled={isSending}
                  className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              maxLength={4000}
              aria-label="Dotaz pro asistenta"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Zeptej se na své LEGO investice…"
              disabled={isSending}
              className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Odeslat
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              Chyba: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
