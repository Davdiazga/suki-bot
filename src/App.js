// Importamos React y los hooks useState y useEffect
import React, { useState, useEffect } from "react";

/* 
    Función para obtener la respuesta de la IA (Ollama con modelo Llama2)
  - Envía el texto que el usuario escribió como prompt
  - Conecta con el endpoint local de Ollama en http://localhost:11434/api/generate
  - Recibe la respuesta y la va construyendo
*/
async function getAIResponse(prompt) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama2", prompt: "Responde en español: " + prompt })
  });

  const reader = response.body.getReader();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break; // Cuando no hay más datos, salimos del bucle

    // Decodificamos el fragmento recibido a texto
    const chunk = new TextDecoder("utf-8").decode(value);

    try {
      // Cada línea contiene un objeto JSON con una parte de la respuesta
      const lines = chunk.trim().split("\n");
      for (let line of lines) {
        if (!line) continue;
        const data = JSON.parse(line);
        if (data.response) result += data.response;
      }
    } catch (e) {
      console.error("Error procesando chunk:", e);
    }
  }

  // Si no se recibió nada, devolvemos un mensaje por defecto
  return result || "🤔 No pude generar respuesta.";
}

/* 
    Componente principal de la app: Suki, acompañante virtual
  - Muestra un chat interactivo donde el usuario puede hablar con la IA
  - Tiene modo oscuro/claro
  - Muestra sugerencias de preguntas
*/
export default function App() {
  // Estado con todos los mensajes del chat
  const [messages, setMessages] = useState([
    { from: "bot", text: "🌟 ¡Hola! Soy Suki tu Acompañante virtual. Estoy aquí para contarte historias y acompañarte 💛" }
  ]);
  const [input, setInput] = useState(""); // Texto actual que escribe el usuario
  const [loading, setLoading] = useState(false); // Indicador de carga
  const [darkMode, setDarkMode] = useState(false); // Alternar modo oscuro
  const [typingText, setTypingText] = useState(""); // Texto que simula que Suki está escribiendo

  /*
    - Función para enviar un mensaje
    - Añade el mensaje del usuario al historial
    - Llama a la IA y muestra su respuesta con efecto de escritura
  */
  const handleSend = async (customPrompt) => {
    const text = customPrompt || input;
    if (!text.trim()) return;

    const newMessages = [...messages, { from: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingText("✍️ Suki está escribiendo...");

    const reply = await getAIResponse(text);

    // Efecto de escritura letra por letra
    let typed = "";
    for (let char of reply) {
      typed += char;
      setTypingText(typed);
      await new Promise((res) => setTimeout(res, 25)); 
    }

    setMessages([...newMessages, { from: "bot", text: reply }]);
    setTypingText("");
    setLoading(false);
  };

  //Preguntas sugeridas que el usuario puede tocar para enviarlas directamente
  const preguntasSugeridas = [
    "Hazme sentir acompañado 💛",
    "Cuéntame un cuento corto y divertido",
    "¿Puedes contarme una historia de amor?",
    "¿Qué noticias bonitas han pasado hoy?",
    "Dime un dato curioso del mundo",
    "Cuéntame una historia de animales",
    "Hazme reír con un chiste",
    "Recomiéndame una película bonita",
    "Dime una frase motivadora",
    "Cuéntame una historia antigua",
    "Dime una receta fácil y sabrosa",
    "Háblame de un país lejano",
    "Cuéntame algo sobre el espacio",
    "Dime un poema corto",
    "Recomiéndame un pasatiempo tranquilo",
    "Dime algo positivo de la vida",
    "Recuérdame un refrán sabio",
    "Cuéntame una historia de fantasía",
    "Háblame de la naturaleza",
    "Cuéntame algo sobre la música",
    "Dime una adivinanza",
    "Cuéntame sobre un invento curioso",
    "Háblame de un personaje famoso",
    "Dime un cuento para dormir",
    "Cuéntame un recuerdo feliz",
    "Dime una cita célebre inspiradora ✨",
    "Dame un consejo para sentirme mejor 💌",
    "Recomiéndame un libro bonito 📖",
    "Dime un dato curioso sobre el cuerpo humano 🧠",
    "Cuéntame una leyenda mitológica 🧚",
    "Háblame de una tradición bonita de algún país 🌎",
    "Dime una curiosidad sobre los gatos 🐱",
    "Cuéntame una historia graciosa de animales 😂",
    "Dame un reto pequeño para hoy 💪",
    "Cuéntame algo que te haga sonreír 😄",
    "Descríbeme un día perfecto 🌞",
    "Hazme imaginar un lugar relajante 🌴",
    "Dime algo que motive a seguir adelante 💖",
    "Cuéntame una anécdota histórica 🏛️",
    "Dime algo sobre el océano 🌊",
    "Cuéntame una curiosidad sobre el espacio 🚀",
    "Dame una idea creativa para hoy 🎨",
    "Hazme imaginar un momento mágico ✨",
    "Cuéntame algo que huela delicioso 🍪",
    "Recomiéndame una canción tranquila 🎵",
    "Dime un nombre bonito y su significado 🌸"
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        background: darkMode
          ? "linear-gradient(135deg,#232526,#414345)" // Fondo oscuro
          : "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", // Fondo claro
        fontFamily: "'Poppins', sans-serif",
        padding: "30px",
        boxSizing: "border-box",
        gap: "30px",
        transition: "0.5s ease"
      }}
    >

      {/*Panel izquierdo: lista de preguntas sugeridas y botón de modo oscuro */}
      <div
        style={{
          width: "300px",
          background: "rgba(255,255,255,0.85)",
          borderRadius: "25px",
          padding: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(10px)"
        }}
      >
        {/* Cabecera con avatar y nombre del bot */}
        <div style={{ textAlign: "center" }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712105.png"
            alt="Suki"
            style={{ width: "80px", borderRadius: "50%", marginBottom: "10px" }}
          />
          <h2 style={{ color: "#ff6f61", fontSize: "24px", margin: 0 }}>💖 Suki Bot</h2>
        </div>

        {/* Lista de botones con preguntas sugeridas */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginTop: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            scrollBehavior: "smooth"
          }}
        >
          {preguntasSugeridas.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              style={{
                textAlign: "left",
                padding: "12px",
                borderRadius: "15px",
                border: "2px solid #ffd6d6",
                background: "#fffaf7",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: "1.4",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Botón para alternar modo claro/oscuro */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "15px",
            border: "none",
            background: darkMode ? "#ffe0ac" : "#414345",
            color: darkMode ? "#333" : "#fff",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Cambiar a {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
      </div>

      {/*Panel derecho: área del chat */}
      <div
        style={{
          flex: 1,
          background: "rgba(255,255,255,0.85)",
          borderRadius: "30px",
          padding: "25px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(10px)"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "35px",
            color: "#ff6f61",
            marginBottom: "15px",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
          }}
        >
          🤖 SUKI Acompañante Virtual
        </h1>

        {/* Contenedor de los mensajes del chat */}
        <div
          style={{
            flex: 1,
            border: "3px solid #ffd6d6",
            borderRadius: "25px",
            padding: "20px",
            overflowY: "auto",
            background: "#fff5f5",
            scrollBehavior: "smooth"
          }}
        >
          {/* Cada mensaje se muestra con distinto diseño según si es del usuario o del bot */}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "20px"
              }}
            >
              {/* Avatar del bot */}
              {msg.from === "bot" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712105.png"
                  alt="Suki"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginRight: "10px"
                  }}
                />
              )}

              {/* Burbuja del mensaje */}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "15px 20px",
                  borderRadius: "20px",
                  fontSize: "18px",
                  lineHeight: "1.6",
                  background: msg.from === "user" ? "#c1f0d2" : "#ffe0ac",
                  color: "#333",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
                }}
              >
                <b>{msg.from === "user" ? "Tú" : "Suki"}:</b> {msg.text}
              </div>

              {/* Avatar del usuario */}
              {msg.from === "user" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2922/2922506.png"
                  alt="Tú"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginLeft: "10px"
                  }}
                />
              )}
            </div>
          ))}

          {/* Texto de "Suki está escribiendo..." mientras llega la respuesta */}
          {typingText && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712105.png"
                alt="Suki"
                style={{ width: "35px", height: "35px", borderRadius: "50%" }}
              />
              <div
                style={{
                  background: "#ffe0ac",
                  padding: "12px 18px",
                  borderRadius: "20px",
                  fontSize: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
              >
                <b>Suki:</b> {typingText}
              </div>
            </div>
          )}
        </div>

        {/* Entrada de texto + botón enviar */}
        <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "18px",
              borderRadius: "15px",
              border: "3px solid #ffb6b6",
              fontSize: "18px"
            }}
            placeholder="Escribe algo bonito aquí..."
          />
          <button
            onClick={() => handleSend()}
            style={{
              padding: "18px 25px",
              borderRadius: "15px",
              background: "#ff6f61",
              color: "#fff",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              boxShadow: "0 5px 10px rgba(0,0,0,0.2)"
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

