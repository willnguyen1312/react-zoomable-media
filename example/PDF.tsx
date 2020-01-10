import React, { useState, useContext } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.parcel';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

import pdfFile from './sample.pdf';
import {
  Zoomable,
  ZoomableDiv,
  zoomableContext,
  ZoomableContextType,
} from '../dist';

const PDF = () => {
  const [file, setFile] = useState<string>(pdfFile);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrrentPage] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(
      (event.target.files && ((event.target.files[0] as unknown) as string)) ||
        ''
    );
  };

  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = ({ view }: PDFPageProxy) => {
    setPageWidth(view[2]);
    setPageHeight(view[3]);
  };

  const goPrevPage = () => setCurrrentPage(Math.max(1, currentPage - 1));

  const goNextPage = () => setCurrrentPage(Math.min(numPages, currentPage + 1));

  return (
    <div>
      <div>
        <label htmlFor="file">Load from file:</label>
        <input onChange={onFileChange} type="file" />
      </div>
      <div>
        <span>Current Page: {currentPage}</span>
        <button onClick={goPrevPage}>Previous Page</button>
        <button onClick={goNextPage}>Next Page</button>
        <span>{currentPage === numPages && 'Last page'}</span>
      </div>
      <ZoomableDiv
        render={({ onDivReady }) => {
          return (
            <Document
              loading={''}
              externalLinkTarget="_blank"
              file={file}
              onItemClick={({ pageNumber }) => {
                setCurrrentPage(Number(pageNumber));
              }}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page
                loading={''}
                onLoadSuccess={arg => {
                  onPageLoadSuccess(arg);
                  onDivReady({
                    width: arg.view[2],
                    height: arg.view[3],
                  });
                }}
                scale={1}
                pageNumber={currentPage}
              />
            </Document>
          );
        }}
      />
    </div>
  );
};

const PDFApp = () => {
  return (
    <Zoomable
      enable
      maxZoom={4}
      moveStep={50}
      wheelZoomRatio={0.1}
      zoomStep={10}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
        }}
      >
        <PDF />
      </div>
    </Zoomable>
  );
};

export default PDFApp;
