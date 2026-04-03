"use client";

import type { CSSProperties } from "react";
import { useFormStatus } from "react-dom";

export default function FormSubmitButton({
  label,
  pendingLabel,
  className,
  style,
}: {
  label: string;
  pendingLabel: string;
  className: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} style={style} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
