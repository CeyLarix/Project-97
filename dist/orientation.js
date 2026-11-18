// Plan X points to the right on the supplied drawing, Z towards the garden.
// Three's front-facing camera reverses plan X without this handedness conversion.
// Reflect the rendered scene and convert all camera/movement coordinates once.
export const MIRROR_AXIS_X=5.4;
export const planWorldX=x=>MIRROR_AXIS_X-x;
export function orientGroup(group){group.position.x=MIRROR_AXIS_X;group.scale.x=-1;return group;}
export const planStepX=worldDeltaX=>-worldDeltaX;
