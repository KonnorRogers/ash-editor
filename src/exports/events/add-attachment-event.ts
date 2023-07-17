import { AttachmentManager } from "src/exports/attachment-manager";
import { BaseEvent } from "./base-event";

/**
 * A mapping of the "trix-attachment-add" for rhino that follows the same construct.
 */
export class AddAttachmentEvent extends BaseEvent {
  static eventName = "rhino-attachment-add" as const

  constructor(public attachment: AttachmentManager, options: Partial<EventInit> = {}) {
    super(AddAttachmentEvent.eventName, options);
    this.attachment = attachment;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    [AddAttachmentEvent.eventName]: AddAttachmentEvent;
  }
}
