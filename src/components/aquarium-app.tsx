import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_FISH,
  FISH_SRC,
  type Fish,
  fishSrc,
  loadFish,
  saveFish,
  startSwim,
} from "@/lib/aquarium";

type FoodBit = { id: number; x: number };

export function AquariumApp() {
  const fishesRef = useRef<Fish[]>(DEFAULT_FISH.map((f) => ({ ...f })));
  const nextIdRef = useRef(5);
  const toastTimer = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [fishes, setFishes] = useState<Fish[]>(() =>
    DEFAULT_FISH.map((f) => ({ ...f })),
  );
  const [selectedType, setSelectedType] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [food, setFood] = useState<FoodBit[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const loaded = loadFish();
    fishesRef.current = loaded;
    nextIdRef.current = Math.max(0, ...loaded.map((f) => f.id)) + 1;
    setFishes(loaded.map((f) => ({ ...f })));
    setSelectedId(loaded[0]?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const persist = () => saveFish(fishesRef.current);
    const id = window.setInterval(persist, 4000);
    window.addEventListener("beforeunload", persist);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("beforeunload", persist);
      persist();
    };
  }, [ready]);

  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 900);
  }

  function syncList() {
    setFishes(fishesRef.current.map((f) => ({ ...f })));
    saveFish(fishesRef.current);
  }

  function addFish() {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("Önce balığa isim ver.");
      return;
    }
    const f: Fish = {
      id: nextIdRef.current++,
      name: trimmed.slice(0, 18),
      type: selectedType,
      points: 0,
      x: 6 + Math.random() * 70,
      y: 15 + Math.random() * 50,
    };
    fishesRef.current = [...fishesRef.current, f];
    setSelectedId(f.id);
    setName("");
    syncList();
    showToast("Balık eklendi!");
  }

  function addPoints(n: number) {
    const live = fishesRef.current.find((x) => x.id === selectedId);
    if (!live) return;
    live.points = Math.max(0, live.points + n);
    syncList();
    if (n > 0) {
      const bit = { id: Date.now() + Math.random(), x: live.x + 2 };
      setFood((prev) => [...prev, bit]);
      window.setTimeout(() => {
        setFood((prev) => prev.filter((x) => x.id !== bit.id));
      }, 1200);
      showToast(`+${n} puan`);
    } else {
      showToast("Puan azaltıldı");
    }
  }

  function deleteSelected() {
    fishesRef.current = fishesRef.current.filter((f) => f.id !== selectedId);
    const next = fishesRef.current[0]?.id ?? null;
    setSelectedId(next);
    syncList();
  }

  function resetPoints() {
    for (const f of fishesRef.current) f.points = 0;
    syncList();
    showToast("Puanlar sıfırlandı");
  }

  function clearAll() {
    fishesRef.current = [];
    setSelectedId(null);
    setConfirmClear(false);
    syncList();
  }

  const total = fishes.reduce((sum, f) => sum + f.points, 0);
  const noSel = selectedId === null;

  return (
    <main className="aq-app">
      <div className="aq-topbar">
        <h1>Yeni Balık Ekle</h1>
        <input
          className="aq-name"
          maxLength={18}
          placeholder="Balık adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addFish();
          }}
          aria-label="Balık adı"
          suppressHydrationWarning
        />
        <div className="aq-thumbs" role="listbox" aria-label="Balık türü">
          {FISH_SRC.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`aq-thumb${i === selectedType ? " sel" : ""}`}
              aria-label={`Balık türü ${i + 1}`}
              aria-selected={i === selectedType}
              onClick={() => setSelectedType(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        <button type="button" className="aq-add" onClick={addFish}>
          ＋ BALIK EKLE
        </button>
      </div>

      <div className="aq-main">
        <div className="aq-tank">
          {ready
            ? fishesRef.current.map((fish) => (
                <FishSprite
                  key={fish.id}
                  fish={fish}
                  selected={fish.id === selectedId}
                  allFish={() => fishesRef.current}
                  points={fishes.find((x) => x.id === fish.id)?.points ?? fish.points}
                  onSelect={() => setSelectedId(fish.id)}
                />
              ))
            : null}
        </div>

        <aside className="aq-side">
          <h2>Balık Listesi</h2>
          <div>
            {fishes.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`aq-row${f.id === selectedId ? " active" : ""}`}
                onClick={() => setSelectedId(f.id)}
              >
                <img src={fishSrc(f.type)} alt="" />
                <b>{f.name}</b>
                <span>★ {f.points}</span>
              </button>
            ))}
          </div>
          <div className="aq-total">
            Toplam Puan
            <strong>{total}</strong>
          </div>
        </aside>

        <div className="aq-bottom">
          <button
            type="button"
            className="aq-btn p1"
            disabled={noSel}
            onClick={() => addPoints(1)}
          >
            ★ +1 PUAN
          </button>
          <button
            type="button"
            className="aq-btn p5"
            disabled={noSel}
            onClick={() => addPoints(5)}
          >
            ★ +5 PUAN
          </button>
          <button
            type="button"
            className="aq-btn p10"
            disabled={noSel}
            onClick={() => addPoints(10)}
          >
            ★ +10 PUAN
          </button>
          <button
            type="button"
            className="aq-btn minus"
            disabled={noSel}
            onClick={() => addPoints(-1)}
          >
            − ★ PUAN
          </button>
          <button
            type="button"
            className="aq-btn del"
            disabled={noSel}
            onClick={deleteSelected}
          >
            BALIĞI SİL
          </button>
          <button type="button" className="aq-btn reset" onClick={resetPoints}>
            PUANLARI SIFIRLA
          </button>
          <button
            type="button"
            className="aq-btn clear"
            onClick={() => setConfirmClear(true)}
          >
            AKVARYUMU TEMİZLE
          </button>
        </div>

        {food.map((bit) => (
          <div
            key={bit.id}
            className="aq-food"
            style={{ left: `${bit.x}%` }}
            aria-hidden="true"
          >
            🐟
          </div>
        ))}

        {toast ? <div className="aq-toast">{toast}</div> : null}

        {confirmClear ? (
          <div className="aq-confirm" role="dialog" aria-modal="true">
            <div className="aq-confirm-card">
              <p>Tüm balıklar silinsin mi?</p>
              <div className="aq-confirm-actions">
                <button type="button" className="aq-btn clear" onClick={clearAll}>
                  Evet, sil
                </button>
                <button
                  type="button"
                  className="aq-btn p1"
                  onClick={() => setConfirmClear(false)}
                  aria-label="Vazgeç"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function FishSprite({
  fish,
  selected,
  allFish,
  points,
  onSelect,
}: {
  fish: Fish;
  selected: boolean;
  allFish: () => Fish[];
  points: number;
  onSelect: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    const art = artRef.current;
    if (!el || !art) return;
    el.style.left = `${fish.x}%`;
    el.style.top = `${fish.y}%`;
    return startSwim(fish, el, art, allFish);
    // Swim once per mounted fish; positions live on the shared object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fish.id]);

  return (
    <div
      ref={elRef}
      className={`aq-fish${selected ? " selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${fish.name}, ${points} puan`}
    >
      <div className="aq-label">
        {fish.name}
        <br />
        <span className="star">★</span> {points}
      </div>
      <div className="aq-art" ref={artRef}>
        <img src={fishSrc(fish.type)} alt="" draggable={false} />
      </div>
    </div>
  );
}
