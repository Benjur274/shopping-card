import { useState, useEffect, useRef } from 'react';
import './App.css';
import Background from './Background';

function App() {
  const [items, setItems] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch {
      // tichý fail pri background pollingu
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async (newItems) => {
    setSaving(true);
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems),
      });
    } catch (e) {
      console.error('Chyba pri ukladaní:', e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = async () => {
    const text = inputText.trim();
    if (!text) return;
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text,
      done: false,
    };
    const newItems = [newItem, ...items];
    setItems(newItems);
    setInputText('');
    await saveItems(newItems);
    inputRef.current?.focus();
  };

  const toggleItem = async (id) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setItems(newItems);
    await saveItems(newItems);
  };

  const removeItem = async (id) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    await saveItems(newItems);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addItem();
  };

  const activeItems = items.filter((i) => !i.done);
  const doneItems = items.filter((i) => i.done);

  return (
    <>
    <Background />
    <div className="app">
      <div className="card">
        <div className="header">
          <span className="header-icon">🛒</span>
          <h1>Nákupný zoznam</h1>
          {saving && <span className="saving-dot" title="Ukladám..." />}
        </div>

        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Čo treba kúpiť?"
            className="text-input"
            autoFocus
          />
          <button
            onClick={addItem}
            className="add-btn"
            disabled={!inputText.trim()}
          >
            Pridať
          </button>
        </div>

        {loading ? (
          <p className="state-msg">Načítavam...</p>
        ) : items.length === 0 ? (
          <p className="state-msg">Zoznam je prázdny 🎉</p>
        ) : (
          <>
            {activeItems.length > 0 && (
              <ul className="list">
                {activeItems.map((item) => (
                  <li key={item.id} className="item">
                    <button
                      className="check"
                      onClick={() => toggleItem(item.id)}
                      aria-label="Označiť ako kúpené"
                    />
                    <span className="item-text">{item.text}</span>
                    <button
                      className="remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Odstrániť"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {doneItems.length > 0 && (
              <div className="done-section">
                <p className="done-label">Kúpené · {doneItems.length}</p>
                <ul className="list">
                  {doneItems.map((item) => (
                    <li key={item.id} className="item done">
                      <button
                        className="check checked"
                        onClick={() => toggleItem(item.id)}
                        aria-label="Zrušiť kúpené"
                      />
                      <span className="item-text">{item.text}</span>
                      <button
                        className="remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Odstrániť"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default App;
