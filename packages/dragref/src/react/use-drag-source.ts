import { type ApplyOptions, type DragReference, handleDragStart } from "dragref";
import type { DragEvent } from "react";

export type DragReferenceInput =
  | DragReference
  | null
  | undefined
  | (() => DragReference | null | undefined);

export type DragSourceOptions = ApplyOptions & {
  disabled?: boolean;
};

export type DragSourceProps = {
  draggable: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
};

/**
 * Props to spread onto any element to make it drag a reference into AI clients. Pass a function
 * to compute the reference at drag time; returning null cancels the drag.
 */
export function useDragSource(
  reference: DragReferenceInput,
  options: DragSourceOptions = {},
): DragSourceProps {
  const { disabled = false, ...applyOptions } = options;
  return {
    draggable: !disabled,
    onDragStart: (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      const ref = typeof reference === "function" ? reference() : reference;
      handleDragStart(event, ref, applyOptions);
    },
  };
}
