import React, { useState } from "react";
import "./App.css";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HeaderRow = {
  key: string;
  value: string;
};

type HistoryItem = {
  id: number;
  method: HttpMethod;
  url: string;
};

const App: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>("GET");

  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/users"
  );

  const [body, setBody] = useState("");

  const [headers, setHeaders] = useState<HeaderRow[]>([
    {
      key: "Content-Type",
      value: "application/json",
    },
  ]);

  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addHeader = () => {
    setHeaders([
      ...headers,
      {
        key: "",
        value: "",
      },
    ]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updatedHeaders = [...headers];

    updatedHeaders[index] = {
      ...updatedHeaders[index],
      [field]: value,
    };

    setHeaders(updatedHeaders);
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setError("Please enter an API URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setStatus("");
    setResponseTime("");
    setCopyMessage("");

    const startTime = Date.now();

    try {
      const requestHeaders: Record<string, string> = {};

      headers.forEach((header) => {
        if (header.key.trim()) {
          requestHeaders[header.key.trim()] = header.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== "GET" && method !== "DELETE" && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);

      const endTime = Date.now();

      setStatus(`${res.status} ${res.statusText}`);
      setResponseTime(`${endTime - startTime} ms`);

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        method,
        url,
      };

      setHistory((previousHistory) => [
        newHistoryItem,
        ...previousHistory,
      ]);

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (err) {
      setError(
        "Request failed. Check the URL, your internet connection, or whether the API allows browser requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setResponse("");
    setStatus("");
    setResponseTime("");
    setError("");
    setCopyMessage("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const clearResponse = () => {
    setResponse("");
    setStatus("");
    setResponseTime("");
    setError("");
    setCopyMessage("");
  };

  const formatJSON = () => {
    if (!response.trim()) {
      return;
    }

    try {
      const parsedJSON = JSON.parse(response);
      setResponse(JSON.stringify(parsedJSON, null, 2));
      setCopyMessage("");
    } catch (err) {
      setError("The response is not valid JSON.");
    }
  };

  const copyResponse = async () => {
    if (!response.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(response);
      setCopyMessage("Response copied.");
    } catch (err) {
      setCopyMessage("Unable to copy response.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>API Testing Tool</h1>
          <p>Send HTTP requests and inspect API responses.</p>
        </div>
      </header>

      <main className="container">
        <section className="request-card">
          <h2>Request</h2>

          <div className="request-row">
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as HttpMethod)
              }
              className="method-select"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter API URL"
              className="url-input"
            />

            <button
              onClick={sendRequest}
              disabled={loading}
              className="send-button"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          <div className="headers-section">
            <div className="section-title">
              <h3>Headers</h3>

              <button
                type="button"
                onClick={addHeader}
                className="add-header-button"
              >
                + Add Header
              </button>
            </div>

            {headers.map((header, index) => (
              <div className="header-row" key={index}>
                <input
                  type="text"
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(index, "key", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(index, "value", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="remove-header-button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {method !== "GET" && method !== "DELETE" && (
            <div className="body-section">
              <label>Request Body (JSON)</label>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`{
  "name": "John",
  "email": "john@example.com"
}`}
              />
            </div>
          )}
        </section>

        <section className="response-card">
          <div className="response-header">
            <h2>Response</h2>

            <div className="response-actions">
              <button
                onClick={formatJSON}
                className="format-button"
                disabled={!response}
              >
                Format JSON
              </button>

              <button
                onClick={copyResponse}
                className="copy-button"
                disabled={!response}
              >
                Copy
              </button>

              <button onClick={clearResponse} className="clear-button">
                Clear
              </button>
            </div>
          </div>

          {(status || responseTime) && (
            <div className="response-info">
              {status && (
                <span className="status">
                  Status: <strong>{status}</strong>
                </span>
              )}

              {responseTime && (
                <span className="time">
                  Time: <strong>{responseTime}</strong>
                </span>
              )}
            </div>
          )}

          {copyMessage && (
            <div className="copy-message">{copyMessage}</div>
          )}

          {error && <div className="error">{error}</div>}

          <pre className="response-box">
            {response || "Response will appear here..."}
          </pre>
        </section>

        <section className="history-card">
          <div className="history-header">
            <h2>Request History</h2>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="clear-history-button"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="empty-history">
              No requests yet. Send a request to see it here.
            </p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="history-item"
                >
                  <span className="history-method">
                    {item.method}
                  </span>

                  <span className="history-url">
                    {item.url}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="info-card">
          <h2>How to use</h2>

          <ol>
            <li>Select an HTTP method.</li>
            <li>Enter an API URL.</li>
            <li>Add request headers if required.</li>
            <li>For POST, PUT, or PATCH, enter a JSON body.</li>
            <li>Click Send.</li>
            <li>View the status, response time, and API response.</li>
            <li>Use Request History to reload previous requests.</li>
            <li>Format or copy the API response when needed.</li>
          </ol>
        </section>
      </main>
    </div>
  );
};

export default App;

