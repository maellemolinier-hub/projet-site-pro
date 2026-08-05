import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cap Entreprendre France — Studio de communication & graphisme à Grasse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f6f1",
          backgroundImage: "linear-gradient(135deg, #f8f6f1 0%, #e8e4d9 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#4449e7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            C
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: "bold",
                color: "#1a1a2e",
                letterSpacing: "-1px",
              }}
            >
              Cap Entreprendre France
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#4449e7",
            marginTop: "10px",
          }}
        >
          Votre agence de communication & studio graphique à Grasse
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "40px",
            fontSize: "22px",
            color: "#666",
          }}
        >
          <span>Création de sites web</span>
          <span>•</span>
          <span>Stratégie de marque</span>
          <span>•</span>
          <span>Identité visuelle</span>
        </div>
      </div>
    ),
    { ...size }
  );
}