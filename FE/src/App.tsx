import { useState, useEffect } from "react";
import axios from "axios";

type FileItem = {
  key: string;
  url: string;
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get<FileItem[]>("http://localhost:5000/files");
      setFiles(res.data);
    } catch (error: any) {
      console.error("❌ Fetch Files Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Backend Error Message:", error.response.data);
      } else {
        console.log("Network/Error:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFile = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const renderPreview = (file: FileItem) => {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.key);
    const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(file.key);

    if (isImage) {
      return (
        <img
          src={file.url}
          width={200}
          alt={file.key}
          style={{ borderRadius: 10 }}
        />
      );
    }

    if (isVideo) {
      return (
        <video width={200} controls style={{ borderRadius: 10 }}>
          <source src={file.url} />
        </video>
      );
    }

    return <p>{file.key}</p>;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>React + TypeScript File Upload → AWS S3</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={uploadFile} style={{ marginLeft: 10 }}>
        Upload
      </button>

      <h3 style={{ marginTop: 30 }}>Uploaded Files</h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {files.map((file) => (
          <div key={file.key}>
            {(console.log("IMAGE URL:", file.url), null)}
            {renderPreview(file)}
            <p>{file.key}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
