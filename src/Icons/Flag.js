import React from "react";

const SvgFlag = props => (
  <svg width={20} height={20} {...props}>
    <path
      d="M10 12h4V8h-4v4zM6 8h4V4H6v4zm4-4h4V0h-4v4zm8-4v4h-4v4h4v4h2V0h-2zM2 8h4v4H2v8H0V0h6v4H2v4z"
      fill="#000"
      fillRule="evenodd"
    />
  </svg>
);

export default SvgFlag;
