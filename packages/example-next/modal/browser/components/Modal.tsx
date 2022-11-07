import * as React from "react";
import { isMobile } from "@walletconnect/legacy-utils";
import Header from "./Header";
import { WALLETCONNECT_MODAL_ID } from "../constants";
import QRCodeDisplay from "./QRCodeDisplay";
import LinkDisplay from "./LinkDisplay";

interface ModalProps {
  uri: string;
  onClose: any;
}

function Modal(props: ModalProps) {
  const mobile = isMobile();
  const [displayQRCode, setDisplayQRCode] = React.useState(!mobile);
  const displayProps = {
    uri: props.uri,
  };
  const rightSelected = mobile ? displayQRCode : !displayQRCode;

  return (
    <div
      id={WALLETCONNECT_MODAL_ID}
      className="walletconnect-qrcode__base animated fadeIn"
    >
      <div className="walletconnect-modal__base">
        <Header onClose={props.onClose} />
        <div
          className={`walletconnect-modal__mobile__toggle${
            rightSelected ? " right__selected" : ""
          }`}
        >
          <div className="walletconnect-modal__mobile__toggle_selector" />
          {mobile ? (
            <>
              <a onClick={() => setDisplayQRCode(false)}>Mobile</a>
              <a onClick={() => setDisplayQRCode(true)}>QR Code</a>
            </>
          ) : null}
        </div>
        <div>
          {displayQRCode ? (
            <QRCodeDisplay {...displayProps} />
          ) : (
            <LinkDisplay {...displayProps} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
