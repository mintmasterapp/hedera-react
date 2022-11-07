import { ReactNode } from "react";

function Pager({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-screen-2xl">{children}</div>;
}

export default Pager;
