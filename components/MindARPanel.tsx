import React from "react";

const MindARPanel: React.FC = () => {
  return (
    <div style={{ 
      width: "100%", 
      height: "calc(100vh - 120px)", 
      maxWidth: 1200, 
      margin: "0 auto",
      paddingLeft: 20,
      paddingRight: 20
    }}>
      <iframe
        src="/ar.html"
        style={{ 
          width: "100%", 
          height: "100%", 
          border: "none" 
        }}
        sandbox="allow-scripts allow-same-origin"
        title="MindAR Example"
      />
    </div>
  );
};

export default MindARPanel;