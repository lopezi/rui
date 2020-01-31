import React from "react";

const SvgSquare = props => (
  <svg width={21} height={20} {...props}>
    <path
      d="M13.65 18h5.25v-5h-5.25v5zm-2.1 2H21v-9h-9.45v9zM2.1 18h5.25v-5H2.1v5zM0 20h9.45v-9H0v9zM13.65 7h5.25V2h-5.25v5zm-2.1 2H21V0h-9.45v9zM2.1 7h5.25V2H2.1v5zM0 9h9.45V0H0v9z"
      fill="#000"
      fillRule="evenodd"
    />
  </svg>
);

export default SvgSquare;
