import React from "react";

const MindARPanel: React.FC = () => {
  return (
    <iframe
      src="/ar.html" // publicディレクトリに配置
      style={{ width: "100vw", height: "100vh", border: "none" }}
      sandbox="allow-scripts allow-same-origin"
      title="MindAR Example"
    />
  );
};

export default MindARPanel;