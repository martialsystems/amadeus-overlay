/** Add buttons here; motion names match groups in kurisu.model3.json. */
export const interactions = {
  special: 
  {
    backendId: 1,
    motion: "TapReaction",
    label: "Special touch",
    // All four values use the shared 600 x 800 character design space.
    // 15% x 7.5% corresponds to 90 x 60 design pixels.
    position: { top: "48%", left: "50%", width: "32%", height: "12%" },
  },

  head: 
  {
    backendId: 2,
    motion: "PatReaction",
    label: "Head Pat",
    position: { top: "22%", left: "50%", width: "26%", height: "10%" },
  },
};

export type InteractionName = keyof typeof interactions;
