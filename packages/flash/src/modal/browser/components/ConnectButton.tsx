import * as React from "react";

interface WalletButtonProps {
  name: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

function WalletButton(props: WalletButtonProps) {
  const { name, onClick } = props;
  return (
    <a
      className="walletconnect-modal__base__row"
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h3 className={"walletconnect-modal__base__row__h3"}>{name}</h3>
    </a>
  );
}

export default WalletButton;
