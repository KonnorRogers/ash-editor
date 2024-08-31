// @ts-check
import { css } from "lit";

export const hostStyles = css`
  /* General tokens */
  --rhino-focus-ring: 0px 0px 1px 1px var(--rhino-button-active-border-color);
  --rhino-border-radius: 4px;

  --rhino-danger-border-color: red;
  --rhino-danger-background-color: #ffdddd;

  /* Editor tokens */
  --rhino-text-color: #374151;
  --rhino-border-color: #cecece;
  --rhino-placeholder-text-color: #cecece;

  /* Regular buttons */
  --rhino-button-text-color: #889;
  --rhino-button-border-color: #cecece;

  /** Disabled Buttons */
  --rhino-button-disabled-text-color: #d1d5db;
  --rhino-button-disabled-border-color: #d1d5db;
  --rhino-button-disabled-background-color: #d1d5db;

  /** Active buttons */
  --rhino-button-active-border-color: #005a9c;
  --rhino-button-active-background-color: rgb(226 239 255);

  --rhino-toolbar-text-color: hsl(219, 6%, 43%);
  --rhino-toolbar-icon-size: 1em;

  --rhino-dialog-border-color: hsl(
    var(--rhino-button-focus-background-color-hsl) / 50%
  );

  /** Focus buttons */
  --rhino-button-focus-background-color: hsl(
    var(--rhino-button-focus-background-color-hsl)
  );

  --rhino-button-focus-background-color-hsl: 219 26% 95%;

  display: block;
  color: var(--rhino-text-color);
`;

export const toolbarButtonStyles = css`
  .rhino-toolbar-button {
    border: 1px solid var(--rhino-border-color);
    border-radius: var(--rhino-border-radius);
    padding: 0.4em;
    color: inherit;
    font-size: inherit;
    display: inline-grid;
  }

  .rhino-toolbar-button:is([aria-disabled="true"], :disabled) {
    color: var(--rhino-button-disabled-text-color);
    border-color: var(--rhino-button-disabled-border-color);
  }

  .rhino-toolbar-button[aria-disabled="true"]:focus {
    border-color: var(--rhino-button-disabled-border-color);
  }

  .rhino-toolbar-button svg {
    min-height: var(--rhino-toolbar-icon-size);
    min-width: var(--rhino-toolbar-icon-size);

    /* max-height / max-width needs to be set for safari */
    max-height: var(--rhino-toolbar-icon-size);
    max-width: var(--rhino-toolbar-icon-size);
  }

  .rhino-toolbar-button:is(:focus, :hover):not(
      [aria-disabled="true"],
      :disabled
    ) {
    outline: transparent;
    border-color: var(--rhino-button-active-border-color);
  }

  .rhino-toolbar-button:is(:focus):not([aria-disabled="true"], :disabled) {
    box-shadow: var(--rhino-focus-ring);
  }

  /* Only change the background color in certain scenarios */
  .rhino-toolbar-button:is(:hover):not(
      [aria-disabled="true"],
      :disabled,
      [aria-pressed="true"],
      [part~="toolbar__button--active"]
    ) {
    background-color: var(--rhino-button-focus-background-color);
  }

  .rhino-toolbar-button:is([aria-disabled="true"], :disabled):not(
      [part~="toolbar__button--active"]
    ) {
    color: var(--rhino-button-disabled-text-color);
    border-color: var(--rhino-button-disabled-border-color);
  }

  .rhino-toolbar-button:is(:focus, :hover):is(
      [aria-disabled="true"],
      :disabled
    ):not([part~="toolbar__button--active"]) {
    outline: transparent;
    color: var(--rhino-button-disabled-text-color);
    border-color: var(--rhino-button-disabled-border-color);
    box-shadow: 0 0 0 1px var(--rhino-button-disabled-border-color);
  }

  svg, ::slotted(svg) {
    height: var(--rhino-toolbar-icon-size);
    width: var(--rhino-toolbar-icon-size);
  }
`;

export default css`
  :host {
    ${hostStyles}
  }

  [part~="toolbar"] {
    color: var(--rhino-toolbar-text-color);
  }

  [part~="toolbar"]::part(base) {
    border-color: var(--rhino-border-color);
    border-bottom-color: transparent;
    border-width: 1px;
    border-radius: 4px;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    display: flex;
    align-items: center;
    overflow: auto;
  }

  [part~="toolbar"][part~="toolbar--bubble-menu"]::part(base) {
    border: 1px solid var(--rhino-border-color);
    border-radius: 4px;
  }

  [part~="toolbar"]::part(base):is(:focus-visible, :focus-within) {
    border-color: var(--rhino-button-active-border-color);
    outline: transparent;
  }

  [part~="toolbar__button--active"],
  [part~="toolbar__button--active"]:is(:hover, :focus-within) {
    background-color: var(--rhino-button-active-background-color);
  }

  slot[name="toolbar"]
    :is(
      [part~="toolbar__button--link"],
      [part~="toolbar__button--increase-indentation"]
    ) {
    margin-inline-end: 1rem;
  }

  [part~="toolbar__button--attach-files"] {
    margin-inline-end: auto;
  }

  role-anchored-region {
    font-size: 0.8em;
    --background: Canvas;
  }

  #dialogs {
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: none;
  }

  .link-dialog {
    position: absolute;
    z-index: 1;
    height: 100%;
    width: 100%;
    padding: 1px;
  }

  .link-dialog__container {
    display: flex;
    align-items: center;
    background: white;
    box-shadow: 0 0.3em 1em #ccc;
    max-width: 600px;
    padding: 0.75rem 0.4rem;
    border-radius: 8px;
    border-top: 2px solid var(--rhino-border-color);
  }

  .link-dialog__input {
    border: 1px solid var(--rhino-border-color);
    border-radius: var(--rhino-border-radius);
    padding: 0.4em 0.6em;
    flex: 1 1 auto;
  }

  .link-dialog__input:is(:focus) {
    outline: transparent;
    border-color: var(--rhino-button-active-border-color);
  }

  .link-validate:invalid {
    outline: transparent;
    background-color: var(--rhino-danger-background-color);
    border-color: var(--rhino-danger-border-color);
    box-shadow: none;
  }

  .rhino-toolbar-button.link-dialog__button {
    padding: 0.4em 0.6em;
    border: 1px solid var(--rhino-button-border-color);
    border-radius: var(--rhino-border-radius);
  }

  .link-dialog__buttons {
    margin-right: 0.5em;
    margin-left: 0.5em;
  }

  .editor-wrapper {
    position: relative;
  }

  .trix-content {
    border: 1px solid var(--rhino-border-color);
    border-radius: 0px 0px var(--rhino-border-radius) var(--rhino-border-radius);
    margin: 0;
    padding: 0.4em 0.6em;
    min-height: 200px;
    outline: transparent;
    white-space: pre-wrap;
  }

  role-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    font-size: 0.75em;
    --background: Canvas;
    color: CanvasText;
    --border-color: gray;
  }

  @media screen and (prefers-color-scheme: dark) {
    role-tooltip {
      --border-color: rgb(200, 200, 200);
    }
  }
`;
