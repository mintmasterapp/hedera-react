import Button from "./Button";

export default function FlashCard() {
  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-4xl font-semibold">Flash Wallet</p>
          <p className="text-white mt-2">Connect Hedera App without pain</p>
        </div>
        <Button name="Connect" onClick={() => {}} />
      </div>
    </div>
  );
}
