import React from 'react';
import MyCustomPDFRenderer from "@/renderers/MyCustomPDFRenderer";

const FileViewer = ({ docData }) => {
  // Main state for the document
  const mainState = {
    currentDocument: {
      fileData: docData,
      fileName: 'Document'
    }
  };

  return (
    <div>
      {/* Directly rendering MyCustomPDFRenderer */}
      <MyCustomPDFRenderer mainState={mainState} />
    </div>
  );
};

export default FileViewer;