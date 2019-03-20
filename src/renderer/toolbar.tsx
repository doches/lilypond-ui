import * as React from "react";
import {
  Button,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  PopoverInteractionKind,
} from "@blueprintjs/core";
import { map } from "lodash";

import "./toolbar.less";

export interface IToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onNew: () => void;
  onRender: () => void;
  path: string;
  needsSaving: boolean;
  scale: string;
  scaleOptions: string[];
  onChangeScale: (scale: string) => void;

  showButtonLabels: boolean;
}

export default class Toolbar extends React.Component<IToolbarProps, {}> {
  public render() {
    return (
      <div className="app-toolbar">
        <div className="toolbar-left">
          <Button
            icon="document"
            intent={Intent.NONE}
            minimal={true}
            text={this.props.showButtonLabels ? "New" : ""}
            onClick={this.props.onNew}
          />
          <Button
            icon="document-open"
            intent={Intent.NONE}
            minimal={true}
            text={this.props.showButtonLabels ? "Open" : ""}
            onClick={this.props.onOpen}
          />
          <Button
            icon="floppy-disk"
            intent={this.props.needsSaving ? Intent.DANGER : Intent.NONE}
            minimal={true}
            text={this.props.showButtonLabels ? "Save" : ""}
            onClick={this.props.onSave}
          />
          <Button
            icon="draw"
            intent={this.props.needsSaving ? Intent.WARNING : Intent.NONE}
            minimal={true}
            text={this.props.showButtonLabels ? "Render" : ""}
            onClick={this.props.onRender}
          />
        </div>
        <div className="toolbar-center">
          {this.props.path && this.props.path.length > 0 && (
            <Button
              text={this.props.path}
              minimal={true}
              intent={Intent.NONE}
            />
          )}
        </div>
        <div className="toolbar-right">
          <Popover
            content={(
              <Menu>
                {map(this.props.scaleOptions, (opt: string) => (
                  <MenuItem
                    text={opt}
                    active={opt === this.props.scale}
                    onClick={() => this.props.onChangeScale(opt)}
                  />
                ))}
              </Menu>
            )}
            position={Position.BOTTOM_LEFT}
            interactionKind={PopoverInteractionKind.CLICK}
          >
            <Button
              icon="zoom-to-fit"
              text={this.props.scale}
              minimal={false}
              intent={Intent.NONE}
            />
          </Popover>
        </div>
      </div>
    );
  }
}
