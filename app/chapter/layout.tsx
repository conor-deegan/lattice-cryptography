import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getChapters } from "./utils";
import {
  ChapterSidebar,
  ChapterSidebarTrigger,
} from "../components/chapter-nav";

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chapters = getChapters()
    .map((c) => ({
      slug: c.slug,
      chapter: c.metadata.chapter,
      title: c.metadata.title,
      status: c.metadata.status,
    }))
    .sort((a, b) => parseInt(a.chapter) - parseInt(b.chapter));

  return (
    <SidebarProvider>
      <ChapterSidebar chapters={chapters} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 px-4 bg-background/80 backdrop-blur">
          <ChapterSidebarTrigger />
        </header>
        <div className="max-w-2xl mx-auto w-full px-6 md:px-8 mt-6 lg:mt-10 pb-16">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
