import { ReactNode } from "react";

function Pager({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-screen-2xl px-10">{children}</div>;
}

export default Pager;
