import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Gift, 
  Music, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Settings,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ExternalLink,
  QrCode
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
}

interface GiftItem {
  id: string;
  name: string;
  price: number;
  image: string;
  bought: boolean;
}

interface WeddingConfig {
  coupleNames: string;
  weddingDate: string;
  location: string;
  pixKey: string;
  whatsappNumber: string;
  envelopeText: string;
  heroImage: string;
  gallery: string[];
  playlist: { title: string; artist: string; url: string }[];
}

// --- Components ---

const EditableText = ({ 
  value, 
  onSave, 
  isEditing, 
  className,
  as: Component = "span"
}: { 
  value: string; 
  onSave: (val: string) => void; 
  isEditing: boolean;
  className?: string;
  as?: any;
}) => {
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2">
        <input 
          type="text" 
          value={localValue} 
          onChange={(e) => setLocalValue(e.target.value)}
          className={cn("border-b border-lilac-deep outline-none bg-transparent", className)}
        />
        <button onClick={() => onSave(localValue)} className="text-green-500 hover:text-green-600"><CheckCircle2 size={16} /></button>
      </div>
    );
  }
  return <Component className={className}>{value}</Component>;
};

const EditableImage = ({ 
  src, 
  onSave, 
  isEditing, 
  className 
}: { 
  src: string; 
  onSave: (val: string) => void; 
  isEditing: boolean;
  className?: string;
}) => {
  if (isEditing) {
    return (
      <div className="relative group">
        <img src={src} className={className} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              const newUrl = prompt("Insira a URL da nova imagem:", src);
              if (newUrl) onSave(newUrl);
            }}
            className="bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg"
          >
            Trocar Foto
          </button>
        </div>
      </div>
    );
  }
  return <img src={src} className={className} referrerPolicy="no-referrer" />;
};

const Envelope = ({ onOpen, text, isEditing, onSaveText }: { onOpen: () => void; text: string; isEditing: boolean; onSaveText: (v: string) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -1000 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-pearl overflow-hidden"
    >
      <div className="relative w-[90vw] max-w-md aspect-[4/3] bg-white shadow-2xl rounded-sm border border-gray-100 flex items-center justify-center p-8">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpen}
          className="relative cursor-pointer group"
        >
          {/* Wax Seal */}
          <div className="w-24 h-24 rounded-full bg-lilac-deep shadow-lg flex items-center justify-center border-4 border-lilac-medium relative z-10">
            <div className="text-white font-serif text-center leading-tight">
              <div className="text-xs uppercase tracking-widest">Clique</div>
              <div className="text-lg font-bold">Aqui</div>
            </div>
          </div>
          
          {/* Decorative Rings */}
          <div className="absolute inset-[-10px] border border-lilac-medium rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-[-20px] border border-lilac-soft rounded-full opacity-30 group-hover:scale-125 transition-transform duration-700" />
        </motion.div>
        
        <div className="absolute bottom-8 text-center w-full px-8">
          <EditableText 
            value={text} 
            onSave={onSaveText} 
            isEditing={isEditing} 
            className="font-serif italic text-gray-400 text-sm" 
          />
        </div>
      </div>
    </motion.div>
  );
};

const AudioPlayer = ({ 
  playlist, 
  isLoggedIn, 
  handleAdminUpdate 
}: { 
  playlist: WeddingConfig["playlist"]; 
  isLoggedIn: boolean; 
  handleAdminUpdate: (type: any, payload: any) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const next = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-lilac-soft flex items-center gap-3 max-w-[280px]">
      <audio 
        ref={audioRef} 
        src={playlist[currentIndex]?.url} 
        onEnded={next}
      />
      <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-lilac-deep text-white flex items-center justify-center hover:bg-lilac-medium transition-colors">
        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
      </button>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] uppercase tracking-tighter text-gray-400 font-medium truncate">Agora tocando</p>
        <p className="text-xs font-semibold truncate text-gray-700">{playlist[currentIndex]?.title}</p>
        {isLoggedIn && (
          <button 
            onClick={() => {
              const title = prompt("Título da música:", playlist[currentIndex].title);
              const artist = prompt("Artista:", playlist[currentIndex].artist);
              const url = prompt("URL do MP3:", playlist[currentIndex].url);
              if (title && artist && url) {
                const newPlaylist = [...playlist];
                newPlaylist[currentIndex] = { title, artist, url };
                handleAdminUpdate("config", { playlist: newPlaylist });
              }
            }}
            className="text-[8px] text-lilac-deep font-bold uppercase"
          >
            Editar Música
          </button>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={prev} className="p-1 text-gray-400 hover:text-lilac-deep"><SkipBack size={16} /></button>
        <button onClick={next} className="p-1 text-gray-400 hover:text-lilac-deep"><SkipForward size={16} /></button>
      </div>
    </div>
  );
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const distance = formatDistanceToNow(new Date(targetDate), { locale: ptBR, addSuffix: true });
        setTimeLeft(distance);
      } catch (e) {
        setTimeLeft("Em breve");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-lilac-deep">
        <Clock size={20} />
        <span className="font-serif text-xl font-bold uppercase tracking-widest">Contagem Regressiva</span>
      </div>
      <p className="text-gray-500 font-medium">{timeLeft}</p>
    </div>
  );
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{ guests: Guest[], gifts: GiftItem[], config: WeddingConfig } | null>(null);
  const [activeSection, setActiveSection] = useState<"home" | "rsvp" | "gifts" | "location">("home");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // RSVP States
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gift States
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  useEffect(() => {
    fetch("/api/data")
      .then(res => res.json())
      .then(setData);
  }, []);

  const handleRSVP = async (guestId: string, confirmed: boolean) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, confirmed })
      });
      if (res.ok) {
        const updatedData = await fetch("/api/data").then(r => r.json());
        setData(updatedData);
        setSelectedGuest(null);
        setSearch("");
        alert("Presença confirmada com sucesso!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword })
    });
    if (res.ok) {
      setIsLoggedIn(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const handleAdminUpdate = async (type: "guests" | "gifts" | "config", payload: any) => {
    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword, type, payload })
    });
    if (res.ok) {
      const updatedData = await fetch("/api/data").then(r => r.json());
      setData(updatedData);
    }
  };

  const addGuest = () => {
    const name = prompt("Nome do novo convidado:");
    if (name && data) {
      const newGuests = [...data.guests, { id: Date.now().toString(), name, confirmed: false }];
      handleAdminUpdate("guests", newGuests);
    }
  };

  const addGift = () => {
    const name = prompt("Nome do presente:");
    const price = parseFloat(prompt("Valor do presente (R$):") || "0");
    const image = prompt("URL da imagem do presente:", "https://picsum.photos/seed/gift/400/300");
    if (name && data) {
      const newGifts = [...data.gifts, { id: Date.now().toString(), name, price, image, bought: false }];
      handleAdminUpdate("gifts", newGifts);
    }
  };

  if (!data) return <div className="h-screen flex items-center justify-center font-serif text-lilac-deep animate-pulse">Carregando...</div>;

  return (
    <div className="min-h-screen bg-pearl selection:bg-lilac-soft selection:text-lilac-deep">
      <AnimatePresence>
        {!isOpen && (
          <Envelope 
            onOpen={() => setIsOpen(true)} 
            text={data.config.envelopeText} 
            isEditing={isLoggedIn}
            onSaveText={(v) => handleAdminUpdate("config", { envelopeText: v })}
          />
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-24"
        >
          {/* Header */}
          <header className="py-12 px-6 text-center space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <EditableText 
                value={data.config.coupleNames} 
                onSave={(v) => handleAdminUpdate("config", { coupleNames: v })}
                isEditing={isLoggedIn}
                as="h1"
                className="text-5xl md:text-7xl font-serif text-lilac-deep italic mb-2 block"
              />
              <p className="font-sans uppercase tracking-[0.3em] text-gray-400 text-sm">Convidam para seu casamento</p>
            </motion.div>
            
            <div className="w-12 h-[1px] bg-lilac-medium mx-auto" />
            
            <nav className="flex flex-wrap justify-center gap-4 pt-8">
              {[
                { id: "rsvp", label: "Confirmar Presença", icon: CheckCircle2 },
                { id: "gifts", label: "Lista de Presentes", icon: Gift },
                { id: "location", label: "Local e Horário", icon: MapPin },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveSection(btn.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 font-medium text-sm",
                    activeSection === btn.id 
                      ? "bg-lilac-deep text-white border-lilac-deep shadow-lg scale-105" 
                      : "bg-white text-gray-600 border-gray-100 hover:border-lilac-medium hover:text-lilac-deep"
                  )}
                >
                  <btn.icon size={18} />
                  {btn.label}
                </button>
              ))}
            </nav>
          </header>

          <main className="max-w-4xl mx-auto px-6">
            <AnimatePresence mode="wait">
              {activeSection === "home" && (
                <motion.section
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16 py-12"
                >
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <EditableImage 
                      src={data.config.heroImage} 
                      onSave={(v) => handleAdminUpdate("config", { heroImage: v })}
                      isEditing={isLoggedIn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <Countdown targetDate={data.config.weddingDate} />
                    {isLoggedIn && (
                      <button 
                        onClick={() => {
                          const newDate = prompt("Nova data (YYYY-MM-DDTHH:MM:SS):", data.config.weddingDate);
                          if (newDate) handleAdminUpdate("config", { weddingDate: newDate });
                        }}
                        className="text-xs bg-lilac-soft text-lilac-deep px-3 py-1 rounded-full font-bold"
                      >
                        Editar Data
                      </button>
                    )}
                  </div>
                  
                  <div className="text-center space-y-6 max-w-2xl mx-auto">
                    <Heart className="mx-auto text-lilac-deep fill-lilac-deep/20" size={32} />
                    <p className="text-lg text-gray-600 leading-relaxed font-serif italic">
                      "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha."
                    </p>
                  </div>
                </motion.section>
              )}

              {activeSection === "rsvp" && (
                <motion.section
                  key="rsvp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-12 space-y-8"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-serif text-gray-800">Confirmação de Presença</h2>
                    <p className="text-gray-500">Por favor, localize seu nome na lista abaixo</p>
                  </div>

                  <div className="max-w-md mx-auto space-y-6">
                    {isLoggedIn && (
                      <button 
                        onClick={addGuest}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-lilac-medium text-lilac-deep font-bold hover:bg-lilac-soft/30 transition-colors"
                      >
                        + Adicionar Convidado
                      </button>
                    )}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text"
                        placeholder="Pesquisar seu nome..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-gray-100 border bg-white shadow-sm focus:ring-2 focus:ring-lilac-medium focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                      {data.guests
                        .filter(g => g.name.toLowerCase().includes(search.toLowerCase()) && search.length > 2)
                        .map(guest => (
                          <button
                            key={guest.id}
                            onClick={() => setSelectedGuest(guest)}
                            className="w-full px-6 py-4 text-left hover:bg-lilac-soft/30 flex items-center justify-between group transition-colors"
                          >
                            <span className="font-medium text-gray-700">{guest.name}</span>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-lilac-deep transition-colors" />
                          </button>
                        ))}
                      {search.length > 2 && data.guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400 italic">Nenhum nome encontrado</div>
                      )}
                      {search.length <= 2 && (
                        <div className="px-6 py-8 text-center text-gray-400 italic">Digite pelo menos 3 letras</div>
                      )}
                    </div>
                  </div>

                  {/* RSVP Modal */}
                  <AnimatePresence>
                    {selectedGuest && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedGuest(null)}
                          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6"
                        >
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-serif text-gray-800">{selectedGuest.name}</h3>
                            <p className="text-gray-500">Você confirma sua presença?</p>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-lilac-deep"
                                checked={isSubmitting} // Just a visual cue for now, or use a separate state
                                onChange={() => {}} 
                              />
                              <span className="text-sm font-medium text-gray-600">Confirmo que estarei presente</span>
                            </label>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleRSVP(selectedGuest.id, true)}
                              className="w-full py-4 rounded-xl bg-lilac-deep text-white font-bold hover:bg-lilac-medium transition-colors flex items-center justify-center gap-2"
                            >
                              {isSubmitting ? "Processando..." : "Confirmar Agora"}
                            </button>
                            <button
                              disabled={isSubmitting}
                              onClick={() => setSelectedGuest(null)}
                              className="w-full py-4 rounded-xl bg-gray-50 text-gray-500 font-medium hover:bg-gray-100 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.section>
              )}

              {activeSection === "gifts" && (
                <motion.section
                  key="gifts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-12 space-y-8"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-serif text-gray-800">Lista de Presentes</h2>
                    <p className="text-gray-500">Sua presença é nosso maior presente, mas se desejar nos agraciar:</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoggedIn && (
                      <button 
                        onClick={addGift}
                        className="aspect-[4/5] rounded-2xl border-2 border-dashed border-lilac-medium flex flex-col items-center justify-center gap-4 text-lilac-deep hover:bg-lilac-soft/30 transition-colors"
                      >
                        <Gift size={48} />
                        <span className="font-bold">Adicionar Presente</span>
                      </button>
                    )}
                    {data.gifts.map(gift => (
                      <div key={gift.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group relative">
                        {isLoggedIn && (
                          <button 
                            onClick={() => {
                              if (confirm("Excluir este presente?")) {
                                handleAdminUpdate("gifts", data.gifts.filter(g => g.id !== gift.id));
                              }
                            }}
                            className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div className="aspect-[4/3] overflow-hidden">
                          <EditableImage 
                            src={gift.image} 
                            onSave={(v) => handleAdminUpdate("gifts", data.gifts.map(g => g.id === gift.id ? { ...g, image: v } : g))}
                            isEditing={isLoggedIn}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <EditableText 
                              value={gift.name} 
                              onSave={(v) => handleAdminUpdate("gifts", data.gifts.map(g => g.id === gift.id ? { ...g, name: v } : g))}
                              isEditing={isLoggedIn}
                              as="h3"
                              className="font-serif text-xl text-gray-800 block"
                            />
                            <div className="flex items-center gap-1">
                              <span className="text-lilac-deep font-bold">R$</span>
                              <EditableText 
                                value={gift.price.toString()} 
                                onSave={(v) => handleAdminUpdate("gifts", data.gifts.map(g => g.id === gift.id ? { ...g, price: parseFloat(v) } : g))}
                                isEditing={isLoggedIn}
                                className="text-lilac-deep font-bold"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedGift(gift)}
                            className="w-full py-3 rounded-xl border border-lilac-soft text-lilac-deep font-semibold hover:bg-lilac-soft transition-colors"
                          >
                            Presentear
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gift Modal */}
                  <AnimatePresence>
                    {selectedGift && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedGift(null)}
                          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6 overflow-y-auto max-h-[90vh]"
                        >
                          <button onClick={() => setSelectedGift(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                          </button>
                          
                          <div className="text-center space-y-4">
                            <h3 className="text-2xl font-serif text-gray-800">Presentear: {selectedGift.name}</h3>
                            <p className="text-gray-500">Escolha como deseja presentear:</p>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-lilac-soft/30 p-6 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-lilac-deep font-bold">
                                  <QrCode size={20} />
                                  <span>Pagar via PIX</span>
                                </div>
                                {isLoggedIn && (
                                  <button 
                                    onClick={() => {
                                      const newKey = prompt("Nova chave PIX:", data.config.pixKey);
                                      if (newKey) handleAdminUpdate("config", { pixKey: newKey });
                                    }}
                                    className="text-[10px] bg-white px-2 py-1 rounded border border-lilac-medium text-lilac-deep font-bold"
                                  >
                                    Editar Chave
                                  </button>
                                )}
                              </div>
                              <div className="bg-white p-4 rounded-xl flex justify-center">
                                <QRCodeSVG value={`pix:${data.config.pixKey}?amount=${selectedGift.price}&item=${selectedGift.name}`} size={180} />
                              </div>
                              <p className="text-[10px] text-center text-gray-400 break-all">{data.config.pixKey}</p>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(data.config.pixKey);
                                  alert("Chave PIX copiada!");
                                }}
                                className="w-full py-2 text-xs font-bold text-lilac-deep uppercase tracking-widest"
                              >
                                Copiar Chave PIX
                              </button>
                            </div>

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                              <div className="relative flex justify-center text-xs uppercase text-gray-300 bg-white px-2">Ou</div>
                            </div>

                            <div className="space-y-3">
                              <button 
                                onClick={() => window.open(`https://wa.me/${data.config.whatsappNumber}?text=Olá! Estou interessado em dar o presente: ${selectedGift.name}.`, "_blank")}
                                className="w-full py-4 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                              >
                                Estou interessado em dar esse presente (WhatsApp)
                              </button>
                              {isLoggedIn && (
                                <button 
                                  onClick={() => {
                                    const newNum = prompt("Novo número WhatsApp (com DDD):", data.config.whatsappNumber);
                                    if (newNum) handleAdminUpdate("config", { whatsappNumber: newNum });
                                  }}
                                  className="w-full text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest"
                                >
                                  Editar Número WhatsApp
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.section>
              )}

              {activeSection === "location" && (
                <motion.section
                  key="location"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-12 space-y-12"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-serif text-gray-800">Local e Horário</h2>
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-lilac-deep" />
                        <span>{new Date(data.config.weddingDate).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-lilac-deep" />
                        <span>Às {new Date(data.config.weddingDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-lilac-deep" />
                        <EditableText 
                          value={data.config.location} 
                          onSave={(v) => handleAdminUpdate("config", { location: v })}
                          isEditing={isLoggedIn}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-video bg-gray-100 relative">
                    {/* Mock Map Integration */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-4">
                      <MapPin size={48} className="animate-bounce text-lilac-deep" />
                      <p className="font-medium">Mapa Interativo</p>
                      <button className="px-6 py-2 rounded-full bg-lilac-deep text-white text-sm font-bold flex items-center gap-2">
                        Abrir no Google Maps <ExternalLink size={14} />
                      </button>
                    </div>
                    <img 
                      src="https://picsum.photos/seed/map/1200/600" 
                      alt="Mapa" 
                      className="w-full h-full object-cover opacity-30"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(data.config.gallery || []).map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm border-2 border-white relative group">
                        <EditableImage 
                          src={img} 
                          onSave={(v) => handleAdminUpdate("config", { gallery: (data.config.gallery || []).map((g, idx) => idx === i ? v : g) })}
                          isEditing={isLoggedIn}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                        {isLoggedIn && (
                          <button 
                            onClick={() => {
                              if (confirm("Excluir esta foto?")) {
                                handleAdminUpdate("config", { gallery: (data.config.gallery || []).filter((_, idx) => idx !== i) });
                              }
                            }}
                            className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {isLoggedIn && (
                      <button 
                        onClick={() => {
                          const url = prompt("URL da nova foto:");
                          if (url) handleAdminUpdate("config", { gallery: [...(data.config.gallery || []), url] });
                        }}
                        className="aspect-square rounded-2xl border-2 border-dashed border-lilac-medium flex items-center justify-center text-lilac-deep hover:bg-lilac-soft/30 transition-colors"
                      >
                        + Foto
                      </button>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          {/* Audio Player */}
          <AudioPlayer 
            playlist={data.config.playlist} 
            isLoggedIn={isLoggedIn}
            handleAdminUpdate={handleAdminUpdate}
          />

          {/* Back Button */}
          <AnimatePresence>
            {isOpen && (
              <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  if (activeSection !== "home") {
                    setActiveSection("home");
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/50 backdrop-blur-sm text-gray-400 hover:text-lilac-deep shadow-sm transition-colors"
              >
                <ChevronLeft size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Admin Toggle */}
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="fixed top-4 right-4 p-2 rounded-full bg-white/50 backdrop-blur-sm text-gray-400 hover:text-lilac-deep transition-colors"
          >
            <Settings size={20} />
          </button>

          {/* Admin Modal */}
          <AnimatePresence>
            {isAdminOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAdminOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                  <button onClick={() => setIsAdminOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>

                  {!isLoggedIn ? (
                    <div className="space-y-6 py-8">
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-serif">Acesso Administrativo</h2>
                        <p className="text-gray-500 text-sm">Digite a senha para gerenciar o site</p>
                      </div>
                      <div className="space-y-4">
                        <input 
                          type="password" 
                          placeholder="Senha"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full px-6 py-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-lilac-medium"
                        />
                        <button 
                          onClick={handleAdminLogin}
                          className="w-full py-4 rounded-xl bg-lilac-deep text-white font-bold hover:bg-lilac-medium transition-colors"
                        >
                          Entrar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <h2 className="text-2xl font-serif border-b pb-4">Painel de Controle</h2>
                      
                      <div className="space-y-6">
                        <section className="space-y-4">
                          <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-lilac-deep" />
                            Lista de Convidados ({data.guests.length})
                          </h3>
                          <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                            {data.guests.map(g => (
                              <div key={g.id} className="p-3 flex justify-between items-center text-sm">
                                <span>{g.name}</span>
                                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", g.confirmed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                                  {g.confirmed ? "Confirmado" : "Pendente"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Gift size={18} className="text-lilac-deep" />
                            Lista de Presentes
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {data.gifts.map(g => (
                              <div key={g.id} className="p-3 border rounded-xl flex items-center gap-3">
                                <img src={g.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{g.name}</p>
                                  <p className="text-[10px] text-gray-400">R$ {g.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <button 
                          onClick={() => alert("Funcionalidade de edição completa disponível na versão Pro")}
                          className="w-full py-4 rounded-xl border-2 border-dashed border-lilac-medium text-lilac-deep font-bold hover:bg-lilac-soft/30 transition-colors"
                        >
                          + Adicionar Item
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
