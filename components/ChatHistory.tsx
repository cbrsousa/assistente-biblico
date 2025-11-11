import React, { useEffect, useRef, useState } from 'react';
import type { Message, Bookmark } from '../types';
import type { FontSize } from '../App';
import WelcomeMessage from './WelcomeMessage';
import TextSelectionMenu from './TextSelectionMenu';
import { bibleBookRegexList } from '../data/bibleBooks';
import { generateSpeech } from '../services/geminiService';

// Regex to find Bible verse patterns like "João 3:16" or "1 Coríntios 13:4-7".
const bibleVerseRegex = new RegExp(
  `\\b([1-3]?\\s?)(${bibleBookRegexList.join('|')})\\s(\\d{1,3}:\\d{1,3}(?:-\\d{1,3})?)\\b`,
  'gi'
);

// Helper functions for audio decoding from Gemini docs
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Strips markdown formatting from a string to prepare it for Text-to-Speech.
 * @param markdown The raw markdown string.
 * @returns A plain text string.
 */
const stripMarkdownForTTS = (markdown: string): string => {
  let text = markdown;

  // Block-level elements
  text = text
    .replace(/^#{1,6}\s/gm, '') // Headings
    .replace(/^\s*[-*+]\s/gm, '') // Unordered list items
    .replace(/^\s*\d+\.\s/gm, '') // Ordered list items
    .replace(/^\s*>\s?/gm, '') // Blockquotes
    .replace(/^---/gm, ''); // Horizontal rules

  // Inline elements
  text = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/~~(.*?)~~/g, '$1') // Strikethrough
    .replace(/`(.*?)`/g, '$1'); // Inline code

  // Cleanup
  text = text
    .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
    .trim();

  return text;
};


interface FormattedMessageProps {
  text: string;
  onSendMessage: (prompt: string) => void;
}

/**
 * A component that parses a string for Bible verses and turns them into clickable buttons
 * that trigger an in-app action to display the verse.
 */
const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, onSendMessage }) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(bibleVerseRegex)) {
    const [fullMatch] = match;
    const startIndex = match.index!;

    // Add the text before the citation
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Add the citation as a button
    parts.push(
      <button
        key={startIndex}
        onClick={() => onSendMessage(`Mostre-me o versículo ${fullMatch}.`)}
        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md px-1.5 py-0.5 mx-0.5 font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors no-underline cursor-pointer"
        title={`Ver o texto de ${fullMatch}`}
      >
        {fullMatch}
      </button>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Add any remaining text after the last citation
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no verses were found, return the original text
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
};


type AudioStatus = 'idle' | 'generating' | 'playing' | 'paused' | 'error';
interface AudioState {
  messageId: string | null;
  status: AudioStatus;
}
interface MessageBubbleProps {
  message: Message;
  onSendMessage: (prompt: string) => void;
  fontSize: FontSize;
  isBookmarked: boolean;
  onToggleBookmark: (message: Message) => void;
  onAudioControl: (message: Message) => void;
  audioState: AudioState;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSendMessage, fontSize, isBookmarked, onToggleBookmark, onAudioControl, audioState }) => {
  const isModel = message.role === 'model';
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  
  const handleToggle = () => {
    onToggleBookmark(message);
    if (bookmarkRef.current) {
        bookmarkRef.current.classList.add('animate-pulse-bookmark');
        bookmarkRef.current.onanimationend = () => {
            bookmarkRef.current?.classList.remove('animate-pulse-bookmark');
        };
    }
  };
  
  const handleAudio = () => {
    onAudioControl(message);
  };
  
  const isCurrentMessageAudio = audioState.messageId === message.id;
  const { status } = audioState;

  let buttonIcon;
  let buttonAriaLabel = "Ler em voz alta";
  let buttonTitle = "Ler em voz alta";

  if (isCurrentMessageAudio) {
      if (status === 'generating') {
          buttonIcon = (
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          );
          buttonAriaLabel = "Gerando áudio...";
          buttonTitle = "Gerando áudio...";
      } else if (status === 'playing') {
          buttonIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 100-2H9V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 100-2h-1V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          );
          buttonAriaLabel = "Pausar leitura";
          buttonTitle = "Pausar leitura";
      } else if (status === 'paused') {
          buttonIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          );
          buttonAriaLabel = "Continuar leitura";
          buttonTitle = "Continuar leitura";
      }
  }

  if (!buttonIcon) {
    buttonIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
  }


  return (
    <div className={`group flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in-up`}>
      <div
        className={`relative max-w-[85%] sm:max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg shadow-md transition-all ${
          isModel 
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none' 
            : 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-none'
        } ${
          isBookmarked && isModel ? 'border-l-4 border-yellow-400 dark:border-yellow-500' : ''
        }`}
      >
        {isModel && (
            <div className="absolute top-2 right-2 flex space-x-1">
                <button
                    onClick={handleAudio}
                    disabled={status === 'generating' && isCurrentMessageAudio}
                    className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-wait"
                    aria-label={buttonAriaLabel}
                    title={buttonTitle}
                >
                    {buttonIcon}
                </button>
                 <button
                    ref={bookmarkRef}
                    onClick={handleToggle}
                    className={`p-1 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        isBookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    aria-label={isBookmarked ? "Remover versículo salvo" : "Salvar versículo"}
                    title={isBookmarked ? "Remover versículo salvo" : "Salvar versículo"}
                >
                    {isBookmarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    )}
                </button>
            </div>
        )}
        {message.imageUrl && (
          <div className="relative mt-2 group/image">
            <img
              src={message.imageUrl}
              alt="Imagem gerada pela IA"
              className="rounded-lg max-w-full h-auto"
            />
            <a
              href={message.imageUrl}
              download="imagem-gerada-ia.png"
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity opacity-0 group-hover/image:opacity-100 focus:opacity-100"
              title="Baixar imagem"
              aria-label="Baixar imagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        )}
        <div className={`${fontSize} whitespace-pre-wrap leading-relaxed ${isModel ? 'pr-20' : ''}`}>
          {isModel ? <FormattedMessage text={message.text} onSendMessage={onSendMessage} /> : message.text}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold mb-1">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
              {message.sources.map((source, index) => (
                <li key={index} className="text-sm">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 dark:hover:text-blue-300">
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatHistoryProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  fontSize: FontSize;
  bookmarks: Bookmark[];
  onToggleBookmark: (message: Message) => void;
  isMobile: boolean;
  audioCache: Map<string, string>;
  onAudioGenerated: (messageId: string, audioData: string) => void;
}

interface SelectionInfo {
  text: string;
  top: number;
  left: number;
}


const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, onSendMessage, fontSize, bookmarks, onToggleBookmark, audioCache, onAudioGenerated }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);

  const [audioState, setAudioState] = useState<AudioState>({ messageId: null, status: 'idle' });

  // Use refs to hold audio objects and state to avoid re-renders and stale closures
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioProgressRef = useRef({ pausedAt: 0, playbackStartedAt: 0 });
  const intentionalStopRef = useRef(false);

  // Stop and clean up any existing audio resources
  const stopAndCleanupAudio = async () => {
    if (audioSourceRef.current) {
      intentionalStopRef.current = true;
      audioSourceRef.current.onended = null;
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if the source is already stopped
      }
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
    }
    audioContextRef.current = null;
    audioSourceRef.current = null;
    audioBufferRef.current = null;
    audioProgressRef.current = { pausedAt: 0, playbackStartedAt: 0 };
    setAudioState({ messageId: null, status: 'idle' });
  };
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAndCleanupAudio();
    };
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selection && selectedText && selectedText.length > 1) {
        const range = selection.getRangeAt(0);
        const anchorNode = range.commonAncestorContainer;
        
        const targetElement = anchorNode.nodeType === Node.ELEMENT_NODE 
          ? anchorNode as HTMLElement 
          : anchorNode.parentElement;

        const modelMessageBubble = targetElement?.closest('.group .bg-white, .group .dark\\:bg-gray-700');
        
        if (modelMessageBubble && chatContainerRef.current) {
          const rect = range.getBoundingClientRect();
          const containerRect = chatContainerRef.current.getBoundingClientRect();
          
          if (containerRect.width === 0 || containerRect.height === 0) {
              setSelectionInfo(null);
              return;
          }

          setSelectionInfo({
            text: selectedText,
            top: rect.top - containerRect.top + chatContainerRef.current.scrollTop - 45,
            left: rect.left - containerRect.left + rect.width / 2,
          });
          return;
        }
      }
      
      setSelectionInfo(null);
    };

    document.addEventListener('mouseup', handleSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  const playAudio = (offset = 0) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    intentionalStopRef.current = false;
    // Create a new source node. A source can only be started once.
    const source = audioContextRef.current.createBufferSource();
    audioSourceRef.current = source;
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      // Only clean up if the audio finished playing on its own, not if it was stopped intentionally.
      if (!intentionalStopRef.current) {
        stopAndCleanupAudio();
      }
    };
    
    source.start(0, offset);
    // Track when this segment of playback started for pause calculations
    audioProgressRef.current.playbackStartedAt = audioContextRef.current.currentTime - offset;
    setAudioState(prev => ({ ...prev, status: 'playing' }));
  }


  const handleAudioControl = async (message: Message) => {
    const { id, text } = message;

    const isSameMessage = audioState.messageId === id;
    const { status } = audioState;

    // Case 1: Click Pause on a playing message
    if (isSameMessage && status === 'playing') {
      if (audioSourceRef.current && audioContextRef.current) {
        // Calculate how far into the buffer we are
        const elapsed = audioContextRef.current.currentTime - audioProgressRef.current.playbackStartedAt;
        audioProgressRef.current.pausedAt = elapsed;

        intentionalStopRef.current = true;
        audioSourceRef.current.stop(); // This is destructive, a new source is needed to resume
        setAudioState(prev => ({ ...prev, status: 'paused' }));
      }
      return;
    }

    // Case 2: Click Play on a paused message
    if (isSameMessage && status === 'paused') {
      playAudio(audioProgressRef.current.pausedAt);
      return;
    }
    
    // Case 3: Play a new message (or a different one)
    await stopAndCleanupAudio();
    
    try {
      setAudioState({ messageId: id, status: 'generating' });
      const cachedAudio = audioCache.get(id);
      let base64Audio: string;

      if (cachedAudio) {
        // Audio is pre-generated, use it directly.
        base64Audio = cachedAudio;
      } else {
        // Not in cache, so we need to generate it.
        const textToSpeak = stripMarkdownForTTS(text);
        base64Audio = await generateSpeech(textToSpeak);
        // Once generated, update the cache via the callback to App.tsx
        onAudioGenerated(id, base64Audio);
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      audioBufferRef.current = audioBuffer;

      // Reset progress and start playing from the beginning
      audioProgressRef.current = { pausedAt: 0, playbackStartedAt: 0 };
      setAudioState(prev => ({ ...prev, messageId: id, status: 'idle' })); // Set back to idle before playing
      playAudio(0);
      
    } catch (error) {
        console.error("Failed to play audio:", error);
        alert(`Erro ao reproduzir áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        stopAndCleanupAudio();
    }
  };
  
  const handleAskAboutSelection = (text: string) => {
    onSendMessage(`Explique o que significa "${text}" no contexto bíblico.`);
    setSelectionInfo(null);
  };

  const handleGetOriginalMeaning = (text: string) => {
    onSendMessage(`__GET_ORIGINAL_MEANING__:${text}`);
    setSelectionInfo(null);
  };

  const bookmarkedIds = new Set(bookmarks.map(b => b.id));

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 relative"
    >
      {selectionInfo && (
        <TextSelectionMenu 
          top={selectionInfo.top}
          left={selectionInfo.left}
          selectedText={selectionInfo.text}
          onAsk={handleAskAboutSelection}
          onGetOriginalMeaning={handleGetOriginalMeaning}
          onClose={() => setSelectionInfo(null)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && <WelcomeMessage fontSize={fontSize} onSendMessage={onSendMessage} />}
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onSendMessage={onSendMessage} 
            fontSize={fontSize}
            isBookmarked={bookmarkedIds.has(msg.id)}
            onToggleBookmark={onToggleBookmark}
            onAudioControl={handleAudioControl}
            audioState={audioState}
          />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatHistory;