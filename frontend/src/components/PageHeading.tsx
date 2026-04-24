import type { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description: string;
  extra?: ReactNode;
};

export function PageHeading({ title, description, extra }: PageHeadingProps) {
  return (
    <div className="page-heading animate-enter">
      <div>
        <p className="eyebrow">Family Hub</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {extra ? <div className="page-heading-extra">{extra}</div> : null}
    </div>
  );
}
