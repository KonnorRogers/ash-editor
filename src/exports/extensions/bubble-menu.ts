import { Extension } from "@tiptap/core";
import {
  Editor,
  isNodeSelection,
  isTextSelection,
  posToDOMRect,
} from "@tiptap/core";
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

export interface BubbleMenuPluginProps {
  /**
   * The plugin key.
   * @type {PluginKey | string}
   * @default 'bubbleMenu'
   */
  pluginKey: PluginKey | string;

  /**
   * The editor instance.
   */
  editor: Editor;

  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement;

  /**
   * The options for the tippy.js instance.
   * @see https://atomiks.github.io/tippyjs/v6/all-props/
   */
  // tippyOptions?: Partial<Props>

  /**
   * The delay in milliseconds before the menu should be updated.
   * This can be useful to prevent performance issues.
   * @type {number}
   * @default 250
   */
  updateDelay?: number;

  /**
   * A function that determines whether the menu should be shown or not.
   * If this function returns `false`, the menu will be hidden, otherwise it will be shown.
   */
  shouldShow?:
    | ((props: {
        editor: Editor;
        view: EditorView;
        state: EditorState;
        oldState?: EditorState;
        from: number;
        to: number;
      }) => boolean)
    | null;

  /**
   * A function that determines what DOM Element to use as an anchor for a NodeView. Useful for things like attachments.
   */
  determineNodeViewAnchor?:
    | ((props: {
        editor: Editor;
        view: EditorView;
        state: EditorState;
        oldState?: EditorState;
        from: number;
        to: number;
      }) => HTMLElement | null)
    | null;
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView;
};

export class BubbleMenuView {
  public editor: Editor;
  public element: HTMLElement;
  public view: EditorView;
  public preventHide = false;
  public updateDelay: number;
  private updateDebounceTimer: number | undefined;
  public shouldShow: Exclude<BubbleMenuPluginProps["shouldShow"], null> = ({
    view,
    state,
    from,
    to,
  }) => {
    const { doc, selection } = state;
    const { empty } = selection;

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock =
      !doc.textBetween(from, to).length && isTextSelection(state.selection);

    // When clicking on a element inside the bubble menu the editor "blur" event
    // is called and the bubble menu item is focussed. In this case we should
    // consider the menu as part of the editor and keep showing the menu
    const isChildOfMenu = this.element.matches(":focus-within");

    const hasEditorFocus = view.hasFocus() || isChildOfMenu;

    if (
      !hasEditorFocus ||
      empty ||
      isEmptyTextBlock ||
      !this.editor.isEditable
    ) {
      return false;
    }

    return true;
  };

  public determineNodeViewAnchor: Exclude<
    BubbleMenuPluginProps["determineNodeViewAnchor"],
    null
  > = ({ view, from }) => {
    let node = view.nodeDOM(from) as HTMLElement;

    // Attachment node views are special, we dont want to show text editing operations.
    // Perhaps in the future we may have a default bubble menu for attachment transforms??
    if (
      this.editor.isActive("attachment-figure") ||
      this.editor.isActive("previewable-attachment-figure")
    ) {
      const figcaption = node.querySelector("figcaption");
      node = figcaption || node;
    }

    let nodeViewWrapper = node.dataset.nodeViewWrapper
      ? node
      : node.querySelector("[data-node-view-wrapper]");

    if (nodeViewWrapper) {
      node = nodeViewWrapper.firstChild as HTMLElement;
    }

    return node;
  };

  constructor({
    editor,
    element,
    view,
    // tippyOptions = {},
    updateDelay = 250,
    shouldShow,
    determineNodeViewAnchor,
  }: BubbleMenuViewProps) {
    this.editor = editor;
    this.element = element;
    this.view = view;
    this.updateDelay = updateDelay;

    if (shouldShow) {
      this.shouldShow = shouldShow;
    }

    if (determineNodeViewAnchor) {
      this.determineNodeViewAnchor = determineNodeViewAnchor;
    }

    this.view.dom.addEventListener("dragstart", this.dragstartHandler);
    this.editor.on("focus", this.focusHandler);
    this.editor.on("blur", this.blurHandler);
    this.element.addEventListener("focusout", this.blurHandler);
  }

  destroy() {
    this.view.dom.removeEventListener("dragstart", this.dragstartHandler);
    this.editor.off("focus", this.focusHandler);
    this.editor.off("blur", this.blurHandler);
    this.element.removeEventListener("focusout", this.blurHandler);
  }

  dragstartHandler = () => {
    // this.hide()
  };

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view));
  };

  blurHandler = () => {
    setTimeout(() => {
      if (
        !this.element.matches(":focus-within") &&
        !this.view.dom.matches(":focus-within")
      ) {
        this.hide();
      }
    });
  };

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view;
    const hasValidSelection = state.selection.from !== state.selection.to;

    if (this.updateDelay > 0 && hasValidSelection) {
      this.handleDebouncedUpdate(view, oldState);
      return;
    }

    const selectionChanged = !oldState?.selection.eq(view.state.selection);
    const docChanged = !oldState?.doc.eq(view.state.doc);

    this.updateHandler(view, selectionChanged, docChanged, oldState);
  }

  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const selectionChanged = !oldState?.selection.eq(view.state.selection);
    const docChanged = !oldState?.doc.eq(view.state.doc);

    if (!selectionChanged && !docChanged) {
      return;
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, selectionChanged, docChanged, oldState);
    }, this.updateDelay);
  };

  updateHandler = (
    view: EditorView,
    selectionChanged: boolean,
    docChanged: boolean,
    oldState?: EditorState,
  ) => {
    const { state, composing } = view;
    const { selection } = state;

    const isSame = !selectionChanged && !docChanged;

    if (composing || isSame) {
      return;
    }

    // support for CellSelections
    const { ranges } = selection;
    const from = Math.min(...ranges.map((range) => range.$from.pos));
    const to = Math.max(...ranges.map((range) => range.$to.pos));

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view,
      state,
      oldState,
      from,
      to,
    });

    if (!shouldShow) {
      this.hide();

      return;
    }

    let clientRect: null | (() => DOMRect) = null;

    if (isNodeSelection(state.selection)) {
      const node =
        this.determineNodeViewAnchor?.({
          editor: this.editor,
          view,
          state,
          oldState,
          from,
          to,
        }) || (view.nodeDOM(from) as HTMLElement);

      if (node) {
        clientRect = () => node.getBoundingClientRect();
      }
    } else {
      clientRect = () => posToDOMRect(view, from, to);
    }

    if (clientRect) {
      this.show(clientRect);
    }
  };

  show(clientRect: () => DOMRect) {
    const evt = new Event("rhino-bubble-menu-show", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    // @ts-expect-error
    evt.clientRect = clientRect;
    this.element.dispatchEvent(evt);
  }

  hide() {
    const evt = new Event("rhino-bubble-menu-hide", {
      bubbles: true,
      composed: true,
    });
    this.element.dispatchEvent(evt);
  }
}

export const BubbleMenuPlugin = (options: BubbleMenuPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === "string"
        ? new PluginKey(options.pluginKey)
        : options.pluginKey,
    view: (view) => new BubbleMenuView({ view, ...options }),
  });
};

export type BubbleMenuOptions = Omit<
  BubbleMenuPluginProps,
  "editor" | "element"
> & {
  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement | null;
};

/**
 * This extension allows you to create a bubble menu.
 * @see https://tiptap.dev/api/extensions/bubble-menu
 */
export const BubbleMenuExtension = Extension.create<BubbleMenuOptions>({
  name: "rhino-bubble-menu",

  addOptions() {
    return {
      element: null,
      pluginKey: "rhino-bubble-menu",
      updateDelay: undefined,
      shouldShow: null,
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return [];
    }

    return [
      BubbleMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        updateDelay: this.options.updateDelay,
        shouldShow: this.options.shouldShow,
        determineNodeViewAnchor: this.options.determineNodeViewAnchor,
      }),
    ];
  },
});
