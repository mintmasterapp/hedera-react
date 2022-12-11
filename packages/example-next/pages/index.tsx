import FlashCard from "../components/FlashCard";
// import HashPackCard from "../components/HashPackCard";
import { Header } from "../components/Header";
import Pager from "../components/Pager";

export default function Home() {
  return (
    <Pager>
      <Header />
      <FlashCard />
    </Pager>
  );
}
