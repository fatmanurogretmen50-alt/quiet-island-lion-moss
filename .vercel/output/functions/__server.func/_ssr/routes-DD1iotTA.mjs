import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DD1iotTA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FISH_SRC = Array.from({ length: 12 }, (_, i) => `/fish/fish-${i}.png`);
var STORAGE_KEY = "sinif-akvaryumu-clean-fish-v6";
var DEFAULT_FISH = [
	{
		id: 1,
		name: "Ali",
		type: 0,
		points: 8,
		x: 7,
		y: 25
	},
	{
		id: 2,
		name: "Elif",
		type: 1,
		points: 12,
		x: 28,
		y: 21
	},
	{
		id: 3,
		name: "Mert",
		type: 2,
		points: 5,
		x: 49,
		y: 31
	},
	{
		id: 4,
		name: "Ayşe",
		type: 3,
		points: 10,
		x: 67,
		y: 24
	}
];
function fishSrc(type) {
	return FISH_SRC[Number.isInteger(Number(type)) && Number(type) >= 0 && Number(type) < FISH_SRC.length ? Number(type) : 0];
}
function normalizeFish(raw, fallbackId) {
	if (!raw || typeof raw !== "object") return null;
	const f = raw;
	const name = typeof f.name === "string" ? f.name.trim().slice(0, 18) : "";
	if (!name) return null;
	const typeNum = Number(f.type);
	const type = Number.isInteger(typeNum) && typeNum >= 0 && typeNum < FISH_SRC.length ? typeNum : 0;
	const id = Number(f.id);
	return {
		id: Number.isFinite(id) && id > 0 ? id : fallbackId,
		name,
		type,
		points: Math.max(0, Number(f.points) || 0),
		x: clampNum(Number(f.x), 6, 76, 20),
		y: clampNum(Number(f.y), 12, 68, 30)
	};
}
function clampNum(n, min, max, fallback) {
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}
function loadFish() {
	try {
		const parsed = JSON.parse(localStorage.getItem("sinif-akvaryumu-clean-fish-v6") || "null");
		if (!Array.isArray(parsed)) return DEFAULT_FISH.map((f) => ({ ...f }));
		const out = [];
		let i = 1;
		for (const item of parsed) {
			const f = normalizeFish(item, i);
			if (f) {
				out.push(f);
				i = Math.max(i, f.id + 1);
			}
		}
		return out.length ? out : DEFAULT_FISH.map((f) => ({ ...f }));
	} catch {
		return DEFAULT_FISH.map((f) => ({ ...f }));
	}
}
function saveFish(fishes) {
	const payload = fishes.map(({ id, name, type, points, x, y }) => ({
		id,
		name,
		type,
		points,
		x,
		y
	}));
	localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
function startSwim(fish, el, art, allFish) {
	const speed0 = 1.15 + Math.random() * .85;
	let vx = (Math.random() < .5 ? -1 : 1) * speed0;
	let vy = (Math.random() - .5) * .22;
	let turnTimer = 1.5 + Math.random() * 3.5;
	let phase = Math.random() * Math.PI * 2;
	let last = performance.now();
	let raf = 0;
	let stopped = false;
	function bounds() {
		const main = el.closest(".aq-main");
		if (!main) return {
			minX: 4,
			maxX: 78,
			minY: 12,
			maxY: 70
		};
		const side = main.querySelector(".aq-side");
		const bottom = main.querySelector(".aq-bottom");
		const w = Math.max(1, main.clientWidth);
		const h = Math.max(1, main.clientHeight);
		const fishW = el.offsetWidth || 150;
		const fishH = el.offsetHeight || 110;
		let rightReserve = 16;
		if (side && getComputedStyle(side).display !== "none" && getComputedStyle(side).position === "absolute") rightReserve = side.offsetWidth + 28;
		let bottomReserve = 24;
		if (bottom && getComputedStyle(bottom).position === "absolute") bottomReserve = bottom.offsetHeight + 28;
		return {
			minX: 2,
			maxX: Math.max(10, (w - fishW - rightReserve) / w * 100),
			minY: 10,
			maxY: Math.max(16, (h - fishH - bottomReserve) / h * 100)
		};
	}
	function frame(now) {
		if (stopped || !el.isConnected) return;
		const { minX, maxX, minY, maxY } = bounds();
		const dt = Math.min(.032, Math.max(.008, (now - last) / 1e3));
		last = now;
		phase += dt * 2.1;
		turnTimer -= dt;
		if (turnTimer <= 0) {
			const a = (Math.random() - .5) * .7;
			const c = Math.cos(a);
			const s = Math.sin(a);
			const nvx = vx * c - vy * s;
			const nvy = vx * s + vy * c;
			vx = nvx;
			vy = nvy;
			turnTimer = 2.5 + Math.random() * 4.5;
		}
		let avoidX = 0;
		let avoidY = 0;
		for (const o of allFish()) {
			if (o === fish || typeof o.x !== "number") continue;
			const dx = fish.x - o.x;
			const dy = fish.y - o.y;
			const d = Math.hypot(dx, dy);
			if (d > 0 && d < 11) {
				const strength = (11 - d) / 11;
				avoidX += dx / d * strength;
				avoidY += dy / d * strength;
			}
		}
		if (fish.x < minX + 7) avoidX += .65;
		if (fish.x > maxX - 7) avoidX -= .65;
		if (fish.y < minY + 7) avoidY += .45;
		if (fish.y > maxY - 7) avoidY -= .45;
		vx += avoidX * dt * .75;
		vy += avoidY * dt * .55;
		vy += Math.sin(phase * .75) * .025;
		const minSpeed = .85;
		const maxSpeed = 2.25;
		const sp = Math.hypot(vx, vy);
		if (sp < minSpeed) {
			const a = Math.atan2(vy, vx);
			vx = Math.cos(a) * minSpeed;
			vy = Math.sin(a) * minSpeed;
		} else if (sp > maxSpeed) {
			vx *= maxSpeed / sp;
			vy *= maxSpeed / sp;
		}
		fish.x += vx * dt;
		fish.y += vy * dt;
		if (fish.x <= minX) {
			fish.x = minX;
			vx = Math.abs(vx) + .12;
		}
		if (fish.x >= maxX) {
			fish.x = maxX;
			vx = -Math.abs(vx) - .12;
		}
		if (fish.y <= minY) {
			fish.y = minY;
			vy = Math.abs(vy) + .08;
		}
		if (fish.y >= maxY) {
			fish.y = maxY;
			vy = -Math.abs(vy) - .08;
		}
		el.style.left = `${fish.x}%`;
		el.style.top = `${fish.y}%`;
		const right = vx >= 0;
		const tilt = Math.max(-6, Math.min(6, vy / vx * 3 || 0));
		const bob = Math.sin(phase) * 1;
		art.style.transform = `translateY(${bob}px) scaleX(${right ? 1 : -1}) rotate(${tilt}deg)`;
		raf = requestAnimationFrame(frame);
	}
	raf = requestAnimationFrame(frame);
	return () => {
		stopped = true;
		cancelAnimationFrame(raf);
	};
}
function AquariumApp() {
	const fishesRef = (0, import_react.useRef)(DEFAULT_FISH.map((f) => ({ ...f })));
	const nextIdRef = (0, import_react.useRef)(5);
	const toastTimer = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [fishes, setFishes] = (0, import_react.useState)(() => DEFAULT_FISH.map((f) => ({ ...f })));
	const [selectedType, setSelectedType] = (0, import_react.useState)(0);
	const [selectedId, setSelectedId] = (0, import_react.useState)(1);
	const [name, setName] = (0, import_react.useState)("");
	const [toast, setToast] = (0, import_react.useState)(null);
	const [food, setFood] = (0, import_react.useState)([]);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const loaded = loadFish();
		fishesRef.current = loaded;
		nextIdRef.current = Math.max(0, ...loaded.map((f) => f.id)) + 1;
		setFishes(loaded.map((f) => ({ ...f })));
		setSelectedId(loaded[0]?.id ?? null);
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		const persist = () => saveFish(fishesRef.current);
		const id = window.setInterval(persist, 4e3);
		window.addEventListener("beforeunload", persist);
		return () => {
			window.clearInterval(id);
			window.removeEventListener("beforeunload", persist);
			persist();
		};
	}, [ready]);
	function showToast(text) {
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
		const f = {
			id: nextIdRef.current++,
			name: trimmed.slice(0, 18),
			type: selectedType,
			points: 0,
			x: 6 + Math.random() * 70,
			y: 15 + Math.random() * 50
		};
		fishesRef.current = [...fishesRef.current, f];
		setSelectedId(f.id);
		setName("");
		syncList();
		showToast("Balık eklendi!");
	}
	function addPoints(n) {
		const live = fishesRef.current.find((x) => x.id === selectedId);
		if (!live) return;
		live.points = Math.max(0, live.points + n);
		syncList();
		if (n > 0) {
			const bit = {
				id: Date.now() + Math.random(),
				x: live.x + 2
			};
			setFood((prev) => [...prev, bit]);
			window.setTimeout(() => {
				setFood((prev) => prev.filter((x) => x.id !== bit.id));
			}, 1200);
			showToast(`+${n} puan`);
		} else showToast("Puan azaltıldı");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "aq-app",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aq-topbar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Yeni Balık Ekle" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "aq-name",
					maxLength: 18,
					placeholder: "Balık adı",
					value: name,
					onChange: (e) => setName(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") addFish();
					},
					"aria-label": "Balık adı",
					suppressHydrationWarning: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aq-thumbs",
					role: "listbox",
					"aria-label": "Balık türü",
					children: FISH_SRC.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `aq-thumb${i === selectedType ? " sel" : ""}`,
						"aria-label": `Balık türü ${i + 1}`,
						"aria-selected": i === selectedType,
						onClick: () => setSelectedType(i),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: ""
						})
					}, src))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "aq-add",
					onClick: addFish,
					children: "＋ BALIK EKLE"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aq-main",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aq-tank",
					children: ready ? fishesRef.current.map((fish) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FishSprite, {
						fish,
						selected: fish.id === selectedId,
						allFish: () => fishesRef.current,
						points: fishes.find((x) => x.id === fish.id)?.points ?? fish.points,
						onSelect: () => setSelectedId(fish.id)
					}, fish.id)) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "aq-side",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Balık Listesi" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: fishes.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `aq-row${f.id === selectedId ? " active" : ""}`,
							onClick: () => setSelectedId(f.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: fishSrc(f.type),
									alt: ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["★ ", f.points] })
							]
						}, f.id)) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "aq-total",
							children: ["Toplam Puan", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: total })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "aq-bottom",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn p1",
							disabled: noSel,
							onClick: () => addPoints(1),
							children: "★ +1 PUAN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn p5",
							disabled: noSel,
							onClick: () => addPoints(5),
							children: "★ +5 PUAN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn p10",
							disabled: noSel,
							onClick: () => addPoints(10),
							children: "★ +10 PUAN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn minus",
							disabled: noSel,
							onClick: () => addPoints(-1),
							children: "− ★ PUAN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn del",
							disabled: noSel,
							onClick: deleteSelected,
							children: "BALIĞI SİL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn reset",
							onClick: resetPoints,
							children: "PUANLARI SIFIRLA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aq-btn clear",
							onClick: () => setConfirmClear(true),
							children: "AKVARYUMU TEMİZLE"
						})
					]
				}),
				food.map((bit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aq-food",
					style: { left: `${bit.x}%` },
					"aria-hidden": "true",
					children: "🐟"
				}, bit.id)),
				toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aq-toast",
					children: toast
				}) : null,
				confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aq-confirm",
					role: "dialog",
					"aria-modal": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "aq-confirm-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Tüm balıklar silinsin mi?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "aq-confirm-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "aq-btn clear",
								onClick: clearAll,
								children: "Evet, sil"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "aq-btn p1",
								onClick: () => setConfirmClear(false),
								"aria-label": "Vazgeç",
								children: "Vazgeç"
							})]
						})]
					})
				}) : null
			]
		})]
	});
}
function FishSprite({ fish, selected, allFish, points, onSelect }) {
	const elRef = (0, import_react.useRef)(null);
	const artRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = elRef.current;
		const art = artRef.current;
		if (!el || !art) return;
		el.style.left = `${fish.x}%`;
		el.style.top = `${fish.y}%`;
		return startSwim(fish, el, art, allFish);
	}, [fish.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: elRef,
		className: `aq-fish${selected ? " selected" : ""}`,
		onClick: onSelect,
		role: "button",
		tabIndex: 0,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onSelect();
			}
		},
		"aria-label": `${fish.name}, ${points} puan`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aq-label",
			children: [
				fish.name,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "star",
					children: "★"
				}),
				" ",
				points
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aq-art",
			ref: artRef,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: fishSrc(fish.type),
				alt: "",
				draggable: false
			})
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AquariumApp, {});
}
//#endregion
export { Home as component };
