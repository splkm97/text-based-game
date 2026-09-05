import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ghost" | "danger";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  readonly variant?: ButtonVariant;
  readonly block?: boolean;
};

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 text-base " +
  "transition-[background-color,border-color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:border-slate disabled:bg-transparent disabled:text-dusk";

const VARIANT: Readonly<Record<ButtonVariant, string>> = {
  primary: "border-ember bg-ember text-ink-deep",
  ghost: "border-slate bg-transparent text-parchment",
  danger: "border-blood bg-transparent text-blood",
};

export function Button({
  variant = "ghost",
  block = false,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANT[variant]} ${block ? "w-full" : ""}`}
      {...rest}
    />
  );
}
