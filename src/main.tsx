import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { characters as seedCharacters, Character } from './data/characters';
import { buildInitiation, catchUpOffline } from './simulation/world';
import { requestDialogue } from './api/dialogue';
import { sqliteSchema } from './data/schema';
import './styles/app.css';

type ChatMessage = { sender: string; body: string; at: string; pending?: boolean };
function Buddy({ character, selected, onSelect }: { character: Character; selected: boolean; onSelect: () => void }) {
  return <button className={`buddy ${selected ? 'selected' : ''}`} onClick={onSelect}><span className="icon">{character.icon}</span><span><strong>{character.screenName}</strong><em>{character.awayMessage ?? character.currentSong ?? character.subtitle}</em></span><small>{character.idleMinutes ? `${character.idleMinutes}m` : ''}</small></button>;
}
function BuddyGroup({ title, list, selectedId, onSelect }: { title: string; list: Character[]; selectedId: string; onSelect: (c: Character) => void }) {
  return <section className="group"><h3>{title}</h3>{list.map(c => <Buddy key={c.id} character={c} selected={selectedId===c.id} onSelect={() => onSelect(c)} />)}</section>;
}
function App() {
  const [characters] = useState(seedCharacters);
  const [selected, setSelected] = useState(characters[0]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ sender:'PixelKat', body:'hey\njay said you were asking about me lol', at:'21:00' }]);
  const catchup = useMemo(() => catchUpOffline(characters, new Date(Date.now()-1000*60*60*7)), [characters]);
  const initiation = buildInitiation(selected);
  async function send() {
    if (!input.trim()) return;
    const text = input.trim(); setInput('');
    setMessages(m => [...m, { sender:'You', body:text, at:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
    setTyping(true);
    const response = await requestDialogue(selected, text);
    response.messages.forEach((msg, index) => setTimeout(() => {
      setMessages(m => [...m, { sender:selected.screenName, body:msg.text, at:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
      if (index === response.messages.length-1) setTyping(false);
    }, msg.delayMs));
  }
  const online = characters.filter(c => c.status==='online'); const away = characters.filter(c => c.status==='away'); const offline = characters.filter(c => c.status==='offline');
  return <main className="desktop"><aside className="buddy-window"><div className="titlebar">Away Message <span>— Connected</span></div><div className="menu">File Edit People Tools Help</div><div className="profile"><div className="avatar">★</div><div><strong>screen_name</strong><p>available // probably</p></div></div><BuddyGroup title="ONLINE" list={online} selectedId={selected.id} onSelect={setSelected}/><BuddyGroup title="AWAY" list={away} selectedId={selected.id} onSelect={setSelected}/><BuddyGroup title="OFFLINE" list={offline} selectedId={selected.id} onSelect={setSelected}/><div className="ad">you've got mail-style notifications • no real ads</div></aside><section className="chat-window"><div className="titlebar">Chat with {selected.screenName}<span>{selected.status}</span></div><div className="chat-meta"><b>{selected.realName}</b> — {selected.subtitle}<br />Mood: {selected.mood.primary} because {selected.mood.reason}</div>{initiation && <div className="nudge">First-message motive: {initiation.reason}<br/>Seed: “{initiation.preferredMessageSeed}”</div>}<div className="log">{messages.map((m,i)=><p key={i} className={m.sender==='You'?'mine':''}><span>[{m.at}] {m.sender}:</span>{m.body}</p>)}{typing && <p className="typing">{selected.screenName} is typing...</p>}</div><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); void send(); }}} placeholder="type anything"/><button onClick={() => void send()}>Send</button></div></section><aside className="sim-panel"><h2>Living world</h2><p>{catchup.absenceNotice || 'No one has commented on your absence yet.'}</p><ul>{catchup.worldEvents.map(e => <li key={e}>{e}</li>)}</ul><h3>SQLite source of truth</h3><pre>{sqliteSchema.split('\n').slice(1,13).join('\n')}...</pre></aside></main>;
}

createRoot(document.getElementById('root')!).render(<App />);
