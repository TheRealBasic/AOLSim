import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { characters as seedCharacters, Character } from './data/characters';
import { buildInitiation, catchUpOffline, simulateDailyLife } from './simulation/world';
import { requestDialogue } from './api/dialogue';
import { sqliteSchema } from './data/schema';
import './styles/app.css';

type ChatMessage = { sender: string; body: string; at: string; pending?: boolean };
function Buddy({ character, selected, onSelect }: { character: Character; selected: boolean; onSelect: () => void }) {
  const profile = character.profileVariants[0];
  return <button className={`buddy ${selected ? 'selected' : ''}`} onClick={onSelect}><span className="icon">{profile?.icon ?? character.icon}</span><span><strong>{character.screenName}</strong><em>{profile?.awayMessage ?? character.awayMessage ?? profile?.currentSong ?? character.currentSong ?? character.subtitle}</em></span><small>{character.idleMinutes ? `${character.idleMinutes}m` : ''}</small></button>;
}
function BuddyGroup({ title, list, selectedId, onSelect }: { title: string; list: Character[]; selectedId: string; onSelect: (c: Character) => void }) {
  return <section className="group"><h3>{title}</h3>{list.map(c => <Buddy key={c.id} character={c} selected={selectedId===c.id} onSelect={() => onSelect(c)} />)}</section>;
}
function App() {
  const [characters] = useState(seedCharacters);
  const [selected, setSelected] = useState(characters[0]);
  const [input, setInput] = useState('');
  const [typingByCharacter, setTypingByCharacter] = useState<Record<string, boolean>>({});
  const [messagesByCharacter, setMessagesByCharacter] = useState<Record<string, ChatMessage[]>>({
    char_kat_001: [{ sender:'PixelKat', body:'hey\njay said you were asking about me lol', at:'21:00' }],
  });
  const daily = useMemo(() => simulateDailyLife(characters), [characters]);
  const catchup = useMemo(() => catchUpOffline(characters, new Date(Date.now()-1000*60*60*7)), [characters]);
  const initiation = buildInitiation(selected);
  const simulatedSelected = daily.characters.find(c => c.id === selected.id);
  const messages = messagesByCharacter[selected.id] ?? [];
  const typing = typingByCharacter[selected.id] ?? false;
  async function send() {
    if (!input.trim()) return;
    const text = input.trim(); setInput('');
    const selectedId = selected.id;
    const selectedScreenName = selected.screenName;
    const selectedCharacter = selected;
    setMessagesByCharacter(messagesMap => ({
      ...messagesMap,
      [selectedId]: [...(messagesMap[selectedId] ?? []), { sender:'You', body:text, at:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }],
    }));
    setTypingByCharacter(typingMap => ({ ...typingMap, [selectedId]: true }));
    const response = await requestDialogue(selectedCharacter, text);
    response.messages.forEach((msg, index) => setTimeout(() => {
      setMessagesByCharacter(messagesMap => ({
        ...messagesMap,
        [selectedId]: [...(messagesMap[selectedId] ?? []), { sender:selectedScreenName, body:msg.text, at:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }],
      }));
      if (index === response.messages.length-1) setTypingByCharacter(typingMap => ({ ...typingMap, [selectedId]: false }));
    }, msg.delayMs));
  }
  const online = characters.filter(c => c.status==='online'); const away = characters.filter(c => c.status==='away'); const offline = characters.filter(c => c.status==='offline');
  return <main className="desktop"><aside className="buddy-window"><div className="titlebar">Away Message <span>— Connected</span></div><div className="menu">File Edit People Tools Help</div><div className="profile"><div className="avatar">★</div><div><strong>screen_name</strong><p>available // probably</p></div></div><BuddyGroup title="ONLINE" list={online} selectedId={selected.id} onSelect={setSelected}/><BuddyGroup title="AWAY" list={away} selectedId={selected.id} onSelect={setSelected}/><BuddyGroup title="OFFLINE" list={offline} selectedId={selected.id} onSelect={setSelected}/><div className="ad">you've got mail-style notifications • no real ads</div></aside><section className="chat-window"><div className="titlebar">Chat with {selected.screenName}<span>{simulatedSelected?.computedStatus ?? selected.status}</span></div><div className="chat-meta"><b>{selected.realName}</b> — {selected.subtitle}<br />Mood: {selected.mood.primary} because {selected.mood.reason}<br />Now: {simulatedSelected?.activeBlock}</div>{simulatedSelected?.profileChange && <div className="profile-change"><b>Profile changed:</b> {simulatedSelected.profileChange.icon} “{simulatedSelected.profileChange.profileText}”</div>}{initiation && <div className="nudge">First-message motive: {initiation.reason}<br/>Seed: “{initiation.preferredMessageSeed}”</div>}<div className="log">{messages.map((m,i)=><p key={i} className={m.sender==='You'?'mine':''}><span>[{m.at}] {m.sender}:</span>{m.body}</p>)}{typing && <p className="typing">{selected.screenName} is typing...</p>}</div><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); void send(); }}} placeholder="type anything"/><button onClick={() => void send()}>Send</button></div></section><aside className="sim-panel"><h2>Phase 2 living world</h2><p className="absence">{catchup.absenceNotice || 'No one has commented on your absence yet.'}</p><h3>Shared events</h3><ul>{daily.worldEvents.map(e => <li key={e.id}>{e.summary}</li>)}</ul><h3>Knowledge boundaries</h3><ul>{daily.knowledgeBoundaries.map(rule => <li key={rule}>{rule}</li>)}</ul><h3>Relationship pulses</h3><ul>{daily.characters.flatMap(c => c.relationshipPulse.map(r => <li key={`${c.id}-${r.to}`}>{c.screenName} ↔ {r.label}: tension {Math.round(r.tension*100)}%</li>))}</ul><h3>Missed conversations</h3><ul>{daily.missedConversations.map(e => <li key={e.id}>{e.visibleToPlayer ? 'public' : 'private'}: {e.summary}</li>)}</ul><h3>SQLite source of truth</h3><pre>{sqliteSchema.split('\n').slice(1,13).join('\n')}...</pre></aside></main>;
}

createRoot(document.getElementById('root')!).render(<App />);
