/**
 * @todo  add all boxes to document, so on next/previous just position 
 *        show and animate box, instead of creating a new element
 */

// Array de imágenes — espacios eliminados con .map(url => url.trim())
const games = [
  "./imagen/1.jpg",   
  "./imagen/2.jpg",  
  "./imagen/3.jpg", 
  "./imagen/4.jpg", 
  "./imagen/5.jpg", 
  "./imagen/6.jpg", 
  
].map(url => url.trim());

// ✅ Array de URLs personalizadas (una por imagen) — también limpias
const urls = [
  "leerpdf1.html",
  "leerpdf2.html",
  "leerpdf3.html",
  "leerpdf4.html",
  "leerpdf5.html",
  "leerpdf6.html",
  
].map(url => url.trim());

// ✅ Array de reseñas: cada una con título + descripción
const reviews = [
  { title: "Uso  de dispositivos electrónicos en niños, niñas y jovenes", desc: "Evidencia internacional y percepciones de familia y docentes ",},
  { title: "Cuidados de la niñez y la adolecencia", desc: "En los entornos digitales" },
  { title: "El uso de dispositivos móviles por niños:  ", desc: "Entre el consumo y el cuidado familiar" },
  { title: "Pantallas en casa", desc: "Guìa para acompañar a las familias en el uso del internet" },
  { title: "Tecnologìas digitales", desc: "Miradas crìticasde la apropiación en America Latina" },
  { title: "Efectos de las pantallas en niños y niñas menores de cinco años", desc: "Orientaciones dirigidas a padres y madres para su uso" },
  
];

// Validación (opcional, pero útil en desarrollo)
if (games.length !== urls.length || games.length !== reviews.length) {
  console.warn("⚠️ El número de imágenes, URLs y reseñas no coincide.");
}

// Template Mustache
const box_tmpl = document.getElementById("boxTmpl").innerHTML;

const nextBoxExec = dir => {
  if (dir === -1) {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : games.length - 1;
  } else if (dir === 1) {
    currentIndex = currentIndex < games.length - 1 ? currentIndex + 1 : 0;
  }

  const dw = Math.max(
    document.documentElement["clientWidth"],
    document.body["scrollWidth"],
    document.documentElement["scrollWidth"],
    document.body["offsetWidth"],
    document.documentElement["offsetWidth"]
  );

  if (typeof currentBox !== "undefined") {
    const obsoleteBox = currentBox;
    if (obsoleteBox.gsap) {
      obsoleteBox.gsap.kill();
      obsoleteBox.gsap = gsap.to(obsoleteBox.transform, {
        duration: 1.0,
        tx: dir === -1 ? dw + 100 : -100,
        rx: obsoleteBox.transform.rx + 180,
        ry: obsoleteBox.transform.ry + 90,
        ease: "back.in",
        onUpdate: () => {
          obsoleteBox.el.style.transform = `translate3d(${obsoleteBox.transform.tx}px, -50%, 0) rotateX(${obsoleteBox.transform.rx}deg) rotateY(${obsoleteBox.transform.ry}deg)`;
        },
        onComplete: () => {
          obsoleteBox.el.remove();
          if (obsoleteBox.rev) obsoleteBox.rev.remove(); // ✅ Limpiar reseña vieja
        }
      });
    }
  }

  const id = `box-${gid++}`;
  let html = Mustache.render(box_tmpl, {
    id: id,
    bg: `style="background-image:url('${games[currentIndex]}')"`
  });

  document.body.insertAdjacentHTML("beforeend", html);
  const boxEl = document.getElementById(id);
  currentBox = { el: boxEl };

  // ✅ Añadir reseña con título + descripción (posición más arriba)
  const rev = document.createElement("div");
  rev.className = "review-badge";
  rev.innerHTML = `
    <div class="review-title">${reviews[currentIndex].title}</div>
    <div class="review-desc">${reviews[currentIndex].desc}</div>
    <div class="hint">Clic sobre la imagen</div>

  `;
  document.body.appendChild(rev);
  currentBox.rev = rev;

  const bw = currentBox.el.getBoundingClientRect().width;
  const startPos = dir === -1 ? -100 : dw + 100;
  currentBox.el.style.transform = `translate3d(${startPos}px, -50%, 2000px) rotateX(-120deg) rotateY(-180deg)`;

  currentBox.transform = { tx: startPos, rx: -90, ry: 210 };
  currentBox.gsap = gsap.to(currentBox.transform, {
    duration: 2.4,
    tx: 0.5 * dw - 0.5 * bw,
    rx: Math.random() > 0.5 ? -16 : 16,
    ry: Math.random() > 0.5 ? -26 : 26,
    ease: "elastic.out(0.4, 0.3)",
    onUpdate: () => {
      currentBox.el.style.transform = `translate3d(${currentBox.transform.tx}px, -50%, 0) rotateX(${currentBox.transform.rx}deg) rotateY(${currentBox.transform.ry}deg)`;
    },
    onComplete: () => {
      if (currentBox.rev) currentBox.rev.style.opacity = "1"; // ✅ Mostrar reseña con fade-in
    }
  });

  // ✅ Clic en imagen: abrir URL en NUEVA pestaña (sin cerrar la actual)
  currentBox.el.style.cursor = "pointer";
  currentBox.el.addEventListener("click", () => {
    const targetUrl = urls[currentIndex];
    if (targetUrl) {
      const win = window.open(targetUrl, "_blank");
      if (!win) {
        alert("⚠️ El gestor de ventanas emergentes bloqueó la apertura. Permite pop-ups para este sitio.");
      }
    } else {
      console.error("❌ URL no definida para índice", currentIndex);
    }
  }, { once: true });
};

// init
let currentIndex = -1,
  gid = 1,
  currentBox;

// controles
document.getElementById("ctrlRight").addEventListener("click", () => nextBoxExec(1));
document.getElementById("ctrlLeft").addEventListener("click", () => nextBoxExec(-1));

// primera imagen
document.getElementById("ctrlRight").click();

// preload
games.forEach((url, index) => {
  if (index === 0) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
});

setTimeout(() => {
  games.forEach(url => {
    const im = new Image();
    im.src = url;
  });
}, 500);