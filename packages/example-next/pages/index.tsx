import FlashCard from "../components/FlashCard";
import HashPackCard from "../components/HashPackCard";
import Blade from "../components/Blade";
import { Header } from "../components/Header";
import Pager from "../components/Pager";

export default function Home() {
  return (
    <Pager>
      <Header />
      <FlashCard />
      <HashPackCard />
      <Blade />
    </Pager>
  );
}
