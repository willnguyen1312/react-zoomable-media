import React, { Component } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.parcel';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

import pdfFile from './sample.pdf';
import { Zoomable, ZoomableDiv } from '../dist';

export default class Sample extends Component {
  state = {
    file: pdfFile,
    numPages: 0,
    currentPage: 1,
    pageHeight: 0,
    pageWidth: 0,
  };

  onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      file: event.target.files && event.target.files[0],
    });
  };

  onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    this.setState({ numPages });
  };

  onPageLoadSuccess = ({ view }: PDFPageProxy) => {
    this.setState({ pageWidth: view[2], pageHeight: view[3] });
  };

  goPrevPage = () =>
    this.setState({ currentPage: Math.max(1, this.state.currentPage - 1) });

  goNextPage = () =>
    this.setState({
      currentPage: Math.min(this.state.numPages, this.state.currentPage + 1),
    });

  render() {
    const { file, numPages, currentPage, pageWidth, pageHeight } = this.state;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
        }}
      >
        <div>
          <div>
            <label htmlFor="file">Load from file:</label>
            <input onChange={this.onFileChange} type="file" />
          </div>
          <div>
            <span>Current Page: {currentPage}</span>
            <button onClick={this.goPrevPage}>Previous Page</button>
            <button onClick={this.goNextPage}>Next Page</button>
            <span>{currentPage === numPages && 'Last page'}</span>
          </div>
          <Zoomable
            enable
            maxZoom={4}
            moveStep={50}
            wheelZoomRatio={0.1}
            zoomStep={10}
          >
            <ZoomableDiv
              render={({ onDivReady }) => {
                return (
                  <Document
                    loading={''}
                    externalLinkTarget="_blank"
                    file={file}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                  >
                    <Page
                      loading={''}
                      onLoadSuccess={arg => {
                        this.onPageLoadSuccess(arg);
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
          </Zoomable>
        </div>
      </div>
    );
  }
}
