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

  handleKeyDown = (event: KeyboardEvent) => {
    const { currentPage, numPages } = this.state;
    const handlers = {
      ArrowDown: () => {
        this.setState({ currentPage: Math.max(1, currentPage - 1) });
      },
      ArrowUp: () => {
        this.setState({
          currentPage: Math.min(numPages, currentPage + 1),
        });
      },
    };

    const handler = handlers[event.key];
    if (handler) {
      handler();
    }
  };

  componentDidMount = () =>
    window.addEventListener('keydown', this.handleKeyDown);

  componentWillUnmount = () =>
    window.removeEventListener('keydown', this.handleKeyDown);

  onFileChange = event => {
    this.setState({
      file: event.target.files[0],
    });
  };

  onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    this.setState({ numPages });
  };

  onPageLoadSuccess = ({ view }: PDFPageProxy) => {
    this.setState({ pageWidth: view[2], pageHeight: view[3] });
  };

  onPageNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentPage: Number(event.target.value) });
  };

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
            <span>Page Number:</span>
            <input
              onChange={this.onPageNumberChange}
              value={currentPage}
              type="number"
              name="numPage"
              id="numPage"
              min={1}
              max={Number(numPages)}
            />
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
