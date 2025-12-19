export const InkFilters = () => (
  <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
    <defs>
      <filter id="ink-wash" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feMorphology operator="dilate" radius="1" in="displaced" result="dilated" />
        <feGaussianBlur stdDeviation="2" in="dilated" result="blurred" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="fine-noise" />
        <feComposite operator="in" in="fine-noise" in2="blurred" result="textured-bleed" />
        <feMerge>
          <feMergeNode in="textured-bleed" />
          <feMergeNode in="displaced" />
        </feMerge>
      </filter>

      <filter id="rice-paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="5" stitchTiles="stitch" result="noise"/>
        <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1.2" result="light">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
        <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" in="light" in2="SourceGraphic" />
      </filter>
    </defs>
  </svg>
)
