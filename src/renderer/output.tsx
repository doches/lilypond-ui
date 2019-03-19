import * as React from "react";
import * as ReactPDF from "react-pdf";
import Pagination from "react-js-pagination";
import {
  Spinner,
  Intent,
  NonIdealState,
} from "@blueprintjs/core";
import Toast from "./toast";

import "./output.less";

const translateScale = (scale: string) => {
  if (scale.indexOf("%") > -1) {
    return (+scale.replace(/[^\d]+/g, ""))/100.0;
  }

  return 1;
}

export interface IOutputProps {
  path: string;
  needsRefresh: boolean;
  hasErrors: boolean;
  showPendingSpinner: boolean;
  onLoadSuccess: () => void;

  onRefresh: () => void;
  scale: string;
}

export interface IOutputState {
  pageCount: number;
  page: number;
  pdfPath?: string;
  width: number;
  hideErrorWarning: boolean;
}

export default class Output extends React.Component<IOutputProps, IOutputState> {
  public state: IOutputState;
  public containerRef: any;
  constructor(props: IOutputProps) {
    super(props);

    this.containerRef = React.createRef();

    this.state = {
      page: 1,
      pageCount: 0,
      width: 0,
      hideErrorWarning: false,
    };
  }

  componentWillReceiveProps(props: IOutputProps) {
    if (props.needsRefresh && !this.props.needsRefresh) {
      // Triggered refresh
      this.loadOutputFromLilypondPath(props.path);
      this.setState({
        hideErrorWarning: false,
      });
    }
  }

  public render() {
    return (
      <div className="app-output" ref={this.containerRef}>
        {this.props.showPendingSpinner && (
          <div className="app-output-spinner">
            <Spinner />
          </div>
        )}
        {this.state.pdfPath && (
          <div className="output-pdf">
            <ReactPDF.Document
              loading=""
              file={this.state.pdfPath}
              onLoadSuccess={(pdfDocumentProxy: any) => {
                this.setState({
                  pageCount: pdfDocumentProxy._pdfInfo.numPages,
                });
                this.props.onLoadSuccess();
              }}
              onLoadError={(error: any) => {
                console.error(error);
                Toast.show({
                  message: "Could not load PDF",
                  intent: Intent.WARNING,
                })
                this.props.onLoadSuccess();
              }}
            >
              <ReactPDF.Page
                pageNumber={this.state.page}
                scale={this.props.scale !== "Auto" ? translateScale(this.props.scale) : null}
                width={this.props.scale === "Auto" ? this.containerRef.current.offsetWidth : null}
              />
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
        {this.props.hasErrors && !this.state.hideErrorWarning && (
          <div
            className="output-errors"
            onClick={() => {
              this.setState({ hideErrorWarning: true });
            }}
          >
            <NonIdealState
              title="PDF is out of date"
              description="Your LilyPond source file has one or more errors"
              icon="warning-sign"
              className="bp3-dark"
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
