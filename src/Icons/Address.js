import React from "react";

const SvgAddress = props => (
  <svg viewBox="0 0 24 24" {...props}>
    <defs>
      <style>
        {
          ".address_svg__cls-1{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}"
        }
      </style>
    </defs>
    <g id="address_svg___23_mail" data-name="23.mail">
      <path
        className="address_svg__cls-1"
        d="M23 12V6a3 3 0 00-3-3H4a3 3 0 00-3 3v12a3 3 0 003 3h7"
      />
      <path
        className="address_svg__cls-1"
        d="M2 4l10 9 10-9M5 15l4-4M23 18h-8"
      />
    </g>
  </svg>
);

export default SvgAddress;
