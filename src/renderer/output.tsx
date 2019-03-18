import * as React from "react";
import * as ReactPDF from "react-pdf";
import Pagination from "react-js-pagination";

import "./output.less";

export interface IOutputProps {
  path: string;
  needsRefresh: boolean;

  onRefresh: () => void;
}

export interface IOutputState {
  pageCount: number;
  page: number;
  pdfPath?: string;
}

export default class Output extends React.Component<IOutputProps, IOutputState> {
  public state: IOutputState;
  constructor(props: IOutputProps) {
    super(props);

    this.state = {
      page: 1,
      pageCount: 0,
    };
  }

  componentWillReceiveProps(props: IOutputProps) {
    if (props.needsRefresh && !this.props.needsRefresh) {
      // Triggered refresh
      this.loadOutputFromLilypondPath(props.path);
    }
  }

  public render() {
    return (
      <div className="app-output">
        {this.state.pdfPath && (
          <div className="output-pdf">
            <ReactPDF.Document
              file={this.state.pdfPath}
              onLoadSuccess={(pdfDocumentProxy: any) => {
                this.setState({ pageCount: pdfDocumentProxy._pdfInfo.numPages });
              }}
            >
              <ReactPDF.Page pageNumber={this.state.page} />
            </ReactPDF.Document>
          </div>
        )}
        {this.state.pdfPath && this.state.pageCount > 1 && (
          <div className="output-pagination">
            <Pagination
              activePage={this.state.page}
              itemsCountPerPage={1}
              totalItemsCount={this.state.pageCount}
              pageRangeDisplayed={5}
              onChange={(newPageNumber: number) => {
                this.setState({
                  page: newPageNumber
                });
              }}
            />
          </div>
        )}
      </div>
    );
  }

  public loadOutputFromLilypondPath = (path: string) => {
    this.setState({
      pdfPath: null,
    });
    setTimeout(() => {
      this.setState({
        pdfPath: path.replace(/\.ly$/, ".pdf"),
      });
      this.props.onRefresh();
    });
  }
}
