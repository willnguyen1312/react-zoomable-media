import React, { Component } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.parcel';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

import pdfFile from './sample.pdf';

export default class Sample extends Component {
  state = {
    file: pdfFile,
    numPages: null,
    currentPage: 1,
    pageHeight: 0,
  };

  onFileChange = event => {
    this.setState({
      file: event.target.files[0],
    });
  };

  onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    this.setState({ numPages });
  };

  onPageLoadSuccess = ({ view }: PDFPageProxy) => {
    this.setState({ pageHeight: view[3] });
  };

  onPageNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentPage: Number(event.target.value) });
  };

  render() {
    const { file, numPages, currentPage, pageHeight } = this.state;

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
              defaultValue={1}
              type="number"
              name="numPage"
              id="numPage"
              min={1}
              max={Number(numPages)}
            />
          </div>
          <div
            style={{
              height: pageHeight ? pageHeight * 1.25 : 'auto',
            }}
          >
            <Document
              externalLinkTarget="_blank"
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
            >
              <Page
                onLoadSuccess={this.onPageLoadSuccess}
                scale={1.25}
                pageNumber={currentPage}
              />
            </Document>
          </div>
        </div>
      </div>
    );
  }
}
