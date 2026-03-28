"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <style>{`
        [data-sonner-toast] [data-close-button] {
          left:  auto !important;
          right: 0    !important;
          transform: translate(35%, -35%) !important;
        }
      `}</style>

      <Sonner
        theme={resolvedTheme as ToasterProps["theme"]}
        richColors
        closeButton
        className="toaster group"
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",

            "--success-bg": "var(--popover)",
            "--success-text": "var(--popover-foreground)",
            "--success-border": "var(--primary)",

            "--error-bg": "var(--popover)",
            "--error-text": "var(--popover-foreground)",
            "--error-border": "var(--destructive)",

            "--warning-bg": "var(--popover)",
            "--warning-text": "var(--popover-foreground)",
            "--warning-border": "var(--accent)",

            "--info-bg": "var(--popover)",
            "--info-text": "var(--popover-foreground)",
            "--info-border": "var(--primary)",

            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        {...props}
      />
    </>
  );
};

export { Toaster };