import * as React from "react";
import SplitPane from "react-split-pane";
import Editor from "./editor";
import Toolbar from "./toolbar";
import Output from "./output";
import ErrorLog from "./errorLog";
import * as fs from "fs";
import Toast from "./toast";
import {
  Intent,
} from "@blueprintjs/core";
import * as Settings from "electron-settings";
import * as Mousetrap from "mousetrap";
import { ipcRenderer } from "electron";
const { dialog } = require("electron").remote;
import { filter, map } from "lodash";
import { USER_SETTINGS, USER_DEFAULTS } from "./userSettings";
import { IMessage, ILinePosition } from "./types";
import PreferencesDialog from "./preferencesDialog";
import DefaultNewFile from "./defaultNewFile";

import './app.less';

import { exec } from "child_process";

export interface IAppProps {

}

export interface IAppState {
  code: string;
  path: string;
  codeHasChanged: boolean;
  outputNeedsRefresh: boolean;
  messages: IMessage[];
  rawOutput: string;
  infoPanelSize: string;
  scrollToPosition?: ILinePosition;
  pdfIsPending: boolean;
  scale: string;
  preferencesVisible: boolean;
  autorenderEnabled: boolean;
}

export default class App extends React.Component<IAppProps, IAppState> {
  state: IAppState;
  constructor(props: IAppProps) {
    super(props)

    this.state = {
      code: "",
      path: "",
      codeHasChanged: false,
      outputNeedsRefresh: false,
      messages: [],
      rawOutput: "",
      infoPanelSize: "99%",
      pdfIsPending: false,
      scale: "100%",
      preferencesVisible: false,
      autorenderEnabled: !!Settings.get(USER_SETTINGS.AUTORENDER_FLAG, USER_DEFAULTS.AUTORENDER_FLAG).valueOf(),
    };
  }

  public componentDidMount() {
    // Load most recent file
    if (Settings.has(USER_SETTINGS.ACTIVE_FILE)) {
      const path = Settings.get(USER_SETTINGS.ACTIVE_FILE).toString();
      this.setState({ path });
      this.loadSourceFile(path);
    }

    // Bind keyboard shortcuts
    Mousetrap.bind(["command+s", "ctrl+s"], () => {
      this.saveSourceFile(this.state.path);
    });
    Mousetrap.bind(["command+r", "ctrl+r"], () => {
      this.compile(this.state.path);
    });
    Mousetrap.bind(["command+n", "ctrl+n"], () => {
      this.newFile();
    });

    // Handle menu actions
    ipcRenderer.on("new", this.newFile);
    ipcRenderer.on("open", this.openFileDialog);
    ipcRenderer.on("save", () => {
      this.saveSourceFile(this.state.path);
    });
    ipcRenderer.on("render", () => {
      this.compile(this.state.path);
    });
    ipcRenderer.on("showPreferences", this.showPreferences);
  }

  componentWillReceiveProps(_: IAppProps, state: IAppState) {
    if (state.path !== this.state.path) {
      if (state.path) {
        const components = state.path.split("/");
        document.title = components.pop().replace(/\.ly/, "");
      } else {
        document.title = "New Lilypond File";
      }
    }
  }

  public render() {
    return (
      <div className="app-container">
        <PreferencesDialog
          isOpen={this.state.preferencesVisible}
          onClose={() => {
            this.setState({
              preferencesVisible: false,
            });
          }}
        />
        <Toolbar
          path={this.state.path}
          onOpen={this.openFileDialog}
          needsSaving={this.state.codeHasChanged}
          onSave={() => {
            this.saveSourceFile(this.state.path);
          }}
          onNew={() => { this.newFile(); }}
          onRender={() => { this.compile(this.state.path); }}
          scale={this.state.scale}
          onChangeScale={(scale: string) => {
            this.setState({ scale });
          }}
          scaleOptions={[
            "100%",
            "125%",
            "150%",
            "200%",
            "Auto"
          ]}
          showButtonLabels={!!Settings.get(USER_SETTINGS.TOOLBAR_ICONS_FLAG, USER_DEFAULTS.TOOLBAR_ICONS_FLAG).valueOf()}
        />
        <div className="app-content">
          <SplitPane
            split="horizontal"
            size={this.state.infoPanelSize}
          >
            <SplitPane
              split="vertical"
              defaultSize={"50%"}
              minSize={400}
              maxSize={1200}
            >
              <Editor
                code={this.state.code}
                onCodeUpdate={(code: string) => {
                  this.setState({
                    code,
                    codeHasChanged: true,
                   });
                }}
                onSave={() => {
                  this.saveSourceFile(this.state.path);
                }}
                messages={this.state.messages}
                scrollPosition={this.state.scrollToPosition}
                editorFontSize={+Settings.get(USER_SETTINGS.EDITOR_FONT_SIZE, USER_DEFAULTS.EDITOR_FONT_SIZE).toString()}
              />
              <Output
                path={this.state.path}
                needsRefresh={this.state.outputNeedsRefresh}
                onRefresh={() => {
                  this.setState({
                    outputNeedsRefresh: false,
                  })
                }}
                showPendingSpinner={this.state.pdfIsPending}
                onLoadSuccess={() => {
                  this.setState({ pdfIsPending: false});
                }}
                scale={this.state.scale}
                hasErrors={this.state.messages && filter(this.state.messages, (message: IMessage) => message.type.toLowerCase() == "error").length > 0}
              />
            </SplitPane>
            <SplitPane
              split="vertical"
              minSize={400}
              maxSize={1200}
              defaultSize={"50%"}
            >
              <ErrorLog
                messages={this.state.messages}
                onMessageClick={(message: IMessage) => {
                  this.setState({
                    scrollToPosition: {
                      line: message.number,
                      ch: message.character,
                    }
                  });
                }}
              />
              <div className="app-raw-output">
                <pre>{this.state.rawOutput}</pre>
              </div>
            </SplitPane>
          </SplitPane>
        </div>
      </div>
    );
  }

  public loadSourceFile = (path: string) => {
    Settings.set(USER_SETTINGS.ACTIVE_FILE, path);
    fs.readFile(path, {encoding: "utf-8"}, (error: any, data: any) => {
      if (!error) {
        this.setState({
          code: data,
          path,
          pdfIsPending: true,
        });

        this.compile(path);
      } else {
        Toast.show({
          message: "Could not read file",
          intent: Intent.DANGER,
        });

        this.setState({
          pdfIsPending: false,
        });
      }
    });
  }

  public saveSourceFile = (path: string, skipRender: boolean = false) => {
    this.setState({
      pdfIsPending: true,
    });

    fs.writeFile(path, this.state.code, (error: any) => {
      if (error) {
        Toast.show({
          message: "Could not save file",
          intent: Intent.DANGER,
        });
        this.setState({
          pdfIsPending: false,
        });
      } else {
        this.setState({
          codeHasChanged: false,
        });
        if (skipRender) {
          return;
        }

        const components = path.split("/");
        Toast.show({
          message: `${components[components.length-1]} saved`,
          intent: Intent.SUCCESS,
          timeout: 1000,
        });

        // After a manual save, also compile unless disabled
        if (this.state.autorenderEnabled) {
          this.compile(path);
        }
      }
    });
  }

  public compile = (path: string) => {
    this.setState({
      pdfIsPending: true,
    });
    const lilypond = Settings.get(USER_SETTINGS.LILYPOND_PATH, USER_DEFAULTS.LILYPOND_PATH).toString();
    const cmd = `${lilypond} --output "${path.replace(/\.[^\.]+$/, "")}" "${path}"`;
    exec(cmd, (error, stdout, stderr) => {
      const lines = stderr.split(/\n/);
      const messages = filter(map(lines, (line: string) => {
        const match = line.match(/:(\d+):(\d+): (error|warning): (.*)$/);
        return match
          ? {
              line,
              number: match[1],
              character: match[2],
              type: match[3],
              message: match[4],
            }
          : false;
      }), (lineOrMatch: any) => !!lineOrMatch);

      this.setState({
        messages,
        rawOutput: stderr,
        pdfIsPending: false,
      });

      if (!error) {
        this.setState({
          outputNeedsRefresh: true,
        });

        this.setState({
          infoPanelSize: "99%",
        });
      } else {
        Toast.show({
          message: `${messages.length} LilyPond alert${messages.length === 1 ? "" : "s"}`,
          intent: Intent.WARNING,
          timeout: 2000,
        });

        this.setState({
          infoPanelSize: "70%",
        });
      }
    });
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
      this.loadSourceFile(files[0]);
    }
  }

  public newFile = () => {
    const outFile = dialog.showSaveDialog({
      title: "Save a new LilyPond source file",
      filters: [
        {name: "LilyPond Source", extensions: ["ly", "lilypond"]}
      ]
    });
    if (outFile && outFile.length > 0) {
      this.setState({
        code: DefaultNewFile,
        path: outFile,
      });
      setTimeout(() => {
        this.saveSourceFile(outFile, true);
      }, 200);
    }
  }

  public showPreferences = () => {
    console.warn("show prefs");
    this.setState({
      preferencesVisible: !this.state.preferencesVisible,
    });
  }
}
