"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { groupChaptersByPart } from "../chapter/parts";

type ChapterItem = {
  slug: string;
  chapter: string;
  title: string;
};

export function ChapterSidebar({ chapters }: { chapters: ChapterItem[] }) {
  const params = useParams<{ slug?: string }>();
  const activeSlug = params?.slug;
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  const grouped = groupChaptersByPart(chapters);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="font-medium" onClick={handleNavigate}>
                Home
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {grouped.map((group) => (
          <SidebarGroup key={group.title ?? "ungrouped"}>
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((chapter) => (
                  <SidebarMenuItem key={chapter.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeSlug === chapter.slug}
                    >
                      <Link
                        href={`/chapter/${chapter.slug}`}
                        onClick={handleNavigate}
                      >
                        <span className="text-muted tabular-nums shrink-0 mr-2">
                          {chapter.chapter}
                        </span>
                        <span className="truncate">{chapter.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function ChapterSidebarTrigger() {
  return <SidebarTrigger />;
}
