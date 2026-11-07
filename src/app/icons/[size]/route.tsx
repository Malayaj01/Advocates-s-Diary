import { ImageResponse } from "next/og";

// App icon: a diary cover in ink blue with a red margin line.
export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = raw === "512" ? 512 : raw === "180" ? 180 : 192;
  const u = size / 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d2b4f",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 24 * u, top: 0, bottom: 0, width: 2.5 * u, background: "#d98a80" }} />
        <div style={{ color: "#f6f0e4", fontSize: 58 * u, fontWeight: 800, fontFamily: "serif", marginLeft: 10 * u }}>
          D
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
