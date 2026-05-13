import { highlight } from "sugar-high";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React from "react";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  return (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return <Link href={href}>{children}</Link>;
  }

  if (href.startsWith("#")) {
    return <a href={href}>{children}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function RoundedImage({
  width,
  height,
  className,
  ...imageProps
}: React.ComponentProps<typeof Image>) {
  const resolvedWidth = typeof width === "number" ? width : 400;
  const resolvedHeight = typeof height === "number" ? height : 400;

  return (
    <div className="flex justify-center my-6">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        {...imageProps}
        width={resolvedWidth}
        height={resolvedHeight}
        className={["rounded-lg", className].filter(Boolean).join(" ")}
      />
    </div>
  );
}

function Code({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlight(children) }}
      className={className}
    />
  );
}

function Pre({ children }: { children: { props: { children: string } } }) {
  return (
    <pre>
      <code
        dangerouslySetInnerHTML={{ __html: highlight(children.props.children) }}
      />
    </pre>
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function createHeading(level: number) {
  const sizeClasses: Record<number, string> = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-base",
    5: "text-sm",
    6: "text-sm",
  };

  const Heading = ({ children }: { children: string }) => {
    const slug = slugify(children);
    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `${sizeClasses[level]} font-semibold tracking-tight`,
      },
      children,
    );
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  pre: Pre,
  Table: Table,
};

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      source={props.source}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
