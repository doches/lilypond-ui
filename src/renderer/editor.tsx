import * as React from "react";
import * as CodeMirror from "react-codemirror2";
import * as CM from "codemirror";
require("codemirror/mode/stex/stex");
require("codemirror/addon/mode/simple");
require("codemirror/keymap/sublime");
require("codemirror/addon/comment/comment.js");
require("codemirror/addon/dialog/dialog.js");
require("codemirror/addon/search/searchcursor.js");
require("codemirror/addon/search/search.js");
import { IMessage, ILinePosition } from "./types";
import "./editor.less";



// Codemirror lilypond mode
require("codemirror-atom-modes").registerGrammars([
  require("../grammar/lilypond-drummode.json"),
  require("../grammar/lilypond-figbass.json"),
  require("../grammar/lilypond-figuregroup.json"),
  require("../grammar/lilypond-internals.json"),
  require("../grammar/lilypond-lyrics.json"),
  require("../grammar/lilypond-markup.json"),
  require("../grammar/lilypond-notedrum.json"),
  require("../grammar/lilypond-notemode-explicit.json"),
  require("../grammar/lilypond-notemode.json"),
  require("../grammar/lilypond-notenames.json"),
  require("../grammar/lilypond-scheme.json"),
  require("../grammar/lilypond.json")
], CM);
// CM.defineSimpleMode("lilypond", {
//   start: [
//     {regex: /(\\time) ([0-9\/]+)/, token: ["tag", "def"]},
//     {regex: /(\\tempo) (\d+\=\d+)/, token: ["tag", "def"]},
//     {regex: /(\\[^\s\\]+)/, token: "tag"},
//     {regex: /%.*$/, token: "comment"},
//     {regex: /[{}]/, token: "bracket"},
//     {regex: /(<<|>>)/, token: "bracket"},
//     {regex: /"[^"]*"/, token: "string"},
//     {regex: /##[tf]/, token: "header"}
//   ]
// });

export interface IProps {
  code: string;
  onCodeUpdate: (code: string) => void;
  onSave: () => void;
  messages: IMessage[];
  scrollPosition?: ILinePosition;
}

export interface IEditorState {

}

export default class Editor extends React.Component<IProps, IEditorState> {
  codemirror: any;
  lineWidgets: any[];
  state: IEditorState;
  constructor(props: IProps) {
    super(props);

    this.state = {

    };

    this.lineWidgets = [];
  }

  public componentWillReceiveProps(props: IProps) {
    if (props.messages && props.messages !== this.props.messages && this.codemirror) {
      // Refresh line widgets
      this.codemirror.operation(() => {
        for (let widget of this.lineWidgets) {
          this.codemirror.removeLineWidget(widget);
        }
        this.lineWidgets.length = 0;

        for (let message of props.messages) {
          const widget = document.createElement("div");
          widget.appendChild(document.createTextNode(message.message));
          widget.className = `line-widget line-widget-${message.type}`;;
          this.lineWidgets.push(this.codemirror.addLineWidget(message.number - 1, widget));
        }
      });
    }

    if (props.scrollPosition && props.scrollPosition !== this.props.scrollPosition) {
      this.codemirror.scrollIntoView(props.scrollPosition);
    }

    if (props.code !== this.props.code) {
      setTimeout(() => this.codemirror.refresh(), 500);
    }
  }

  public render() {
    return (
      <div className="editor-wrapper">
        <CodeMirror.Controlled
          className="editor"
          options={{
            mode: "LilyPond",
            theme: "nord",
            lineWrapping: true,
            scrollbarStyle: null,
            lineNumbers: true,
            cursorScrollMargin: 10,
          }}
          value={this.props.code}
          onBeforeChange={(editor, data, value) => {
            this.props.onCodeUpdate(value);
          }}
          editorDidMount={this.codemirrorDidMount}
        />
      </div>
    );
  }

  public codemirrorDidMount = (editor: any) => {
    this.codemirror = editor;
    console.warn(editor);
    editor.setOption("keyMap", "sublime");
    editor.setOption("extraKeys", {
      "Cmd+f": "compile",
    });
    CM.commands.save = () => {
      this.props.onSave();
    };
    CM.commands.compile = () => {
      console.warn("compile");
    }
  }
}
