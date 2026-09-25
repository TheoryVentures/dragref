import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { type DragReferenceInput, type DragSourceOptions, useDragSource } from "./use-drag-source";

export type DraggableProps = Omit<HTMLAttributes<HTMLElement>, "draggable"> &
  DragSourceOptions & {
    reference: DragReferenceInput;
    /** Element or component to render. */
    as?: ElementType;
    /** Rendered when `as` is `"a"`. */
    href?: string;
    children?: ReactNode;
  };

/** Wraps content in an element that drags `reference` into AI clients. */
export function Draggable({
  reference,
  as: Component = "div",
  plainText,
  dataMimeType,
  disabled,
  onDragStart,
  style,
  ...rest
}: DraggableProps) {
  const source = useDragSource(reference, { plainText, dataMimeType, disabled });
  return (
    <Component
      {...rest}
      data-dragref=""
      draggable={source.draggable}
      style={source.draggable ? { cursor: "grab", ...style } : style}
      onDragStart={(event: Parameters<typeof source.onDragStart>[0]) => {
        source.onDragStart(event);
        onDragStart?.(event);
      }}
    />
  );
}
