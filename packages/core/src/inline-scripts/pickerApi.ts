export type HyperframePickerBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HyperframePickerElementInfo = {
  id: string | null;
  tagName: string;
  selector: string;
  label: string;
  boundingBox: HyperframePickerBoundingBox;
  textContent: string | null;
  src: string | null;
  dataAttributes: Record<string, string>;
};

/** A picker element augmented with a `paints` flag, for the host-driven hit-model query.
 *  `paints` = the element visibly paints at the current frame (background/border/media/own text);
 *  a `false` element is transparent to hit-testing (clicks fall through it). */
export type HitModelElementInfo = HyperframePickerElementInfo & {
  paints: boolean;
};

export type HyperframePickerApi = {
  enable: () => void;
  disable: () => void;
  isActive: () => boolean;
  getHovered: () => HyperframePickerElementInfo | null;
  getSelected: () => HyperframePickerElementInfo | null;
  getCandidatesAtPoint: (
    clientX: number,
    clientY: number,
    limit?: number,
  ) => HyperframePickerElementInfo[];
  pickAtPoint: (
    clientX: number,
    clientY: number,
    index?: number,
  ) => HyperframePickerElementInfo | null;
  pickManyAtPoint: (
    clientX: number,
    clientY: number,
    indexes?: number[],
  ) => HyperframePickerElementInfo[];
};

declare global {
  interface Window {
    __HF_PICKER_API?: HyperframePickerApi;
  }
}
