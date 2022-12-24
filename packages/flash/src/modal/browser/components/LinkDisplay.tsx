import * as React from "react";
import { saveMobileLinkInfo } from "@walletconnect/legacy-utils";

import { WALLETCONNECT_CTA_TEXT_ID } from "../constants";

import ConnectButton from "./ConnectButton";

interface LinkDisplayProps {
  uri: string;
}

function LinkDisplay(props: LinkDisplayProps) {
  return (
    <div>
      <p id={WALLETCONNECT_CTA_TEXT_ID} className="walletconnect-qrcode__text">
        Connect to Mobile Wallet
      </p>
      <div className={`walletconnect-connect__buttons__wrapper __android`}>
        <ConnectButton
          name="Connect"
          onClick={React.useCallback(() => {
            window.open(`flash://connect/?${props.uri}`, "");
          }, [])}
        />
      </div>
    </div>
  );
}

export default LinkDisplay;
