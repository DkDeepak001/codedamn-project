import { Header } from "@/components/header";
import { SetupPlayGround } from "@/components/playGrounds/create";
import { PlayGoundLoader } from "@/components/playGrounds/loader";
import { RecentPlayGrounds } from "@/components/playGrounds/recent/server";
import { PlayGrounds } from "@/components/playGrounds/server";
import { Suspense } from "react";

export default function IndexPage() {

  return (
    <div className=" ">
      <Header />
      <div className="w-10/12  mx-auto my-10 flex flex-col gap-y-10">
        <div className="flex gap-y-5 flex-col">
          <h2 className="font-semibold text-lg ">PlayGrounds</h2>
          <Suspense fallback={<PlayGoundLoader />}>
            <PlayGrounds />
          </Suspense>
        </div>
        <div className="flex gap-y-5 flex-col">
          <h2 className="font-semibold text-lg ">Recents</h2>
          <Suspense fallback={<h1>Loading...</h1>}>
            <RecentPlayGrounds />
          </Suspense>
        </div>
      </div>
      <SetupPlayGround />
    </div>
  );
}
