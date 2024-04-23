import { Header } from "@/components/header";
import { PlayGoundLoader } from "@/components/playGrounds/loader";
import { PlayGrounds } from "@/components/playGrounds/server";
import { Suspense } from "react";

export default function IndexPage() {

  return (
    <div className=" ">
      <Header />
      <Suspense fallback={<PlayGoundLoader />}>
        <PlayGrounds />
      </Suspense>
    </div>
  );
}
