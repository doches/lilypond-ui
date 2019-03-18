import * as React from "react";
import { IMessage } from "./types";
import { map } from "lodash";

import "./errorLog.less";

export interface IErrorLogProps {
  messages: IMessage[];
  onMessageClick: (message: IMessage) => void;
}

export default class ErrorLog extends React.Component<IErrorLogProps, {}> {
  public render() {
    return (
      <div className="error-log">
        {map(this.props.messages, (message: IMessage) => {
          return (
            <div 
              key={message.line}
              className={`error-log-message error-log-message-${message.type}`}
              onClick={() => {
                this.props.onMessageClick(message);
              }}
            >
              <div className="elm-title">
                <div className="elm-type">{message.type}</div>
                <div className="elm-location">
                  <div className="elm-location-line">{message.number}</div>
                  <div className="elm-location-character">{message.character}</div>
                </div>
              </div>
              <div className="elm-message">{message.message}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
