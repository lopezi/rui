import React from "react";

const SvgDrawer = props => (
  <svg width={20} height={21} {...props}>
    <path
      d="M6 14H4v-4h12v4h-2v-2H6v2zM2 2h16V0H2v2zm0 16h16V6H2v12zm-2 2h20V4H0v16z"
      fill="#000"
      fillRule="evenodd"
    />
  </svg>
);

export default SvgDrawer;
