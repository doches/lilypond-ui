import * as React from "react";
import {
  Button,
  Intent,
} from "@blueprintjs/core";

import "./toolbar.less";

const { dialog } = require("electron").remote;

export interface IToolbarProps {
  onLoadFile: (path: string) => void;
  onSave: () => void;
  onNew: () => void;
  onRender: () => void;
  path: string;
  needsSaving: boolean;
}

export default class Toolbar extends React.Component<IToolbarProps, {}> {
  public render() {
    return (
      <div className="app-toolbar">
        <Button
          icon="document"
          intent={Intent.NONE}
          minimal={true}
          text="New"
          onClick={this.props.onNew}
        />
        <Button
          icon="document-open"
          intent={Intent.NONE}
          minimal={true}
          text="Open"
          onClick={this.openFileDialog}
        />
        <Button
          icon="floppy-disk"
          intent={this.props.needsSaving ? Intent.DANGER : Intent.NONE}
          minimal={true}
          text="Save"
          onClick={this.props.onSave}
        />
        <Button
          icon="draw"
          intent={this.props.needsSaving ? Intent.WARNING : Intent.NONE}
          minimal={true}
          text="Render"
          onClick={this.props.onRender}
        />
        <span
          style={{flex: 1}}
        />
        {this.props.path && this.props.path.length > 0 && (
          <Button
            text={this.props.path}
            minimal={true}
            intent={Intent.NONE}
          />
        )}
      </div>
    );
  }

  public openFileDialog = () => {
    const files = dialog.showOpenDialog({
      properties: ['openFile'],
      title: "Open a LilyPond source file",
      filters: [
        {name: "LilyPond Source", extensions: ["ly", "lilypond"]}
      ]
    });
    if (files && files.length === 1) {
      this.props.onLoadFile(files[0]);
    }
  }
}
