"use client";

import type { ReactNode } from "react";
import { Button as RACButton, type ButtonProps } from "react-aria-components/Button";
import { Link, type LinkProps } from "react-aria-components/Link";
import { cx } from "@/app/lib/cx";

type Variant =
  | "primary"
  | "standard"
  | "subtle"
  | "subtle-danger"
  | "danger"
  | "outline";
type Size = "sm" | "md" | "icon" | "icon-sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ds-brand text-ds-on-brand data-[hovered]:bg-ds-brand-hover data-[pressed]:bg-ds-brand-pressed",
  standard:
    "bg-ds-neutral text-ds-text data-[hovered]:bg-ds-neutral-hover data-[pressed]:bg-ds-neutral-hover",
  subtle:
    "bg-transparent text-ds-text-subtle data-[hovered]:bg-ds-surface-hover data-[hovered]:text-ds-text data-[pressed]:bg-ds-surface-hover",
  "subtle-danger":
    "bg-transparent text-ds-danger-text data-[hovered]:bg-ds-danger-bg data-[pressed]:bg-ds-danger-bg",
  danger:
    "bg-ds-danger text-ds-on-danger data-[hovered]:bg-ds-danger-hover data-[pressed]:bg-ds-danger-hover",
  outline:
    "border border-ds-line bg-ds-surface text-ds-text data-[hovered]:bg-ds-surface-hover data-[pressed]:bg-ds-surface-hover",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2 text-[13px]",
  md: "h-8 gap-2 px-3 text-sm",
  icon: "size-8 p-0",
  "icon-sm": "size-7 p-0",
};

function buttonClassName(
  variant: Variant = "standard",
  size: Size = "md",
  className?: string,
) {
  return cx(
    "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-ds font-medium leading-5 no-underline outline-none transition-colors",
    "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonComponentProps = ButtonProps & {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function Button({
  variant = "standard",
  size = "md",
  className,
  ...props
}: ButtonComponentProps) {
  return (
    <RACButton
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}

type ButtonLinkProps = LinkProps & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
};

export function ButtonLink({
  variant = "standard",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}
