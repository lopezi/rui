import React from "react";

const SvgCup = props => (
  <svg width={18} height={18} {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="M-3-3h24v24H-3z" />
      <path
        d="M18 1.45C18 .65 17.35 0 16.55 0H1.45C.65 0 0 .65 0 1.45c0 .35.13.7.37.96L8 11v5H4c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1h-4v-5l7.63-8.59c.24-.26.37-.61.37-.96zM4.43 4L2.66 2h12.69l-1.78 2H4.43z"
        fill="#1D1D1D"
      />
    </g>
  </svg>
);

export default SvgCup;
