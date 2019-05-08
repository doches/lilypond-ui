import * as React from "react";
import {
  Dialog,
  Classes,
  FormGroup,
  InputGroup,
  NumericInput,
  Switch
} from "@blueprintjs/core";
import { USER_DEFAULTS, USER_SETTINGS } from "./userSettings";
import * as Settings from "electron-settings";
import cx from "classnames";

export interface IPreferencesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface IPreferencesDialogState {
  autorenderEnabled: boolean;
  toolbarIconsEnabled: boolean;
  editorFontSize: number;
}

export default class PreferencesDialog extends React.Component<IPreferencesDialogProps, IPreferencesDialogState> {
  public state: IPreferencesDialogState;
  constructor(props: IPreferencesDialogProps) {
    super(props);

    this.state = {
      autorenderEnabled: !!Settings.get(USER_SETTINGS.AUTORENDER_FLAG, USER_DEFAULTS.AUTORENDER_FLAG).valueOf(),
      toolbarIconsEnabled: !!Settings.get(USER_SETTINGS.TOOLBAR_ICONS_FLAG, USER_DEFAULTS.TOOLBAR_ICONS_FLAG).valueOf(),
      editorFontSize: +Settings.get(USER_SETTINGS.EDITOR_FONT_SIZE, USER_DEFAULTS.EDITOR_FONT_SIZE).toString(),
    };
  }

  public render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        title="Preferences"
        icon="cog"
        onClose={this.props.onClose}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            helperText="The full path to your LilyPond executable"
            label="LilyPond path"
            labelFor="lilypond-path"
            labelInfo="(required)"
          >
            <InputGroup
              id="lilypond-path"
              placeholder={USER_DEFAULTS.LILYPOND_PATH}
              defaultValue={Settings.get(USER_SETTINGS.LILYPOND_PATH, USER_DEFAULTS.LILYPOND_PATH).toString()}
              onChange={(event: any) => {
                Settings.set(USER_SETTINGS.LILYPOND_PATH, event.target.value);
              }}
              className={Classes.FILL}
            />
          </FormGroup>
          <FormGroup
            helperText="The full path to your musicxml2ly executable"
            label="MusicXML2ly path"
            labelFor="musicxml2ly-path"
          >
            <InputGroup
              id="musicxml2ly-path"
              placeholder={USER_DEFAULTS.MUSICXML_CONVERTER_PATH}
              defaultValue={Settings.get(USER_SETTINGS.MUSICXML_PATH, USER_DEFAULTS.MUSICXML_CONVERTER_PATH).toString()}
              onChange={(event: any) => {
                Settings.set(USER_SETTINGS.MUSICXML_PATH, event.target.value);
              }}
              className={Classes.FILL}
            />
          </FormGroup>
          <FormGroup
            helperText="Enable to automatically render a fresh PDF after saving"
            label="Render on Save"
            labelFor="autorender-flag"
          >
            <Switch
              id="autorender-flag"
              checked={this.state.autorenderEnabled}
              onChange={() => {
                const newState = !this.state.autorenderEnabled;
                Settings.set(USER_SETTINGS.AUTORENDER_FLAG, newState);
                this.setState({
                  autorenderEnabled: newState,
                });
              }}
              className={cx([Classes.FILL])}
              label={this.state.autorenderEnabled ? "Enabled" : "Disabled"}
            />
          </FormGroup>
          <FormGroup
            helperText="Enable or disable button labels in the toolbar"
            label="Show Toolbar Labels"
            labelFor="toolbar-icons-flag"
          >
            <Switch
              id="toolbar-icons-flag"
              checked={this.state.toolbarIconsEnabled}
              onChange={() => {
                const newState = !this.state.toolbarIconsEnabled;
                Settings.set(USER_SETTINGS.TOOLBAR_ICONS_FLAG, newState);
                this.setState({
                  toolbarIconsEnabled: newState,
                });
              }}
              className={cx([Classes.FILL])}
              label={this.state.toolbarIconsEnabled ? "Enabled" : "Disabled"}
            />
          </FormGroup>
          <FormGroup
            helperText="Font size (in px) to use in the editor"
            label="Font Size"
            labelFor="editor-font-size"
          >
            <NumericInput
              id="editor-font-size"
              placeholder={"" + USER_DEFAULTS.EDITOR_FONT_SIZE}
              value={this.state.editorFontSize}
              onValueChange={(value: number) => {
                this.setState({
                  editorFontSize: value,
                });
                Settings.set(USER_SETTINGS.EDITOR_FONT_SIZE, value);
              }}
              className={Classes.FILL}
            />
          </FormGroup>
        </div>
      </Dialog>
    );
  }
}
