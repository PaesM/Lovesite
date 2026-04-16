import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Firebase (ONLY Firestore now)
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

// ================= NAVBAR =================
function Navbar() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const startMusic = () => {
    if (!started && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      setStarted(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <nav
        onClick={startMusic}
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          padding: "15px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(15px)",
          zIndex: 1000,
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          fontFamily: "'Minimo', sans-serif"
        }}
      >
        <a href="#home">Home</a>
        <a href="#moments">Our Moments</a>

        <button
          onClick={(e) => {
            e.stopPropagation();

            if (!playing) {
              audioRef.current.play();
            } else {
              audioRef.current.pause();
            }

            setPlaying(!playing);
          }}
        >
          {playing ? "Pause 🎵" : "Play 🎵"}
        </button>
      </nav>
    </>
  );
}

// ================= FOOTER =================
function Footer({ onOpenSecret }) {
  return (
    <footer
      onDoubleClick={onOpenSecret}
      style={{
        textAlign: "center",
        padding: "30px",
        marginTop: "50px",
        opacity: 0.7,
        cursor: "pointer"
      }}
    >
      <p>Made with love ❤️ (double click me)</p>
    </footer>
  );
}

// ================= CLOUDINARY UPLOAD =================
const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "love_uploads");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dodjabpms/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// ================= BURST SYSTEM =================
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createBurst(x, y) {
  const particles = [];
  const count = 16;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = random(70, 180);

    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: random(10, 16),
      symbol: Math.random() > 0.5 ? "❤️" : "✨"
    });
  }

  return particles;
}

// ================= MAIN APP =================
export default function App() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bursts, setBursts] = useState([]);

  const [showSecret, setShowSecret] = useState(false);
  const [secretNote, setSecretNote] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // ✅ UPDATED

  const [newMoment, setNewMoment] = useState({
    title: "",
    description: "",
    image: null,
    date: ""
  });

  useEffect(() => {
    if (showSecret) {
      const saved = localStorage.getItem("secretNote");
      if (saved) setSecretNote(saved);
    }
  }, [showSecret]);

  useEffect(() => {
    localStorage.setItem("secretNote", secretNote);
  }, [secretNote]);

  const handleClick = (e) => {
    const newBurst = createBurst(e.clientX, e.clientY);
    setBursts((prev) => [...prev, ...newBurst]);

    setTimeout(() => {
      setBursts((prev) =>
        prev.filter((_, i) => i >= newBurst.length ? false : true)
      );
    }, 1200);
  };

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        const snapshot = await getDocs(collection(db, "moments"));

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) || [];

        setMoments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, []);

  const handleAddMoment = async () => {
    if (!newMoment.image || !newMoment.date) return;

    const imageUrl = await uploadToCloudinary(newMoment.image);
    if (!imageUrl) return;

    await addDoc(collection(db, "moments"), {
      title: newMoment.title,
      description: newMoment.description,
      date: newMoment.date,
      image: imageUrl
    });

    const snapshot = await getDocs(collection(db, "moments"));

    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    setMoments(data);

    setNewMoment({
      title: "",
      description: "",
      image: null,
      date: ""
    });
  };

  const deleteMoment = async (id) => {
    await deleteDoc(doc(db, "moments", id));
    setMoments((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main
      onClick={(e) => {
        if (
          e.target.tagName !== "INPUT" &&
          e.target.tagName !== "BUTTON"
        ) {
          handleClick(e);
        }
      }}
      style={{
        fontFamily: "'Minimo', sans-serif",
        color: "#333",
        overflow: "hidden",
        transform: "none",
        transition: "transform 0.15s ease"
      }}
    >
      <Navbar />

      {/* 💥 BURSTS */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: b.x + b.vx,
              y: b.y + b.vy,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 1 }}
            style={{
              position: "fixed",
              left: b.x,
              top: b.y,
              fontSize: b.size,
              pointerEvents: "none",
              zIndex: 9999
            }}
          >
            {b.symbol}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* IMAGE VIEWER (SWIPE GALLERY) */}
      <AnimatePresence>
  {selectedImageIndex !== null && (
    <motion.div
      onClick={() => setSelectedImageIndex(null)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
    >
      {/* ✅ CLOSE BUTTON (NEW) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevents closing + swipe conflict
          setSelectedImageIndex(null);
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10000,
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "white",
          fontWeight: "bold"
        }}
      >
        Close ✖
      </button>

      <motion.img
        key={selectedImageIndex}
        src={moments[selectedImageIndex]?.image}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.x < -100) {
            setSelectedImageIndex((prev) =>
              prev < moments.length - 1 ? prev + 1 : prev
            );
          } else if (info.offset.x > 100) {
            setSelectedImageIndex((prev) =>
              prev > 0 ? prev - 1 : prev
            );
          }
        }}
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          borderRadius: "10px"
        }}
      />

      {/* LEFT CLICK */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImageIndex((prev) =>
            prev > 0 ? prev - 1 : prev
          );
        }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "30%",
          height: "100%"
        }}
      />

      {/* RIGHT CLICK */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImageIndex((prev) =>
            prev < moments.length - 1 ? prev + 1 : prev
          );
        }}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "30%",
          height: "100%"
        }}
      />
    </motion.div>
  )}
</AnimatePresence>

      {/* HOME */}
      <section
        id="home"
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #a9c8f0, #9f9ef5)",
          textAlign: "center"
        }}
      >
        <h1>Hi Langga ❤️</h1>
      </section>

      {/* MOMENTS */}
      <section style={{ padding: "40px", background: "#fff5f7" }}>
        <h1>Our Moments ❤️</h1>

        <input placeholder="Title" value={newMoment.title}
          onChange={(e) => setNewMoment({ ...newMoment, title: e.target.value })} />

        <input type="date" value={newMoment.date}
          onChange={(e) => setNewMoment({ ...newMoment, date: e.target.value })} />

        <input placeholder="Description" value={newMoment.description}
          onChange={(e) => setNewMoment({ ...newMoment, description: e.target.value })} />

        <input type="file"
          onChange={(e) => setNewMoment({ ...newMoment, image: e.target.files[0] })} />

        <button onClick={handleAddMoment}>Add ❤️</button>

        {loading && <p>Loading...</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {moments.map((m, index) => (
            <div
              key={m.id}
              style={{
                background: "white",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
                cursor: "pointer"
              }}
            >
              <img
                src={m.image}
                alt={m.title}
                onClick={() => setSelectedImageIndex(index)} // ✅ UPDATED
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover"
                }}
              />

              <div style={{ padding: "15px" }}>
                <h3 style={{ marginBottom: "5px" }}>{m.title}</h3>
                <small style={{ color: "#888" }}>{m.date}</small>

                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    maxHeight: "60px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {m.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMoment(m.id);
                  }}
                  style={{
                    marginTop: "10px",
                    background: "#ff4d6d",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECRET */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "linear-gradient(135deg, #80b3c7, #bfe9ff)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 40
            }}
          >
            <h1 style={{ color: "white" }}>💌 Things I Love About You</h1>

            <textarea
              value={secretNote}
              onChange={(e) => setSecretNote(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 600,
                height: 300,
                padding: 15,
                borderRadius: 15,
                border: "none",
                outline: "none",
                marginTop: 20
              }}
            />

            <button
              onClick={() => setShowSecret(false)}
              style={{
                marginTop: 20,
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer onOpenSecret={() => setShowSecret(true)} />
    </main>
  );
}