import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Firebase (ONLY Firestore now)
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

// ================= NAVBAR =================
function Navbar() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const songs = [
    { title: "Espresso", src: "/espresso.mp3" },
    { title: "Needy", src: "/needy.mp3" },
    { title: "Paragraphs", src: "/paragraphs.mp3" },
    { title: "Seasons", src: "/seasons.mp3" },
    { title: "Tiptoe", src: "/tiptoe.mp3" }
  ];

  const [currentSong, setCurrentSong] = useState(0);

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
        <source src={songs[currentSong].src} type="audio/mpeg" />
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
        <a href="#home">🏠︎ Home</a>
        {/* 🎵 SONG SELECTOR */}
        <select
          value={currentSong}
          onChange={(e) => {
            const index = Number(e.target.value);
            setCurrentSong(index);

            const audio = audioRef.current;
            audio.src = songs[index].src;
            audio.play();
            setPlaying(true);
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "5px 10px",
            borderRadius: "8px",
            border: "none",
            outline: "none"
          }}
        >
          {songs.map((song, i) => (
            <option key={i} value={i}>
              {song.title}
            </option>
          ))}
        </select>

        {/* ▶ PLAY / PAUSE */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const audio = audioRef.current;

            if (!playing) {
              audio.src = songs[currentSong].src;
              audio.play();
            } else {
              audio.pause();
            }

            setPlaying(!playing);
          }}
          onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
          style={{
          transition: "0.2s ease",
          padding: "2px 8px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          fontFamily: "'Minimo', sans-serif"
          }}
        >
          {playing ? "Pause ⏸" : "Play ▶"}
        </button>

        {/* ⏭ NEXT */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const next = (currentSong + 1) % songs.length;
            setCurrentSong(next);

            const audio = audioRef.current;
            audio.src = songs[next].src;
            audio.play();

            setPlaying(true);
          }}
          onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
          style={{
          transition: "0.2s ease",
          padding: "2px 8px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          fontFamily: "'Minimo', sans-serif"
          }}
        >
          Next ⏭
        </button>
      </nav>
    </>
  );
}
// ================= FOOTER =================
function Footer(){
  return (
    <footer>
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
  const count = 14; // slightly smaller burst

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;

    // 🔥 smaller explosion radius
    const distance = random(20, 60);

    particles.push({
      id: Math.random(),
      x,
      y,

      // final position target (radial explosion)
      tx: x + Math.cos(angle) * distance,
      ty: y + Math.sin(angle) * distance,

      size: random(10, 14),
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
  const startDate = new Date("2025-04-11"); 
  const getDaysTogether = () => {
  const now = new Date();
  const diff = now - startDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
  };
  const [showSecret, setShowSecret] = useState(false);
  const [role, setRole] = useState("M");
  const [secretNotes, setSecretNotes] = useState({
  M: "",
  K: ""
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const theme = {
  M: {
    background: "#729ff3",
    accent: "#ff4d6d"
  },
  K: {
    background: "#ffb6c1",
    accent: "#4d79ff"
  }
};
  const [newMoment, setNewMoment] = useState({
    title: "",
    description: "",
    image: null,
    date: ""
  });
useEffect(() => {
  const fetchNotes = async () => {
    const ref = doc(db, "secret", "notes");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setSecretNotes(snap.data());
    } else {
      await setDoc(ref, { M: "", K: "" });
    }
  };
  fetchNotes();
}, []);
const updateNote = async (value) => {
  const updated = {
    ...secretNotes,
    [role]: value
  };
  setSecretNotes(updated);
  const ref = doc(db, "secret", "notes");
  await setDoc(ref, updated, { merge: true });
};
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
      image: imageUrl,
      uploadedBy: role
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
const cuteInput = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #2e2b2b",
  outline: "none",
  fontSize: "14px",
  background: "white"
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
      transition: "background 0.8s ease, transform 0.15s ease",
      background: theme[role].background
      }}
    >
      <Navbar />

      {/* 💥 BURSTS */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
          key={b.id}
          initial={{ opacity: 1, scale: 1, x: b.x, y: b.y }}
          animate={{
            x: b.tx,
            y: b.ty,
            opacity: 0,
            scale: 0.6
          }}
          transition={{
            duration: 1.6, // 🐢 slow-mo feel
            ease: "easeOut"
          }}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
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
          background: "transparent",
          textAlign: "center"
        }}
      >
        <div>
  <h1 style={{ fontSize: "75px", marginBottom: "10px" }}>
    Langga ❤️
  </h1>

  <p style={{ fontSize: "50px", opacity: 0.8 }}>
    ≽ ^⎚ ˕ ⎚^ ≼
  </p>
  <h2 style={{ fontSize: "30px", marginTop: "10px" }}>
    We've been together for {getDaysTogether()} days 💕
  </h2>
</div>
      </section>

      {/* MOMENTS */}
        <section style={{ padding: "40px", background: "transparent" }}>
  <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
    Our Moments ❤️
  </h1>

  {/* 💖 ADD MOMENT CARD */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto 30px auto",
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <input
          placeholder="💖 Title"
          value={newMoment.title}
          onChange={(e) =>
            setNewMoment({ ...newMoment, title: e.target.value })
          }
          style={cuteInput}
        />

        <input
          type="date"
          value={newMoment.date}
          onChange={(e) =>
            setNewMoment({ ...newMoment, date: e.target.value })
          }
          style={cuteInput}
        />

        <input
          placeholder="💌 Description"
          value={newMoment.description}
          onChange={(e) =>
            setNewMoment({ ...newMoment, description: e.target.value })
          }
          style={cuteInput}
        />

        <input
          type="file"
          onChange={(e) =>
            setNewMoment({ ...newMoment, image: e.target.files[0] })
          }
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #333131",
            background: "white"
          }}
        />

        <button
          onClick={handleAddMoment}
          onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
          style={{
          transition: "0.2s ease",
            marginTop: "10px",
            background: "linear-gradient(135deg, #ff6fa3, #ff4d6d)",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Add Moment 💕
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* ✅ GRID (UNCHANGED — THIS HAS YOUR DELETE BUTTON) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20
        }}
      >
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
              onClick={() => setSelectedImageIndex(index)}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
                style={{
                transition: "0.2s ease",
                width: "100%",
                height: 200,
                objectFit: "cover"
              }}
            />

            <div style={{ padding: "15px" }}>
              <h3 style={{ marginBottom: "5px" }}>{m.title}</h3>
              <small style={{ color: "#888" }}>{m.date}</small>
              <small style={{ color: "#555", display: "block", marginTop: "4px" }}>
                Uploaded by: <b>{m.uploadedBy}</b>
              </small>
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

              {/* 🔥 DELETE BUTTON IS HERE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMoment(m.id);
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                  style={{
                  transition: "0.2s ease",
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

      <div
  style={{
    position: "fixed",
    top: 15,
    right: 15,
    display: "flex",
    gap: "10px",
    zIndex: 1000
  }}
>
  {/* ROLE BUTTON */}
  <button
    onClick={() => setRole(role === "M" ? "K" : "M")}
    style={{
      padding: "10px 15px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      background: theme[role].accent,
      color: "white",
      fontWeight: "bold"
    }}
  >
    {role}
  </button>

  {/* SECRET BUTTON */}
  <button
    onClick={() => setShowSecret(true)}
    style={{
      padding: "10px 15px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(10px)",
      fontWeight: "bold"
    }}
  >
    💌
  </button>
</div>

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

      {/* VIEW BOTH NOTES */}
      <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
        
        <div style={{ color: "#224f63", fontSize: "20px" }}>
          <h3>M Note</h3>
          <p style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
          }}>
          {secretNotes.M || "..."}
          </p>
        </div>

        <div style={{ color: "#ca3662", fontSize: "20px" }}>
          <h3>K Note</h3>
          <p style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
          }}>
          {secretNotes.K || "..."}
          </p>
        </div>
      </div>

      {/* ONLY EDIT OWN NOTE */}
      <textarea
        value={secretNotes[role] || ""}
        onChange={(e) => updateNote(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 200,
          height: 100,
          padding: 15,
          borderRadius: 15,
          border: "none",
          outline: "none",
          marginTop: 20,
          whiteSpace: "pre-wrap"
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

      <Footer/>
    </main>
  );
}