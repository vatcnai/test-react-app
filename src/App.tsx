import PdfSplitter from "./PdfSplitter";
import DocSplitter from "./DocSplitter";

function App() {
  return (
    <div>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Document Processing Tools</h1>

        <div
          style={{
            marginBottom: "40px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <DocSplitter />
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <PdfSplitter />
        </div>
      </div>
    </div>
  );
}

export default App;
