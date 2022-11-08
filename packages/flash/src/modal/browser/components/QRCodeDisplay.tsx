import * as React from "react";
import QRCode from "qrcode";
import copy from "copy-to-clipboard";

import { WALLETCONNECT_CTA_TEXT_ID } from "../constants";
import Notification from "./Notification";

async function formatQRCodeImage(data: string) {
  let result = "";
  const dataString = await QRCode.toString(data, { margin: 0, type: "svg" });
  if (typeof dataString === "string") {
    result = dataString.replace(
      "<svg",
      `<svg class="walletconnect-qrcode__image"`
    );
  }
  return result;
}

interface QRCodeDisplayProps {
  uri: string;
}

function QRCodeDisplay(props: QRCodeDisplayProps) {
  const [notification, setNotification] = React.useState("");
  const [svg, setSvg] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setSvg(await formatQRCodeImage(props.uri));
    })();
  }, []);

  const copyToClipboard = () => {
    const success = copy(props.uri);
    if (success) {
      setNotification("Copy to clipboard");
      setInterval(() => setNotification(""), 1200);
    } else {
      setNotification("Error");
      setInterval(() => setNotification(""), 1200);
    }
  };

  return (
    <div>
      <p id={WALLETCONNECT_CTA_TEXT_ID} className="walletconnect-qrcode__text">
        Scan QR code with a Flash wallet
      </p>
      <div dangerouslySetInnerHTML={{ __html: svg }}></div>
      <div className="walletconnect-modal__footer">
        <a onClick={copyToClipboard}>Copy to clipboard</a>
      </div>
      <Notification message={notification} />
    </div>
  );
}

export default QRCodeDisplay;
